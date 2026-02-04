'use client'

import { useState, useEffect } from 'react'
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

// Simple face silhouette SVGs for three angles (frontal, 3/4, profile)
const SAMPLE_FRONTAL = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 140" fill="%236b7280"><ellipse cx="60" cy="75" rx="40" ry="45"/><ellipse cx="45" cy="68" rx="4" ry="5" fill="%239ca3af"/><ellipse cx="75" cy="68" rx="4" ry="5" fill="%239ca3af"/><path d="M50 95 Q60 105 70 95" stroke="%239ca3af" stroke-width="2" fill="none"/></svg>')
const SAMPLE_THREE_QUARTER = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 140" fill="%236b7280"><path d="M85 75 Q95 75 95 120 Q95 130 55 130 Q25 130 25 95 Q25 70 50 55 Q75 45 90 60 Z"/><ellipse cx="65" cy="68" rx="4" ry="5" fill="%239ca3af"/><path d="M55 92 Q65 98 72 92" stroke="%239ca3af" stroke-width="2" fill="none"/></svg>')
const SAMPLE_PROFILE = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 140" fill="%236b7280"><path d="M35 55 Q50 45 75 50 Q95 55 95 85 Q95 120 70 130 Q40 130 30 100 Q25 75 35 55 Z"/><ellipse cx="65" cy="70" rx="3" ry="4" fill="%239ca3af"/><path d="M45 95 Q55 98 62 94" stroke="%239ca3af" stroke-width="2" fill="none"/></svg>')

export default function FaceSearch() {
  const [gallery, setGallery] = useState<string>(
    'photographs-of-graduations-commissioning-gallery'
  )
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [results, setResults] = useState<FaceResult[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)
  const [notificationEmail, setNotificationEmail] = useState('')
  const [notificationPhone, setNotificationPhone] = useState('')
  const [notifyVia, setNotifyVia] = useState<'email' | 'phone'>('email')
  const [searchStepIndex, setSearchStepIndex] = useState(0)

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPG, PNG, etc.)')
      return
    }

    setError(null)
    setResults([])
    setSearched(false)
    const url = URL.createObjectURL(file)
    setImagePreview(url)
    setLoading(true)

    const reader = new FileReader()

    reader.onload = async () => {
      if (typeof reader.result !== 'string') {
        setError('Failed to read image file')
        setLoading(false)
        return
      }

      const base64 = reader.result.split(',')[1]
      if (!base64) {
        setError('Invalid image data')
        setLoading(false)
        return
      }

      // Validate image dimensions (100x100 min, max 1920×1080 per guideline)
      const img = new window.Image()
      img.onload = async () => {
        const w = img.naturalWidth
        const h = img.naturalHeight
        if (w < 100 || h < 100) {
          setError('Image too small. Use at least 100×100 pixels (head and shoulders).')
          setLoading(false)
          return
        }
        const maxDim = Math.max(w, h)
        if (maxDim > 1920) {
          setError('Image too large. Max dimension 1920 pixels (e.g. 1920×1080).')
          setLoading(false)
          return
        }

        try {
          const res = await fetch('/api/users/face-search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageBase64: base64,
              gallery,
              notificationEmail: notifyVia === 'email' ? notificationEmail : undefined,
              notificationPhone: notifyVia === 'phone' ? notificationPhone : undefined,
            }),
          })

          const json = await res.json()

          if (!res.ok || json.code !== 200) {
            throw new Error(json.message || 'Face search failed')
          }

          setResults(json.data?.results ?? [])
          setSearched(true)
        } catch (err) {
          setError((err as Error).message)
        } finally {
          setLoading(false)
        }
      }
      img.onerror = () => {
        setError('Failed to load image')
        setLoading(false)
      }
      img.src = reader.result as string
    }

    reader.onerror = () => {
      setError('Error reading file')
      setLoading(false)
    }

    reader.readAsDataURL(file)
  }

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview)
    }
  }, [imagePreview])

  // Cycle search step message while loading
  useEffect(() => {
    if (!loading) {
      setSearchStepIndex(0)
      return
    }
    const t = setInterval(() => {
      setSearchStepIndex((i) => (i + 1) % SEARCH_STEPS.length)
    }, 1400)
    return () => clearInterval(t)
  }, [loading])

  const handleReset = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImagePreview(null)
    setResults([])
    setError(null)
    setSearched(false)
  }

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

              {/* Three sample angles */}
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Three facial angles:
              </p>
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="text-center">
                  <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 aspect-square flex items-center justify-center p-2">
                    <img src={SAMPLE_FRONTAL} alt="Frontal view" className="w-full h-full object-contain" />
                  </div>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-2 block">Frontal</span>
                </div>
                <div className="text-center">
                  <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 aspect-square flex items-center justify-center p-2">
                    <img src={SAMPLE_THREE_QUARTER} alt="3/4 view" className="w-full h-full object-contain" />
                  </div>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-2 block">3/4 View</span>
                </div>
                <div className="text-center">
                  <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 aspect-square flex items-center justify-center p-2">
                    <img src={SAMPLE_PROFILE} alt="Profile view" className="w-full h-full object-contain" />
                  </div>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-2 block">Profile</span>
                </div>
              </div>
            </div>

            {/* Search form */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                Search Face in Gallery
              </h2>

              <div className="space-y-6">

                {/* <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Select gallery
                  </label>
                  <select
                    value={gallery}
                    onChange={(e) => {
                        setGallery(e.target.value)
                        setResults([])
                        setSearched(false)
                    }}
                    disabled={loading}
                    className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--secondary-theme)] focus:border-transparent disabled:opacity-50"
                    >
                    <option value="arsalan">Arsalan</option>
                    <option value="manual-seach-gallery">Manual Search Gallery</option>
                    <option value="photographs-of-graduations-commissioning-gallery">
                        Graduation / Commissioning
                    </option>
                    </select>
                </div> */}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Upload photo
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUpload}
                    disabled={loading}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[var(--secondary-theme)] file:text-white hover:file:bg-[var(--secondary-theme)]/90 cursor-pointer disabled:opacity-50"
                  />
                </div>

                {imagePreview && (
                  <div className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700">
                    <img
                      src={imagePreview}
                      alt="Upload preview"
                      className={`w-full max-h-64 object-contain transition-all duration-300 ${loading ? 'opacity-60 scale-[0.98]' : ''}`}
                    />
                    {loading && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px]">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl px-8 py-6 flex flex-col items-center gap-4 min-w-[240px]">
                          <div className="relative">
                            <div className="w-14 h-14 rounded-full border-4 border-gray-200 dark:border-gray-600 border-t-[var(--secondary-theme)] animate-spin" />
                            <div className="absolute inset-0 w-14 h-14 rounded-full border-4 border-transparent border-r-[var(--secondary-theme)]/50 animate-spin" style={{ animationDuration: '1.2s', animationDirection: 'reverse' }} />
                          </div>
                          <p className="text-sm font-semibold text-gray-800 dark:text-white transition-opacity duration-300">
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
                          <div className="p-2 text-center">
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                              {(r.similarity * 100).toFixed(1)}% similar
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(imagePreview || results.length > 0) && !loading && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="btn border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 px-6 rounded-lg"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

