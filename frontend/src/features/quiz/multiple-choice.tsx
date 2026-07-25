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
    if (disabled) return;
    setSelectedOption(option);
    if (onSelectOption) {
      onSelectOption(option);
    }
  };

  const handleSubmit = () => {
    if (selectedOption && !disabled) {
      if (onSubmitAnswer) {
        onSubmitAnswer(selectedOption);
      } else if (onSelectOption) {
        onSelectOption(selectedOption);
      }
    }
  };

  return (
    <div className="flex flex-col gap-4 text-[#0B0E14]">
      {/* Question Heading */}
      <h3 className="text-lg font-bold text-[#0B0E14] leading-snug">{question}</h3>

      {/* Options List */}
      <div className="flex flex-col gap-2.5">
        {options.map((option, index) => {
          const isSelected = selectedOption?.id === option.id;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => handleSelect(option)}
              disabled={disabled}
              className={`flex items-center gap-3 w-full px-4 py-3 text-left font-medium transition-all border ${
                disabled ? "cursor-not-allowed opacity-80" : "cursor-pointer"
              } ${
                isSelected
                  ? "bg-[#0B0E14] text-white border-[#0B0E14] font-semibold"
                  : "bg-white text-[#0B0E14] border-slate-300 hover:border-[#0B0E14] hover:bg-slate-50"
              }`}
            >
              {/* Option Letter Badge (A, B, C...) */}
              <span
                className={`flex items-center justify-center w-7 h-7 shrink-0 font-mono text-xs font-bold transition-colors ${
                  isSelected
                    ? "bg-primary text-white"
                    : "bg-slate-100 text-slate-700 border border-slate-300"
                }`}
              >
                {String.fromCharCode(65 + index)}
              </span>

              <span className="text-sm">{option.text}</span>
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
          className="h-11 px-6 bg-primary text-white font-mono text-xs font-bold uppercase tracking-wider border border-[#0B0E14] hover:bg-[#0B0E14] hover:text-[#F8FAFC] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          Submit Answer
        </button>
      </div>
    </div>
  );
}