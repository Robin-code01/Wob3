"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCourse } from "@/lib/courses";

interface CreateCourseFormProps {
  userAddress: string;
  accessToken?: string;
}

export default function CreateCourseForm({
  userAddress,
  accessToken,
}: CreateCourseFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    outcomes: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!userAddress) {
      setError("No connected wallet address found.");
      setLoading(false);
      return;
    }

    try {
      const data = await createCourse(
        {
          title: formData.title,
          description: formData.description,
          outcomes: formData.outcomes,
          creator_id: userAddress,
        },
        accessToken,
      );

      // Revalidate and redirect back to homepage
      router.push(`/courses/${data?.course_id}/modules/create`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Something went wrong creating the course.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-6 max-w-2xl mx-auto"
    >
      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 text-sm font-medium rounded">
          {error}
        </div>
      )}

      {/* Course Title */}
      <div className="flex flex-col gap-2">
        <label
          htmlFor="title"
          className="font-mono text-xs font-bold uppercase tracking-wider text-slate-700"
        >
          Course Title *
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g. Intro to Web3"
          className="px-4 py-3 border border-[#0B0E14] bg-white text-[#0B0E14] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B0E14]"
        />
      </div>

      {/* Description */}
      <div className="flex flex-col gap-2">
        <label
          htmlFor="description"
          className="font-mono text-xs font-bold uppercase tracking-wider text-slate-700"
        >
          Description *
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          required
          value={formData.description}
          onChange={handleChange}
          placeholder="Learn blockchain basics..."
          className="px-4 py-3 border border-[#0B0E14] bg-white text-[#0B0E14] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B0E14]"
        />
      </div>

      {/* Learning Outcomes */}
      <div className="flex flex-col gap-2">
        <label
          htmlFor="outcomes"
          className="font-mono text-xs font-bold uppercase tracking-wider text-slate-700"
        >
          Learning Outcomes *
        </label>
        <textarea
          id="outcomes"
          name="outcomes"
          rows={3}
          required
          value={formData.outcomes}
          onChange={handleChange}
          placeholder="Build a DApp, understand smart contract security..."
          className="px-4 py-3 border border-[#0B0E14] bg-white text-[#0B0E14] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B0E14]"
        />
      </div>

      {/* Creator ID (Read-only representation) */}
      <div className="flex flex-col gap-2">
        <label className="font-mono text-xs font-bold uppercase tracking-wider text-slate-500">
          Creator Wallet Address
        </label>
        <input
          type="text"
          disabled
          value={userAddress || "0xNotConnected"}
          className="px-4 py-3 border border-slate-300 bg-slate-100 text-slate-600 font-mono text-sm cursor-not-allowed"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="mt-4 px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider text-white bg-[#0B0E14] border border-[#0B0E14] hover:bg-slate-800 disabled:opacity-50 transition-all cursor-pointer shadow-sm active:translate-y-0.5"
      >
        {loading ? "Creating Course..." : "Publish Course"}
      </button>
    </form>
  );
}
