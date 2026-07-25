"use client";

import { useState } from "react";

export interface Option {
  id: string | number;
  text: string;
}

export interface CreatedQuestionPayload {
  question: string;
  options: Option[];
  correctOptionId: string | number | null;
}

interface CreateQuizQuestionProps {
  onSaveQuestion?: (data: CreatedQuestionPayload) => void;
}

export default function CreateQuizQuestion({
  onSaveQuestion,
}: CreateQuizQuestionProps) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<Option[]>([
    { id: "1", text: "" },
    { id: "2", text: "" },
  ]);
  const [correctOptionId, setCorrectOptionId] = useState<
    string | number | null
  >("1");

  // Handle option text update
  const handleOptionChange = (id: string | number, text: string) => {
    setOptions((prev) =>
      prev.map((opt) => (opt.id === id ? { ...opt, text } : opt)),
    );
  };

  // Add a new option (up to a reasonable max, e.g., 6)
  const handleAddOption = () => {
    if (options.length >= 6) return;
    const newId = String(Date.now());
    setOptions((prev) => [...prev, { id: newId, text: "" }]);
  };

  // Remove an option
  const handleRemoveOption = (id: string | number) => {
    if (options.length <= 2) return; // Keep at least 2 choices
    setOptions((prev) => prev.filter((opt) => opt.id !== id));
    if (correctOptionId === id) {
      setCorrectOptionId(null);
    }
  };

  // Handle Save / Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return alert("Please enter a question.");
    if (options.some((opt) => !opt.text.trim())) {
      return alert("Please fill out all option choices.");
    }
    if (!correctOptionId) {
      return alert("Please select which option is the correct answer.");
    }

    if (onSaveQuestion) {
      onSaveQuestion({
        question,
        options,
        correctOptionId,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-white">
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-primary/40 pb-3">
        <h3 className="text-xl font-bold tracking-wide">
          Create Multiple Choice Question
        </h3>
        <p className="text-xs text-white/70">
          Write your question, add options, and click a badge (A, B, C...) to
          set the correct answer.
        </p>
      </div>

      {/* Question Text Input */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-teal-200 uppercase tracking-wider">
          Question Text
        </label>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g. What is the default component type in Next.js App Router?"
          className="w-full px-4 py-3 rounded-lg border bg-primary/50 text-white placeholder:text-white/50 border-primary/50 focus:outline-none focus:bg-white focus:text-slate-900 focus:border-white focus:shadow-md transition-all font-medium text-base"
        />
      </div>

      {/* Options List */}
      <div className="flex flex-col gap-3">
        <label className="text-sm font-semibold text-teal-200 uppercase tracking-wider">
          Answer Options
        </label>

        <div className="flex flex-col gap-2.5">
          {options.map((option, index) => {
            const isCorrect = correctOptionId === option.id;

            return (
              <div key={option.id} className="flex items-center gap-2">
                {/* Clickable Badge to Toggle Correct Answer */}
                <button
                  type="button"
                  title="Click to set as correct answer"
                  onClick={() => setCorrectOptionId(option.id)}
                  className={`flex items-center justify-center w-10 h-10 rounded-lg text-sm font-bold shrink-0 transition-all cursor-pointer border ${
                    isCorrect
                      ? "bg-white text-slate-900 border-white shadow-md font-extrabold"
                      : "bg-primary/50 hover:bg-primary/70 text-white border-primary/50"
                  }`}
                >
                  {String.fromCharCode(65 + index)}
                </button>

                {/* Option Text Input */}
                <input
                  type="text"
                  value={option.text}
                  onChange={(e) =>
                    handleOptionChange(option.id, e.target.value)
                  }
                  placeholder={`Option ${String.fromCharCode(65 + index)}`}
                  className={`flex-1 px-4 py-2.5 rounded-lg border text-white placeholder:text-white/50 focus:outline-none transition-all font-medium ${
                    isCorrect
                      ? "bg-primary/70 border-white"
                      : "bg-primary/40 border-primary/40 focus:border-white/80"
                  }`}
                />

                {/* Remove Option Button */}
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(option.id)}
                    className="p-2 text-white/60 hover:text-red-300 transition-colors cursor-pointer text-lg"
                    title="Remove option"
                  >
                    ✕
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Add Option Button */}
        {options.length < 6 && (
          <button
            type="button"
            onClick={handleAddOption}
            className="self-start text-xs font-semibold text-teal-200 hover:text-white bg-primary/40 hover:bg-primary/60 px-3 py-1.5 rounded-md border border-primary/40 transition-all cursor-pointer mt-1"
          >
            + Add Another Option
          </button>
        )}
      </div>

      {/* Action Footer */}
      <div className="flex justify-end pt-2 border-t border-primary/40">
        <button
          type="submit"
          className="px-6 py-2.5 rounded-lg bg-white text-slate-900 font-bold hover:bg-teal-100 transition-all cursor-pointer shadow-md"
        >
          Save Question
        </button>
      </div>
    </form>
  );
}
