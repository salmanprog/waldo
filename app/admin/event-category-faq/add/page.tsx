"use client";
import { useState, useEffect } from "react";
import Button from "@/components/ui/button/Button";
import { useRouter } from "next/navigation";
import useApi from "@/utils/useApi";

export default function AddEventCategoryFaq() {
  const router = useRouter();

  // Set page title
  useEffect(() => {
    document.title = "Admin | Add Event Category FAQ";
  }, []);

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [eventCategoryId, setEventCategoryId] = useState("");
  const [status, setStatus] = useState("1");
  const [errorMsg, setErrorMsg] = useState("");

  // Load event categories
  const { data: categoryList, fetchApi: fetchCategories } = useApi({
    url: "/api/admin/events/category",
    method: "GET",
    type: "manual",
    requiresAuth: true,
  });

  // Submit FAQ API
  const { sendData, loading } = useApi({
    url: "/api/admin/events/category/faq",
    type: "manual",
    requiresAuth: true,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const submitFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!question) return setErrorMsg("Question is required.");
    if (!answer) return setErrorMsg("Answer is required.");
    if (!eventCategoryId) return setErrorMsg("Please select an event category.");

    try {
      const formData = new FormData();
      formData.append("question", question);
      formData.append("answer", answer);
      formData.append("eventCategoryId", eventCategoryId);
      formData.append("status", status);

      const res = await sendData(formData, undefined, "POST");

      if (res.code === 200) {
        router.push("/admin/event-category-faq");
      } else {
        setErrorMsg(res.message || "Something went wrong.");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "An error occurred. Try again.");
    }
  };

  return (
    <div className="p-4 mx-auto md:p-6">

      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          Add Event Category FAQ
        </h2>

        <nav>
          <ol className="flex items-center gap-1.5">
            <li>
              <a
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400"
                href="/admin"
              >
                Home
                <svg className="stroke-current" width="17" height="16">
                  <path
                    d="M6.0765 12.667L10.2432 8.50033L6.0765 4.33366"
                    strokeWidth="1.2"
                  />
                </svg>
              </a>
            </li>

            <li className="text-sm text-gray-800 dark:text-white/90">Add FAQ</li>
          </ol>
        </nav>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 text-sm">
          {errorMsg}
        </div>
      )}

      {/* Form */}
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
          <h2 className="text-lg font-medium text-gray-800 dark:text-white">
            FAQ Details
          </h2>
        </div>

        <div className="p-4 sm:p-6">
          <form onSubmit={submitFaq} className="space-y-5">

            {/* Event Category Dropdown */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Event Category
              </label>
              <select
                value={eventCategoryId}
                onChange={(e) => setEventCategoryId(e.target.value)}
                className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs
                bg-transparent border-gray-300 focus:border-brand-300
                dark:bg-gray-900 dark:text-white dark:border-gray-700"
              >
                <option value="">-- Select Event Category --</option>

                {/* dynamic categories */}
                {categoryList?.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Question */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Question
              </label>
              <input
                type="text"
                placeholder="Enter question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs
                bg-transparent border-gray-300 focus:border-brand-300
                dark:bg-gray-900 dark:text-white dark:border-gray-700"
              />
            </div>

            {/* Answer */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Answer
              </label>
              <textarea
                rows={5}
                placeholder="Enter answer..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs
                bg-transparent border-gray-300 focus:border-brand-300
                dark:bg-gray-900 dark:text-white dark:border-gray-700"
              ></textarea>
            </div>

            {/* Status */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="h-11 w-full rounded-lg border px-4 py-2.5 shadow-theme-xs
                bg-transparent border-gray-300 dark:bg-gray-900 dark:text-white"
              >
                <option value="1">Active</option>
                <option value="0">Inactive</option>
              </select>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" loading={loading}>
                Save FAQ
              </Button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}

