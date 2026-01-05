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
    document.title = "Admin | Edit Event Category";
  }, []);

  const [name, setName] = useState("");
  const [status, setStatus] = useState("1");
  const [image, setImage] = useState<File | null>(null);
  const [oldImage, setOldImage] = useState<string | null>(null);
  const [description, setDescription] = useState("");
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
      const c = data;
      setName(c.name);
      setDescription(c.description || "");
      setStatus(c.status ? "1" : "0");
      setOldImage(c.imageUrl || null);
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
          Edit Event Category
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
            Category Details
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
