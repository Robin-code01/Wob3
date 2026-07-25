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
  onSubmitAnswer?: (selectedOption: Option) => void;
  disabled?: boolean;
}

export default function QuizQuestion({
  question,
  options,
  onSelectOption,
  onSubmitAnswer,
  disabled,
}: QuizQuestionProps) {
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);

  const handleSelect = (option: Option) => {
    setSelectedOption(option);
    if (onSelectOption) {
      onSelectOption(option);
    }
  };

  const handleSubmit = () => {
    if (selectedOption) {
      if (onSubmitAnswer) {
        onSubmitAnswer(selectedOption);
      } else if (onSelectOption) {
        onSelectOption(selectedOption);
      }
    }
  };

  return (
    <div className="flex flex-col gap-4 text-white">
      {/* Question Heading */}
      <h3 className="text-xl font-bold tracking-wide">{question}</h3>

      {/* Options Grid/List */}
      <div className="flex flex-col gap-2">
        {options.map((option, index) => {
          const isSelected = selectedOption?.id === option.id;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => handleSelect(option)}
              disabled={disabled}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg border text-left font-medium transition-all cursor-pointer ${
                isSelected
                  ? "bg-white text-[#0B0E14] border-white shadow-md font-semibold"
                  : "bg-primary/50 hover:bg-primary/70 text-white border-primary/50"
              }`}
            >
              {/* Option Letter Badge (A, B, C, D...) */}
              <span
                className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-colors ${
                  isSelected
                    ? "bg-primary text-white"
                    : "bg-primary/80 text-teal-200"
                }`}
              >
                {String.fromCharCode(65 + index)}
              </span>

              <span>{option.text}</span>
            </button>
          );
        })}
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!selectedOption || disabled}
          className="px-6 py-2.5 bg-primary text-white font-mono text-xs font-bold uppercase tracking-wider border border-white/20 rounded-lg hover:bg-white hover:text-[#0B0E14] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          Submit Answer
        </button>
      </div>
    </div>
  );
}