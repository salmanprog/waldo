"use client";

import { use, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
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
  is_face_recognition?: boolean;
  face_recognition_heading?: string | null;
  galleryPath?: string | null;
  numberOfDownlaod?: string | null;
}

interface OrderItemDownloads {
  remainingDownlaod?: string | null;
}

function galleryDownloadsLabel(value: string | null | undefined): string | null {
  if (value == null || String(value).trim() === "") return null;
  const v = String(value).trim();
  if (/^\d+$/.test(v)) {
    const n = Number(v);
    return `${n.toLocaleString()} download${n === 1 ? "" : "s"} available`;
  }
  return `${v} available`;
}

export default function GalleryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: orderId } = use(params);
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId") ?? "";

  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [platoonNumber, setPlatoonNumber] = useState<number | null>(null);
  /** OrderItem download fields for this order + event (from DB). */
  const [orderItemDownloads, setOrderItemDownloads] =
    useState<OrderItemDownloads | null>(null);

  const apiUrl = `/api/users/gallery?eventId=${eventId}&orderId=${orderId}`;
  const { data, loading, error, fetchApi } = useApi({
    url: apiUrl,
    method: "GET",
    type: "manual",
    requiresAuth: true,
  });

  useEffect(() => {
    if (eventId) fetchApi();
  }, [orderId, eventId]);

  useEffect(() => {
    if (data && Array.isArray(data)) {
      setGalleries(data);
    }
  }, [data]);

  useEffect(() => {
    if (!orderId) return;
    const token = typeof window !== "undefined"
      ? localStorage.getItem("token") || sessionStorage.getItem("token")
      : "";
    if (!token) return;
    fetch(`/api/users/orders/platoon?orderId=${orderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((json) => {
        if (json.code === 200 && json.data?.platoonNumber != null) {
          setPlatoonNumber(Number(json.data.platoonNumber));
        } else {
          setPlatoonNumber(null);
        }
      })
      .catch(() => setPlatoonNumber(null));
  }, [orderId]);

  useEffect(() => {
    if (!orderId || !eventId) {
      setOrderItemDownloads(null);
      return;
    }
    const token = typeof window !== "undefined"
      ? localStorage.getItem("token") || sessionStorage.getItem("token")
      : "";
    if (!token) {
      setOrderItemDownloads(null);
      return;
    }
    fetch(
      `/api/users/orders/item-downloads?orderId=${encodeURIComponent(orderId)}&eventId=${encodeURIComponent(eventId)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then((r) => r.json())
      .then((json) => {
        if (json.code === 200 && json.data) {
          setOrderItemDownloads(json.data as OrderItemDownloads);
        } else {
          setOrderItemDownloads(null);
        }
      })
      .catch(() => setOrderItemDownloads(null));
  }, [orderId, eventId]);

  if (!eventId) {
    return (
      <>
        <InnerBanner bannerClass="products-banner" title="Gallery" />
        <section className="products-section sec-gap">
          <div className="container">
            <div className="text-center py-8 text-gray-600">Invalid purchase link.</div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <InnerBanner bannerClass="products-banner" title="Gallery" />

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
              {galleries.map((gallery) => {
                const downloadsLabel =
                  galleryDownloadsLabel(orderItemDownloads?.remainingDownlaod) ??
                  galleryDownloadsLabel(gallery.numberOfDownlaod);
                return (
                    <div className="product-card h-auto group" key={gallery.id}>
                    <div className="product-card-image relative overflow-hidden">
                    {downloadsLabel && (
                      <span
                        className="absolute top-2 right-2 z-10 max-w-[calc(100%-1rem)] rounded-md border border-white/15 bg-gray-900/88 px-2.5 py-1 text-center text-[11px] font-semibold leading-tight text-white shadow-md backdrop-blur-sm sm:text-xs"
                        title={downloadsLabel}
                      >
                        {downloadsLabel}
                      </span>
                    )}
                    <Image
                      src={gallery.imageUrl || ""}
                      alt={gallery.title}
                      className="w-full"
                      width={400}
                      height={400}
                      unoptimized
                    />
                    </div>
                    <div className="product-card-content">
                        <h3 className="product-card-title line-clamp-2">{gallery.title}</h3>
                    </div>
                    <div className="product-hidden-content flex flex-col gap-2">
                        <Link href={`/purchase/gallery/${gallery.id}?orderId=${orderId}`} className="btn btn-primary w-full flex justify-center items-center gap-2">
                            <span>Manual Search</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>
                        {gallery.is_face_recognition && platoonNumber != null && (
                          <Link
                            href={`/face-detect/${platoonNumber}/${encodeURIComponent(gallery.galleryPath?.replace(/^\/uploads\/gallery\//, "") || gallery.slug)}`}
                            className="btn btn-primary w-full flex justify-center items-center gap-2"
                          >
                            <span>{gallery.face_recognition_heading || "Face Recognition"}</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </Link>
                        )}
                    </div>
                </div>
              );
              })}
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
