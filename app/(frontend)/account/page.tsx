"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/utils/currentUser";
import useApi, { ApiResponse } from "@/utils/useApi";
import InnerBanner from "@/components/common/InnerBanner";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import Image from "next/image";
import Link from "next/link";


interface AccountUser {
  id: number;
  name: string | null;
  email: string | null;
  mobileNumber?: string | null;
  categoryId?: string | null;
  companyId?: string | null;
  imageUrl?: string | null;
  dob?: string | null;
  gender?: string | null;
  createdAt?: string;
  [key: string]: any;
}

export default function AccountPage() {
  const router = useRouter();
  const { user: currentUser, loadingUser, errorUser } = useCurrentUser();
  const user = currentUser as AccountUser | null;
  const [activeTab, setActiveTab] = useState<"profile" | "password" | "orders">("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    mobileNumber: "",
    categoryId: "",
    companyId: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [profileLoaded, setProfileLoaded] = useState(false);

  // Helper function to normalize image URL
  const normalizeImageUrl = (url: string | null | undefined): string | null => {
    if (!url) return null;
    // If it's already a relative path, return as is
    if (url.startsWith('/')) return url;
    // If it's a full URL, extract the path
    try {
      const urlObj = new URL(url);
      return urlObj.pathname;
    } catch {
      // If URL parsing fails, assume it's a relative path
      return url.startsWith('/') ? url : `/${url}`;
    }
  };

  // Update form data when user loads (from currentUser cache)
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || "",
        mobileNumber: user.mobileNumber || "",
        categoryId: user.categoryId ?? prev.categoryId,
        companyId: user.companyId ?? prev.companyId,
      }));
      if (user.imageUrl) {
        const normalizedUrl = normalizeImageUrl(user.imageUrl);
        setImagePreview(normalizedUrl);
      }
    }
  }, [user]);

  // Fetch fresh profile from API when account page loads so DB fields (category, company, etc.) are shown
  useEffect(() => {
    if (!user?.id) return;
    setProfileLoaded(false);
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id || profileLoaded) return;
    let isMounted = true;
    const loadProfile = async () => {
      try {
        const res: ApiResponse<AccountUser> = await fetchProfile();
        if (isMounted && res?.code === 200 && res?.data) {
          const profile = res.data;
          setFormData({
            name: profile.name || "",
            mobileNumber: profile.mobileNumber || "",
            categoryId: profile.categoryId ?? "",
            companyId: profile.companyId ?? "",
          });
          if (profile.imageUrl) {
            const normalizedUrl = normalizeImageUrl(profile.imageUrl);
            setImagePreview(normalizedUrl);
          }
          setProfileLoaded(true);
        }
      } catch {
        if (isMounted) setProfileLoaded(true);
      }
    };
    loadProfile();
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, profileLoaded]);

  // Set page title
  useEffect(() => {
    document.title = "My Waldo | My Account";
  }, []);

  // Redirect if not logged in
  useEffect(() => {
    if (!loadingUser && !user && !errorUser) {
      router.push("/login");
    }
  }, [user, loadingUser, errorUser, router]);

  const { sendData, loading: apiLoading } = useApi({
    url: user ? `/api/users/profile/${user.id}` : "",
    type: "manual",
    method: "PATCH",
    requiresAuth: true,
  });

  // Fetch fresh profile when account page loads so DB value is shown
  const { fetchApi: fetchProfile } = useApi({
    url: user ? `/api/users/profile/${user.id}` : "",
    method: "GET",
    type: "manual",
    requiresAuth: true,
  });

  const { data: categoryList, fetchApi: fetchCategories } = useApi({
    url: "/api/users/events/category",
    method: "GET",
    type: "manual",
    requiresAuth: true,
  });

  const { data: companyList, fetchApi: fetchCompanies } = useApi({
    url: "/api/users/companies",
    method: "GET",
    type: "manual",
    requiresAuth: true,
  });

  useEffect(() => {
    fetchCategories();
    fetchCompanies();
  }, []);

  const { sendData: sendPasswordData, loading: passwordLoading } = useApi({
    url: "/api/users/password",
    type: "manual",
    method: "POST",
    requiresAuth: true,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }   
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage("Image size should be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateProfileForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = "Name is required";
    }

    if (formData.mobileNumber && !/^\d{10,15}$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = "Please enter a valid mobile number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = () => {
    const newErrors: Record<string, string> = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!validateProfileForm()) return;

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("mobileNumber", formData.mobileNumber || "");
      if (formData.categoryId) formDataToSend.append("categoryId", formData.categoryId);
      if (formData.companyId) formDataToSend.append("companyId", formData.companyId);

      // Add image if a new one was selected
      const imageInput = document.getElementById("image") as HTMLInputElement;
      if (imageInput?.files?.[0]) {
        formDataToSend.append("image", imageInput.files[0]);
      }

      const res: ApiResponse = await sendData(formDataToSend, undefined, "PATCH");

      if (res.code === 200) {
        setSuccessMessage("Profile updated successfully!");
        setIsEditing(false);
        // Reload page to get updated user data
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setErrorMessage(res.message || "Failed to update profile");
        if (res.data && typeof res.data === "object") {
          setErrors(res.data as Record<string, string>);
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Something went wrong. Please try again.");
    }
  };

  const { fetchApi: fetchOrders } = useApi({
    url: "/api/users/orders", // <-- UserOrderController index route
    method: "GET",
    requiresAuth: true,
    type: "manual",
  });

  useEffect(() => {
    if (activeTab === "orders") {
      loadOrders();
    }
  }, [activeTab]);
  
  const loadOrders = async () => {
    setOrdersLoading(true);
    setOrdersError("");
  
    try {
      const res: ApiResponse = await fetchOrders();
  
      if (res.code === 200) {
        setOrders(res.data || []);
      } else {
        setOrdersError(res.message || "Failed to load orders");
      }
    } catch (err: any) {
      setOrdersError("Something went wrong while loading orders");
    } finally {
      setOrdersLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!validatePasswordForm()) return;

    try {
      const payload = {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      };

      const res: ApiResponse = await sendPasswordData(payload, undefined, "POST");

      if (res.code === 200) {
        setSuccessMessage("Password changed successfully!");
        // Clear form
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setErrors({});
      } else {
        setErrorMessage(res.message || "Failed to change password");
        if (res.data && typeof res.data === "object") {
          setErrors(res.data as Record<string, string>);
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Something went wrong. Please try again.");
    }
  };

  // Show loading only if we're actually loading AND don't have user data
  if (loadingUser && !user) {
    return (
      <>
        <InnerBanner title="My Account" bannerClass="account-banner" />
        <section className="py-20">
          <div className="container">
            <div className="text-center">Loading...</div>
          </div>
        </section>
      </>
    );
  }

  // If no user after loading completes, don't render (will redirect)
  if (!loadingUser && !user) {
    return null; // Will redirect via useEffect
  }

  // If we have user data, show the page (even if still loading in background)
  if (!user) {
    return null;
  }

  return (
    <>
      <InnerBanner title="My Account" bannerClass="account-banner" />
      <section className="py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            {/* Tabs */}
            <div className="flex gap-4 mb-8 border-b border-gray-200">
              <button
                onClick={() => setActiveTab("profile")}
                className={`px-6 py-3 font-semibold transition-colors ${
                  activeTab === "profile"
                    ? "text-[var(--primary-theme)] border-b-2 border-[var(--primary-theme)]"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Profile Information
              </button>
              <button
                onClick={() => setActiveTab("password")}
                className={`px-6 py-3 font-semibold transition-colors ${
                  activeTab === "password"
                    ? "text-[var(--primary-theme)] border-b-2 border-[var(--primary-theme)]"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Change Password
              </button>
              <button
                onClick={() => setActiveTab("orders")}
                className={`px-6 py-3 font-semibold transition-colors ${
                  activeTab === "orders"
                    ? "text-[var(--primary-theme)] border-b-2 border-[var(--primary-theme)]"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Purchases
              </button>
            </div>

            {/* Success/Error Messages */}
            {successMessage && (
              <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                {successMessage}
              </div>
            )}
            {errorMessage && (
              <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {errorMessage}
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
                {!isEditing ? (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
                      <Button onClick={() => setIsEditing(true)} size="sm">
                        Edit Profile
                      </Button>
                    </div>

                    <div className="space-y-6">
                      {/* Profile Image */}
                      <div className="flex items-center gap-6">
                        <div className="relative">
                          {imagePreview ? (
                            <Image
                              src={imagePreview}
                              alt="Profile"
                              width={120}
                              height={120}
                              className="rounded-full object-cover"
                              unoptimized={imagePreview.startsWith('data:') || imagePreview.includes('localhost')}
                            />
                          ) : (
                            <div className="w-[120px] h-[120px] rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-4xl text-gray-600">
                                {user.name?.[0]?.toUpperCase() || "U"}
                              </span>
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Profile Picture</p>
                        </div>
                      </div>

                      {/* User Info Display */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label>Name</Label>
                          <p className="mt-1 text-gray-900 font-medium">{user.name || "Not set"}</p>
                        </div>
                        <div>
                          <Label>Email</Label>
                          <p className="mt-1 text-gray-900 font-medium">{user.email || "Not set"}</p>
                        </div>
                        <div>
                          <Label>Mobile Number</Label>
                          <p className="mt-1 text-gray-900 font-medium">
                            {user.mobileNumber || "Not set"}
                          </p>
                        </div>
                        <div>
                          <Label>Category</Label>
                          <p className="mt-1 text-gray-900 font-medium">
                            {categoryList?.find((c: { id: number; name: string }) => String(c.id) === String(user?.categoryId ?? formData.categoryId))?.name ?? "Not set"}
                          </p>
                        </div>
                        <div>
                          <Label>Company</Label>
                          <p className="mt-1 text-gray-900 font-medium">
                            {companyList?.find((c: { id: number; name: string }) => String(c.id) === String(user?.companyId ?? formData.companyId))?.name ?? "Not set"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleProfileSubmit} className="space-y-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false);
                          setErrors({});
                          setErrorMessage("");
                          setSuccessMessage("");
                        }}
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>

                    {/* Profile Image Upload */}
                    <div>
                      <Label>Profile Picture</Label>
                      <div className="mt-2 flex items-center gap-4">
                        {imagePreview ? (
                          <Image
                            src={imagePreview}
                            alt="Preview"
                            width={100}
                            height={100}
                            className="rounded-full object-cover"
                            unoptimized={imagePreview.startsWith('data:') || imagePreview.includes('localhost')}
                          />
                        ) : (
                          <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-2xl text-gray-600">
                              {formData.name?.[0]?.toUpperCase() || "U"}
                            </span>
                          </div>
                        )}
                        <div>
                          <input
                            type="file"
                            id="image"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--primary-theme)] file:text-white hover:file:bg-[var(--secondary-theme)]"
                          />
                          <p className="mt-1 text-xs text-gray-500">Max size: 5MB</p>
                        </div>
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="name">
                          Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          error={!!errors.name}
                          hint={errors.name}
                        />
                      </div>

                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={user?.email || ""}
                          disabled={true}
                        />
                        <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                      </div>

                      <div>
                        <Label htmlFor="mobileNumber">Mobile Number</Label>
                        <Input
                          id="mobileNumber"
                          name="mobileNumber"
                          type="tel"
                          value={formData.mobileNumber}
                          onChange={handleInputChange}
                          error={!!errors.mobileNumber}
                          hint={errors.mobileNumber}
                        />
                      </div>

                      <div>
                        <Label htmlFor="categoryId">Category</Label>
                        <select
                          id="categoryId"
                          name="categoryId"
                          value={formData.categoryId}
                          onChange={handleInputChange}
                          className="h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm"
                        >
                          <option value="">-- Select Category --</option>
                          {categoryList?.map((cat: { id: number; name: string }) => (
                            <option key={cat.id} value={String(cat.id)}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <Label htmlFor="companyId">Company</Label>
                        <select
                          id="companyId"
                          name="companyId"
                          value={formData.companyId}
                          onChange={handleInputChange}
                          className="h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm"
                        >
                          <option value="">-- Select Company --</option>
                          {companyList?.map((company: { id: number; name: string }) => (
                            <option key={company.id} value={String(company.id)}>
                              {company.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false);
                          setErrors({});
                          setErrorMessage("");
                          setSuccessMessage("");
                        }}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={apiLoading}>
                        {apiLoading ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Password Tab */}
            {activeTab === "password" && (
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Change Password</h2>
                <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-md">
                  <div>
                    <Label htmlFor="currentPassword">
                      Current Password <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, currentPassword: e.target.value })
                      }
                      error={!!errors.currentPassword}
                      hint={errors.currentPassword}
                    />
                  </div>

                  <div>
                    <Label htmlFor="newPassword">
                      New Password <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, newPassword: e.target.value })
                      }
                      error={!!errors.newPassword}
                      hint={errors.newPassword}
                    />
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">
                      Confirm New Password <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                      }
                      error={!!errors.confirmPassword}
                      hint={errors.confirmPassword}
                    />
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={passwordLoading}>
                      {passwordLoading ? "Updating..." : "Update Password"}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === "orders" && (
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">My Purchases</h2>

                  {/* Loading */}
                  {ordersLoading && (
                    <p className="text-center py-10 text-gray-500">Loading purchases...</p>
                  )}

                  {/* Error */}
                  {ordersError && (
                    <p className="text-center py-10 text-red-500">{ordersError}</p>
                  )}

                  {/* Empty */}
                  {!ordersLoading && orders.length === 0 && (
                    <p className="text-center py-10 text-gray-500">
                      You have no purchase yet.
                    </p>
                  )}

                  {/* Orders Table */}
                  {!ordersLoading && orders.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-gray-100 text-gray-500 text-sm uppercase tracking-wider">
                            <th className="py-4 font-semibold">Purchase ID</th>
                            <th className="py-4 font-semibold">Purchase Date</th>
                            <th className="py-4 font-semibold text-center">Status</th>
                            <th className="py-4 font-semibold text-right">Total</th>
                            <th className="py-4 font-semibold text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {orders.map((order) => (
                            <tr key={order.id}>
                              <td className="py-6 font-medium text-gray-900">
                                #{order.id}
                              </td>
                              <td className="py-6 font-medium text-gray-900">
                              {order.purchase_date}
                              {/* {order.items && order.items.length > 0 ? (
                                  <ul className="space-y-1">
                                    {order.items.map((item: any) => (
                                      <li key={item.id}>
                                        {item.title} <span className="text-sm text-gray-500"></span>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  "—"
                                )} */}
                              </td>
                              <td className="py-6 text-center">
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100">
                                  {order.status}
                                </span>
                              </td>

                              <td className="py-6 text-right font-bold text-gray-900">
                                ${Number(order.total).toFixed(2)}
                              </td>

                              <td className="py-6 text-right">
                                {order.items?.[0]?.productId ? (
                                  <Link href={`/purchase/${order.id}/gallery?eventId=${order.items[0].productId}`}>
                                    <Button variant="outline" size="sm">
                                      View Event Galleries
                                    </Button>
                                  </Link>
                                ) : (
                                  <span className="text-gray-400 text-sm">—</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
          </div>
        </div>
      </section>
    </>
  );
}

