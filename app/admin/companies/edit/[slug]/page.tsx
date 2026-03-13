"use client";
import { useEffect, useState } from "react";
import Button from "@/components/ui/button/Button";
import useApi from "@/utils/useApi";
import { useParams, useRouter } from "next/navigation";

export default function EditCompany() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;

  useEffect(() => {
    document.title = "Admin | Edit Company";
  }, []);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [oldImage, setOldImage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const { data, fetchApi } = useApi({
    url: `/api/admin/companies/${slug}`,
    method: "GET",
    type: "manual",
    requiresAuth: true,
  });
  const { sendData, loading } = useApi({
    url: `/api/admin/companies/${slug}`,
    method: "PATCH",
    type: "manual",
    requiresAuth: true,
  });

  useEffect(() => {
    if (slug) fetchApi();
  }, [slug]);

  useEffect(() => {
    if (data) {
      const c = data as {
        name?: string;
        description?: string | null;
        imageUrl?: string | null;
      };
      setName(c.name ?? "");
      setDescription(c.description ?? "");
      setOldImage(c.imageUrl ?? null);
    }
  }, [data]);

  const updateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name.trim()) {
      setErrorMsg("Company name is required.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      if (image) formData.append("image", image);

      const res = await sendData(formData, undefined, "PATCH");

      if (res.code === 200) {
        router.push("/admin/companies");
      } else {
        setErrorMsg(res.message || "Something went wrong.");
      }
    } catch (err: unknown) {
      setErrorMsg((err as Error)?.message || "Update failed. Try again.");
    }
  };

  return (
    <div className="p-4 mx-auto md:p-6">
      <div className="flex justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Edit Company
        </h2>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 text-sm">{errorMsg}</div>
      )}

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-white/[0.03]">
        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white">
            Company Details
          </h3>
        </div>
        <div className="p-4 sm:p-6">
          <form onSubmit={updateCompany} className="space-y-5">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-400">
                Company Name
              </label>
              <input
                type="text"
                className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs
                  bg-transparent border-gray-300 focus:border-brand-300
                  dark:bg-gray-900 dark:text-white dark:border-gray-700"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-400">
                Description
              </label>
              <textarea
                rows={5}
                className="w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs
                  bg-transparent border-gray-300 focus:border-brand-300
                  dark:bg-gray-900 dark:text-white dark:border-gray-700"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-400">
                Company Image
              </label>
              {oldImage && !image && (
                <img
                  src={oldImage}
                  className="w-32 h-32 object-cover rounded-md mb-2"
                  alt="Company"
                />
              )}
              <label className="cursor-pointer block border-2 border-dashed border-gray-300 dark:border-gray-800 p-6 rounded-lg text-center">
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) setImage(e.target.files[0]);
                  }}
                />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Click to upload or drag & drop
                </p>
                {image && <p className="text-xs text-green-600 mt-2">{image.name}</p>}
              </label>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/companies")}
              >
                Cancel
              </Button>
              <Button type="submit" loading={loading}>
                Update Company
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
