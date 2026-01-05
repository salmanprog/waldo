"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/button/Button";
import { useRouter } from "next/navigation";
import useApi from "@/utils/useApi";

export default function AddEvent() {
  const router = useRouter();

  // Set page title
  useEffect(() => {
    document.title = "Admin | Add Event";
  }, []);

  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState("1");
  const [image, setImage] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [isFace, setIsFace] = useState("0"); 
  const [isManual, setIsManual] = useState("0");
  const [errorMsg, setErrorMsg] = useState("");

  // Load event categories
  const { data: categoryList, fetchApi: fetchCategories } = useApi({
    url: "/api/admin/events/category",
    method: "GET",
    type: "manual",
    requiresAuth: true,
  });

  // Submit Event API
  const { sendData, loading } = useApi({
    url: "/api/admin/events",
    type: "manual",
    requiresAuth: true,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const submitEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!title) return setErrorMsg("Event title is required.");
    if (!categoryId) return setErrorMsg("Please select a category.");
    if (!price) return setErrorMsg("Event price is required.");

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("categoryId", categoryId);
      formData.append("price", String(Number(price)));
      formData.append("description", description);
      formData.append("status", status);
      formData.append("is_face", isFace);
      formData.append("is_manual", isManual);
      if (image) formData.append("image", image);

      const res = await sendData(formData, undefined, "POST");

      if (res.code === 200) {
        router.push("/admin/event");
      } else {
        setErrorMsg(res.message || "Something went wrong.");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "An error occurred. Try again.");
    }
  };

  return (
    <div className="p-4 mx-auto md:p-6">

      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Add Event
        </h2>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 text-sm">
          {errorMsg}
        </div>
      )}

      <div className="border rounded-2xl bg-white dark:bg-gray-900 p-6">
        <form onSubmit={submitEvent} className="space-y-5">

          {/* Event Title */}
          <div>
            <label className="block text-sm font-medium">Event Title</label>
            <input
              type="text"
              placeholder="Enter event title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-11 w-full rounded-lg border px-4"
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-sm font-medium">Event Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="h-11 w-full rounded-lg border px-4"
            >
              <option value="">-- Select Category --</option>

              {/* dynamic categories */}
              {categoryList?.map((cat: any) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Event Price */}
          <div>
            <label className="block text-sm font-medium">Event Price</label>
            <input
              type="text"
              placeholder="Enter event price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="h-11 w-full rounded-lg border px-4"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border px-4 py-2.5"
            />
          </div>

          {/* Image */}
          <div>
            <label className="block text-sm font-medium">Event Image</label>
            <label className="border-2 border-dashed p-6 rounded-lg block text-center cursor-pointer">
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files?.[0]) setImage(e.target.files[0]);
                }}
              />
              <p>Click to upload or drag & drop</p>
              {image && <p className="text-xs mt-2">{image.name}</p>}
            </label>
          </div>
          {/* Face Recognition */}
          <div>
            <label className="block text-sm font-medium mb-2">Face Recognition</label>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="is_face"
                  value="1"
                  checked={isFace === "1"}
                  onChange={(e) => setIsFace(e.target.value)}
                />
                <span className="text-sm">Active</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="is_face"
                  value="0"
                  checked={isFace === "0"}
                  onChange={(e) => setIsFace(e.target.value)}
                />
                <span className="text-sm">Inactive</span>
              </label>
            </div>
          </div>
            {/* Manual Search */}
          <div>
            <label className="block text-sm font-medium mb-2">Manual Search</label>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="is_manual"
                  value="1"
                  checked={isManual === "1"}
                  onChange={(e) => setIsManual(e.target.value)}
                />
                <span className="text-sm">Active</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="is_manual"
                  value="0"
                  checked={isManual === "0"}
                  onChange={(e) => setIsManual(e.target.value)}
                />
                <span className="text-sm">Inactive</span>
              </label>
            </div>
          </div>
          {/* Status */}
          <div>
            <label className="block text-sm font-medium">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="h-11 w-full rounded-lg border px-4"
            >
              <option value="1">Active</option>
              <option value="0">Inactive</option>
            </select>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3">
            <Button variant="outline">Cancel</Button>
            <Button type="submit" loading={loading}>
              Save Event
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
}
