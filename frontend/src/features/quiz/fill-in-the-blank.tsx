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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-white">
      {/* Question Heading */}
      {question && <h3 className="text-xl font-bold tracking-wide">{question}</h3>}

      {/* Input Field and Submit Button */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 px-4 py-3 rounded-lg border bg-primary/50 text-white placeholder:text-white/60 border-primary/50 focus:outline-none focus:bg-white focus:text-slate-900 focus:border-white focus:shadow-md transition-all font-medium text-base"
        />
        <button
          type="submit"
          disabled={!answer.trim() || disabled}
          className="px-6 py-3 bg-primary text-white font-mono text-xs font-bold uppercase tracking-wider border border-white/20 rounded-lg hover:bg-white hover:text-[#0B0E14] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
        >
          Submit Answer
        </button>
      </div>
    </form>
  );
}