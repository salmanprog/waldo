"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import InnerBanner from "@/components/common/InnerBanner";
import useApi, { ApiResponse } from "@/utils/useApi";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import { useCurrentUser } from "@/utils/currentUser";

interface FavouriteImage {
  id: number;
  galleryImageId: number;
  galleryImagePath: string;
}

export default function CoffeeTableBookPage() {
  const { user: currentUser } = useCurrentUser();

  useEffect(() => {
    document.title = "My Waldo | Coffee Table Book";
  }, []);

  const [favouriteImages, setFavouriteImages] = useState<FavouriteImage[]>([]);

  const { data: favouritesData, fetchApi: fetchFavourites } = useApi({
    url: "/api/users/favourite-images-coffe-book",
    method: "GET",
    type: "manual",
    requiresAuth: true,
  });

  useEffect(() => {
    fetchFavourites();
  }, []);

  useEffect(() => {
    if (favouritesData && Array.isArray(favouritesData)) {
      setFavouriteImages(favouritesData as FavouriteImage[]);
    }
  }, [favouritesData]);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    if (currentUser && typeof currentUser === "object") {
      const u = currentUser as { name?: string | null; lname?: string | null; email?: string | null; mobileNumber?: string | null };
      setForm((prev) => ({
        ...prev,
        firstName: u.name ?? prev.firstName,
        lastName: u.lname ?? prev.lastName,
        email: u.email ?? prev.email,
        phone: u.mobileNumber ?? prev.phone,
      }));
    }
  }, [currentUser]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const { sendData, loading } = useApi({
    url: "/api/users/coffe-book-table",
    type: "manual",
    requiresAuth: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!form.firstName.trim()) newErrors.firstName = "First name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Invalid email format";
    }
    if (favouriteImages.length === 0) newErrors.images = "Add at least one image from your gallery";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const removeFavouriteImage = async (galleryImageId: number) => {
    const token = typeof window !== "undefined"
      ? localStorage.getItem("token") || sessionStorage.getItem("token") || ""
      : "";
    if (!token) return;
    try {
      const res = await fetch(
        `/api/users/favourite-images-coffe-book?galleryImageId=${galleryImageId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const json = await res.json();
      if (json.code === 200) {
        setFavouriteImages((prev) => prev.filter((img) => img.galleryImageId !== galleryImageId));
      }
    } catch (err) {
      console.error("Remove favourite error:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!validateForm()) return;

    try {
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        address: form.address,
        imageUrls: favouriteImages.map((img) => img.galleryImagePath),
      };

      const res = await sendData<ApiResponse>(payload, undefined, "POST");

      if (res.code === 200) {
        setSuccessMsg("Thank you! Your coffee table book request has been submitted.");
        setForm({ firstName: "", lastName: "", email: "", phone: "", address: "" });
        setFavouriteImages([]);
      } else if (res.code === 422) {
        setErrors(res.data ?? {});
        setErrorMsg(res.message || "Validation failed");
      } else {
        setErrorMsg(res.message || "Something went wrong.");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Server error. Try again.");
    }
  };

  return (
    <>
      <InnerBanner bannerClass="products-banner" title="Coffee Table Book" />

      <section className="products-section sec-gap">
        <div className="container">
          <div className="max-w-[40rem] mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
              <h2 className="text-3xl font-bold text-center mb-2">
                Request Coffee Table Book
              </h2>
              <p className="text-center text-gray-600 mb-6">
                Fill out the form below to request your coffee table book
              </p>

              {favouriteImages.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-700 mb-3">Added images</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {favouriteImages.map((img) => (
                      <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                        <Image
                          src={img.galleryImagePath}
                          alt="Added to coffee table book"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                        <button
                          type="button"
                          onClick={() => removeFavouriteImage(img.galleryImageId)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          title="Remove from favourites"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {successMsg && (
                <div className="mb-4 p-3 rounded-lg bg-green-100 text-green-700 text-sm">
                  {successMsg}
                </div>
              )}

              {errorMsg && (
                <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 text-sm">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div style={{ display: 'none' }}>
                  <label className="block text-sm font-medium mb-1">First Name *</label>
                  <Input
                    type="text"
                    name="firstName"
                    placeholder="Enter your first name"
                    value={form.firstName}
                    onChange={handleChange}
                    error={!!errors.firstName}
                    hint={errors.firstName}
                  />
                </div>

                <div style={{ display: 'none' }}>
                  <label className="block text-sm font-medium mb-1">Last Name (optional)</label>
                  <Input
                    type="text"
                    name="lastName"
                    placeholder="Enter your last name (optional)"
                    value={form.lastName}
                    onChange={handleChange}
                    error={!!errors.lastName}
                    hint={errors.lastName}
                  />
                </div>

                <div style={{ display: 'none' }}>
                  <label className="block text-sm font-medium mb-1">Email *</label>
                  <Input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={form.email}
                    onChange={handleChange}
                    error={!!errors.email}
                    hint={errors.email}
                  />
                </div>

                <div style={{ display: 'none' }}>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <Input
                    type="text"
                    name="phone"
                    placeholder="Enter your phone number (optional)"
                    value={form.phone}
                    onChange={handleChange}
                  />
                </div>

                <div style={{ display: 'none' }}>
                  <label className="block text-sm font-medium mb-1">Address</label>
                  <textarea
                    name="address"
                    rows={4}
                    placeholder="Enter your address (optional)"
                    value={form.address}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {errors.images && (
                  <p className="text-xs text-red-500">{errors.images}</p>
                )}

                <Button type="submit" loading={loading} className="w-full">
                  Submit Request
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
