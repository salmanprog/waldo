"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/button/Button";
import useApi from "@/utils/useApi";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import RichTextEditor from "@/components/ui/rich-text-editor/RichTextEditor";

function normalizePagePayload(d: unknown): Record<string, unknown> | null {
  if (!d || typeof d !== "object") return null;
  const o = d as Record<string, unknown>;
  const inner = o.data;
  if (inner && typeof inner === "object" && inner !== null && "title" in inner) {
    return inner as Record<string, unknown>;
  }
  if ("title" in o) return o;
  return null;
}

export default function EditPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug;
  const slugParam =
    typeof slug === "string" ? slug : Array.isArray(slug) ? (slug[0] ?? "") : "";

  useEffect(() => {
    document.title = "Admin | Edit Page";
  }, []);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [oldImage, setOldImage] = useState<string | null>(null);
  const [status, setStatus] = useState("1");
  const [errorMsg, setErrorMsg] = useState("");
  const [descriptionEditorKey, setDescriptionEditorKey] = useState(0);
  const [seoDescriptionEditorKey, setSeoDescriptionEditorKey] = useState(0);

  const baseUrl = slugParam ? `/api/admin/pages/${encodeURIComponent(slugParam)}` : "/api/admin/pages/_";

  const { data: pageData, fetchApi: fetchPage } = useApi({
    url: baseUrl,
    method: "GET",
    type: "manual",
    requiresAuth: true,
  });

  const { sendData, loading } = useApi({
    url: baseUrl,
    method: "PATCH",
    type: "manual",
    requiresAuth: true,
  });

  useEffect(() => {
    if (slugParam) fetchPage();
  }, [slugParam]);

  useEffect(() => {
    setTitle("");
    setDescription("");
    setSeoTitle("");
    setSeoDescription("");
    setStatus("1");
    setOldImage(null);
    setImage(null);
    setDescriptionEditorKey(0);
    setSeoDescriptionEditorKey(0);
  }, [slugParam]);

  useEffect(() => {
    const row = normalizePagePayload(pageData);
    if (!row) return;
    const rowSlug = String(row.slug ?? "");
    if (slugParam && rowSlug && rowSlug !== slugParam) return;

    setTitle(String(row.title ?? ""));
    setDescription(String(row.description ?? ""));
    setSeoTitle(String(row.seoTitle ?? ""));
    setSeoDescription(String(row.seoDescription ?? ""));
    setStatus(row.status === true || row.status === "true" || row.status === 1 ? "1" : "0");
    setOldImage((row.imageUrl as string | null) || null);
    setDescriptionEditorKey((k) => k + 1);
    setSeoDescriptionEditorKey((k) => k + 1);
  }, [pageData, slugParam]);

  const updatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!title) return setErrorMsg("Page title is required.");

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("seoTitle", seoTitle);
      formData.append("seoDescription", seoDescription);
      formData.append("status", status);

      if (image) {
        formData.append("image", image);
      }

      const res = await sendData(formData, undefined, "PATCH");

      if (res.code === 200) {
        router.push("/admin/pages");
      } else {
        setErrorMsg(res.message || "Something went wrong.");
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Update failed. Try again.");
    }
  };

  return (
    <div className="p-4 mx-auto md:p-6">
      <div className="flex justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Edit Page</h2>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 text-sm">{errorMsg}</div>
      )}

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-white/[0.03]">
        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white">Page Details</h3>
        </div>

        <div className="p-4 sm:p-6">
          <form onSubmit={updatePage} className="space-y-5">
            <div>
              <label className="block mb-1 text-sm font-medium">
                Page Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">Description</label>
              <RichTextEditor
                key={descriptionEditorKey}
                value={description}
                onChange={setDescription}
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">SEO Title</label>
              <input
                type="text"
                placeholder="Enter SEO title for search engines"
                className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">SEO Description</label>
              <textarea
                rows={3}
                placeholder="Enter SEO description"
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                className="w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs bg-transparent border-gray-300 focus:border-brand-300 dark:bg-gray-900 dark:text-white dark:border-gray-700"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">Page Image</label>

              {oldImage && !image && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Current Image:</p>
                  <div className="relative w-32 h-32 rounded-md overflow-hidden border border-gray-200 dark:border-gray-700">
                    <Image
                      src={oldImage}
                      alt="Current page image"
                      width={128}
                      height={128}
                      className="object-cover w-full h-full"
                      unoptimized
                    />
                  </div>
                </div>
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

                <p className="text-sm text-gray-500">Click to upload or drag & drop</p>

                {image && <p className="text-xs text-green-600 mt-2">{image.name}</p>}
              </label>
              <p className="text-xs text-gray-500 mt-1">Leave empty to keep current image</p>
            </div>

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

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" loading={loading}>
                Update Page
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
