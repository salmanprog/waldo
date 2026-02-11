"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import useApi from "@/utils/useApi";
import Button from "@/components/ui/button/Button";
import Link from "next/link";
import Image from "next/image";

interface CoffeeTableBookImage {
  id: number;
  slug: string | null;
  imageUrl: string;
}

interface CoffeeTableBook {
  id: number;
  slug: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  address: string | null;
  images: CoffeeTableBookImage[];
  createdAt: string;
  updatedAt: string;
}

export default function ViewCoffeeTableBook({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [book, setBook] = useState<CoffeeTableBook | null>(null);

  const { data, loading, fetchApi } = useApi({
    url: `/api/admin/coffe-book-table/${id}`,
    method: "GET",
    type: "manual",
    requiresAuth: true,
  });

  useEffect(() => {
    document.title = "Admin | View Coffee Table Book Entry";
  }, []);

  useEffect(() => {
    fetchApi();
  }, [id]);

  useEffect(() => {
    if (data) {
      console.log("Book data:", data);
      // Handle nested data structure if API returns { data: {...} }
      const bookData = data.data || data;
      setBook(bookData);
    }
  }, [data]);

  if (loading) {
    return (
      <div className="p-4 mx-auto md:p-6">
        <div className="text-center py-8">Loading...</div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="p-4 mx-auto md:p-6">
        <div className="text-center py-8 text-red-500">Entry not found</div>
      </div>
    );
  }

  return (
    <div className="p-4 mx-auto md:p-6">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Coffee Table Book Entry Details
        </h2>
        <Link href="/admin/coffee-table-book">
          <Button variant="outline">Back to List</Button>
        </Link>
      </div>

      {/* Entry Details Card */}
      <div className="border rounded-2xl bg-white dark:bg-gray-900 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Personal Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              ID
            </label>
            <p className="text-gray-800 dark:text-white">{book.id}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Slug
            </label>
            <p className="text-gray-800 dark:text-white">{book.slug}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              First Name
            </label>
            <p className="text-gray-800 dark:text-white">{book.firstName}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Last Name
            </label>
            <p className="text-gray-800 dark:text-white">{book.lastName}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Email
            </label>
            <p className="text-gray-800 dark:text-white">{book.email}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Phone
            </label>
            <p className="text-gray-800 dark:text-white">{book.phone || "N/A"}</p>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Address
            </label>
            <p className="text-gray-800 dark:text-white whitespace-pre-wrap">
              {book.address || "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Images Section */}
      <div className="border rounded-2xl bg-white dark:bg-gray-900 p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Uploaded Images ({book.images?.length || 0})
        </h3>

        {book.images && book.images.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {book.images.map((image, index) => (
              <div
                key={image.id}
                className="border rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800"
              >
                <div className="relative w-full h-48">
                  <Image
                    src={image.imageUrl}
                    alt={`Image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    Image #{index + 1}
                  </p>
                  <a
                    href={image.imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    View Full Size
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No images uploaded
          </p>
        )}
      </div>
    </div>
  );
}
