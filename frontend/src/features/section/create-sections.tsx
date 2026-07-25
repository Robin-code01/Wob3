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

const SECTION_TYPE_CONFIG: Record<
  SectionType,
  { label: string; desc: string; icon: string; badgeBg: string; badgeText: string }
> = {
  Video: {
    label: "Video Lesson",
    desc: "Embed YouTube or direct video streams",
    icon: "📹",
    badgeBg: "bg-blue-500/10 border-blue-500/30",
    badgeText: "text-blue-400",
  },
  MCQ: {
    label: "Multiple Choice",
    desc: "Test knowledge with single-choice options",
    icon: "📝",
    badgeBg: "bg-amber-500/10 border-amber-500/30",
    badgeText: "text-amber-400",
  },
  FillInBlank: {
    label: "Fill in the Blank",
    desc: "Interactive completion prompts",
    icon: "🔤",
    badgeBg: "bg-purple-500/10 border-purple-500/30",
    badgeText: "text-purple-400",
  },
  InfoPanel: {
    label: "Info Panel",
    desc: "Rich explanatory text or key takeaways",
    icon: "💡",
    badgeBg: "bg-emerald-500/10 border-emerald-500/30",
    badgeText: "text-emerald-400",
  },
};

export default function ModuleSectionsManager({
  courseId,
  moduleId,
  initialSections = [],
  accessToken,
}: ModuleSectionsManagerProps) {
  const router = useRouter();
  const [sections, setSections] = useState<SectionItem[]>(initialSections);
  const [activeSectionIdx, setActiveSectionIdx] = useState<number | null>(
    initialSections.length > 0 ? 0 : null
  );

  // Popover state
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Creation State
  const [draftType, setDraftType] = useState<SectionType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form inputs
  const [url, setUrl] = useState("");
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>(["", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [sentenceWithBlank, setSentenceWithBlank] = useState("");
  const [blankAnswer, setBlankAnswer] = useState("");
  const [infoTitle, setInfoTitle] = useState("");
  const [infoBody, setInfoBody] = useState("");

  // Close popup menu when clicking outside
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

    // Reset forms
    setUrl("");
    setQuestion("");
    setOptions(["", "", ""]);
    setCorrectAnswer("");
    setSentenceWithBlank("");
    setBlankAnswer("");
    setInfoTitle("");
    setInfoBody("");
  };

  const handleOptionChange = (idx: number, val: string) => {
    const updated = [...options];
    updated[idx] = val;
    setOptions(updated);
  };

  const handleCreateSectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftType) return;

    setLoading(true);
    setError(null);

    let payload: CreateSectionPayload;

    try {
      if (draftType === "Video") {
        if (!url.trim()) throw new Error("Video URL is required.");
        payload = { type_of_section: "Video", url };
      } else if (draftType === "MCQ") {
        const cleanOpts = options.map((o) => o.trim()).filter(Boolean);
        if (!question.trim()) throw new Error("Question text is required.");
        if (cleanOpts.length < 2) throw new Error("Provide at least 2 options.");
        if (!correctAnswer.trim() || !cleanOpts.includes(correctAnswer)) {
          throw new Error("Select a valid correct answer option.");
        }
        payload = {
          type_of_section: "MCQ",
          question,
          options: cleanOpts,
          correct_answer: correctAnswer,
        };
      } else if (draftType === "FillInBlank") {
        if (!sentenceWithBlank.trim()) throw new Error("Prompt sentence required.");
        if (!blankAnswer.trim()) throw new Error("Correct answer required.");
        payload = {
          type_of_section: "FillInBlank",
          sentence_with_blank: sentenceWithBlank,
          correct_answer: blankAnswer,
        };
      } else {
        if (!infoTitle.trim() || !infoBody.trim()) {
          throw new Error("Title and content body are required.");
        }
        payload = {
          type_of_section: "InfoPanel",
          title: infoTitle,
          body_text: infoBody,
        };
      }

      // Perform POST Request only on "Create Section" button click
      const newSection = await createSection(moduleId, payload, accessToken);

      const updated = [...sections, newSection];
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

  return (
    <div className="flex flex-col lg:flex-row min-h-[640px] rounded-2xl border border-slate-800 bg-[#0F172A] text-slate-100 shadow-2xl overflow-hidden backdrop-blur-md">
      {/* ---------------- SIDEBAR ---------------- */}
      <aside className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-slate-800 bg-[#0B0F19]/80 p-5 flex flex-col justify-between shrink-0">
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400">
              Sections List
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
              {sections.length}
            </span>
          </div>

          <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
            {sections.length === 0 && !draftType && (
              <div className="p-6 text-center border border-dashed border-slate-800 rounded-xl text-xs text-slate-500">
                No sections built yet. Click the + button below to start.
              </div>
            )}

            {sections.map((sec, idx) => {
              const isActive = activeSectionIdx === idx && !draftType;
              const config = SECTION_TYPE_CONFIG[sec.type_of_section];

              return (
                <button
                  key={sec.id || idx}
                  onClick={() => {
                    setActiveSectionIdx(idx);
                    setDraftType(null);
                  }}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between group ${
                    isActive
                      ? "bg-slate-800/90 border-slate-600 text-white shadow-lg shadow-black/20"
                      : "bg-slate-900/40 border-slate-800/80 text-slate-300 hover:bg-slate-800/50 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-3 truncate pr-2">
                    <span className="text-base">{config?.icon || "📄"}</span>
                    <div className="truncate">
                      <p className="text-xs font-semibold truncate leading-snug">
                        {sec.title ||
                          sec.question ||
                          sec.sentence_with_blank ||
                          (sec.type_of_section === "Video"
                            ? "Video Lesson"
                            : "Section")}
                      </p>
                      <span className="text-[10px] font-mono text-slate-500">
                        #{idx + 1} • {sec.type_of_section}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md border ${config.badgeBg} ${config.badgeText}`}
                  >
                    {sec.type_of_section}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* PLUS BUTTON & SMALL MODAL / POPOVER */}
        <div className="relative mt-4 pt-4 border-t border-slate-800" ref={menuRef}>
          {/* POPUP SELECTION MODAL */}
          {showTypeMenu && (
            <div className="absolute bottom-full left-0 mb-3 w-full bg-[#1E293B] border border-slate-700 rounded-xl shadow-2xl p-2 space-y-1 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
              <div className="px-3 py-1.5 border-b border-slate-700/60 mb-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  Select Section Type
                </span>
              </div>

              {(Object.keys(SECTION_TYPE_CONFIG) as SectionType[]).map((typeKey) => {
                const item = SECTION_TYPE_CONFIG[typeKey];
                return (
                  <button
                    key={typeKey}
                    onClick={() => handleSelectTypeToCreate(typeKey)}
                    className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-slate-700/60 transition-colors flex items-center gap-3 cursor-pointer group"
                  >
                    <span className="text-lg">{item.icon}</span>
                    <div>
                      <p className="text-xs font-bold text-slate-200 group-hover:text-white">
                        {item.label}
                      </p>
                      <p className="text-[10px] text-slate-400">{item.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* MAIN PLUS BUTTON */}
          <button
            onClick={() => setShowTypeMenu((prev) => !prev)}
            className="w-full py-3 px-4 rounded-xl font-mono text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span className="text-lg leading-none">+</span>
            <span>Add Section</span>
          </button>
        </div>
      </aside>

      {/* ---------------- MAIN BUILDER VIEW ---------------- */}
      <main className="flex-1 p-6 lg:p-10 bg-[#0B0F19]/40 flex flex-col justify-between">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
            ⚠️ {error}
          </div>
        )}

        {draftType ? (
          /* CREATE FORM (POST Fired ONLY when Create Section Button clicked) */
          <form
            onSubmit={handleCreateSectionSubmit}
            className="max-w-xl space-y-6 animate-in fade-in duration-200"
          >
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <span className="text-2xl">
                {SECTION_TYPE_CONFIG[draftType].icon}
              </span>
              <div>
                <h3 className="text-xl font-bold text-white">
                  New {SECTION_TYPE_CONFIG[draftType].label}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure content fields below before adding.
                </p>
              </div>
            </div>

            {/* Dynamic Inputs based on draftType */}
            {draftType === "Video" && (
              <div className="space-y-2">
                <label className="text-xs font-mono font-semibold text-slate-300 uppercase">
                  Video URL
                </label>
                <input
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>
            )}

            {draftType === "MCQ" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-mono font-semibold text-slate-300 uppercase">
                    Question
                  </label>
                  <input
                    type="text"
                    required
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="e.g. What is Web3?"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-mono font-semibold text-slate-300 uppercase">
                    Options (Select radio for correct answer)
                  </label>
                  {options.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="correct_answer"
                        checked={correctAnswer === opt && opt !== ""}
                        onChange={() => setCorrectAnswer(opt)}
                        disabled={!opt.trim()}
                        className="w-4 h-4 accent-blue-500 cursor-pointer"
                      />
                      <input
                        type="text"
                        required
                        value={opt}
                        onChange={(e) => {
                          const val = e.target.value;
                          handleOptionChange(idx, val);
                          if (correctAnswer === options[idx]) setCorrectAnswer(val);
                        }}
                        placeholder={`Option ${idx + 1}`}
                        className="flex-1 px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setOptions((prev) => [...prev, ""])}
                    className="text-xs font-mono text-blue-400 hover:underline cursor-pointer pt-1"
                  >
                    + Add Option
                  </button>
                </div>
              </div>
            )}

            {draftType === "FillInBlank" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-mono font-semibold text-slate-300 uppercase">
                    Sentence Prompt
                  </label>
                  <input
                    type="text"
                    required
                    value={sentenceWithBlank}
                    onChange={(e) => setSentenceWithBlank(e.target.value)}
                    placeholder="e.g. Solidity is used to write smart ____."
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-mono font-semibold text-slate-300 uppercase">
                    Correct Answer
                  </label>
                  <input
                    type="text"
                    required
                    value={blankAnswer}
                    onChange={(e) => setBlankAnswer(e.target.value)}
                    placeholder="e.g. contracts"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {draftType === "InfoPanel" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-mono font-semibold text-slate-300 uppercase">
                    Panel Title
                  </label>
                  <input
                    type="text"
                    required
                    value={infoTitle}
                    onChange={(e) => setInfoTitle(e.target.value)}
                    placeholder="e.g. Key Concept Breakdown"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-mono font-semibold text-slate-300 uppercase">
                    Body Content
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={infoBody}
                    onChange={(e) => setInfoBody(e.target.value)}
                    placeholder="Detailed explanation..."
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {/* FORM ACTION BUTTONS */}
            <div className="flex gap-3 pt-4 border-t border-slate-800">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-mono text-xs font-bold uppercase tracking-wider hover:from-blue-500 hover:to-indigo-500 transition-all cursor-pointer shadow-lg shadow-blue-500/20 disabled:opacity-50"
              >
                {loading ? "Creating Section..." : "Create Section"}
              </button>
              <button
                type="button"
                onClick={() => setDraftType(null)}
                className="px-6 py-3 rounded-xl border border-slate-700 text-slate-300 font-mono text-xs font-bold uppercase hover:bg-slate-800 transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : activeSection ? (
          /* READ-ONLY PREVIEW FOR SELECTED SECTION */
          <div className="space-y-6 max-w-2xl animate-in fade-in duration-150">
            <div className="border-b border-slate-800 pb-4">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                {activeSection.type_of_section} Section
              </span>
              <h3 className="text-2xl font-bold text-white mt-1">
                {activeSection.title ||
                  activeSection.question ||
                  activeSection.sentence_with_blank ||
                  "Section Overview"}
              </h3>
            </div>

            {activeSection.type_of_section === "Video" && (
              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2 font-mono text-xs">
                <p className="text-slate-400 font-bold">VIDEO LINK:</p>
                <a
                  href={activeSection.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-400 underline break-all hover:text-blue-300"
                >
                  {activeSection.url}
                </a>
              </div>
            )}

            {activeSection.type_of_section === "MCQ" && (
              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
                <p className="text-sm font-semibold text-white">
                  Q: {activeSection.question}
                </p>
                <div className="space-y-2">
                  {activeSection.options?.map((opt, oIdx) => {
                    const isCorrect = opt === activeSection.correct_answer;
                    return (
                      <div
                        key={oIdx}
                        className={`p-3 rounded-lg border text-xs font-mono flex items-center justify-between ${
                          isCorrect
                            ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300"
                            : "bg-slate-950 border-slate-800 text-slate-400"
                        }`}
                      >
                        <span>{opt}</span>
                        {isCorrect && (
                          <span className="text-[10px] uppercase font-bold text-emerald-400">
                            ✓ Correct
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeSection.type_of_section === "FillInBlank" && (
              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <p className="text-sm text-slate-200">
                  <span className="font-mono text-xs text-slate-500 uppercase block mb-1">
                    Prompt:
                  </span>
                  {activeSection.sentence_with_blank}
                </p>
                <p className="text-xs font-mono text-emerald-400 font-bold">
                  Answer: {activeSection.correct_answer}
                </p>
              </div>
            )}

            {activeSection.type_of_section === "InfoPanel" && (
              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <h4 className="font-bold text-white text-base">
                  {activeSection.title}
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                  {activeSection.body_text}
                </p>
              </div>
            )}
          </div>
        ) : (
          /* EMPTY STATE */
          <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500">
            <span className="text-4xl mb-3">🧩</span>
            <p className="text-sm font-semibold text-slate-300">
              No section selected
            </p>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">
              Pick a section from the sidebar to inspect or click the "+" button to add a new section.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}