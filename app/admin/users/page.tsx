"use client";
import { useEffect, useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import Image from "next/image";
import Button from "@/components/ui/button/Button";
import useApi from "@/utils/useApi";
import Badge from "@/components/ui/badge/Badge";
import ActionMenu from "@/components/ui/dropdown/ActionMenu";

interface User {
  id: number;
  name: string;
  slug: string;
  email: string;
  imageUrl: string | null;
  platoon: string | null;
  categoryId?: string | null;
  categoryName?: string | null;
  role: {
    id: number;
    title: string;
    slug: string;
  } | null;
}

type SortOrder = "" | "name-asc" | "name-desc";

export default function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [platoonSearchQuery, setPlatoonSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("");
  const { data, loading, fetchApi, updateParams } = useApi({
    url: "/api/admin/users",
    method: "GET",
    type: "manual",
    requiresAuth: true,
  });

  // Set page title
  useEffect(() => {
    document.title = "Admin | Users";
  }, []);

  useEffect(() => {
    fetchApi();
  }, []);
  useEffect(() => {
    if (data && Array.isArray(data)) {
      setUsers(data);
    }
  }, [data]);

  const sortedUsers = useMemo(() => {
    if (!sortOrder) return users;
    const list = [...users];
    list.sort((a, b) => {
      const nameA = (a.name || "").toLowerCase();
      const nameB = (b.name || "").toLowerCase();
      if (sortOrder === "name-asc") return nameA.localeCompare(nameB);
      return nameB.localeCompare(nameA);
    });
    return list;
  }, [users, sortOrder]);

  const filteredUsers = useMemo(() => {
    let list = sortedUsers;
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (u) =>
          (u.name || "").toLowerCase().includes(q) ||
          (u.email || "").toLowerCase().includes(q) ||
          (u.categoryName || "").toLowerCase().includes(q) ||
          (u.platoon || "").toLowerCase().includes(q) ||
          (u.role?.title || "").toLowerCase().includes(q)
      );
    }
    const pq = platoonSearchQuery.trim().toLowerCase();
    if (pq) {
      list = list.filter((u) => (u.platoon || "").toLowerCase().includes(pq));
    }
    return list;
  }, [sortedUsers, searchQuery, platoonSearchQuery]);

  const handleExport = () => {
    const headers = ["ID", "Name", "Email", "Category", "Platoon Number", "Role"];
    const escapeCsv = (val: string | number | null | undefined) => {
      const s = String(val ?? "");
      if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
      return s;
    };
    const rows = filteredUsers.map((u) =>
      [
        u.id,
        u.name ?? "",
        u.email ?? "",
        u.categoryName ?? "",
        u.platoon ?? "",
        u.role?.title ?? "",
      ].map(escapeCsv).join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Users List
          </h3>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-theme-sm text-gray-700 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:placeholder:text-gray-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search by platoon..."
              value={platoonSearchQuery}
              onChange={(e) => setPlatoonSearchQuery(e.target.value)}
              className="h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-theme-sm text-gray-700 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:placeholder:text-gray-500"
            />
          </div>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder((e.target.value || "") as SortOrder)}
            className="h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-theme-sm text-gray-700 shadow-theme-xs focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
          >
            <option value="">Sort by name</option>
            <option value="name-asc">A–Z</option>
            <option value="name-desc">Z–A</option>
          </select>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setPlatoonSearchQuery("");
              fetchApi();
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          >
            See all
          </button>
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          >
            Export
          </button>
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
                Category
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Role
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
            {loading ? (
              <TableRow>
                <TableCell className="py-8 text-center text-gray-500">
                  Loading users...
                </TableCell>
              </TableRow>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <TableRow key={user.id} className="">
                  <TableCell className="py-3">
                    <div className="flex items-center gap-3">
                      {user.imageUrl ? (
                        <div className="h-[50px] w-[50px] overflow-hidden rounded-md">
                          <Image 
                            src={user.imageUrl} 
                            alt={user.name || "User"} 
                            width={50} 
                            height={50}
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-[50px] w-[50px] overflow-hidden rounded-md bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500 text-sm">{user.id}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {user.name || "N/A"}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {user.email || "N/A"}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {user.categoryName || "N/A"}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {user.role?.title || "N/A"}
                  </TableCell>
                  <TableCell className="py-3 text-center">
                    <ActionMenu
                      viewUrl={`/admin/users/${user.slug}`}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell className="py-8 text-center text-gray-500">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
    </>
  );
}
