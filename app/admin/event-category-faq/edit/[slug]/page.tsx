"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/button/Button";
import useApi from "@/utils/useApi";
import { useParams, useRouter } from "next/navigation";

export default function EditEventCategoryFaq() {
  const router = useRouter();
  const { slug } = useParams();

  // Set page title
  useEffect(() => {
    document.title = "Admin | Edit Event Category FAQ";
  }, []);

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [eventCategoryId, setEventCategoryId] = useState("");
  const [status, setStatus] = useState("1");
  const [errorMsg, setErrorMsg] = useState("");

  // Fetch categories
  const { data: categoryList, fetchApi: fetchCategories } = useApi({
    url: "/api/admin/events/category",
    method: "GET",
    type: "manual",
    requiresAuth: true,
  });

  // Fetch single FAQ
  const { data: faqData, fetchApi: fetchFaq } = useApi({
    url: `/api/admin/events/category/faq/${slug}`,
    method: "GET",
    type: "manual",
    requiresAuth: true,
  });

  // Update FAQ API
  const { sendData, loading } = useApi({
    url: `/api/admin/events/category/faq/${slug}`,
    method: "PATCH",
    type: "manual",
    requiresAuth: true,
  });

  useEffect(() => {
    fetchCategories();
    fetchFaq();
  }, []);

  // Fill edit form fields
  useEffect(() => {
    if (faqData) {
      setQuestion(faqData.question ?? "");
      setAnswer(faqData.answer || "");
      setStatus(faqData.status ? "1" : "0");
      setEventCategoryId(String(faqData.eventCategoryId));
    }
  }, [faqData]);

  const updateFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!question) return setErrorMsg("Question is required.");
    if (!answer) return setErrorMsg("Answer is required.");
    if (!eventCategoryId) return setErrorMsg("Event category is required.");

    try {
      const formData = new FormData();
      formData.append("question", question);
      formData.append("answer", answer);
      formData.append("eventCategoryId", eventCategoryId);
      formData.append("status", status);

      const res = await sendData(formData, undefined, "PATCH");

      if (res.code === 200) {
        router.push("/admin/event-category-faq");
      } else {
        setErrorMsg(res.message || "Something went wrong.");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Update failed. Try again.");
    }
  };

  return (
    <div className="p-4 mx-auto md:p-6">

      <div className="flex justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Edit Event Category FAQ
        </h2>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 text-sm">
          {errorMsg}
        </div>
      )}

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-white/[0.03]">
        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white">
            FAQ Details
          </h3>
        </div>

        <div className="p-4 sm:p-6">
          <form onSubmit={updateFaq} className="space-y-5">

            {/* Event Category Dropdown */}
            <div>
              <label className="block mb-1 text-sm font-medium">Event Category</label>
              <select
                value={eventCategoryId}
                onChange={(e) => setEventCategoryId(e.target.value)}
                className="h-11 w-full rounded-lg border px-4"
              >
                <option value="">-- Select Event Category --</option>
                {categoryList?.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Question */}
            <div>
              <label className="block mb-1 text-sm font-medium">Question</label>
              <input
                type="text"
                className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
            </div>

            {/* Answer */}
            <div>
              <label className="block mb-1 text-sm font-medium">Answer</label>
              <textarea
                rows={5}
                className="w-full rounded-lg border px-4 py-2.5 text-sm"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
              />
            </div>

            {/* Status */}
            <div>
              <label className="block mb-1 text-sm font-medium">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="h-11 w-full border rounded-lg px-4 py-2.5"
              >
                <option value="1">Active</option>
                <option value="0">Inactive</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" loading={loading}>
                Update FAQ
              </Button>
            </div>

          </form>
        </div>
      </div>

    </div>
  );
}

