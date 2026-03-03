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
  const [is_face_recognition, setIs_face_recognition] = useState<"1" | "0">("0");
  const [face_recognition_heading, setFace_recognition_heading] = useState("");
  const [is_coff_book, setIs_coff_book] = useState<"1" | "0">("0");
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
    if (!image) return setErrorMsg("Gallery cover image is required.");

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("eventCategoryId", eventCategoryId);
      if (eventId) formData.append("eventId", eventId);
      formData.append("description", description);
      formData.append("is_face_recognition", is_face_recognition);
      if (is_face_recognition === "1") formData.append("face_recognition_heading", face_recognition_heading);
      formData.append("is_coff_book", is_coff_book);
      formData.append("status", status);
      formData.append("image", image);

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
            <label className="block text-sm font-medium">Event Package</label>
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

          {/* is_face_recognition */}
          <div>
            <label className="block text-sm font-medium mb-2">Face Recognition</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="is_face_recognition"
                  value="1"
                  checked={is_face_recognition === "1"}
                  onChange={() => setIs_face_recognition("1")}
                  className="w-4 h-4"
                />
                <span>Yes</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="is_face_recognition"
                  value="0"
                  checked={is_face_recognition === "0"}
                  onChange={() => setIs_face_recognition("0")}
                  className="w-4 h-4"
                />
                <span>No</span>
              </label>
            </div>
          </div>

          {is_face_recognition === "1" && (
            <div>
              <label className="block text-sm font-medium mb-2">Face Recognition Heading</label>
              <input
                type="text"
                name="face_recognition_heading"
                placeholder="Enter face recognition heading"
                value={face_recognition_heading}
                onChange={(e) => setFace_recognition_heading(e.target.value)}
                className="h-11 w-full rounded-lg border px-4"
              />
            </div>
          )}

          {/* is_coff_book */}
          <div>
            <label className="block text-sm font-medium mb-2">Coffe Book Table</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="is_coff_book"
                  value="1"
                  checked={is_coff_book === "1"}
                  onChange={() => setIs_coff_book("1")}
                  className="w-4 h-4"
                />
                <span>Yes</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="is_coff_book"
                  value="0"
                  checked={is_coff_book === "0"}
                  onChange={() => setIs_coff_book("0")}
                  className="w-4 h-4"
                />
                <span>No</span>
              </label>
            </div>
          </div>

          {/* Gallery Image */}
          <div>
            <label className="block text-sm font-medium">
              Gallery Cover Image <span className="text-red-500">*</span>
            </label>
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
