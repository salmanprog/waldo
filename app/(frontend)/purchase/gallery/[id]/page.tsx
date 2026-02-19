"use client";

import { use, useEffect, useState, useCallback } from "react";
import Image from "next/image";
import InnerBanner from "@/components/common/InnerBanner";
import useApi from "@/utils/useApi";

interface Gallery {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  gallery?: { id: number; title: string; slug: string; is_coff_book?: boolean };
}

interface FavouriteItem {
  id: number;
  galleryImageId: number;
  galleryImagePath: string;
}

export default function GalleryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [favouriteIds, setFavouriteIds] = useState<Set<number>>(new Set());
  
  const { data, loading, error, fetchApi } = useApi({
    url: `/api/users/gallery-items?galleryId=${id}`,
    method: "GET",
    type: "manual",
    requiresAuth: true,
  });

  const {
    data: favouritesData,
    fetchApi: fetchFavourites,
  } = useApi({
    url: "/api/users/favourite-images-coffe-book",
    method: "GET",
    type: "manual",
    requiresAuth: true,
  });

  useEffect(() => {
    fetchApi();
    fetchFavourites();
  }, [id]);

  useEffect(() => {
    if (data && Array.isArray(data)) {
      setGalleries(data);
    }
  }, [data]);

  useEffect(() => {
    if (favouritesData && Array.isArray(favouritesData)) {
      setFavouriteIds(new Set((favouritesData as FavouriteItem[]).map((f) => f.galleryImageId)));
    }
  }, [favouritesData]);

  const toggleFavourite = useCallback(
    async (galleryImageId: number, galleryImagePath: string) => {
      const isFavourited = favouriteIds.has(galleryImageId);
      const token = typeof window !== "undefined"
        ? localStorage.getItem("token") || sessionStorage.getItem("token") || ""
        : "";

      try {
        if (isFavourited) {
          const res = await fetch(
            `/api/users/favourite-images-coffe-book?galleryImageId=${galleryImageId}`,
            {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const json = await res.json();
          if (json.code === 200) {
            setFavouriteIds((prev) => {
              const next = new Set(prev);
              next.delete(galleryImageId);
              return next;
            });
          }
        } else {
          const res = await fetch("/api/users/favourite-images-coffe-book", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              galleryImageId,
              galleryImagePath: galleryImagePath || "",
            }),
          });
          const json = await res.json();
          if (json.code === 200) {
            setFavouriteIds((prev) => new Set([...prev, galleryImageId]));
          }
        }
      } catch (err) {
        console.error("Toggle favourite error:", err);
      }
    },
    [favouriteIds]
  );

  return (
    <>
      <InnerBanner bannerClass="products-banner" title="Gallery Images" />

      <section className="products-section sec-gap">
        <div className="container">
          {loading ? (
            <div className="text-center py-8">Loading galleries...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              Error loading galleries: {error}
            </div>
          ) : galleries.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {galleries.map((gallery) => (
                    <div className="product-card h-auto group" key={gallery.id}>
                    <div className="product-card-image">
                    <Image
                      src={gallery.imageUrl || ""}
                      alt={gallery.title || ""}
                      className="w-full"
                      width={400}
                      height={400}
                      unoptimized
                    />
                    </div>
                    <div className="product-hidden-content flex flex-col gap-2">
                        <a
                          href={gallery.imageUrl || "#"}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-primary w-full flex justify-center items-center gap-2"
                        >
                          <span>Download</span>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
                          </svg>
                        </a>
                        {galleries[0]?.gallery?.is_coff_book && (
                        <button
                          type="button"
                          onClick={() => toggleFavourite(gallery.id, gallery.imageUrl || "")}
                          className={`btn w-full flex justify-center items-center gap-2 ${
                            favouriteIds.has(gallery.id)
                              ? "btn-secondary"
                              : "btn-primary"
                          }`}
                        >
                          {favouriteIds.has(gallery.id) ? (
                            <>
                              <span>Remove from coffee table book</span>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </>
                          ) : (
                            <>
                              <span>Add to coffee table book</span>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            </>
                          )}
                        </button>
                        )}
                    </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-600">
              No galleries found.
            </div>
          )}
        </div>
      </section>
    </>
  );
}
