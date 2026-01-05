"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/button/Button";
import { useRouter } from "next/navigation";
import useApi from "@/utils/useApi";

export default function AddGallery() {
  const router = useRouter();

  // Page title
  useEffect(() => {
    document.title = "Admin | Add Gallery";
  }, []);

  const [title, setTitle] = useState("");
  const [eventCategoryId, setEventCategoryId] = useState("");
  const [eventId, setEventId] = useState("");
  const [status, setStatus] = useState("1");
  const [image, setImage] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [eventCategorySlug, setEventCategorySlug] = useState("");

  // Load event categories
  const { data: categoryList, fetchApi: fetchCategories } = useApi({
    url: "/api/admin/events/category",
    method: "GET",
    type: "manual",
    requiresAuth: true,
  });

  // Load events (optional – based on category)
  const { data: eventList, fetchApi: fetchEvents } = useApi({
    url: (eventCategorySlug
      ? `/api/admin/events?cat_id=${eventCategorySlug}`
      : "") as string,
    method: "GET",
    type: "manual",
    requiresAuth: true,
  });
  

  // Submit Gallery API
  const { sendData, loading } = useApi({
    url: "/api/admin/gallery",
    type: "manual",
    requiresAuth: true,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (eventCategoryId) fetchEvents();
  }, [eventCategoryId]);

  const submitGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!title) return setErrorMsg("Gallery title is required.");
    if (!eventCategoryId) return setErrorMsg("Please select an event category.");

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("eventCategoryId", eventCategoryId);
      if (eventId) formData.append("eventId", eventId);
      formData.append("description", description);
      formData.append("status", status);
      if (image) formData.append("image", image);

      const res = await sendData(formData, undefined, "POST");

      if (res.code === 200) {
        router.push("/admin/gallery");
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
          Add Gallery
        </h2>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 text-sm">
          {errorMsg}
        </div>
      )}

      <div className="border rounded-2xl bg-white dark:bg-gray-900 p-6">
        <form onSubmit={submitGallery} className="space-y-5">

          {/* Gallery Title */}
          <div>
            <label className="block text-sm font-medium">Gallery Title</label>
            <input
              type="text"
              placeholder="Enter gallery title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-11 w-full rounded-lg border px-4"
            />
          </div>

          {/* Event Category */}
          <div>
            <label className="block text-sm font-medium">Event Category</label>
            <select
                value={eventCategoryId}
                onChange={(e) => {
                  const selectedId = e.target.value;
                  const selectedCategory = categoryList.find(
                    (cat: any) => String(cat.id) === selectedId
                  );

                  setEventCategoryId(selectedId); 
                  setEventCategorySlug(selectedCategory?.slug || "");
                }}
                className="h-11 w-full rounded-lg border px-4"
              >
                <option value="">-- Select Category --</option>
                {categoryList?.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
          </div>

          {/* Event (Optional) */}
          <div>
            <label className="block text-sm font-medium">Event</label>
            <select
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              className="h-11 w-full rounded-lg border px-4"
              disabled={!eventCategoryId}
            >
              <option value="">-- Select Event --</option>
              {eventList?.map((ev: any) => (
                <option key={ev.id} value={ev.id}>
                  {ev.name}
                </option>
              ))}
            </select>
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

          {/* Gallery Image */}
          <div>
            <label className="block text-sm font-medium">Gallery Cover Image</label>
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
            <Button variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Save Gallery
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
}
