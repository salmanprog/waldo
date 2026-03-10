"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/button/Button";
import useApi from "@/utils/useApi";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";

export default function EditEventCategory() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug;

  // Set page title
  useEffect(() => {
    document.title = "Admin | Edit Service Category";
  }, []);

  const [name, setName] = useState("");
  const [status, setStatus] = useState("1");
  const [image, setImage] = useState<File | null>(null);
  const [oldImage, setOldImage] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [isAvailable, setIsAvailable] = useState<"yes" | "no">("yes");
  const [availableText, setAvailableText] = useState("");
  const [isPlatoon, setIsPlatoon] = useState<"yes" | "no">("yes");
  const [errorMsg, setErrorMsg] = useState("");
  const { data, fetchApi } = useApi({
    url: `/api/admin/events/category/${slug}`,
    method: "GET",
    type: "manual",
    requiresAuth: true,
  });
  const { sendData, loading } = useApi({
    url: `/api/admin/events/category/${slug}`,
    method: "PATCH",
    type: "manual",
    requiresAuth: true,
  });

  useEffect(() => {
    fetchApi();
  }, []);

  useEffect(() => {
    if (data) {
      const c = data as { name?: string; description?: string; status?: boolean; imageUrl?: string | null; is_available?: boolean; available_text?: string; is_platoon?: boolean };
      setName(c.name ?? "");
      setDescription(c.description || "");
      setStatus(c.status ? "1" : "0");
      setOldImage(c.imageUrl || null);
      setIsAvailable(c.is_available === false ? "no" : "yes");
      setAvailableText(c.available_text ?? "");
      setIsPlatoon(c.is_platoon === false ? "no" : "yes");
    }
  }, [data]);
  
  const updateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name) {
      setErrorMsg("Category name is required.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("status", status);
      formData.append("is_available", isAvailable === "yes" ? "1" : "0");
      formData.append("available_text", isAvailable === "no" ? availableText : "");
      formData.append("is_platoon", isPlatoon === "yes" ? "1" : "0");

      if (image) {
        formData.append("image", image);
      }

      const res = await sendData(formData, undefined, "PATCH");

      if (res.code === 200) {
        router.push("/admin/event-categories");
      } else {
        setErrorMsg(res.message || "Something went wrong.");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Update failed. Try again.");
    }
  };

  return (
    <div className="p-4 mx-auto md:p-6">

      {/* Header */}
      <div className="flex justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Edit Service Category
        </h2>
      </div>

      {/* Error */}
      {errorMsg && (
        <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 text-sm">
          {errorMsg}
        </div>
      )}

      {/* Form Box */}
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-white/[0.03]">
        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white">
            Service Category Details
          </h3>
        </div>

        <div className="p-4 sm:p-6">
          <form onSubmit={updateCategory} className="space-y-5">

            {/* Name */}
            <div>
              <label className="block mb-1 text-sm font-medium">Category Name</label>
              <input
                type="text"
                className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block mb-1 text-sm font-medium">Description</label>
              <textarea
                rows={5}
                className="w-full rounded-lg border px-4 py-2.5 text-sm"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Image */}
            <div>
              <label className="block mb-1 text-sm font-medium">Category Image</label>

              {oldImage && !image && (
                <img
                  src={oldImage}
                  className="w-32 h-32 object-cover rounded-md mb-2"
                  alt="Old"
                />
              )}

              <label className="cursor-pointer block border-2 border-dashed p-6 rounded-lg text-center">
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setImage(e.target.files[0]);
                    }
                  }}
                />

                <p className="text-sm text-gray-500">
                  Click to upload or drag & drop
                </p>

                {image && <p className="text-xs text-green-600 mt-2">{image.name}</p>}
              </label>
            </div>

            {/* Category Available */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Category Available
              </label>
              <div className="flex gap-6">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="categoryAvailable"
                    value="yes"
                    checked={isAvailable === "yes"}
                    onChange={() => setIsAvailable("yes")}
                    className="rounded-full border-gray-300 text-brand-500 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Yes</span>
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="categoryAvailable"
                    value="no"
                    checked={isAvailable === "no"}
                    onChange={() => setIsAvailable("no")}
                    className="rounded-full border-gray-300 text-brand-500 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">No</span>
                </label>
              </div>
              {isAvailable === "no" && (
                <div className="mt-3">
                  <input
                    type="text"
                    placeholder="Enter a text"
                    value={availableText}
                    onChange={(e) => setAvailableText(e.target.value)}
                    className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs
                      bg-transparent border-gray-300 focus:border-brand-300
                      dark:bg-gray-900 dark:text-white dark:border-gray-700"
                  />
                </div>
              )}
            </div>

            {/* Applicable Platoon Number */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Applicable Platoon Number
              </label>
              <div className="flex gap-6">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="applicablePlatoon"
                    value="yes"
                    checked={isPlatoon === "yes"}
                    onChange={() => setIsPlatoon("yes")}
                    className="rounded-full border-gray-300 text-brand-500 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Yes</span>
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="applicablePlatoon"
                    value="no"
                    checked={isPlatoon === "no"}
                    onChange={() => setIsPlatoon("no")}
                    className="rounded-full border-gray-300 text-brand-500 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">No</span>
                </label>
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block mb-1 text-sm font-medium">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="h-11 w-full border rounded-lg px-4 py-2.5"
              >
                <option value="1">Active</option>
                <option value="0">Inactive</option>
              </select>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-3">
              <Button variant="outline">Cancel</Button>
              <Button type="submit" loading={loading}>
                Update Category
              </Button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
