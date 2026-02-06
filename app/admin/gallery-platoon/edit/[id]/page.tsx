"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/button/Button";
import { useRouter, useParams } from "next/navigation";
import useApi from "@/utils/useApi";

export default function EditGalleryPlatoon() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  useEffect(() => {
    document.title = "Admin | Edit Gallery Platoon";
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

  const { data: platoon, fetchApi: fetchPlatoon } = useApi({
    url: `/api/admin/gallery-platoon/${id}`,
    method: "GET",
    type: "manual",
    requiresAuth: true,
  });

  const { sendData, loading } = useApi({
    url: `/api/admin/gallery-platoon/${id}`,
    type: "manual",
    requiresAuth: true,
  });

  useEffect(() => {
    fetchGalleries();
    fetchPlatoon();
  }, [id]);

  useEffect(() => {
    if (platoon) {
      setGalleryId(String(platoon.galleryId));
      setPlatoonNumber(String(platoon.platoonNumber));
    }
  }, [platoon]);

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

      const res = await sendData(formData, undefined, "PATCH");

      if (res.code === 200) {
        router.push("/admin/gallery-platoon");
      } else {
        setErrorMsg(res.message || "Update failed.");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Something went wrong.");
    }
  };

  return (
    <div className="p-4 md:p-6">
      <h2 className="text-xl font-semibold mb-6">Edit Gallery Platoon</h2>

      {errorMsg && (
        <div className="mb-4 p-3 rounded bg-red-100 text-red-700 text-sm">
          {errorMsg}
        </div>
      )}

      <div className="border rounded-2xl bg-white p-6">
        <form onSubmit={submitPlatoon} className="space-y-5">
          <div>
            <label className="text-sm font-medium">Gallery</label>
            <select
              value={galleryId}
              onChange={(e) => setGalleryId(e.target.value)}
              className="h-11 w-full rounded border px-4"
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
            <label className="text-sm font-medium">Platoon Number</label>
            <input
              type="number"
              min="1"
              value={platoonNumber}
              onChange={(e) => setPlatoonNumber(e.target.value)}
              className="h-11 w-full rounded border px-4"
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Update Platoon
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
