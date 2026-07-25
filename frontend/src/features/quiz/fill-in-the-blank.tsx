"use client";

import { useState } from "react";

interface FillInTheBlankQuestionProps {
  question: string;
  placeholder?: string;
  onAnswerSubmit?: (answer: string) => void;
  disabled?: boolean;
}

export default function FillInTheBlankQuestion({
  question,
  placeholder = "Type your answer here...",
  onAnswerSubmit,
  disabled,
}: FillInTheBlankQuestionProps) {
  const [answer, setAnswer] = useState("");

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (onAnswerSubmit && answer.trim()) {
      onAnswerSubmit(answer.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-[#0B0E14]">
      {/* Question Heading */}
      {question && <h3 className="text-lg font-bold text-[#0B0E14] leading-snug">{question}</h3>}

      {/* Input Field and Submit Button */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 px-4 py-3 border border-[#0B0E14] bg-white text-[#0B0E14] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B0E14] text-sm font-medium disabled:bg-slate-100 disabled:cursor-not-allowed"
        />
        <button
          type="submit"
          disabled={!answer.trim() || disabled}
          className="h-11 px-6 bg-primary text-white font-mono text-xs font-bold uppercase tracking-wider border border-[#0B0E14] hover:bg-[#0B0E14] hover:text-[#F8FAFC] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
        >
          Submit Answer
        </button>
      </div>
    </form>
  );
}