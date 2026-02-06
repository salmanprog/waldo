"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import Button from "@/components/ui/button/Button";
import useApi from "@/utils/useApi";
import ActionMenu from "@/components/ui/dropdown/ActionMenu";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";

interface GalleryPlatoon {
  id: number;
  galleryId: number;
  platoonNumber: number;
  gallery?: {
    id: number;
    title: string | null;
    slug: string;
  } | null;
}

export default function GalleryPlatoonList() {
  const [items, setItems] = useState<GalleryPlatoon[]>([]);
  const deleteModal = useModal();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, fetchApi } = useApi({
    url: "/api/admin/gallery-platoon",
    method: "GET",
    type: "manual",
    requiresAuth: true,
  });

  useEffect(() => {
    document.title = "Admin | Gallery Platoons";
  }, []);

  useEffect(() => {
    fetchApi();
  }, []);

  useEffect(() => {
    if (data) setItems(data);
  }, [data]);

  const handleDelete = async () => {
    if (deleteId === null) return;

    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token") || "";
    await fetch(`/api/admin/gallery-platoon/${deleteId}`, {
      method: "DELETE",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    deleteModal.closeModal();
    setDeleteId(null);
    fetchApi();
  };

  return (
    <>
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        className="max-w-[450px] p-6"
      >
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">
            Confirm Delete
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Are you sure you want to delete this gallery platoon?
            <br />
            This action cannot be undone.
          </p>

          <div className="flex justify-center gap-3">
            <button
              onClick={deleteModal.closeModal}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Cancel
            </button>

            <button
              onClick={handleDelete}
              className="px-4 py-2 rounded-lg bg-error-500 text-white hover:bg-error-600"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Gallery Platoons
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/admin/gallery-platoon/add">
              <Button>Add Platoon</Button>
            </Link>
          </div>
        </div>

        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
              <TableRow>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  ID
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Gallery
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Platoon Number
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Action
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {item.id}
                  </TableCell>

                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {item.gallery?.title || `Gallery #${item.galleryId}`}
                  </TableCell>

                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {item.platoonNumber}
                  </TableCell>

                  <TableCell className="py-3 text-center">
                    <ActionMenu
                      editUrl={`/admin/gallery-platoon/edit/${item.id}`}
                      onDelete={() => {
                        setDeleteId(item.id);
                        deleteModal.openModal();
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
