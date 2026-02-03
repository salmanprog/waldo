const fs = require('fs')
const path = require('path')
const faceapi = require('face-api.js')
const canvas = require('canvas')

const {
  Canvas,
  Image: CanvasImage,
  ImageData: CanvasImageData,
} = canvas

faceapi.env.monkeyPatch({
  Canvas,
  Image: CanvasImage,
  ImageData: CanvasImageData,
})

const MODEL_PATH = path.join(process.cwd(), 'models')
const GALLERY_ROOT = path.join(process.cwd(), 'public/uploads/gallery')

// Optimizations for large galleries (20k+ images)
const CONCURRENCY = 6                    // process N images in parallel
const MAX_IMAGE_DIM = 1024               // resize large images to speed up detection and reduce memory
const PROGRESS_EVERY = 1               // emit every image so UI shows 1%, 2%, 3%... (flushed immediately)

// Parse --gallery=folderName from argv (optional: only index this gallery)
function getGalleryFilter() {
  const arg = process.argv.find(a => a.startsWith('--gallery='))
  if (!arg) return null
  return arg.replace('--gallery=', '').trim() || null
}

// Full rebuild: ignore existing index and re-index all images (default: incremental)
// Set via env FACE_INDEX_FULL=1 (API) or CLI --full
function isFullRebuild() {
  return process.env.FACE_INDEX_FULL === '1' || process.argv.includes('--full')
}

// Write and flush immediately so progress reaches the client (stdout is block-buffered when piped)
function emit(type, data) {
  const line = JSON.stringify({ type, ...data }) + '\n'
  try {
    fs.writeSync(process.stdout.fd, line)
  } catch {
    process.stdout.write(line)
  }
}

// Resize image to max dimension for faster detection and lower memory
function resizeIfNeeded(img, maxDim) {
  const w = img.width
  const h = img.height
  if (w <= maxDim && h <= maxDim) return img
  const scale = maxDim / Math.max(w, h)
  const newW = Math.round(w * scale)
  const newH = Math.round(h * scale)
  const c = new Canvas(newW, newH)
  const ctx = c.getContext('2d')
  ctx.drawImage(img, 0, 0, w, h, 0, 0, newW, newH)
  return c
}

// Process a single image: load, optionally resize, detect faces, return index entries
async function processImage(imgPath, imagePath) {
  const img = await canvas.loadImage(imgPath)
  const source = resizeIfNeeded(img, MAX_IMAGE_DIM)

  let detections = await faceapi
    .detectAllFaces(
      source,
      new faceapi.SsdMobilenetv1Options({
        minConfidence: 0.2,
        maxResults: 20,
      })
    )
    .withFaceLandmarks()
    .withFaceDescriptors()

  if (detections.length === 0) {
    detections = await faceapi
      .detectAllFaces(
        source,
        new faceapi.TinyFaceDetectorOptions({
          inputSize: 512,
          scoreThreshold: 0.2,
        })
      )
      .withFaceLandmarks()
      .withFaceDescriptors()
  }

  const entries = detections.map(det => ({
    image: imagePath,
    desc: Array.from(det.descriptor),
  }))
  return entries
}

// Run up to `limit` promises at a time
async function runWithConcurrency(items, limit, fn) {
  const results = []
  const executing = []
  for (const item of items) {
    const p = Promise.resolve().then(() => fn(item)).then(result => {
      executing.splice(executing.indexOf(p), 1)
      return result
    })
    results.push(p)
    executing.push(p)
    if (executing.length >= limit) {
      await Promise.race(executing)
    }
  }
  return Promise.all(results)
}

async function buildIndex() {
  const galleryFilter = getGalleryFilter()
  const fullRebuild = isFullRebuild()

  const allGalleries = fs.readdirSync(GALLERY_ROOT).filter(g => {
    const itemsDir = path.join(GALLERY_ROOT, g, 'items')
    if (!fs.existsSync(itemsDir)) return false
    if (galleryFilter && g !== galleryFilter) return false
    return true
  })

  emit('step', { message: 'Loading models...' })
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_PATH)
  await faceapi.nets.tinyFaceDetector.loadFromDisk(MODEL_PATH)
  await faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_PATH)
  await faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_PATH)
  emit('step', { message: 'Models loaded' })

  let globalCurrent = 0
  let globalTotal = 0

  // Precompute total so progress % is correct from the start
  for (const gallery of allGalleries) {
    const itemsDir = path.join(GALLERY_ROOT, gallery, 'items')
    const allFiles = fs.readdirSync(itemsDir).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
    const indexPath = path.join(MODEL_PATH, `index-${gallery}.json`)
    let indexedPaths = new Set()
    if (!fullRebuild && fs.existsSync(indexPath)) {
      try {
        const existing = JSON.parse(fs.readFileSync(indexPath, 'utf-8'))
        if (Array.isArray(existing)) existing.forEach(e => e && e.image && indexedPaths.add(e.image))
      } catch {}
    }
    const basePath = `/uploads/gallery/${gallery}/items/`
    const toProcess = fullRebuild ? allFiles : allFiles.filter(f => !indexedPaths.has(basePath + f))
    globalTotal += toProcess.length
  }

  for (const gallery of allGalleries) {
    const itemsDir = path.join(GALLERY_ROOT, gallery, 'items')
    const allFiles = fs.readdirSync(itemsDir).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))

    const indexPath = path.join(MODEL_PATH, `index-${gallery}.json`)
    let existingIndex = []
    let indexedPaths = new Set()

    if (!fullRebuild && fs.existsSync(indexPath)) {
      try {
        existingIndex = JSON.parse(fs.readFileSync(indexPath, 'utf-8'))
        if (Array.isArray(existingIndex)) {
          existingIndex.forEach(e => e && e.image && indexedPaths.add(e.image))
        }
      } catch {
        existingIndex = []
        indexedPaths = new Set()
      }
    }

    const basePath = `/uploads/gallery/${gallery}/items/`
    const filesToProcess = fullRebuild
      ? allFiles
      : allFiles.filter(f => !indexedPaths.has(basePath + f))

    emit('step', {
      message: fullRebuild
        ? `Indexing gallery: ${gallery} (${filesToProcess.length} images, full rebuild)`
        : `Indexing gallery: ${gallery} (${filesToProcess.length} new, ${existingIndex.length} existing faces)`,
      gallery,
      total: filesToProcess.length,
      skipped: allFiles.length - filesToProcess.length,
    })

    if (filesToProcess.length === 0) {
      emit('step', { message: `Done: ${gallery} (no new images)`, gallery })
      continue
    }

    // Emit initial progress so the bar shows 0% with correct total (not stuck at 0%)
    emit('progress', { current: globalCurrent, total: globalTotal })

    let processed = 0

    const results = await runWithConcurrency(filesToProcess, CONCURRENCY, async (file) => {
      const imgPath = path.join(itemsDir, file)
      const imagePath = basePath + file
      let entries = []
      try {
        entries = await processImage(imgPath, imagePath)
      } catch {
        // skip failed images
      }
      processed++
      globalCurrent++
      if (processed % PROGRESS_EVERY === 0 || processed === filesToProcess.length) {
        emit('progress', { current: globalCurrent, total: globalTotal })
      }
      return entries
    })

    const newEntries = results.flat()
    const index = [...existingIndex, ...newEntries]
    fs.writeFileSync(indexPath, JSON.stringify(index))
    emit('step', { message: `Done: ${gallery} (${index.length} faces total, +${newEntries.length} new)`, gallery })
  }

  emit('done', {})
}

buildIndex().catch(err => {
  emit('error', { message: err.message })
  process.exit(1)
})
