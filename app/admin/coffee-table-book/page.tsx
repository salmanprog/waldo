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

interface CoffeeTableBook {
  id: number;
  slug: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  address: string | null;
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
        <Table>
          {/* Table Header */}
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
                Name
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Email
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Phone
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Action
              </TableCell>
            </TableRow>
          </TableHeader>

          {/* Table Body */}

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {coffeeTableBooks.map((book) => (
              <TableRow key={book.id} className="">
                <TableCell className="py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-[50px] w-[50px] overflow-hidden rounded-md">
                      {book.id}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {book.firstName} {book.lastName}
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {book.email}
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {book.phone || "N/A"}
                </TableCell>
                <TableCell className="py-3 text-center">
                <ActionMenu
                    viewUrl={`/admin/coffee-table-book/view/${book.id}`}
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
