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

interface Blog {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  status: boolean;
}

export default function BlogList() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [titleSearch, setTitleSearch] = useState("");
  const deleteModal = useModal();
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null);
  const { data, loading, fetchApi } = useApi({
    url: "/api/admin/blog",
    method: "GET",
    type: "manual",
    requiresAuth: true,
  });

  // Set page title
  useEffect(() => {
    document.title = "Admin | Waldo News";
  }, []);

  useEffect(() => {
    fetchApi();
  }, []);
  useEffect(() => {
    if (data) setBlogs(data);
  }, [data]);

  const filteredBlogs = useMemo(() => {
    const q = titleSearch.trim().toLowerCase();
    if (!q) return blogs;
    return blogs.filter((blog) => blog.title.toLowerCase().includes(q));
  }, [blogs, titleSearch]);

  const handleDelete = async () => {
    if (!deleteSlug) return;

    await fetch(`/api/admin/blog/${deleteSlug}`, {
      method: "DELETE",
    });

    deleteModal.closeModal();
    setDeleteSlug(null);
    fetchApi(); // refresh table
  };

  const columns: DataTableColumn<Blog>[] = [
    {
      header: "ID",
      sortable: true,
      sortValue: (blog) => blog.id,
      cellClassName: "py-3",
      cell: (blog) => (
        <div className="flex items-center gap-3">
          <div className="h-[50px] w-[50px] overflow-hidden rounded-md flex items-center justify-center bg-gray-100 dark:bg-gray-800">
            {blog.id}
          </div>
        </div>
      ),
    },
    {
      header: "Image",
      sortable: true,
      sortValue: (blog) => (blog.imageUrl || "").toLowerCase(),
      cellClassName: "py-3",
      cell: (blog) =>
        blog.imageUrl ? (
          <div className="h-[50px] w-[50px] overflow-hidden rounded-md">
            <Image
              src={blog.imageUrl}
              alt={blog.title}
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
      sortValue: (blog) => blog.title.toLowerCase(),
      cell: (blog) => blog.title,
    },
    {
      header: "Slug",
      sortable: true,
      sortValue: (blog) => (blog.slug || "").toLowerCase(),
      cell: (blog) => (
        <div className="max-w-xs truncate" title={blog.slug || ""}>
          {blog.slug || "N/A"}
        </div>
      ),
    },
    {
      header: "Status",
      sortable: true,
      sortValue: (blog) => (blog.status ? 1 : 0),
      cell: (blog) => (
        <Badge
          size="sm"
          color={
            blog.status === true
              ? "success"
              : blog.status === false
              ? "warning"
              : "error"
          }
        >
          {blog.status === true ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      header: "Action",
      cellClassName: "py-3 text-center",
      cell: (blog) => (
        <ActionMenu
          editUrl={`/admin/blog/edit/${blog.slug}`}
          onDelete={() => {
            setDeleteSlug(blog.slug);
            deleteModal.openModal();
          }}
        />
      ),
    },
  ];

  return (
    <>
      {/* DELETE CONFIRMATION MODAL */}
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
            Are you sure you want to delete this blog?  
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
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Waldo News
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
          {/* <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
            <svg
              className="stroke-current fill-white dark:fill-gray-800"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2.29004 5.90393H17.7067"
                stroke=""
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M17.7075 14.0961H2.29085"
                stroke=""
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12.0826 3.33331C13.5024 3.33331 14.6534 4.48431 14.6534 5.90414C14.6534 7.32398 13.5024 8.47498 12.0826 8.47498C10.6627 8.47498 9.51172 7.32398 9.51172 5.90415C9.51172 4.48432 10.6627 3.33331 12.0826 3.33331Z"
                fill=""
                stroke=""
                strokeWidth="1.5"
              />
              <path
                d="M7.91745 11.525C6.49762 11.525 5.34662 12.676 5.34662 14.0959C5.34661 15.5157 6.49762 16.6667 7.91745 16.6667C9.33728 16.6667 10.4883 15.5157 10.4883 14.0959C10.4883 12.676 9.33728 11.525 7.91745 11.525Z"
                fill=""
                stroke=""
                strokeWidth="1.5"
              />
            </svg>
            Filter
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
            See all
          </button> */}
          <Link href="/admin/blog/add">
            <Button>Add Waldo News</Button>
            </Link>
        </div>
      </div>
      <div className="max-w-full overflow-x-auto">
        <DataTable<Blog>
          columns={columns}
          data={filteredBlogs}
          getRowKey={(blog) => blog.id}
          loading={loading}
          loadingMessage="Loading Waldo News..."
          emptyMessage="No Waldo News found."
        />
      </div>
    </div>
    </>
  );
}

