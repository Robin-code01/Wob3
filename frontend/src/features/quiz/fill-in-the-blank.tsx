"use client";

import { useState } from "react";

interface FillInTheBlankQuestionProps {
  question: string; // Tip: Use "___" or "[blank]" in your question text to represent the gap
  placeholder?: string;
  onAnswerSubmit?: (answer: string) => void;
}

export default function FillInTheBlankQuestion({
  question,
  placeholder = "Type your answer here...",
  onAnswerSubmit,
}: FillInTheBlankQuestionProps) {
  const [answer, setAnswer] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAnswer(value);
    if (onAnswerSubmit) {
      onAnswerSubmit(value);
    }
  };

  return (
    <div className="flex flex-col gap-4 text-white">
      {/* Question Heading */}
      <h3 className="text-xl font-bold tracking-wide">{question}</h3>

      {/* Input Field */}
      <div className="flex flex-col gap-2">
        <input
          type="text"
          value={answer}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full px-4 py-3 rounded-lg border bg-primary/50 text-white placeholder:text-white/60 border-primary/50 focus:outline-none focus:bg-white focus:text-slate-900 focus:border-white focus:shadow-md transition-all font-medium text-base"
        />
      </div>
    </div>
  );
}
