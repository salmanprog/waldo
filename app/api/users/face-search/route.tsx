import fs from 'fs'
import path from 'path'
import { NextResponse } from 'next/server'
import * as faceapi from 'face-api.js'
import * as canvas from 'canvas'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

// ─────────────────────────────────────────────
// Canvas monkey-patch for Node (TypeScript safe)
// ─────────────────────────────────────────────
const {
  Canvas,
  Image: CanvasImage,
  ImageData: CanvasImageData,
} = canvas as unknown as {
  Canvas: typeof HTMLCanvasElement
  Image: typeof HTMLImageElement
  ImageData: typeof ImageData
}

faceapi.env.monkeyPatch({
  Canvas,
  Image: CanvasImage,
  ImageData: CanvasImageData,
})

// ─────────────────────────────────────────────
// Model loader (cached in memory)
// ─────────────────────────────────────────────
let modelsLoaded = false
const MODEL_PATH = path.join(process.cwd(), 'models')
const GALLERY_ROOT = path.join(process.cwd(), 'public', 'uploads', 'gallery')
const BATCH_SIZE = 6
const MAX_IMAGE_DIM = 1024

async function loadModels(): Promise<void> {
  if (modelsLoaded) return

  await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_PATH)
  await faceapi.nets.tinyFaceDetector.loadFromDisk(MODEL_PATH)
  await faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_PATH)
  await faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_PATH)

  modelsLoaded = true
}

// Same resize as build-face-index.js so query and index descriptors match
function resizeIfNeeded(img: { width: number; height: number }, maxDim: number): { width: number; height: number } {
  const w = img.width
  const h = img.height
  if (w <= maxDim && h <= maxDim) return img
  const scale = maxDim / Math.max(w, h)
  const newW = Math.round(w * scale)
  const newH = Math.round(h * scale)
  const c = new (Canvas as unknown as new (w: number, h: number) => { getContext: (x: string) => { drawImage: (i: unknown, sx: number, sy: number, sw: number, sh: number, dx: number, dy: number, dw: number, dh: number) => void } })(newW, newH)
  const ctx = c.getContext('2d')
  if (ctx) ctx.drawImage(img, 0, 0, w, h, 0, 0, newW, newH)
  return c as unknown as { width: number; height: number }
}

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type FaceIndexEntry = {
  image: string
  desc: number[]
}

type FaceMatch = {
  image: string
  similarity: number
}

type FaceSearchResult = FaceMatch & {
  galleryImageId: number | null
}

// In-memory index cache (no disk read per search)
const indexCache = new Map<string, { index: FaceIndexEntry[]; mtime: number }>()

// ─────────────────────────────────────────────
// On-demand index build (no build-face-index.js needed)
// ─────────────────────────────────────────────
async function getOrBuildIndex(gallery: string, platoonNumber?: number | string | null): Promise<FaceIndexEntry[]> {
  const subdir = platoonNumber != null ? `platoon-${platoonNumber}` : 'items'
  let itemsDir = path.join(GALLERY_ROOT, gallery, subdir)
  if (!fs.existsSync(itemsDir)) {
    // Fallback: if platoon dir missing, try items/
    if (platoonNumber != null) {
      itemsDir = path.join(GALLERY_ROOT, gallery, 'items')
      if (fs.existsSync(itemsDir)) {
        // Use items dir, image paths stay under items/
        return getOrBuildIndex(gallery, null)
      }
    }
    throw new Error('Gallery not found')
  }

  const indexKey = platoonNumber != null ? `${gallery}-platoon-${platoonNumber}` : gallery
  const indexPath = path.join(MODEL_PATH, `index-${indexKey.replace(/[/\\]/g, '-')}.json`)
  const dirMtime = fs.statSync(itemsDir).mtimeMs

  // Check in-memory cache
  const cached = indexCache.get(indexKey)
  if (cached && cached.mtime >= dirMtime) {
    return cached.index
  }

  // Check disk cache
  if (fs.existsSync(indexPath)) {
    try {
      const stat = fs.statSync(indexPath)
      if (stat.mtimeMs >= dirMtime) {
        const index = JSON.parse(fs.readFileSync(indexPath, 'utf-8')) as FaceIndexEntry[]
        indexCache.set(indexKey, { index, mtime: dirMtime })
        return index
      }
    } catch {
      // Fall through to rebuild
    }
  }

  // Build index on-demand (parallel processing for speed)
  await loadModels()
  const files = fs.readdirSync(itemsDir).filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f))
  const index: FaceIndexEntry[] = []

  for (let i = 0; i < files.length; i += BATCH_SIZE) {
    const batch = files.slice(i, i + BATCH_SIZE)
    const results = await Promise.all(
      batch.map(async (file) => {
        const imgPath = path.join(itemsDir, file)
        try {
          const img = await canvas.loadImage(imgPath)
          const source = resizeIfNeeded(img as unknown as InstanceType<typeof CanvasImage>, MAX_IMAGE_DIM)
          let detections = await faceapi
            .detectAllFaces(source as unknown as faceapi.TNetInput, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.2, maxResults: 20 }))
            .withFaceLandmarks()
            .withFaceDescriptors()
          if (detections.length === 0) {
            detections = await faceapi
              .detectAllFaces(source as unknown as faceapi.TNetInput, new faceapi.TinyFaceDetectorOptions({ inputSize: 512, scoreThreshold: 0.2 }))
              .withFaceLandmarks()
              .withFaceDescriptors()
          }
          const imagePrefix = platoonNumber != null
            ? `/uploads/gallery/${gallery}/platoon-${platoonNumber}`
            : `/uploads/gallery/${gallery}/items`
          return detections.map((d) => ({
            image: `${imagePrefix}/${file}`,
            desc: Array.from(d.descriptor),
          }))
        } catch {
          return []
        }
      })
    )
    for (const entries of results) index.push(...entries)
  }

  indexCache.set(indexKey, { index, mtime: dirMtime })
  fs.mkdirSync(MODEL_PATH, { recursive: true })
  fs.writeFileSync(indexPath, JSON.stringify(index))
  return index
}

// ─────────────────────────────────────────────
// POST /api/users/face-search
// ─────────────────────────────────────────────
export async function POST(request: Request) {
  const startTime = Date.now()

  try {
    const body = await request.json()

    const imageBase64: string | undefined = body.imageBase64
    const gallery: string | undefined = body.gallery
    const platoonNumber: number | string | null =
      body.platoonNumber != null && body.platoonNumber !== ''
        ? body.platoonNumber
        : null
    const threshold: number = body.threshold ?? 0.6
    const notificationEmail: string | undefined = body.notificationEmail
    const notificationPhone: string | undefined = body.notificationPhone

    if (!imageBase64 || !gallery) {
      return NextResponse.json(
        { code: 400, message: 'imageBase64 and gallery are required' },
        { status: 400 }
      )
    }

    await loadModels()

    // ─────────────────────────────
    // Decode uploaded image (resize like index so same image → same descriptor)
    // ─────────────────────────────
    const buffer = Buffer.from(imageBase64, 'base64')
    const img = await canvas.loadImage(buffer)
    const queryInput = resizeIfNeeded(img as unknown as InstanceType<typeof CanvasImage>, MAX_IMAGE_DIM)

    // Try SSD MobileNet first (more accurate), then TinyFaceDetector fallback
    let detection = await faceapi
      .detectSingleFace(
        queryInput as unknown as faceapi.TNetInput,
        new faceapi.SsdMobilenetv1Options({ minConfidence: 0.2 })
      )
      .withFaceLandmarks()
      .withFaceDescriptor()

    if (!detection) {
      detection = await faceapi
        .detectSingleFace(
          queryInput as unknown as faceapi.TNetInput,
          new faceapi.TinyFaceDetectorOptions({
            inputSize: 512,
            scoreThreshold: 0.2,
          })
        )
        .withFaceLandmarks()
        .withFaceDescriptor()
    }

    if (!detection) {
      return NextResponse.json({
        code: 200,
        message: 'No face detected in uploaded image',
        data: { results: [] },
      })
    }

    const queryDescriptor = detection.descriptor

    // ─────────────────────────────
    // Get or build index (on-demand, no build-face-index.js needed)
    // ─────────────────────────────
    let index: FaceIndexEntry[]
    try {
      index = await getOrBuildIndex(gallery, platoonNumber)
    } catch (err) {
      return NextResponse.json(
        { code: 404, message: (err as Error).message },
        { status: 404 }
      )
    }

    // ─────────────────────────────
    // Compare descriptors (FAST)
    // ─────────────────────────────
    const results: FaceMatch[] = []

    for (const entry of index) {
      const distance = faceapi.euclideanDistance(
        queryDescriptor,
        new Float32Array(entry.desc)
      )
      let similarity = 1 - distance
      if (distance < 0.005) similarity = 1
      else similarity = Number(similarity.toFixed(3))

      if (distance < threshold) {
        results.push({
          image: entry.image,
          similarity,
        })
      }
    }

    results.sort((a, b) => b.similarity - a.similarity)

    const uniquePaths = [...new Set(results.map((r) => r.image))]
    const idByPath = new Map<string, number>()
    if (uniquePaths.length > 0) {
      const rows = await prisma.galleryItem.findMany({
        where: {
          deletedAt: null,
          status: true,
          imageUrl: { in: uniquePaths },
        },
        select: { id: true, imageUrl: true },
      })
      for (const row of rows) {
        idByPath.set(row.imageUrl, row.id)
      }
    }

    const resultsWithIds: FaceSearchResult[] = results.map((r) => ({
      image: r.image,
      similarity: r.similarity,
      galleryImageId: idByPath.get(r.image) ?? null,
    }))

    console.log(
      `⚡ Face search (${gallery}) in ${Date.now() - startTime}ms`
    )

    // Include notification contact when matches found (for future notification service)
    const notificationContact =
      resultsWithIds.length > 0 && (notificationEmail || notificationPhone)
        ? { email: notificationEmail, phone: notificationPhone }
        : undefined

    return NextResponse.json({
      code: 200,
      message: 'success',
      data: {
        results: resultsWithIds,
        ...(notificationContact && { notificationContact }),
      },
    })
  } catch (error) {
    return NextResponse.json(
      { code: 500, message: (error as Error).message },
      { status: 500 }
    )
  }
}
