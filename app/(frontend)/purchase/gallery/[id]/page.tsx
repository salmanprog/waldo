"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import InnerBanner from "@/components/common/InnerBanner";
import useApi from "@/utils/useApi";

interface Gallery {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
}

export default function GalleryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [galleries, setGalleries] = useState<Gallery[]>([]);

  const { data, loading, error, fetchApi } = useApi({
    url: `/api/users/gallery-items?galleryId=${id}`,
    method: "GET",
    type: "manual",
    requiresAuth: true,
  });

  useEffect(() => {
    fetchApi();
  }, [id]);

  useEffect(() => {
    if (data && Array.isArray(data)) {
      setGalleries(data);
    }
  }, [data]);

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
                    <div className="product-hidden-content">
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
