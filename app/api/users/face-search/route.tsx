import fs from 'fs'
import path from 'path'
import { NextResponse } from 'next/server'
import * as faceapi from 'face-api.js'
import * as canvas from 'canvas'

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

async function loadModels(): Promise<void> {
  if (modelsLoaded) return

  await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_PATH)
  await faceapi.nets.tinyFaceDetector.loadFromDisk(MODEL_PATH)
  await faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_PATH)
  await faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_PATH)

  modelsLoaded = true
}

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type FaceIndexEntry = {
  image: string
  desc: number[]
}

type FaceSearchResult = {
  image: string
  similarity: number
}

// In-memory index cache (no disk read per search)
const indexCache = new Map<string, { index: FaceIndexEntry[]; mtime: number }>()

// ─────────────────────────────────────────────
// On-demand index build (no build-face-index.js needed)
// ─────────────────────────────────────────────
async function getOrBuildIndex(gallery: string): Promise<FaceIndexEntry[]> {
  const itemsDir = path.join(GALLERY_ROOT, gallery, 'items')
  if (!fs.existsSync(itemsDir)) {
    throw new Error('Gallery not found')
  }

  const indexPath = path.join(MODEL_PATH, `index-${gallery}.json`)
  const dirMtime = fs.statSync(itemsDir).mtimeMs

  // Check in-memory cache
  const cached = indexCache.get(gallery)
  if (cached && cached.mtime >= dirMtime) {
    return cached.index
  }

  // Check disk cache
  if (fs.existsSync(indexPath)) {
    try {
      const stat = fs.statSync(indexPath)
      if (stat.mtimeMs >= dirMtime) {
        const index = JSON.parse(fs.readFileSync(indexPath, 'utf-8')) as FaceIndexEntry[]
        indexCache.set(gallery, { index, mtime: dirMtime })
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
          let detections = await faceapi
            .detectAllFaces(img as unknown as faceapi.TNetInput, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.2, maxResults: 20 }))
            .withFaceLandmarks()
            .withFaceDescriptors()
          if (detections.length === 0) {
            detections = await faceapi
              .detectAllFaces(img as unknown as faceapi.TNetInput, new faceapi.TinyFaceDetectorOptions({ inputSize: 512, scoreThreshold: 0.2 }))
              .withFaceLandmarks()
              .withFaceDescriptors()
          }
          return detections.map((d) => ({
            image: `/uploads/gallery/${gallery}/items/${file}`,
            desc: Array.from(d.descriptor),
          }))
        } catch {
          return []
        }
      })
    )
    for (const entries of results) index.push(...entries)
  }

  indexCache.set(gallery, { index, mtime: dirMtime })
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
    const threshold: number = body.threshold ?? 0.6
    const minSimilarity: number = body.minSimilarity ?? 0.6
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
    // Decode uploaded image
    // ─────────────────────────────
    const buffer = Buffer.from(imageBase64, 'base64')
    const img = await canvas.loadImage(buffer)

    // Try SSD MobileNet first (more accurate), then TinyFaceDetector fallback
    let detection = await faceapi
      .detectSingleFace(
        img as unknown as faceapi.TNetInput,
        new faceapi.SsdMobilenetv1Options({ minConfidence: 0.2 })
      )
      .withFaceLandmarks()
      .withFaceDescriptor()

    if (!detection) {
      detection = await faceapi
        .detectSingleFace(
          img as unknown as faceapi.TNetInput,
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
      index = await getOrBuildIndex(gallery)
    } catch (err) {
      return NextResponse.json(
        { code: 404, message: (err as Error).message },
        { status: 404 }
      )
    }

    // ─────────────────────────────
    // Compare descriptors (FAST)
    // ─────────────────────────────
    const results: FaceSearchResult[] = []

    for (const entry of index) {
      const distance = faceapi.euclideanDistance(
        queryDescriptor,
        new Float32Array(entry.desc)
      )
      const similarity = Number((1 - distance).toFixed(3))

      if (distance < threshold && similarity >= minSimilarity) {
        results.push({
          image: entry.image,
          similarity,
        })
      }
    }

    results.sort((a, b) => b.similarity - a.similarity)

    console.log(
      `⚡ Face search (${gallery}) in ${Date.now() - startTime}ms`
    )

    // Include notification contact when matches found (for future notification service)
    const notificationContact =
      results.length > 0 && (notificationEmail || notificationPhone)
        ? { email: notificationEmail, phone: notificationPhone }
        : undefined

    return NextResponse.json({
      code: 200,
      message: 'success',
      data: {
        results,
        ...(notificationContact && { notificationContact }),
      },
    })
  } catch (error) {
    console.error('❌ Face search error:', error)
    return NextResponse.json(
      { code: 500, message: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
