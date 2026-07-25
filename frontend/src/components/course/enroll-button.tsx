"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { enrollInCourse } from "@/lib/courses";

type EnrollButtonProps = {
  courseId: string | number;
  userAddress: string;
  accessToken?: string;
  initialEnrolled: boolean;
};

export default function EnrollButton({
  courseId,
  userAddress,
  accessToken,
  initialEnrolled,
}: EnrollButtonProps) {
  const router = useRouter();
  const [isEnrolled, setIsEnrolled] = useState(initialEnrolled);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleEnroll() {
    if (!userAddress) {
      setErrorMsg("Please connect your wallet first.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const res = await enrollInCourse(userAddress, courseId, accessToken);

    if (res.success) {
      setIsEnrolled(true);
      router.refresh();
    } else {
      setErrorMsg(res.message || "Failed to enroll. Please try again.");
    }
    setLoading(false);
  }

  if (isEnrolled) {
    return (
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5 px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-800">
          <svg className="w-4 h-4 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
          Enrolled
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleEnroll}
        disabled={loading}
        className="h-11 px-6 bg-primary text-white font-mono text-xs font-bold uppercase tracking-wider border border-[#0B0E14] hover:bg-[#0B0E14] hover:text-[#F8FAFC] transition-colors disabled:opacity-50 hover:cursor-pointer"
      >
        {loading ? "Enrolling..." : "Enroll in Course"}
      </button>
      {errorMsg && (
        <p className="text-xs text-red-600 font-mono mt-1">{errorMsg}</p>
      )}
    </div>
  );
}