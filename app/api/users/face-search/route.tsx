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

async function loadModels(): Promise<void> {
  if (modelsLoaded) return

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

    const detection = await faceapi
      .detectSingleFace(
        img as unknown as faceapi.TNetInput,
        new faceapi.TinyFaceDetectorOptions({
          inputSize: 416,
          scoreThreshold: 0.3,
        })
      )
      .withFaceLandmarks()
      .withFaceDescriptor()

    if (!detection) {
      return NextResponse.json({
        code: 200,
        message: 'No face detected in uploaded image',
        data: { results: [] },
      })
    }

    const queryDescriptor = detection.descriptor

    // ─────────────────────────────
    // Load FAST index JSON
    // ─────────────────────────────
    const indexPath = path.join(
      process.cwd(),
      'models',
      `index-${gallery}.json`
    )

    if (!fs.existsSync(indexPath)) {
      return NextResponse.json(
        { code: 404, message: 'Face index not found for gallery' },
        { status: 404 }
      )
    }

    const index: FaceIndexEntry[] = JSON.parse(
      fs.readFileSync(indexPath, 'utf-8')
    )

    // ─────────────────────────────
    // Compare descriptors (FAST)
    // ─────────────────────────────
    const results: FaceSearchResult[] = []

    for (const entry of index) {
      const distance = faceapi.euclideanDistance(
        queryDescriptor,
        new Float32Array(entry.desc)
      )

      if (distance < threshold) {
        results.push({
          image: entry.image,
          similarity: Number((1 - distance).toFixed(3)),
        })
      }
    }

    results.sort((a, b) => b.similarity - a.similarity)

    console.log(
      `⚡ Face search (${gallery}) in ${Date.now() - startTime}ms`
    )

    return NextResponse.json({
      code: 200,
      message: 'success',
      data: { results },
    })
  } catch (error) {
    console.error('❌ Face search error:', error)
    return NextResponse.json(
      { code: 500, message: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
