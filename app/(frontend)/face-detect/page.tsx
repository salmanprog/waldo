'use client'

import { useState, useEffect } from 'react'
import InnerBanner from '@/components/common/InnerBanner'

type FaceResult = {
  image: string
  similarity: number
}

export default function FaceSearch() {
    const [gallery, setGallery] = useState<string>(
        'photographs-of-graduations-commissioning-gallery'
      )
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [results, setResults] = useState<FaceResult[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)

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

      try {
        const res = await fetch('/api/users/face-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64,
            gallery,
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
          <div className="max-w-3xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                Search Face in Gallery
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
                Upload a photo to find similar faces in our gallery.
              </p>

              <div className="space-y-6">
                <div>
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
                </div>

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
                  <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700">
                    <img
                      src={imagePreview}
                      alt="Upload preview"
                      className="w-full max-h-64 object-contain"
                    />
                  </div>
                )}

                {loading && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    🔍 Searching similar faces…
                  </p>
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
