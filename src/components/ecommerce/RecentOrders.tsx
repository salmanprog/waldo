"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import useApi from "@/utils/useApi";
import Link from "next/link";

interface OrderItem {
  id: number;
  title: string;
  quantity: number;
  price: string | number;
}

interface Order {
  id: number;
  userId: number;
  user: { name: string | null; slug: string; platoon: string | null } | null;
  platoonNumber: number;
  purchaseDate: string;
  total: string | number;
  status: string;
  createdAt: string;
  itemsCount: number;
  items: OrderItem[];
}

interface OrdersMeta {
  total: number;
  perPage: number;
  currentPage: number;
  lastPage: number;
}

const PER_PAGE = 10;

export default function RecentOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [meta, setMeta] = useState<OrdersMeta | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const { data, loading, fetchApi } = useApi({
    url: "/api/admin/orders",
    method: "GET",
    type: "manual",
    requiresAuth: true,
  });

  useEffect(() => {
    const load = async () => {
      const res = await fetchApi({ page: currentPage, perPage: PER_PAGE });
      if (res && typeof res === "object" && res.meta) {
        setMeta(res.meta as OrdersMeta);
      }
    };
    load();
  }, [currentPage]);

  useEffect(() => {
    if (data && Array.isArray(data)) {
      setOrders(data);
    }
  }, [data]);

  const badgeColor = (status: string) => {
    if (status === "PAID") return "success";
    if (status === "PENDING") return "warning";
    return "error";
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Recent Orders
          </h3>
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
                Order ID
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                User / Platoon
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Total
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Date
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Status
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-gray-500">
                  Loading orders...
                </TableCell>
              </TableRow>
            ) : orders.length > 0 ? (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="py-3 font-medium text-gray-800 text-theme-sm dark:text-white/90">
                    #{order.id}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    <div>
                      {order.user?.name && (
                        <Link
                          href={`/admin/users/${order.user.slug}`}
                          className="text-brand-500 hover:underline"
                        >
                          {order.user.name}
                        </Link>
                      )}
                      {order.user?.name && order.platoonNumber != null && " · "}
                      {order.platoonNumber != null && (
                        <span>Platoon {order.platoonNumber}</span>
                      )}
                      {!order.user?.name && order.platoonNumber == null && "—"}
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    ${Number(order.total).toFixed(2)}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {new Date(order.purchaseDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    <Badge size="sm" color={badgeColor(order.status)}>
                      {order.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-gray-500">
                  No orders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {meta && meta.lastPage > 1 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-gray-200 dark:border-gray-800 pt-4">
          <p className="text-theme-sm text-gray-500 dark:text-gray-400">
            Showing {(meta.currentPage - 1) * meta.perPage + 1}–
            {Math.min(meta.currentPage * meta.perPage, meta.total)} of {meta.total}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={meta.currentPage <= 1}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.03]"
            >
              Previous
            </button>
            <span className="text-theme-sm text-gray-600 dark:text-gray-400">
              Page {meta.currentPage} of {meta.lastPage}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(meta.lastPage, p + 1))}
              disabled={meta.currentPage >= meta.lastPage}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.03]"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
