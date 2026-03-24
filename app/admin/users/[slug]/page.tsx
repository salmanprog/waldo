"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import useApi from "@/utils/useApi";
import Image from "next/image";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";

interface UserDetails {
  id: number;
  slug: string;
  username?: string;
  name: string | null;
  lname?: string | null;
  email: string | null;
  mobileNumber: string | null;
  address?: string | null;
  imageUrl: string | null;
  dob: string | null;
  age?: number;
  gender: string | null;
  profileType?: string | null;
  status: boolean;
  platoon?: string | null;
  isEmailVerify?: boolean;
  emailVerifyAt?: string | null;
  platformType?: string | null;
  platformId?: string | null;
  createdAt: string;
  updatedAt: string;
  role: {
    id: number;
    title: string;
    slug: string;
  } | null;
}

interface OrderItemRow {
  id: number;
  orderId: number;
  itemId: number;
  itemslug: string;
  title: string;
  price: string | number;
  quantity: number;
  createdAt?: string;
}

interface OrderWithItems {
  id: number;
  userId: number;
  platoonNumber: number;
  purchaseDate: string;
  total: string | number;
  status: string;
  stripeSessionId: string;
  createdAt: string;
  items: OrderItemRow[];
}

export default function UserDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  // Set page title
  useEffect(() => {
    document.title = "Admin | User Details";
  }, []);

  const { data, loading, error, fetchApi } = useApi({
    url: `/api/admin/users/${slug}`,
    method: "GET",
    type: "manual",
    requiresAuth: true,
  });

  const {
    data: ordersData,
    fetchApi: fetchOrders,
  } = useApi({
    url: slug ? `/api/admin/users/${slug}/orders` : "",
    method: "GET",
    type: "manual",
    requiresAuth: true,
  });

  const [user, setUser] = useState<UserDetails | null>(null);
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
  const orderDetailModal = useModal();

  useEffect(() => {
    if (slug) {
      fetchApi();
    }
  }, [slug]);

  useEffect(() => {
    if (data) {
      setUser(data as UserDetails);
    }
  }, [data]);

  useEffect(() => {
    if (slug) {
      fetchOrders();
    }
  }, [slug]);

  useEffect(() => {
    if (ordersData && Array.isArray(ordersData)) {
      setOrders(ordersData as OrderWithItems[]);
    } else if (ordersData && typeof ordersData === "object" && "data" in ordersData) {
      const d = (ordersData as { data?: OrderWithItems[] }).data;
      setOrders(Array.isArray(d) ? d : []);
    } else {
      setOrders([]);
    }
  }, [ordersData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-gray-500">Loading user details...</div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 mb-4">Error loading user details</div>
          <Button onClick={() => router.push("/admin/users")} variant="outline">
            Back to Users List
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            User Details
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            View detailed information about the user
          </p>
        </div>
        <Button onClick={() => router.push("/admin/users")} variant="outline">
          Back to List
        </Button>
      </div>

      {/* User Details Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Profile Image Section */}
          <div className="flex-shrink-0">
            {user.imageUrl ? (
              <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 dark:border-gray-700">
                <Image
                  src={user.imageUrl}
                  alt={user.name || "User"}
                  width={128}
                  height={128}
                  className="object-cover"
                  unoptimized={user.imageUrl.includes('localhost')}
                />
              </div>
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center border-4 border-gray-200 dark:border-gray-700">
                <span className="text-4xl text-gray-500 dark:text-gray-400">
                  {user.name?.[0]?.toUpperCase() || "U"}
                </span>
              </div>
            )}
          </div>

          {/* User Information */}
          <div className="flex-1">
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90 mb-2">
                {[user.name, user.lname].filter(Boolean).join(" ") || user.username || "N/A"}
              </h3>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge color={user.status ? "success" : "error"}>
                  {user.status ? "Active" : "Inactive"}
                </Badge>
                {user.role && (
                  <Badge color="primary">{user.role.title}</Badge>
                )}
                <Button
                  onClick={() => {
                    const escapeCsv = (val: string | number | boolean | null | undefined) => {
                      const s = String(val ?? "");
                      if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
                      return s;
                    };
                    const headers = ["ID", "Slug", "Name", "Last Name", "Email", "Mobile Number", "Address", "Platoon", "Role"];
                    const row = [
                      user.id,
                      user.slug ?? "",
                      user.name ?? "",
                      user.lname ?? "",
                      user.email ?? "",
                      user.mobileNumber ?? "",
                      user.address ?? "",
                      user.platoon ?? "",
                      user.role?.title ?? "",
                    ].map(escapeCsv).join(",");
                    const csv = [headers.join(","), row].join("\n");
                    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `user-details-${user.slug || user.id}-${new Date().toISOString().slice(0, 10)}.csv`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  variant="outline"
                  className="ml-auto"
                >
                  Export
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">User ID</label>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90 mt-1">#{user.id}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Slug</label>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90 mt-1">{user.slug || "N/A"}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">First Name</label>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90 mt-1">{user.name || "N/A"}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Last Name</label>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90 mt-1">{user.lname || "N/A"}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Email Address</label>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90 mt-1">{user.email || "N/A"}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Mobile Number</label>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90 mt-1">{user.mobileNumber || "N/A"}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Address</label>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90 mt-1">{user.address || "N/A"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Orders table (if purchased) */}
      {orders.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">Orders</h3>
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                <TableRow>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Order ID
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Purchase Date
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Platoon
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Total
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Status
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Action
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="py-3 text-theme-sm text-gray-800 dark:text-white/90">
                      #{order.id}
                    </TableCell>
                    <TableCell className="py-3 text-theme-sm text-gray-600 dark:text-gray-400">
                      {typeof order.purchaseDate === "string"
                        ? new Date(order.purchaseDate).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "—"}
                    </TableCell>
                    <TableCell className="py-3 text-theme-sm text-gray-600 dark:text-gray-400">
                      {order.platoonNumber}
                    </TableCell>
                    <TableCell className="py-3 text-theme-sm text-gray-600 dark:text-gray-400">
                      ${Number(order.total).toFixed(2)}
                    </TableCell>
                    <TableCell className="py-3">
                      <Badge color={order.status === "PAID" ? "success" : "primary"}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedOrder(order);
                          orderDetailModal.openModal();
                        }}
                      >
                        View order detail
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Order detail modal */}
      <Modal
        isOpen={orderDetailModal.isOpen}
        onClose={() => {
          orderDetailModal.closeModal();
          setSelectedOrder(null);
        }}
        className="max-w-2xl p-6"
      >
        {selectedOrder && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">
              Order #{selectedOrder.id}
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Purchase Date</span>
                <p className="font-medium text-gray-800 dark:text-white/90">
                  {typeof selectedOrder.purchaseDate === "string"
                    ? new Date(selectedOrder.purchaseDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "—"}
                </p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Platoon</span>
                <p className="font-medium text-gray-800 dark:text-white/90">{selectedOrder.platoonNumber}</p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Total</span>
                <p className="font-medium text-gray-800 dark:text-white/90">
                  ${Number(selectedOrder.total).toFixed(2)}
                </p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Status</span>
                <p className="font-medium">
                  <Badge color={selectedOrder.status === "PAID" ? "success" : "primary"}>
                    {selectedOrder.status}
                  </Badge>
                </p>
              </div>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                Order Items
              </p>
              <ul className="space-y-2">
                {selectedOrder.items?.map((item) => (
                  <li
                    key={item.id}
                    className="flex justify-between items-center text-sm text-gray-700 dark:text-gray-300"
                  >
                    <span>{item.title}</span>
                    <span>
                      {item.quantity} × ${Number(item.price).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  orderDetailModal.closeModal();
                  setSelectedOrder(null);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

