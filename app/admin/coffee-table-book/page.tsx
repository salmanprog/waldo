"use client";
import { useEffect, useState } from "react";
import DataTable, {
  type DataTableColumn,
} from "@/components/ui/datatable/DataTable";
import useApi from "@/utils/useApi";
import ActionMenu from "@/components/ui/dropdown/ActionMenu";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";

interface CoffeeTableBookImageRow {
  id: number;
  coffeTableBookId: number;
  imageUrl: string;
}

interface CoffeeTableBook {
  id: number;
  slug: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  address: string | null;
  images?: CoffeeTableBookImageRow[];
}

export default function CoffeeTableBookList() {
  const [coffeeTableBooks, setCoffeeTableBooks] = useState<CoffeeTableBook[]>([]);
  const deleteModal = useModal();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { data, loading, fetchApi } = useApi({
    url: "/api/users/coffe-book-table",
    method: "GET",
    type: "manual",
    requiresAuth: true,
  });

  // Set page title
  useEffect(() => {
    document.title = "Admin | Coffee Table Book";
  }, []);

  useEffect(() => {
    fetchApi();
  }, []);
  useEffect(() => {
    console.log("Coffee Table Book Data:", data);
    if (data) setCoffeeTableBooks(data);
  }, [data]);
  const handleDelete = async () => {
    if (!deleteId) return;

    await fetch(`/api/admin/coffe-book-table/${deleteId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    deleteModal.closeModal();
    setDeleteId(null);
    fetchApi(); // refresh table
  };

  const columns: DataTableColumn<CoffeeTableBook>[] = [
    {
      header: "ID",
      sortable: true,
      sortValue: (book) => book.id,
      cellClassName: "py-3",
      cell: (book) => (
        <div className="flex items-center gap-3">
          <div className="h-[50px] w-[50px] overflow-hidden rounded-md">
            {book.id}
          </div>
        </div>
      ),
    },
    {
      header: "Name",
      sortable: true,
      sortValue: (book) => `${book.firstName} ${book.lastName}`.toLowerCase(),
      cell: (book) => (
        <>
          {book.firstName} {book.lastName}
        </>
      ),
    },
    {
      header: "Email",
      sortable: true,
      sortValue: (book) => (book.email || "").toLowerCase(),
      cell: (book) => book.email,
    },
    {
      header: "Phone",
      sortable: true,
      sortValue: (book) => (book.phone || "").toLowerCase(),
      cell: (book) => book.phone || "N/A",
    },
    {
      header: "No. of Images",
      sortable: true,
      sortValue: (book) => book.images?.length ?? 0,
      cell: (book) => String(book.images?.length ?? 0),
    },
    {
      header: "Action",
      cellClassName: "py-3 text-center",
      cell: (book) => (
        <ActionMenu
          viewUrl={`/admin/coffee-table-book/view/${book.id}`}
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
            Are you sure you want to delete this entry?  
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
            Coffee Table Book Entries
          </h3>
        </div>
      </div>
      <div className="max-w-full overflow-x-auto">
        <DataTable<CoffeeTableBook>
          columns={columns}
          data={coffeeTableBooks}
          getRowKey={(book) => book.id}
          loading={loading}
          loadingMessage="Loading entries..."
          emptyMessage="No coffee table book entries found."
        />
      </div>
    </div>
    </>
  );
}
