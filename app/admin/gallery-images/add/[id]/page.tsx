"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/button/Button";
import { useParams, useRouter } from "next/navigation";
import useApi from "@/utils/useApi";

const MAX_IMAGES = 5;
const PAGE_SIZE = 20;

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

  // ================= LOAD GALLERY =================
  useEffect(() => {
    if (galleryId) {
      fetchGalleryItems();
    }
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
      } else {
        setErrorMsg(res?.message || "Upload failed");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Upload failed");
    } finally {
      setUploading(false);
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
  const allImages = Array.isArray(galleryItems) ? galleryItems : [];
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
          type="file"
          multiple
          accept="image/*"
          onChange={handleFiles}
          disabled={uploading}
        />

        <p className="text-xs text-gray-500">
          Maximum {MAX_IMAGES} images per upload
        </p>

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

      {/* ================= EXISTING GALLERY GRID ================= */}
      <h3 className="text-lg font-semibold mb-4">
        Gallery Images
      </h3>

      <div className="grid grid-cols-5 gap-4">
        {visibleImages.map((img: any) => (
          <div
            key={img.id}
            className="relative border rounded overflow-hidden group"
          >
            <img
              src={img.imageUrl}
              className="w-full h-32 object-cover"
            />

            {/* ❌ DELETE BUTTON */}
            <button
              type="button"
              onClick={() => deleteImage(img.slug)}
              className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded
                         opacity-0 group-hover:opacity-100 transition"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

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
