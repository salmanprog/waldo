"use client";

import { useState, useEffect, useMemo } from "react";
import Input from "@/components/form/input/InputField";
import Link from "next/link";
import InnerBanner from "@/components/common/InnerBanner";
import useApi, { ApiResponse } from "@/utils/useApi";
import { useRouter } from "next/navigation";
import { safeRedirectPath } from "@/utils/safeRedirectPath";

interface LoginResponse {
  apiTokens?: { apiToken: string }[];
  message?: string;
}

export default function LoginPage() {
  const router = useRouter();

  const postAuthRedirect = useMemo(() => {
    if (typeof window === "undefined") return "/";
    return safeRedirectPath(new URLSearchParams(window.location.search).get("redirect"), "/");
  }, []);

  useEffect(() => {
    document.title = "My Waldo | Login";
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token") || document.cookie.split(';').find(c => c.trim().startsWith('token='))?.split('=')[1];
    if (token) {
      router.push(postAuthRedirect);
    }
  }, [router, postAuthRedirect]);
  const { sendData, loading, error } = useApi({
    url: "/api/users/login",
    type: "manual",
    method: "POST",
    requiresAuth: false,
  });
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");  // for showing top-level error message
  const [verifyBanner, setVerifyBanner] = useState<{ text: string; tone: "ok" | "warn" } | null>(null);

  useEffect(() => {
    const status = new URLSearchParams(window.location.search).get("emailVerify");
    if (status === "verified") {
      setVerifyBanner({ text: "Your email has been verified. You can sign in.", tone: "ok" });
    } else if (status === "expired") {
      setVerifyBanner({
        text: "This verification link has expired. Please contact support if you need help.",
        tone: "warn",
      });
    } else if (status === "invalid") {
      setVerifyBanner({
        text: "This verification link is invalid or has already been used.",
        tone: "warn",
      });
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");  // Reset error message

    if (!validateForm()) return;

    try {
      const formDataSend = new FormData();
      formDataSend.append("email", formData.email);
      formDataSend.append("password", formData.password);

      const res: ApiResponse<LoginResponse> = await sendData<ApiResponse<LoginResponse>>(
        formDataSend,
        undefined,
        "POST"
      );

      if (res.code === 200 && res.data?.apiTokens?.[0]?.apiToken) {
        const token = res.data.apiTokens[0].apiToken;
        localStorage.setItem("token", token);
        window.location.href = postAuthRedirect;
      } else {
        setErrorMsg(res.message || "Credentials does not matach in our records.");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <>
      <InnerBanner title="Login" bannerClass="login-banner auth-banner" />
      <section className="py-20">
        <div className="container">
          <div className="max-w-[40rem] mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
              <h2 className="text-3xl font-bold text-center mb-2 text-gray-900">
                Welcome
              </h2>
              <p className="text-center text-gray-600 mb-8">
                Sign in to your account to continue
              </p>

              {/* Display error message */}
              {errorMsg && (
                <div className="text-sm text-red-500 font-medium mb-3">{errorMsg}</div>
              )}
              {verifyBanner && (
                <div
                  className={
                    verifyBanner.tone === "ok"
                      ? "bg-green-100 text-green-800 p-3 rounded-md text-sm font-medium mb-3"
                      : "bg-amber-100 text-amber-900 p-3 rounded-md text-sm font-medium mb-3"
                  }
                >
                  {verifyBanner.text}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    error={!!errors.email}
                    hint={errors.email}
                  />
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      error={!!errors.password}
                      hint={errors.password}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Link href="/forgot-password" className="text-sm text-[var(--secondary-theme)] hover:text-blue-700 font-semibold">
                    Forgot Password?
                  </Link>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="btn btn-primary w-full mt-6"
                >
                  {loading ? "Signing in..." : "Sign in"}
                </button>

                {/* Signup Link */}
                <p className="text-center text-sm text-gray-600 mt-6">
                  Don't have an account?{" "}
                  <Link
                    href={`/signup?redirect=${encodeURIComponent(postAuthRedirect)}`}
                    className="text-[var(--secondary-theme)] hover:text-blue-700 font-semibold"
                  >
                    Sign Up
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
