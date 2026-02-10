'use client'

import { use, useState, useEffect, useRef } from 'react'
import InnerBanner from '@/components/common/InnerBanner'

const SEARCH_STEPS = [
  'Detecting face…',
  'Analyzing features…',
  'Searching gallery…',
  'Matching faces…',
]

type FaceResult = {
  image: string
  similarity: number
}

type Angle = 'frontal' | 'threeQuarter' | 'profile'

type UploadSlot = {
  preview: string | null
  file: File | null
}

// Simple face silhouette SVGs for three angles (frontal, 3/4, profile)
const SAMPLE_FRONTAL = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 140" fill="%236b7280"><ellipse cx="60" cy="75" rx="40" ry="45"/><ellipse cx="45" cy="68" rx="4" ry="5" fill="%239ca3af"/><ellipse cx="75" cy="68" rx="4" ry="5" fill="%239ca3af"/><path d="M50 95 Q60 105 70 95" stroke="%239ca3af" stroke-width="2" fill="none"/></svg>')
const SAMPLE_THREE_QUARTER = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 140" fill="%236b7280"><path d="M85 75 Q95 75 95 120 Q95 130 55 130 Q25 130 25 95 Q25 70 50 55 Q75 45 90 60 Z"/><ellipse cx="65" cy="68" rx="4" ry="5" fill="%239ca3af"/><path d="M55 92 Q65 98 72 92" stroke="%239ca3af" stroke-width="2" fill="none"/></svg>')
const SAMPLE_PROFILE = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 140" fill="%236b7280"><path d="M35 55 Q50 45 75 50 Q95 55 95 85 Q95 120 70 130 Q40 130 30 100 Q25 75 35 55 Z"/><ellipse cx="65" cy="70" rx="3" ry="4" fill="%239ca3af"/><path d="M45 95 Q55 98 62 94" stroke="%239ca3af" stroke-width="2" fill="none"/></svg>')

const ANGLE_LABELS: Record<Angle, string> = {
  frontal: 'Frontal',
  threeQuarter: '3/4 View',
  profile: 'Profile',
}

const ANGLE_SAMPLES: Record<Angle, string> = {
  frontal: SAMPLE_FRONTAL,
  threeQuarter: SAMPLE_THREE_QUARTER,
  profile: SAMPLE_PROFILE,
}

const initialUploads: Record<Angle, UploadSlot> = {
  frontal: { preview: null, file: null },
  threeQuarter: { preview: null, file: null },
  profile: { preview: null, file: null },
}

export default function FaceSearch({
  params,
}: {
  params: Promise<{ platoonNumber: string; gallery: string }>
}) {
  const { platoonNumber, gallery: galleryParam } = use(params)
  const gallery = galleryParam ? decodeURIComponent(galleryParam) : 'platoon-event'
  const [uploads, setUploads] = useState<Record<Angle, UploadSlot>>(initialUploads)
  const [results, setResults] = useState<FaceResult[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)
  const [notificationEmail, setNotificationEmail] = useState('')
  const [notificationPhone, setNotificationPhone] = useState('')
  const [notifyVia, setNotifyVia] = useState<'email' | 'phone'>('email')
  const [searchStepIndex, setSearchStepIndex] = useState(0)
  const fileInputRefs = useRef<Record<Angle, HTMLInputElement | null>>({
    frontal: null,
    threeQuarter: null,
    profile: null,
  })
  const uploadsRef = useRef(uploads)
  uploadsRef.current = uploads

  const handleFileSelect = (angle: Angle, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPG, PNG, or WebP).')
      return
    }
    setError(null)
    setResults([])
    setSearched(false)
    const prev = uploads[angle]?.preview
    if (prev) URL.revokeObjectURL(prev)
    setUploads((u) => ({
      ...u,
      [angle]: { preview: URL.createObjectURL(file), file },
    }))
  }

  const validateAndConvert = async (
    file: File,
    dataUrl: string
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image()
      img.onload = () => {
        const w = img.naturalWidth
        const h = img.naturalHeight
        if (w < 100 || h < 100) {
          reject(new Error('Image too small. Use at least 100×100 pixels (head and shoulders).'))
          return
        }
        if (Math.max(w, h) > 1920) {
          reject(new Error('Image too large. Max dimension 1920 pixels (e.g. 1920×1080).'))
          return
        }
        let base64 = dataUrl.split(',')[1] ?? ''
        if (file.type === 'image/webp') {
          try {
            const canvas = document.createElement('canvas')
            canvas.width = w
            canvas.height = h
            const ctx = canvas.getContext('2d')
            if (ctx) {
              ctx.drawImage(img, 0, 0)
              base64 = canvas.toDataURL('image/jpeg', 0.92).split(',')[1] ?? base64
            }
          } catch {
            // keep original
          }
        }
        resolve(base64)
      }
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = dataUrl
    })
  }

  const runSearchForFile = async (file: File): Promise<FaceResult[]> => {
    const dataUrl = await new Promise<string>((res, rej) => {
      const r = new FileReader()
      r.onload = () => res(r.result as string)
      r.onerror = () => rej(new Error('Failed to read file'))
      r.readAsDataURL(file)
    })
    const base64 = await validateAndConvert(file, dataUrl)
    const res = await fetch('/api/users/face-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBase64: base64,
        gallery,
        platoonNumber: platoonNumber || undefined,
        notificationEmail: notifyVia === 'email' ? notificationEmail : undefined,
        notificationPhone: notifyVia === 'phone' ? notificationPhone : undefined,
      }),
    })
    const json = await res.json()
    if (!res.ok || json.code !== 200) throw new Error(json.message || 'Face search failed')
    return json.data?.results ?? []
  }

  const handleSearch = async () => {
    const angles: Angle[] = ['frontal', 'threeQuarter', 'profile']
    const toSearch = angles.filter((a) => uploads[a].file)
    if (toSearch.length === 0) {
      setError('Upload at least one photo (Frontal, 3/4 View, or Profile) to search.')
      return
    }
    setError(null)
    setLoading(true)
    setSearched(true)
    try {
      const allResults: FaceResult[] = []
      for (const angle of toSearch) {
        const list = await runSearchForFile(uploads[angle].file!)
        allResults.push(...list)
      }
      const byImage = new Map<string, number>()
      for (const r of allResults) {
        const current = byImage.get(r.image)
        if (current == null || r.similarity > current) byImage.set(r.image, r.similarity)
      }
      const merged = Array.from(byImage.entries())
        .map(([image, similarity]) => ({ image, similarity }))
        .sort((a, b) => b.similarity - a.similarity)
      setResults(merged)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    return () => {
      ;(['frontal', 'threeQuarter', 'profile'] as Angle[]).forEach((a) => {
        const prev = uploadsRef.current[a]?.preview
        if (prev) URL.revokeObjectURL(prev)
      })
    }
  }, [])

  useEffect(() => {
    if (!loading) setSearchStepIndex(0)
    else {
      const t = setInterval(() => setSearchStepIndex((i) => (i + 1) % SEARCH_STEPS.length), 1400)
      return () => clearInterval(t)
    }
  }, [loading])

  const handleReset = () => {
    ;(['frontal', 'threeQuarter', 'profile'] as Angle[]).forEach((a) => {
      if (uploads[a].preview) URL.revokeObjectURL(uploads[a].preview)
    })
    setUploads(initialUploads)
    setResults([])
    setError(null)
    setSearched(false)
  }

  const hasAnyUpload = uploads.frontal.file || uploads.threeQuarter.file || uploads.profile.file
  const showLoadingOverlay = loading && hasAnyUpload

  return (
    <>
      <InnerBanner title="Face Search" bannerClass="products-banner" />
      <section className="py-20">
        <div className="container">
          <div className="max-w-3xl mx-auto space-y-8">

            {/* Photo guidelines */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                Photo Guidelines
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                With a mobile device, we suggest you take three photographs of your grad specifically for the Facial Recognition: frontal view, 3/4 view and profile. Follow these guidelines:
              </p>
              <ul className="text-gray-600 dark:text-gray-400 text-sm space-y-2 list-disc list-inside mb-6">
                <li>Head and shoulders</li>
                <li>Sharp, no facial obstructions</li>
                <li>Both eyes open</li>
                <li>Larger than 100×100 pixels, resolution up to 1920×1080</li>
                <li>Colored images</li>
                <li>Flat lighting, no backlighting</li>
                <li>Neutral expression with no smiles</li>
              </ul>

              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Upload one or more angles below, then click Search.
              </p>
            </div>

            {/* Search form: three upload sections + Search */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
                Search Face in Gallery
              </h2>

              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {(['frontal', 'threeQuarter', 'profile'] as Angle[]).map((angle) => (
                    <div key={angle} className="text-center">
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        {ANGLE_LABELS[angle]}
                      </p>
                      <div className="relative rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 aspect-square flex items-center justify-center p-2 min-h-[140px]">
                        {uploads[angle].preview ? (
                          <img
                            src={uploads[angle].preview}
                            alt={ANGLE_LABELS[angle]}
                            className={`w-full h-full object-contain rounded ${showLoadingOverlay ? 'opacity-60' : ''}`}
                          />
                        ) : (
                          <img
                            src={ANGLE_SAMPLES[angle]}
                            alt={ANGLE_LABELS[angle]}
                            className="w-full h-full object-contain opacity-70"
                          />
                        )}
                      </div>
                      <input
                        ref={(el) => { fileInputRefs.current[angle] = el }}
                        type="file"
                        accept="image/*,image/webp"
                        onChange={(e) => handleFileSelect(angle, e)}
                        disabled={loading}
                        className="sr-only"
                        aria-label={`Upload ${ANGLE_LABELS[angle]} photo`}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRefs.current[angle]?.click()}
                        disabled={loading}
                        className="mt-2 w-full py-2 px-4 rounded-lg text-sm font-semibold bg-[var(--secondary-theme)] text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
                      >
                        Browse
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3 items-center">
                  <button
                    type="button"
                    onClick={handleSearch}
                    disabled={loading || !hasAnyUpload}
                    className="btn bg-[var(--secondary-theme)] text-white border-0 hover:opacity-90 px-6 py-2.5 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Searching…' : 'Search'}
                  </button>
                  {hasAnyUpload && !loading && (
                    <button
                      type="button"
                      onClick={handleReset}
                      className="btn border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 px-6 rounded-lg"
                    >
                      Reset
                    </button>
                  )}
                </div>

                {showLoadingOverlay && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl px-8 py-6 flex flex-col items-center gap-4 min-w-[260px]">
                      <div className="relative">
                        <div className="w-14 h-14 rounded-full border-4 border-gray-200 dark:border-gray-600 border-t-[var(--secondary-theme)] animate-spin" />
                        <div className="absolute inset-0 w-14 h-14 rounded-full border-4 border-transparent border-r-[var(--secondary-theme)]/50 animate-spin" style={{ animationDuration: '1.2s', animationDirection: 'reverse' }} />
                      </div>
                      <p className="text-sm font-semibold text-gray-800 dark:text-white">
                        {SEARCH_STEPS[searchStepIndex]}
                      </p>
                      <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                        <div
                          className="h-full w-1/3 bg-[var(--secondary-theme)] rounded-full"
                          style={{ animation: 'face-search-progress 1.8s ease-in-out infinite' }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="text-sm text-red-500 font-medium bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-lg border border-red-200 dark:border-red-800">
                    {error}
                  </div>
                )}

                {!loading && searched && results.length === 0 && (
                  <div className="rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                    <p className="text-gray-700 dark:text-gray-300">
                      No similar faces found.
                    </p>
                  </div>
                )}

                {results.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      Found {results.length} matching face{results.length !== 1 ? 's' : ''}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {results.map((r, i) => (
                        <div
                          key={i}
                          className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700"
                        >
                          <img
                            src={r.image}
                            alt="Matched face"
                            className="w-full aspect-square object-cover"
                          />
                          <div className="p-2 text-center space-y-2">
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 block">
                              {(r.similarity * 100).toFixed(1)}% similar
                            </span>
                            <a
                              href={r.image}
                              download
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-primary w-full flex justify-center items-center gap-2 text-sm py-2"
                            >
                              <span>Download</span>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
                              </svg>
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

