"use client";

import { useEffect, useRef, useState } from "react";
import Button from "@/components/ui/button/Button";
import { useParams, useRouter } from "next/navigation";
import useApi from "@/utils/useApi";

const MAX_IMAGES = 5;
const PAGE_SIZE = 20;

async function sendGalleryUploadEmailToPurchasers(galleryIdStr: string) {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token") || sessionStorage.getItem("token") || ""
      : "";
  if (!token) return;
  const gid = Number(galleryIdStr);
  if (Number.isNaN(gid) || gid < 1) return;
  try {
    await fetch("/api/admin/gallery-items/notify-purchasers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ galleryId: gid }),
    });
  } catch (e) {
    console.error("notify purchasers email:", e);
  }
}

export default function AddGalleryImages() {
  const router = useRouter();
  const params = useParams();

  const galleryId =
    typeof params.id === "string" ? params.id : params.id?.[0] ?? "";

  useEffect(() => {
    document.title = "Admin | Upload Gallery Images";
  }, []);

  // ================= STATES =================
  const [images, setImages] = useState<File[]>([]);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Face index: which image paths are indexed, and indexing progress
  const [indexedPaths, setIndexedPaths] = useState<Set<string>>(new Set());
  const [indexing, setIndexing] = useState(false);
  const [indexProgress, setIndexProgress] = useState(0);
  const [indexStep, setIndexStep] = useState("");
  const [fullRebuild, setFullRebuild] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ================= APIs =================

  // upload API
  const { sendData } = useApi({
    url: "/api/admin/gallery-items/multiple",
    type: "manual",
    requiresAuth: true,
  });

  // list API (same pattern)
  const {
    data: galleryItems,
    fetchApi: fetchGalleryItems,
  } = useApi({
    url: `/api/admin/gallery-items?galleryId=${galleryId}`,
    method: "GET",
    type: "manual",
    requiresAuth: true,
  });

  // delete API (same pattern)
  const { sendData: deleteItem } = useApi({
    url: "/api/admin/gallery-items",
    type: "manual",
    requiresAuth: true,
  });

  // ================= LOAD GALLERY + INDEXED PATHS =================
  useEffect(() => {
    if (galleryId) {
      fetchGalleryItems();
    }
  }, [galleryId]);

  const fetchIndexedPaths = async () => {
    if (!galleryId) return;
    try {
      const res = await fetch(
        `/api/admin/face-index?galleryId=${encodeURIComponent(galleryId)}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` } }
      );
      const data = await res.json();
      if (data?.data?.indexedPaths) {
        setIndexedPaths(new Set(data.data.indexedPaths));
      }
    } catch {
      setIndexedPaths(new Set());
    }
  };

  useEffect(() => {
    if (galleryId) fetchIndexedPaths();
  }, [galleryId]);

  // ================= FILE CHANGE =================
  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const selected = Array.from(e.target.files);

    if (selected.length + images.length > MAX_IMAGES) {
      setErrorMsg(`Maximum ${MAX_IMAGES} images allowed.`);
      e.target.value = "";
      return;
    }

    setErrorMsg("");
    setImages((prev) => [...prev, ...selected]);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (uploading) return;
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
    if (files.length + images.length > MAX_IMAGES) {
      setErrorMsg(`Maximum ${MAX_IMAGES} images allowed.`);
      return;
    }
    setErrorMsg("");
    setImages((prev) => [...prev, ...files]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  // ================= REMOVE PREVIEW =================
  const removePreviewImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // ================= UPLOAD =================
  const uploadImages = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!galleryId) return setErrorMsg("Gallery ID missing");
    if (!images.length) return setErrorMsg("Select at least one image");

    const formData = new FormData();
    formData.append("galleryId", galleryId);

    images.forEach((file) => {
      formData.append("images[]", file);
    });

    try {
      setUploading(true);
      setProgress(0);

      const res = await sendData(formData, (percent) => {
        setProgress(percent);
      });

      if (res?.code === 200) {
        setImages([]);
        setVisibleCount(PAGE_SIZE);
        fetchGalleryItems(); // refresh grid
        void sendGalleryUploadEmailToPurchasers(galleryId);
      } else {
        setErrorMsg(res?.message || "Upload failed");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // ================= BUILD FACE INDEX =================
  const runFaceIndex = async () => {
    if (!galleryId) return setErrorMsg("Gallery ID missing");
    setErrorMsg("");
    setIndexing(true);
    setIndexProgress(0);
    setIndexStep("Starting…");
    try {
      const res = await fetch("/api/admin/face-index", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify({
          galleryId: Number(galleryId),
          fullRebuild,
        }),
      });
      if (!res.ok || !res.body) {
        setErrorMsg("Failed to start indexing");
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const ev = JSON.parse(line) as { type: string; message?: string; current?: number; total?: number };
            if (ev.type === "step" && ev.message) setIndexStep(ev.message);
            if (ev.type === "progress" && ev.total != null && ev.current != null) {
              const pct = ev.total === 0 ? 100 : Math.round((100 * ev.current) / ev.total);
              setIndexProgress(Math.min(100, pct));
              await new Promise((r) => setTimeout(r, 0));
            }
            if (ev.type === "done") setIndexProgress(100);
            if (ev.type === "error" && ev.message) setErrorMsg(ev.message);
          } catch {
            // ignore parse errors
          }
        }
      }
      setIndexStep("Complete");
      setIndexProgress(100);
      await fetchIndexedPaths();
      fetchGalleryItems();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Indexing failed");
    } finally {
      setIndexing(false);
    }
  };

  const imagePathFromUrl = (imageUrl: string): string => {
    try {
      if (imageUrl.startsWith("/")) return imageUrl;
      const u = new URL(imageUrl);
      return u.pathname;
    } catch {
      return imageUrl;
    }
  };

  // ================= DELETE IMAGE =================
  const deleteImage = async (slug: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return;

    try {
      const res = await fetch(`/api/admin/gallery-items/${slug}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });
  
      const data = await res.json();
  
      if (res.ok && data?.code === 200) {
        fetchGalleryItems();
      } else {
        setErrorMsg(data?.message || "Delete failed");
      }
    } catch (err: any) {
      setErrorMsg("Delete failed");
    }
  
  };

  // ================= PAGINATION =================
  const rawItems = Array.isArray(galleryItems) ? galleryItems : [];
  const allImages = rawItems;
  const visibleImages = allImages.slice(0, visibleCount);
  const hasMore = visibleCount < allImages.length;

  // ================= UI =================
  return (
    <div className="p-4 mx-auto md:p-6 max-w-5xl">
      <h2 className="text-xl font-semibold mb-6">
        Upload Gallery Images
      </h2>

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {errorMsg}
        </div>
      )}

      {/* ================= UPLOAD FORM ================= */}
      <form onSubmit={uploadImages} className="space-y-5 mb-10">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFiles}
          disabled={uploading}
          className="sr-only"
          aria-label="Choose images to upload"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          disabled={uploading}
          className={`w-full min-h-[120px] flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed transition-colors disabled:opacity-50 disabled:pointer-events-none ${
            dragOver
              ? "border-blue-500 bg-blue-50/50"
              : "border-gray-300 bg-gray-50/50 hover:border-blue-400 hover:bg-blue-50/30"
          }`}
        >
          <span className="text-gray-500">
            <svg className="w-10 h-10 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </span>
          <span className="text-sm font-medium text-gray-600">
            Choose images or drag and drop
          </span>
          <span className="text-xs text-gray-500">
            Maximum {MAX_IMAGES} images per upload · JPG, PNG, WebP
          </span>
        </button>

        {/* PREVIEW GRID */}
        {images.length > 0 && (
          <div className="grid grid-cols-5 gap-3">
            {images.map((file, index) => (
              <div key={index} className="relative">
                <img
                  src={URL.createObjectURL(file)}
                  className="w-full h-20 object-cover rounded"
                />
                <button
                  type="button"
                  onClick={() => removePreviewImage(index)}
                  className="absolute top-1 right-1 bg-black/70 text-white text-xs px-1 rounded"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {uploading && (
          <>
            <div className="w-full bg-gray-200 h-3 rounded overflow-hidden">
              <div
                className="bg-green-600 h-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm">{progress}% uploading…</p>
          </>
        )}

        <div className="flex gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={uploading}
          >
            Cancel
          </Button>
          <Button type="submit" loading={uploading}>
            Upload
          </Button>
        </div>
      </form>

      {/* ================= BUILD FACE INDEX ================= */}
      {galleryId && (
        <div className="mb-8 p-4 border rounded-lg bg-gray-50">
          <h3 className="text-lg font-semibold mb-2">Face index</h3>
          <p className="text-sm text-gray-600 mb-3">
            Index faces in this gallery&apos;s directory so face search can find them. By default only new images are indexed (fast). Use &quot;Full rebuild&quot; to re-index all images in this gallery.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={fullRebuild}
                onChange={(e) => setFullRebuild(e.target.checked)}
                disabled={indexing || uploading}
              />
              Full rebuild (re-index all images in this gallery)
            </label>
            <Button
              type="button"
              variant="outline"
              onClick={runFaceIndex}
              disabled={indexing || uploading}
            >
              {indexing ? "Indexing…" : "Build face index"}
            </Button>
          </div>
          {indexing && (
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full overflow-hidden h-4">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-300 ease-out flex-shrink-0"
                  style={{
                    width: `${Math.min(100, indexProgress)}%`,
                    minWidth: indexProgress > 0 ? "2%" : "0%",
                  }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-1">{indexProgress}% — {indexStep}</p>
            </div>
          )}
        </div>
      )}

      {/* ================= EXISTING GALLERY GRID ================= */}
      <h3 className="text-lg font-semibold mb-4">
        Gallery Images
      </h3>

      {visibleImages.length === 0 ? (
        <p className="text-gray-500 py-8 text-center rounded-lg border border-dashed border-gray-300">
          No images found
        </p>
      ) : (
        <div className="grid grid-cols-5 gap-4">
          {visibleImages.map((img: any) => {
            const path = imagePathFromUrl(img.imageUrl ?? "");
            const isIndexed = indexedPaths.has(path);
            return (
              <div
                key={img.id}
                className="relative border rounded overflow-hidden group"
              >
                <img
                  src={img.imageUrl}
                  className="w-full h-32 object-cover"
                />
                <span
                  className={`absolute bottom-2 left-2 text-xs px-2 py-0.5 rounded ${
                    isIndexed ? "bg-green-600 text-white" : "bg-gray-500 text-white"
                  }`}
                >
                  {isIndexed ? "Indexed" : "Not indexed"}
                </span>
                <button
                  type="button"
                  onClick={() => deleteImage(img.slug)}
                  className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded
                             opacity-0 group-hover:opacity-100 transition"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* LOAD MORE */}
      {hasMore && (
        <div className="flex justify-center mt-6">
          <Button onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}>
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}
