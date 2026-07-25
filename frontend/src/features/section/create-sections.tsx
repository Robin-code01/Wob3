"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  createSection,
  SectionItem,
  SectionType,
  CreateSectionPayload,
} from "@/lib/section/create";

interface ModuleSectionsManagerProps {
  courseId: string;
  moduleId: string;
  initialSections?: SectionItem[];
  accessToken?: string;
}

export default function ModuleSectionsManager({
  moduleId,
  initialSections = [],
  accessToken,
}: ModuleSectionsManagerProps) {
  const router = useRouter();
  const [sections, setSections] = useState<SectionItem[]>(initialSections);
  const [activeSectionIdx, setActiveSectionIdx] = useState<number | null>(
    initialSections.length > 0 ? 0 : null,
  );

  // Popover State under + button
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Draft / Form State
  const [draftType, setDraftType] = useState<SectionType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [url, setUrl] = useState("");
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>(["", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [sentence, setSentence] = useState("");

  // Dismiss popover menu when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowTypeMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectTypeToCreate = (type: SectionType) => {
    setDraftType(type);
    setActiveSectionIdx(null);
    setShowTypeMenu(false);
    setError(null);

    // Reset Form inputs
    setUrl("");
    setQuestion("");
    setOptions(["", "", ""]);
    setCorrectAnswer("");
    setTitle("");
    setContent("");
    setSentence("");
  };

  const handleOptionChange = (idx: number, value: string) => {
    const updated = [...options];
    updated[idx] = value;
    setOptions(updated);
  };

  const handleCreateSectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftType) return;

    setLoading(true);
    setError(null);

    let payload: CreateSectionPayload;

    if (draftType === "Video") {
      if (!url.trim()) {
        setError("Video URL is required.");
        setLoading(false);
        return;
      }
      payload = { type_of_section: "Video", url };
    } else if (draftType === "MCQ") {
      const cleanOpts = options.map((o) => o.trim()).filter(Boolean);
      if (!question.trim()) {
        setError("Question text is required.");
        setLoading(false);
        return;
      }
      if (cleanOpts.length < 2) {
        setError("Please provide at least 2 options.");
        setLoading(false);
        return;
      }
      if (!correctAnswer.trim() || !cleanOpts.includes(correctAnswer)) {
        setError("Please select a valid correct answer option.");
        setLoading(false);
        return;
      }
      payload = {
        type_of_section: "MCQ",
        question,
        options: cleanOpts,
        correct_answer: correctAnswer,
      };
    } else if (draftType === "InfoPanel") {
      if (!title.trim() || !content.trim()) {
        setError("Title and content are required for Info Panel.");
        setLoading(false);
        return;
      }
      payload = {
        type_of_section: "InfoPanel",
        title,
        content,
      };
    } else {
      // FillInTheBlank
      if (!sentence.trim() || !correctAnswer.trim()) {
        setError("Sentence and correct answer are required.");
        setLoading(false);
        return;
      }
      payload = {
        type_of_section: "FillInTheBlank",
        sentence,
        correct_answer: correctAnswer,
      };
    }

    try {
      const newSec = await createSection(moduleId, payload, accessToken);

      const updated = [...sections, newSec];
      setSections(updated);
      setActiveSectionIdx(updated.length - 1);
      setDraftType(null);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to create section.");
    } finally {
      setLoading(false);
    }
  };

  const activeSection =
    activeSectionIdx !== null ? sections[activeSectionIdx] : null;

  const getBadgeStyle = (type: SectionType, isActive: boolean) => {
    switch (type) {
      case "Video":
        return isActive
          ? "border-blue-400 text-blue-300"
          : "border-blue-600 text-blue-700 bg-blue-50";
      case "MCQ":
        return isActive
          ? "border-amber-400 text-amber-300"
          : "border-amber-600 text-amber-700 bg-amber-50";
      case "InfoPanel":
        return isActive
          ? "border-emerald-400 text-emerald-300"
          : "border-emerald-600 text-emerald-700 bg-emerald-50";
      case "FillInTheBlank":
        return isActive
          ? "border-purple-400 text-purple-300"
          : "border-purple-600 text-purple-700 bg-purple-50";
    }
  };

  const getSectionTitle = (sec: SectionItem) => {
    switch (sec.type_of_section) {
      case "Video":
        return "Video Lesson";
      case "MCQ":
        return sec.question || "MCQ Quiz";
      case "InfoPanel":
        return sec.title || "Information Panel";
      case "FillInTheBlank":
        return sec.sentence || "Fill in the Blank";
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[580px] border border-[#0B0E14] bg-white">
      {/* ---------------- SIDEBAR ---------------- */}
      <aside className="w-full md:w-80 border-b md:border-b-0 md:border-r border-[#0B0E14] bg-slate-50 flex flex-col justify-between p-4 shrink-0">
        <div>
          <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 px-2">
            Module Sections
          </h2>

          <div className="flex flex-col gap-2">
            {sections.length === 0 && !draftType && (
              <p className="text-xs text-slate-500 px-2 py-4 italic">
                No sections created yet. Press the + button below to add one.
              </p>
            )}

            {sections.map((sec, idx) => {
              const isActive = activeSectionIdx === idx && !draftType;
              return (
                <button
                  key={sec.id || idx}
                  onClick={() => {
                    setActiveSectionIdx(idx);
                    setDraftType(null);
                  }}
                  className={`w-full text-left px-3 py-2.5 flex items-center justify-between border transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#0B0E14] text-white border-[#0B0E14]"
                      : "bg-white text-[#0B0E14] border-slate-200 hover:border-slate-400"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <span className="font-mono text-xs opacity-70">
                      #{idx + 1}
                    </span>
                    <span className="text-sm font-medium truncate">
                      {getSectionTitle(sec)}
                    </span>
                  </div>

                  <span
                    className={`font-mono text-[9px] uppercase font-bold px-1.5 py-0.5 border shrink-0 ${getBadgeStyle(
                      sec.type_of_section,
                      isActive,
                    )}`}
                  >
                    {sec.type_of_section === "FillInTheBlank"
                      ? "FITB"
                      : sec.type_of_section}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* PLUS BUTTON & POPOVER MODAL */}
        <div className="relative mt-6" ref={menuRef}>
          {showTypeMenu && (
            <div className="absolute bottom-full left-0 mb-2 w-full bg-white border border-[#0B0E14] shadow-lg p-2 z-50 space-y-1">
              <div className="px-2 py-1 border-b border-slate-200 mb-1">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Select Section Type
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleSelectTypeToCreate("Video")}
                className="w-full text-left px-3 py-2 text-xs font-mono font-bold uppercase hover:bg-slate-100 flex items-center gap-2 cursor-pointer border border-transparent hover:border-slate-300"
              >
                <span>📹</span>
                <span>Video Section</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectTypeToCreate("MCQ")}
                className="w-full text-left px-3 py-2 text-xs font-mono font-bold uppercase hover:bg-slate-100 flex items-center gap-2 cursor-pointer border border-transparent hover:border-slate-300"
              >
                <span>📝</span>
                <span>MCQ Section</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectTypeToCreate("InfoPanel")}
                className="w-full text-left px-3 py-2 text-xs font-mono font-bold uppercase hover:bg-slate-100 flex items-center gap-2 cursor-pointer border border-transparent hover:border-slate-300"
              >
                <span>💡</span>
                <span>Info Panel</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectTypeToCreate("FillInTheBlank")}
                className="w-full text-left px-3 py-2 text-xs font-mono font-bold uppercase hover:bg-slate-100 flex items-center gap-2 cursor-pointer border border-transparent hover:border-slate-300"
              >
                <span>✏️</span>
                <span>Fill in the Blank</span>
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowTypeMenu((prev) => !prev)}
            className="w-full py-3 px-4 flex items-center justify-center gap-2 font-mono text-xs font-bold uppercase tracking-wider bg-white text-[#0B0E14] border border-[#0B0E14] hover:bg-[#0B0E14] hover:text-white transition-all cursor-pointer"
          >
            <span className="text-base leading-none">+</span>
            <span>Add Section</span>
          </button>
        </div>
      </aside>

      {/* ---------------- MAIN CONTENT AREA ---------------- */}
      <main className="flex-1 p-6 md:p-8">
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 text-sm font-medium">
            {error}
          </div>
        )}

        {draftType ? (
          /* SECTION CREATION FORM */
          <form
            onSubmit={handleCreateSectionSubmit}
            className="max-w-xl space-y-6"
          >
            <div>
              <span className="font-mono text-xs font-bold uppercase text-slate-500">
                New Section Draft
              </span>
              <h3 className="text-2xl font-bold text-[#0B0E14] mt-0.5">
                Create{" "}
                {draftType === "FillInTheBlank"
                  ? "Fill in the Blank"
                  : draftType}{" "}
                Section
              </h3>
            </div>

            {/* Video Inputs */}
            {draftType === "Video" && (
              <div className="flex flex-col gap-2">
                <label className="font-mono text-xs font-bold uppercase text-slate-700">
                  Video URL *
                </label>
                <input
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="px-4 py-3 border border-[#0B0E14] text-sm focus:outline-none"
                />
              </div>
            )}

            {/* MCQ Inputs */}
            {draftType === "MCQ" && (
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="font-mono text-xs font-bold uppercase text-slate-700">
                    Question *
                  </label>
                  <input
                    type="text"
                    required
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="e.g. What is Web3?"
                    className="px-4 py-3 border border-[#0B0E14] text-sm focus:outline-none"
                  />
                </div>

                <div className="space-y-3">
                  <label className="font-mono text-xs font-bold uppercase text-slate-700">
                    Options * (Select radio for correct answer)
                  </label>
                  {options.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="correct_answer"
                        checked={correctAnswer === opt && opt !== ""}
                        onChange={() => setCorrectAnswer(opt)}
                        disabled={!opt.trim()}
                        className="cursor-pointer"
                      />
                      <input
                        type="text"
                        required
                        value={opt}
                        onChange={(e) => {
                          const val = e.target.value;
                          handleOptionChange(idx, val);
                          if (correctAnswer === options[idx]) {
                            setCorrectAnswer(val);
                          }
                        }}
                        placeholder={`Option ${idx + 1}`}
                        className="flex-1 px-3 py-2 border border-slate-300 text-sm focus:outline-none focus:border-[#0B0E14]"
                      />
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => setOptions((prev) => [...prev, ""])}
                    className="font-mono text-xs text-slate-600 hover:text-black underline cursor-pointer mt-1"
                  >
                    + Add Option
                  </button>
                </div>
              </div>
            )}

            {/* Info Panel Inputs */}
            {draftType === "InfoPanel" && (
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="font-mono text-xs font-bold uppercase text-slate-700">
                    Panel Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Key Concept: Immutability"
                    className="px-4 py-3 border border-[#0B0E14] text-sm focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-mono text-xs font-bold uppercase text-slate-700">
                    Content *
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Detailed note, tips, or core explanation for students..."
                    className="px-4 py-3 border border-[#0B0E14] text-sm focus:outline-none resize-y"
                  />
                </div>
              </div>
            )}

            {/* Fill in the Blank Inputs */}
            {draftType === "FillInTheBlank" && (
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="font-mono text-xs font-bold uppercase text-slate-700">
                    Sentence / Statement *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={sentence}
                    onChange={(e) => setSentence(e.target.value)}
                    placeholder="e.g. React uses a _____ DOM to optimize rendering performance."
                    className="px-4 py-3 border border-[#0B0E14] text-sm focus:outline-none resize-y"
                  />
                  <span className="text-[11px] font-mono text-slate-500">
                    Tip: Use underscores (e.g. _____) where the blank space
                    should appear.
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-mono text-xs font-bold uppercase text-slate-700">
                    Expected Correct Answer *
                  </label>
                  <input
                    type="text"
                    required
                    value={correctAnswer}
                    onChange={(e) => setCorrectAnswer(e.target.value)}
                    placeholder="e.g. virtual"
                    className="px-4 py-3 border border-[#0B0E14] text-sm focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* ACTION BUTTONS */}
            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-[#0B0E14] text-white font-mono text-xs font-bold uppercase hover:bg-slate-800 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Section"}
              </button>
              <button
                type="button"
                onClick={() => setDraftType(null)}
                className="px-6 py-3 border border-slate-300 text-slate-700 font-mono text-xs font-bold uppercase hover:bg-slate-100 transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : activeSection ? (
          /* READ-ONLY VIEW */
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <span className="font-mono text-xs font-bold uppercase text-slate-500">
                {activeSection.type_of_section} Section
              </span>
              <h3 className="text-2xl font-bold text-[#0B0E14] mt-1">
                {getSectionTitle(activeSection)}
              </h3>
            </div>

            {activeSection.type_of_section === "Video" && (
              <div className="p-4 bg-slate-50 border border-slate-200 font-mono text-xs space-y-2">
                <span className="font-bold text-slate-600">Video URL:</span>
                <p className="text-blue-600 underline break-all">
                  {activeSection.url}
                </p>
              </div>
            )}

            {activeSection.type_of_section === "MCQ" && (
              <div className="p-4 bg-slate-50 border border-slate-200 space-y-4">
                <p className="font-semibold text-sm text-[#0B0E14]">
                  Q: {activeSection.question}
                </p>
                <div className="space-y-2">
                  {activeSection.options?.map((opt, oIdx) => {
                    const isCorrect = opt === activeSection.correct_answer;
                    return (
                      <div
                        key={oIdx}
                        className={`p-3 border text-xs font-mono flex items-center justify-between ${
                          isCorrect
                            ? "bg-emerald-50 border-emerald-500 text-emerald-900 font-bold"
                            : "bg-white border-slate-200 text-slate-700"
                        }`}
                      >
                        <span>{opt}</span>
                        {isCorrect && (
                          <span className="text-[10px] uppercase tracking-wide bg-emerald-600 text-white px-2 py-0.5 rounded-sm">
                            Correct Answer
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeSection.type_of_section === "InfoPanel" && (
              <div className="p-5 bg-emerald-50/50 border border-emerald-600 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-700">💡</span>
                  <h4 className="font-mono text-xs font-bold uppercase text-emerald-900">
                    {activeSection.title}
                  </h4>
                </div>
                <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {activeSection.content}
                </p>
              </div>
            )}

            {activeSection.type_of_section === "FillInTheBlank" && (
              <div className="p-5 bg-purple-50/50 border border-purple-600 space-y-4">
                <div>
                  <span className="font-mono text-[10px] font-bold uppercase text-purple-700">
                    Fill in the Blank Prompt
                  </span>
                  <p className="text-base font-medium text-[#0B0E14] mt-1 leading-relaxed">
                    {activeSection.sentence}
                  </p>
                </div>

                <div className="p-3 bg-white border border-purple-300 font-mono text-xs flex items-center justify-between">
                  <span className="text-slate-500 uppercase font-bold">
                    Correct Answer:
                  </span>
                  <span className="font-bold text-purple-900 bg-purple-100 px-2 py-0.5 border border-purple-300">
                    {activeSection.correct_answer}
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* EMPTY STATE */
          <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500">
            <p className="text-sm font-medium">
              Select a section on the left or click "+" to create one.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
