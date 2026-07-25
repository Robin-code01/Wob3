"use client";

import { useState } from "react";

export interface Option {
  id: string | number;
  text: string;
}

interface QuizQuestionProps {
  question: string;
  options: Option[];
  onSelectOption?: (selectedOption: Option) => void;
}

export default function QuizQuestion({
  question,
  options,
  onSelectOption,
}: QuizQuestionProps) {
  const [selectedId, setSelectedId] = useState<string | number | null>(null);

  const handleSelect = (option: Option) => {
    setSelectedId(option.id);
    if (onSelectOption) {
      onSelectOption(option);
    }
  };

  return (
    <div className="flex flex-col gap-4 text-white">
      {/* Question Heading */}
      <h3 className="text-xl font-bold tracking-wide">{question}</h3>

      {/* Options Grid/List */}
      <div className="flex flex-col gap-2">
        {options.map((option, index) => {
          const isSelected = selectedId === option.id;

          return (
            <button
              key={option.id}
              onClick={() => handleSelect(option)}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg border text-left font-medium transition-all cursor-pointer ${
                isSelected
                  ? "bg-white text-primary/150 border-white shadow-md font-semibold"
                  : "bg-primary/50 hover:bg-primary/70 text-white border-primary/50"
              }`}
            >
              {/* Option Letter Badge (A, B, C, D...) */}
              <span
                className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-colors ${
                  isSelected
                    ? "bg-primary/120 text-white"
                    : "bg-primary/110 text-teal-200"
                }`}
              >
                {String.fromCharCode(65 + index)}
              </span>

              <span>{option.text}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
