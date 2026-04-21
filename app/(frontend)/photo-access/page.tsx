"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import InnerBanner from "@/components/common/InnerBanner";
import Sec from "@/components/home/Sec";
import useApi from "@/utils/useApi";
import { useCurrentUser } from "@/utils/currentUser";

interface EventCategory {
  id: number;
  name: string;
  slug: string;
  imageUrl: string | null;
  description: string | null;
  status: boolean;
  createdAt: string;
  is_available?: boolean;
  available_text?: string;
}

export default function PhotoAccessPage() {
  const router = useRouter();
  const { user, loadingUser } = useCurrentUser();
  const [categories, setCategories] = useState<EventCategory[]>([]);

  const { data, loading: apiLoading, error: apiError, fetchApi } = useApi({
    url: "/api/users/events/category",
    type: "manual",
    method: "GET",
    requiresAuth: false,
  });

  useEffect(() => {
    document.title = "My Waldo | Photo Access";
  }, []);

  useEffect(() => {
    if (loadingUser) return;
    if (!user) {
      router.replace("/signup?redirect=/photo-access");
    }
  }, [loadingUser, user, router]);

  useEffect(() => {
    if (loadingUser || !user) return;
    fetchApi();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingUser, user]);

  useEffect(() => {
    if (data && Array.isArray(data)) {
      setCategories(data);
    }
  }, [data]);

  if (loadingUser || !user) {
    return (
      <>
        <InnerBanner bannerClass="products-banner" title="Photo Access" />
        <div className="container py-16 text-center text-gray-600">
          {loadingUser ? "Loading..." : "Redirecting..."}
        </div>
      </>
    );
  }

  return (
    <>
      <InnerBanner bannerClass="products-banner" title="Photo Access" />
      {categories.length > 0 ? (
        <section className="bg-white py-[50px]">
          <div className="container">
            <h2 className="text-[40px] font-bold text-[#000000] text-center mb-10 uppercase">Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {categories.map((category) => {
                const unavailable = category.is_available === false;
                return (
                  <div
                    key={category.id}
                    className={unavailable ? "opacity-60 grayscale pointer-events-none" : ""}
                  >
                    {unavailable ? (
                      <div className="group relative inline-block w-full pointer-events-auto">
                        <Link href="#">
                          <div className="py-[20px]">
                            <div className="btn btn-primary w-full flex justify-center items-center gap-2 mt-2">
                              <span className="whitespace-nowrap">{category.name}</span>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </div>
                        </Link>
                        {category.available_text ? (
                          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 text-xs font-normal text-white bg-gray-800 dark:bg-gray-700 rounded-lg shadow-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-200 z-10 max-w-[200px] text-center whitespace-normal">
                            {category.available_text}
                          </span>
                        ) : null}
                      </div>
                    ) : (
                      <Sec
                        title={category.name}
                        sectionClass="border-2 border-white/100"
                        href={`/samples-gallery?category=${encodeURIComponent(category.name)}`}
                        backgroundImage={category.imageUrl}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      ) : apiLoading ? (
        <div className="container py-8 text-center">Loading categories...</div>
      ) : apiError ? (
        <div className="container py-8 text-center text-red-500">Error loading categories: {apiError}</div>
      ) : null}
    </>
  );
}
