/**
 * Build face index from HTTP(S) image URLs (e.g. S3 public URLs from DB).
 * Env: FACE_INDEX_URLS_FILE = path to newline-separated URLs
 * Args: --gallery=folderName --platoon=N (optional)
 * Index file matches face-search: index-{gallery}.json or index-{gallery}-platoon-N.json
 */
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
const CONCURRENCY = 6
const MAX_IMAGE_DIM = 1024
const PROGRESS_EVERY = 1

function getGalleryFilter() {
  const arg = process.argv.find((a) => a.startsWith('--gallery='))
  if (!arg) return null
  return arg.replace('--gallery=', '').trim() || null
}

function getPlatoonFilter() {
  const arg = process.argv.find((a) => a.startsWith('--platoon='))
  if (!arg) return null
  const v = arg.replace('--platoon=', '').trim()
  return v === '' ? null : v
}

function isFullRebuild() {
  return process.env.FACE_INDEX_FULL === '1' || process.argv.includes('--full')
}

function emit(type, data) {
  const line = JSON.stringify({ type, ...data }) + '\n'
  try {
    fs.writeSync(process.stdout.fd, line)
  } catch {
    process.stdout.write(line)
  }
}

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

async function processImageUrl(imageUrl) {
  const img = await canvas.loadImage(imageUrl)
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

  return detections.map((det) => ({
    image: imageUrl,
    desc: Array.from(det.descriptor),
  }))
}

async function runWithConcurrency(items, limit, fn) {
  const results = []
  const executing = []
  for (const item of items) {
    const p = Promise.resolve()
      .then(() => fn(item))
      .then((result) => {
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
  const gallery = getGalleryFilter()
  const platoonFilter = getPlatoonFilter()
  const fullRebuild = isFullRebuild()
  const urlsFile = process.env.FACE_INDEX_URLS_FILE

  if (!gallery) {
    emit('error', { message: '--gallery= required' })
    process.exit(1)
  }
  if (!urlsFile || !fs.existsSync(urlsFile)) {
    emit('error', { message: 'FACE_INDEX_URLS_FILE missing or not found' })
    process.exit(1)
  }

  const raw = fs.readFileSync(urlsFile, 'utf-8')
  let allUrls = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .filter((u) => /^https?:\/\//i.test(u))

  const indexKey = platoonFilter ? `${gallery}-platoon-${platoonFilter}` : gallery
  const indexPath = path.join(
    MODEL_PATH,
    `index-${indexKey.replace(/[/\\]/g, '-')}.json`
  )

  let existingIndex = []
  let indexedPaths = new Set()
  if (!fullRebuild && fs.existsSync(indexPath)) {
    try {
      existingIndex = JSON.parse(fs.readFileSync(indexPath, 'utf-8'))
      if (Array.isArray(existingIndex)) {
        existingIndex.forEach((e) => e && e.image && indexedPaths.add(e.image))
      }
    } catch {
      existingIndex = []
      indexedPaths = new Set()
    }
  } else if (fullRebuild) {
    existingIndex = []
    indexedPaths = new Set()
  }

  const toProcess = fullRebuild
    ? allUrls
    : allUrls.filter((u) => !indexedPaths.has(u))

  emit('step', { message: 'Loading models...' })
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_PATH)
  await faceapi.nets.tinyFaceDetector.loadFromDisk(MODEL_PATH)
  await faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_PATH)
  await faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_PATH)
  emit('step', { message: 'Models loaded' })

  const globalTotal = toProcess.length
  let globalCurrent = 0

  emit('step', {
    message: fullRebuild
      ? `Indexing ${globalTotal} image URLs (full rebuild)`
      : `Indexing ${globalTotal} new image URLs`,
    gallery,
    total: globalTotal,
  })

  if (toProcess.length === 0) {
    emit('step', { message: 'Done (no new URLs)', gallery })
    emit('done', {})
    return
  }

  emit('progress', { current: globalCurrent, total: globalTotal })

  let processed = 0
  const results = await runWithConcurrency(toProcess, CONCURRENCY, async (url) => {
    let entries = []
    try {
      entries = await processImageUrl(url)
    } catch {
      //
    }
    processed++
    globalCurrent++
    if (processed % PROGRESS_EVERY === 0 || processed === toProcess.length) {
      emit('progress', { current: globalCurrent, total: globalTotal })
    }
    return entries
  })

  const newEntries = results.flat()
  const index = [...existingIndex, ...newEntries]
  fs.mkdirSync(MODEL_PATH, { recursive: true })
  fs.writeFileSync(indexPath, JSON.stringify(index))
  emit('step', {
    message: `Done: ${gallery} (${index.length} faces total, +${newEntries.length} new)`,
    gallery,
  })
  emit('done', {})
}

buildIndex().catch((err) => {
  emit('error', { message: err.message })
  process.exit(1)
})
