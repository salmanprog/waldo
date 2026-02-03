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

async function buildIndex() {
  console.log('⏳ Loading models...')

  await faceapi.nets.tinyFaceDetector.loadFromDisk(MODEL_PATH)
  await faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_PATH)
  await faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_PATH)

  console.log('✅ Models loaded')

  for (const gallery of fs.readdirSync(GALLERY_ROOT)) {
    const itemsDir = path.join(GALLERY_ROOT, gallery, 'items')
    if (!fs.existsSync(itemsDir)) continue

    console.log(`📂 Indexing gallery: ${gallery}`)
    const index = []

    for (const file of fs.readdirSync(itemsDir)) {
      if (!/\.(jpg|jpeg|png|webp)$/i.test(file)) continue

      const imgPath = path.join(itemsDir, file)

      try {
        const img = await canvas.loadImage(imgPath)

        const detections = await faceapi
          .detectAllFaces(
            img,
            new faceapi.TinyFaceDetectorOptions({
              inputSize: 512,
              scoreThreshold: 0.3,
            })
          )
          .withFaceLandmarks()
          .withFaceDescriptors()

        for (const det of detections) {
          index.push({
            image: `/uploads/gallery/${gallery}/items/${file}`,
            desc: Array.from(det.descriptor),
          })
        }

        if (detections.length === 0) {
          console.log('❌ No face detected:', imgPath)
        }
      } catch {
        console.warn('⚠️ Failed:', imgPath)
      }
    }

    const outPath = path.join(MODEL_PATH, `index-${gallery}.json`)
    fs.writeFileSync(outPath, JSON.stringify(index))

    console.log(`✅ ${gallery}: ${index.length} faces indexed`)
  }

  console.log('🎉 Face index build complete')
}

buildIndex().catch(console.error)
