"use client";

import { useState } from "react";

interface MintCourseButtonProps {
  courseName: string;
  userAddress?: string | null;
}

export default function MintCourseButton({
  courseName,
  userAddress,
}: MintCourseButtonProps) {
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleMint = async () => {
    if (!userAddress) {
      alert("Public key not found. Please log in with your wallet.");
      return;
    }

    if (!courseName) {
      alert("Course name is missing.");
      return;
    }

    setLoading(true);
    setStatusMessage(null);

    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL || "https://wob3.onrender.com";

      const response = await fetch(`${baseUrl}/mint_course_completion/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          student_public_key: userAddress,
          course_name: courseName,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.error || data?.message || `Error ${response.status}`,
        );
      }

      setStatusMessage("Successfully minted completion NFT/Certificate!");
      console.log("Mint result:", data);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Minting failed.";
      console.error("Minting error:", err);
      setStatusMessage(`Failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        onClick={handleMint}
        disabled={loading || !userAddress}
        className="px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {loading ? "Minting..." : "Mint Course Completion"}
      </button>

      {statusMessage && (
        <p
          className={`text-sm ${
            statusMessage.startsWith("Successfully")
              ? "text-emerald-600 font-medium"
              : "text-rose-600"
          }`}
        >
          {statusMessage}
        </p>
      )}
    </div>
  );
}
