"use client";
import { useEffect, useState, useMemo } from "react";
import DataTable, {
  type DataTableColumn,
} from "@/components/ui/datatable/DataTable";
import Link from "next/link";
import Button from "@/components/ui/button/Button";
import useApi from "@/utils/useApi";
import Badge from "@/components/ui/badge/Badge";
import ActionMenu from "@/components/ui/dropdown/ActionMenu";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import Image from "next/image";

interface CmsPage {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  status: boolean;
}

export default function PagesList() {
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [titleSearch, setTitleSearch] = useState("");
  const deleteModal = useModal();
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null);
  const { data, loading, fetchApi } = useApi({
    url: "/api/admin/pages",
    method: "GET",
    type: "manual",
    requiresAuth: true,
  });

  useEffect(() => {
    document.title = "Admin | CMS Pages";
  }, []);

  useEffect(() => {
    fetchApi();
  }, []);
  useEffect(() => {
    if (data) setPages(data);
  }, [data]);

  const filteredPages = useMemo(() => {
    const q = titleSearch.trim().toLowerCase();
    if (!q) return pages;
    return pages.filter((p) => p.title.toLowerCase().includes(q));
  }, [pages, titleSearch]);

  const handleDelete = async () => {
    if (!deleteSlug) return;

    await fetch(`/api/admin/pages/${encodeURIComponent(deleteSlug)}`, {
      method: "DELETE",
    });

    deleteModal.closeModal();
    setDeleteSlug(null);
    fetchApi();
  };

  const columns: DataTableColumn<CmsPage>[] = [
    {
      header: "ID",
      sortable: true,
      sortValue: (p) => p.id,
      cellClassName: "py-3",
      cell: (p) => (
        <div className="flex items-center gap-3">
          <div className="h-[50px] w-[50px] overflow-hidden rounded-md flex items-center justify-center bg-gray-100 dark:bg-gray-800">
            {p.id}
          </div>
        </div>
      ),
    },
    {
      header: "Image",
      sortable: true,
      sortValue: (p) => (p.imageUrl || "").toLowerCase(),
      cellClassName: "py-3",
      cell: (p) =>
        p.imageUrl ? (
          <div className="h-[50px] w-[50px] overflow-hidden rounded-md">
            <Image
              src={p.imageUrl}
              alt={p.title}
              width={50}
              height={50}
              className="object-cover w-full h-full"
              unoptimized
            />
          </div>
        ) : (
          <div className="h-[50px] w-[50px] overflow-hidden rounded-md bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <span className="text-xs text-gray-500">No Image</span>
          </div>
        ),
    },
    {
      header: "Title",
      sortable: true,
      sortValue: (p) => p.title.toLowerCase(),
      cell: (p) => p.title,
    },
    {
      header: "Slug",
      sortable: true,
      sortValue: (p) => (p.slug || "").toLowerCase(),
      cell: (p) => (
        <div className="max-w-xs truncate" title={p.slug || ""}>
          {p.slug || "N/A"}
        </div>
      ),
    },
    {
      header: "Status",
      sortable: true,
      sortValue: (p) => (p.status ? 1 : 0),
      cell: (p) => (
        <Badge
          size="sm"
          color={
            p.status === true
              ? "success"
              : p.status === false
                ? "warning"
                : "error"
          }
        >
          {p.status === true ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      header: "Action",
      cellClassName: "py-3 text-center",
      cell: (p) => (
        <ActionMenu
          editUrl={`/admin/pages/edit/${p.slug}`}
          onDelete={() => {
            setDeleteSlug(p.slug);
            deleteModal.openModal();
          }}
        />
      ),
    },
  ];

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
            Are you sure you want to delete this page?
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
              CMS Pages
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search by title..."
                value={titleSearch}
                onChange={(e) => setTitleSearch(e.target.value)}
                className="h-10 w-full min-w-[200px] rounded-lg border border-gray-300 bg-white px-3 py-2 text-theme-sm text-gray-700 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:placeholder:text-gray-500 sm:w-64"
              />
            </div>
            <Link href="/admin/pages/add">
              <Button>Add Page</Button>
            </Link>
          </div>
        </div>
        <div className="max-w-full overflow-x-auto">
          <DataTable<CmsPage>
            columns={columns}
            data={filteredPages}
            getRowKey={(p) => p.id}
            loading={loading}
            loadingMessage="Loading pages..."
            emptyMessage="No pages found."
          />
        </div>
      </div>
    </>
  );
}
