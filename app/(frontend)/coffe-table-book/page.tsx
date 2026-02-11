"use client";

import { useEffect, useState } from "react";
import InnerBanner from "@/components/common/InnerBanner";
import useApi, { ApiResponse } from "@/utils/useApi";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";

export default function CoffeeTableBookPage() {
  useEffect(() => {
    document.title = "My Waldo | Coffee Table Book";
  }, []);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
  });

  const [images, setImages] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const { sendData, loading } = useApi({
    url: "/api/users/coffe-book-table",
    type: "manual",
    requiresAuth: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!form.firstName.trim()) newErrors.firstName = "First name is required";
    if (!form.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Invalid email format";
    }
    if (images.length === 0) newErrors.images = "At least one image is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setImages((prev) => [...prev, ...newFiles]);
      // Clear image error when files are selected
      if (errors.images) {
        setErrors({ ...errors, images: "" });
      }
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!validateForm()) return;

    try {
      const formData = new FormData();
      formData.append("firstName", form.firstName);
      formData.append("lastName", form.lastName);
      formData.append("email", form.email);
      formData.append("phone", form.phone);
      formData.append("address", form.address);
      
      // Append all images
      images.forEach((image) => {
        formData.append("images", image);
      });

      const res = await sendData<ApiResponse>(formData, undefined, "POST");

      if (res.code === 200) {
        setSuccessMsg("Thank you! Your coffee table book request has been submitted.");
        setForm({ firstName: "", lastName: "", email: "", phone: "", address: "" });
        setImages([]);
      } else if (res.code === 422) {
        setErrors(res.data ?? {});
        setErrorMsg(res.message || "Validation failed");
      } else {
        setErrorMsg(res.message || "Something went wrong.");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Server error. Try again.");
    }
  };

  return (
    <>
      <InnerBanner bannerClass="products-banner" title="Coffee Table Book" />

      <section className="products-section sec-gap">
        <div className="container">
          <div className="max-w-[40rem] mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
              <h2 className="text-3xl font-bold text-center mb-2">
                Request Coffee Table Book
              </h2>
              <p className="text-center text-gray-600 mb-6">
                Fill out the form below to request your coffee table book
              </p>

              {successMsg && (
                <div className="mb-4 p-3 rounded-lg bg-green-100 text-green-700 text-sm">
                  {successMsg}
                </div>
              )}

              {errorMsg && (
                <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 text-sm">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-1">First Name *</label>
                  <Input
                    type="text"
                    name="firstName"
                    placeholder="Enter your first name"
                    value={form.firstName}
                    onChange={handleChange}
                    error={!!errors.firstName}
                    hint={errors.firstName}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Last Name *</label>
                  <Input
                    type="text"
                    name="lastName"
                    placeholder="Enter your last name"
                    value={form.lastName}
                    onChange={handleChange}
                    error={!!errors.lastName}
                    hint={errors.lastName}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Email *</label>
                  <Input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={form.email}
                    onChange={handleChange}
                    error={!!errors.email}
                    hint={errors.email}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <Input
                    type="text"
                    name="phone"
                    placeholder="Enter your phone number (optional)"
                    value={form.phone}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Address</label>
                  <textarea
                    name="address"
                    rows={4}
                    placeholder="Enter your address (optional)"
                    value={form.address}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Upload Images <span className="text-red-500">*</span>
                  </label>
                  <label className={`border-2 border-dashed rounded-lg p-6 block text-center cursor-pointer hover:border-blue-500 transition-colors ${
                    errors.images ? "border-red-500" : "border-gray-300"
                  }`}>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                    />
                    <div className="flex flex-col items-center gap-2">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-gray-600">Click to upload or drag & drop</p>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB each</p>
                    </div>
                  </label>
                  {errors.images && (
                    <p className="mt-1.5 text-xs text-red-500">{errors.images}</p>
                  )}

                  {images.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                      {images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                          <p className="text-xs text-gray-600 mt-1 truncate">{image.name}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button type="submit" loading={loading} className="w-full">
                  Submit Request
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
