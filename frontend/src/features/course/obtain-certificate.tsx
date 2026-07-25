"use client";

import { useState } from "react";

interface MintCourseButtonProps {
  courseName: string;
  userAddress?: string | null;
  accessToken?: string | null;
  isCourseComplete?: boolean;
  isEnrolled?: boolean;
}

export default function MintCourseButton({
  courseName,
  userAddress,
  accessToken,
  isCourseComplete = true,
  isEnrolled = true,
}: MintCourseButtonProps) {
  const [loading, setLoading] = useState(false);
  const [isMinted, setIsMinted] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleMint = async () => {
    if (!userAddress) {
      setStatusMessage("Wallet not connected. Please connect your wallet.");
      return;
    }

    if (!courseName) {
      setStatusMessage("Course name is missing.");
      return;
    }

    setLoading(true);
    setStatusMessage(null);

    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL || "https://wob3.onrender.com";

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };
      if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
      }

      const response = await fetch(`${baseUrl}/web3/mint_course_completion/`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          student_public_key: userAddress,
          course_name: courseName,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const errMsg =
          data?.error || data?.message || `Minting failed (${response.status})`;
        if (errMsg.toLowerCase().includes("already")) {
          setIsMinted(true);
          setStatusMessage("Certificate has already been minted for this course.");
          return;
        }
        throw new Error(errMsg);
      }

      setIsMinted(true);
      setStatusMessage(
        data?.message || "Successfully minted completion certificate!"
      );
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
    <section className="border border-[#0B0E14] bg-white p-6 sm:p-8 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <h2 className="font-mono text-xs font-bold tracking-widest text-slate-500 uppercase">
          Course Certificate
        </h2>
        {isMinted ? (
          <span className="font-mono text-[11px] font-bold text-emerald-800 uppercase bg-emerald-100 px-2.5 py-1 border border-emerald-400">
            Minted ✓
          </span>
        ) : isCourseComplete ? (
          <span className="font-mono text-[11px] font-bold text-emerald-800 uppercase bg-emerald-50 px-2.5 py-1 border border-emerald-300">
            Unlocked
          </span>
        ) : (
          <span className="font-mono text-[11px] font-bold text-slate-500 uppercase bg-slate-100 px-2.5 py-1 border border-slate-300">
            Locked
          </span>
        )}
      </div>

      <div className="space-y-1.5">
        <h3 className="text-lg font-bold text-[#0B0E14]">
          {isMinted ? "Certificate Claimed" : "Verifiable Completion NFT"}
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          {isMinted
            ? "Congratulations! You have successfully minted your completion certificate on the blockchain."
            : isCourseComplete
            ? "You have completed all requirements for this course. Claim your non-transferable certificate token below."
            : isEnrolled
            ? "Finish all module lessons and quizzes in this course to unlock your on-chain completion certificate."
            : "Enroll in this course and complete all modules to earn your verified Web3 completion certificate."}
        </p>
      </div>

      {statusMessage && (
        <div
          className={`font-mono text-xs p-3 border ${
            isMinted || statusMessage.toLowerCase().includes("success")
              ? "bg-emerald-50 text-emerald-800 border-emerald-600"
              : "bg-rose-50 text-rose-800 border-rose-600"
          }`}
        >
          {statusMessage}
        </div>
      )}

      <div className="pt-1">
        {isMinted ? (
          <button
            type="button"
            disabled
            className="w-full sm:w-auto h-11 px-6 bg-emerald-100 text-emerald-800 font-mono text-xs font-bold uppercase tracking-wider border border-emerald-600 cursor-not-allowed opacity-100 flex items-center justify-center gap-2"
          >
            <span>✓</span> Certificate Minted
          </button>
        ) : (
          <button
            type="button"
            onClick={handleMint}
            disabled={loading || !userAddress || !isCourseComplete}
            className="w-full sm:w-auto h-11 px-6 bg-primary text-white font-mono text-xs font-bold uppercase tracking-wider border border-[#0B0E14] hover:bg-[#0B0E14] hover:text-[#F8FAFC] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? "Minting Certificate..." : "Mint Course Completion"}
          </button>
        )}
      </div>
    </section>
  );
}