"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/button/Button";
import { useRouter } from "next/navigation";
import useApi from "@/utils/useApi";

export default function AddGalleryPlatoon() {
  const router = useRouter();

  useEffect(() => {
    document.title = "Admin | Add Gallery Platoon";
  }, []);

  const [galleryId, setGalleryId] = useState("");
  const [platoonNumber, setPlatoonNumber] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const { data: galleryList, fetchApi: fetchGalleries } = useApi({
    url: "/api/admin/gallery",
    method: "GET",
    type: "manual",
    requiresAuth: true,
  });

  const { sendData, loading } = useApi({
    url: "/api/admin/gallery-platoon",
    type: "manual",
    requiresAuth: true,
  });

  useEffect(() => {
    fetchGalleries();
  }, []);

  const submitPlatoon = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!galleryId) return setErrorMsg("Please select a gallery.");
    if (!platoonNumber) return setErrorMsg("Platoon number is required.");

    const num = parseInt(platoonNumber, 10);
    if (isNaN(num) || num < 1)
      return setErrorMsg("Platoon number must be a positive integer.");

    try {
      const formData = new FormData();
      formData.append("galleryId", galleryId);
      formData.append("platoonNumber", platoonNumber);

      const res = await sendData(formData, undefined, "POST");

      if (res.code === 200) {
        router.push("/admin/gallery-platoon");
      } else {
        setErrorMsg(res.message || "Something went wrong.");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "An error occurred. Try again.");
    }
  };

  return (
    <div className="p-4 mx-auto md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Add Gallery Platoon
        </h2>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 text-sm">
          {errorMsg}
        </div>
      )}

      <div className="border rounded-2xl bg-white dark:bg-gray-900 p-6">
        <form onSubmit={submitPlatoon} className="space-y-5">
          <div>
            <label className="block text-sm font-medium">
              Gallery <span className="text-red-500">*</span>
            </label>
            <select
              value={galleryId}
              onChange={(e) => setGalleryId(e.target.value)}
              className="h-11 w-full rounded-lg border px-4"
            >
              <option value="">-- Select Gallery --</option>
              {galleryList?.map((g: any) => (
                <option key={g.id} value={g.id}>
                  {g.title || g.slug}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">
              Platoon Number <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              placeholder="e.g. 1"
              value={platoonNumber}
              onChange={(e) => setPlatoonNumber(e.target.value)}
              className="h-11 w-full rounded-lg border px-4"
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Save Platoon
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
