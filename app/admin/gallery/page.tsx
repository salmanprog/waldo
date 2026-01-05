"use client";
import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import Button from "@/components/ui/button/Button";
import useApi from "@/utils/useApi";
import Badge from "@/components/ui/badge/Badge";
import ActionMenu from "@/components/ui/dropdown/ActionMenu";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";

interface Gallery {
  id: number;
  title: string;
  slug: string;
  eventCategory?: {
    id: number;
    name: string;
    slug: string;
  } | null;
  status: boolean;
}

export default function GalleryList() {
  const [gallery, setGallery] = useState<Gallery[]>([]);
  const deleteModal = useModal();
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null);

  const { data, fetchApi } = useApi({
    url: "/api/admin/gallery",
    method: "GET",
    type: "manual",
    requiresAuth: true,
  });

  // Same title pattern
  useEffect(() => {
    document.title = "Admin | Galleries";
  }, []);

  useEffect(() => {
    fetchApi();
  }, []);

  useEffect(() => {
    if (data) setGallery(data);
  }, [data]);

  const handleDelete = async () => {
    if (!deleteSlug) return;

    await fetch(`/api/admin/gallery/${deleteSlug}`, {
      method: "DELETE",
    });

    deleteModal.closeModal();
    setDeleteSlug(null);
    fetchApi();
  };

  return (
    <>
      {/* DELETE CONFIRMATION MODAL – SAME */}
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
            Are you sure you want to delete this gallery?
            <br />This action cannot be undone.
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

      {/* MAIN CARD – EXACT SAME */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Event Galleries
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
              Filter
            </button>

            <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
              See all
            </button>

            <Link href="/admin/gallery/add">
              <Button>Add Gallery</Button>
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
                ID</TableCell>
                <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Name</TableCell>
                <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Slug</TableCell>
                <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Category</TableCell>
                <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Status</TableCell>
                <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Action</TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {gallery.map((gal) => (
                <TableRow key={gal.id}>
                  <TableCell className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-[50px] w-[50px] overflow-hidden rounded-md">
                        {gal.id}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {gal.title}
                  </TableCell>

                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {gal.slug}
                  </TableCell>

                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {gal.eventCategory?.name || "N/A"}
                  </TableCell>

                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    <Badge size="sm" color={gal.status ? "success" : "warning"}>
                      {gal.status ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>

                  <TableCell className="py-3 text-center">
                    <ActionMenu
                      editUrl={`/admin/gallery/edit/${gal.slug}`}
                      onDelete={() => {
                        setDeleteSlug(gal.slug);
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
