"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/button/Button";
import { useRouter, useParams } from "next/navigation";
import useApi from "@/utils/useApi";

export default function EditGallery() {
  const router = useRouter();
  const { slug } = useParams<{ slug: string }>();

  // ---------------- State ----------------
  const [title, setTitle] = useState("");
  const [eventCategoryId, setEventCategoryId] = useState(""); // CATEGORY SLUG
  const [eventId, setEventId] = useState("");                 // EVENT ID
  const [status, setStatus] = useState("1");
  const [image, setImage] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Store gallery event id temporarily (important)
  const [initialEventId, setInitialEventId] = useState<string>("");

  // ---------------- Categories ----------------
  const { data: categoryList, fetchApi: fetchCategories } = useApi({
    url: "/api/admin/events/category",
    method: "GET",
    type: "manual",
    requiresAuth: true,
  });

  // ---------------- Events ----------------
  const { data: eventList, fetchApi: fetchEvents } = useApi({
    url: (eventCategoryId
      ? `/api/admin/events?cat_id=${eventCategoryId}`
      : "") as string,
    method: "GET",
    type: "manual",
    requiresAuth: true,
  });

  // ---------------- Get Gallery ----------------
  const { data: gallery, fetchApi: fetchGallery } = useApi({
    url: `/api/admin/gallery/${slug}`,
    method: "GET",
    type: "manual",
    requiresAuth: true,
  });

  // ---------------- Update Gallery ----------------
  const { sendData, loading } = useApi({
    url: `/api/admin/gallery/${slug}`,
    type: "manual",
    requiresAuth: true,
  });

  // ---------------- Init ----------------
  useEffect(() => {
    document.title = "Admin | Edit Gallery";
    fetchCategories();
    fetchGallery();
  }, []);

  // ---------------- Fill form from API ----------------
  useEffect(() => {
    if (!gallery) return;

    setTitle(gallery.title || "");
    setDescription(gallery.description || "");
    setStatus(gallery.status ? "1" : "0");

    // STEP 1: set category slug
    if (gallery.eventCategory?.slug) {
      setEventCategoryId(gallery.eventCategory.slug);
    }

    // STEP 2: store event id (do NOT set directly yet)
    if (gallery.event?.id) {
      setInitialEventId(String(gallery.event.id));
    }
  }, [gallery]);

  // ---------------- Fetch events when category changes ----------------
  useEffect(() => {
    if (!eventCategoryId) return;
    fetchEvents();
  }, [eventCategoryId]);

  // ---------------- Auto-select event AFTER event list loads ----------------
  useEffect(() => {
    if (!eventList || !initialEventId) return;

    const exists = eventList.find(
      (ev: any) => String(ev.id) === initialEventId
    );

    if (exists) {
      setEventId(initialEventId);
    }
  }, [eventList]);

  // ---------------- Submit ----------------
  const submitGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!title) return setErrorMsg("Gallery title is required.");
    if (!eventCategoryId)
      return setErrorMsg("Please select an event category.");

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("eventCategoryId", eventCategoryId); // slug
      if (eventId) formData.append("eventId", eventId);    // id
      formData.append("description", description);
      formData.append("status", status);
      if (image) formData.append("image", image);

      const res = await sendData(formData, undefined, "PATCH");

      if (res.code === 200) {
        router.push("/admin/gallery");
      } else {
        setErrorMsg(res.message || "Update failed.");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Something went wrong.");
    }
  };

  return (
    <div className="p-4 md:p-6">
      <h2 className="text-xl font-semibold mb-6">Edit Gallery</h2>

      {errorMsg && (
        <div className="mb-4 p-3 rounded bg-red-100 text-red-700 text-sm">
          {errorMsg}
        </div>
      )}

      <div className="border rounded-2xl bg-white p-6">
        <form onSubmit={submitGallery} className="space-y-5">

          {/* Title */}
          <div>
            <label className="text-sm font-medium">Gallery Title</label>
            <input
              className="h-11 w-full rounded border px-4"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-sm font-medium">Event Category</label>
            <select
              className="h-11 w-full rounded border px-4"
              value={eventCategoryId}
              onChange={(e) => {
                setEventCategoryId(e.target.value);
                setEventId(""); // reset event on change
              }}
            >
              <option value="">-- Select Category --</option>
              {categoryList?.map((cat: any) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Event */}
          <div>
            <label className="text-sm font-medium">Event</label>
            <select
              className="h-11 w-full rounded border px-4"
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
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
            <label className="text-sm font-medium">Description</label>
            <textarea
              rows={4}
              className="w-full rounded border px-4 py-2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Images */}
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
            <label className="text-sm font-medium">Status</label>
            <select
              className="h-11 w-full rounded border px-4"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="1">Active</option>
              <option value="0">Inactive</option>
            </select>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Update Gallery
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
}
