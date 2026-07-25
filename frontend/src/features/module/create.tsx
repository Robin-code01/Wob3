"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createModule } from "@/lib/modules/create";

interface CreateModuleFormProps {
  courseId: string;
  accessToken?: string;
}

export default function CreateModuleForm({
  courseId,
  accessToken,
}: CreateModuleFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await createModule(courseId, { title }, accessToken);

      console.log(data);

      // Refresh data and send user back to the course details page
      router.push(
        `/courses/${courseId}/modules/${data.module_id}/sections/create`,
      );
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to create module. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-6 max-w-xl mx-auto"
    >
      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 text-sm font-medium rounded">
          {error}
        </div>
      )}

      {/* Module Title Input */}
      <div className="flex flex-col gap-2">
        <label
          htmlFor="title"
          className="font-mono text-xs font-bold uppercase tracking-wider text-slate-700"
        >
          Module Title *
        </label>
        <input
          id="title"
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Module 1: Blockchain basics"
          className="px-4 py-3 border border-[#0B0E14] bg-white text-[#0B0E14] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B0E14]"
        />
      </div>

      {/* Form Action Buttons */}
      <div className="flex items-center gap-4 mt-2">
        <button
          type="submit"
          disabled={loading || !title.trim()}
          className="px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider text-white bg-[#0B0E14] border border-[#0B0E14] hover:bg-slate-800 disabled:opacity-50 transition-all cursor-pointer shadow-sm active:translate-y-0.5"
        >
          {loading ? "Adding Module..." : "Add Module"}
        </button>

        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider text-slate-700 border border-slate-300 hover:bg-slate-100 transition-all cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
