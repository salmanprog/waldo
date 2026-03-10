"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import InnerBanner from "@/components/common/InnerBanner";
import useApi from "@/utils/useApi";

interface Blog {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  status: boolean;
  createdAt: string;
}

interface BlogCategory {
  id: number;
  title: string;
  slug: string;
}

export default function BlogPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");

  // Set page title
  useEffect(() => {
    document.title = "My Waldo | Blog";
  }, []);

  const { data: categoriesData, fetchApi: fetchCategories } = useApi({
    url: "/api/users/blog-category",
    type: "manual",
    method: "GET",
    requiresAuth: false,
  });

  const { data, loading: apiLoading, error: apiError, fetchApi: fetchBlogs } = useApi({
    url: "/api/users/blog",
    type: "manual",
    method: "GET",
    requiresAuth: false,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (categoriesData && Array.isArray(categoriesData)) {
      setCategories(
        categoriesData.map((c: { id: number; title: string; slug: string }) => ({
          id: c.id,
          title: c.title,
          slug: c.slug,
        }))
      );
    }
  }, [categoriesData]);

  // Fetch blogs (with optional category filter)
  useEffect(() => {
    fetchBlogs(selectedCategoryId ? { blogCategoryId: selectedCategoryId } : undefined);
  }, [selectedCategoryId]);

  // Update blogs when data is received
  useEffect(() => {
    if (data && Array.isArray(data)) {
      setBlogs(data);
    }
  }, [data]);

  return (
    <>
      <InnerBanner bannerClass="blog-banner" title="Waldo News" />
      <section className="blog-section sec-gap">
        <div className="container">
          {/* Category filter */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <button
              type="button"
              onClick={() => setSelectedCategoryId("")}
              className={selectedCategoryId === "" ? "btn btn-primary" : "btn border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategoryId(String(cat.id))}
                className={selectedCategoryId === String(cat.id) ? "btn btn-primary" : "btn border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"}
              >
                {cat.title}
              </button>
            ))}
          </div>

          {apiLoading ? (
            <div className="text-center py-8 loading-text">Loading blogs...</div>
          ) : apiError ? (
            <div className="text-center py-8 text-red-500">Error loading blogs: {apiError}</div>
          ) : blogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {blogs.map((blog) => (
                <div key={blog.id} className="blog-card group">
                  <div className="blog-card-image">
                    {blog.imageUrl ? (
                      <Image
                      src={blog.imageUrl.startsWith("http")
                        ? blog.imageUrl
                        : `${blog.imageUrl}`
                      }
                      alt={blog.title || "Blog image"}
                      width={400}
                      height={264}
                      className="w-full h-[264px] object-cover rounded"
                      unoptimized
                    />
                    ) : (
                      <div className="w-full h-[264px] bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <span className="text-gray-400">No Image</span>
                      </div>
                    )}
                  </div>
                  <div className="blog-card-content">
                    <span className="blog-card-date">
                      {new Date(blog.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                    <h3 className="blog-card-title line-clamp-2">{blog.title}</h3>
                    {blog.description && (
                      <p className="blog-card-description line-clamp-3">{blog.description}</p>
                    )}
                  </div>
                  <div className="blog-hidden-content">
                    <Link href={`/blog/${blog.slug}`} className="btn btn-primary w-full flex justify-center items-center gap-2">
                      <span>Read More</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-xl text-gray-600">No blogs found.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

