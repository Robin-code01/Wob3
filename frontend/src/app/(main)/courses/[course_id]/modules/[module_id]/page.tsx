"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import QuizBox from "@/features/quiz/quiz-box";
import QuizQuestion, { Option } from "@/features/quiz/multiple-choice";
import FillInTheBlankQuestion from "@/features/quiz/fill-in-the-blank";
import VideoPlayerSection from "@/features/video/video";
import TextLessonSection from "@/features/info/information-panel";
import {
  getModuleSections,
  submitSectionAnswer,
  checkModuleCompletion,
  mintModuleCompletion,
  Section,
} from "@/lib/courses";

function getSectionSources(section: any): any[] {
  if (!section || typeof section !== "object") return [];
  const rawSources = [
    section,
    section.content,
    section.details,
    section.data,
    section.mcq,
    section.mcq_section,
    section.mcq_data,
    section.blank,
    section.blank_section,
    section.coding_problem,
    section.coding_section,
    section.video,
    section.video_section,
    section.info_panel,
    section.info_panel_section,
    section.info,
    section.payload,
    section.fields,
  ];
  return rawSources.filter((s) => s !== undefined && s !== null && s !== "");
}

function findProp(sources: any[], keys: string[]): any {
  for (const src of sources) {
    if (src === undefined || src === null) continue;

    if (typeof src === "object") {
      for (const key of keys) {
        const val = src[key];
        if (val !== undefined && val !== null && val !== "") {
          if (typeof val === "string" && val.trim() === "") continue;
          return val;
        }
      }
    } else if (typeof src === "string") {
      const trimmed = src.trim();
      if (trimmed !== "") {
        return trimmed;
      }
    }
  }
  return undefined;
}

function parseContentParagraphs(rawContent: any): string[] {
  if (!rawContent) return [];

  if (typeof rawContent === "string") {
    const trimmed = rawContent.trim();
    if (!trimmed) return [];
    if (
      (trimmed.startsWith("[") && trimmed.endsWith("]")) ||
      (trimmed.startsWith("{") && trimmed.endsWith("}"))
    ) {
      try {
        const parsed = JSON.parse(trimmed);
        return parseContentParagraphs(parsed);
      } catch {
        // Fall back to split by line
      }
    }
    return trimmed
      .split(/\r?\n+/)
      .map((p) => p.trim())
      .filter(Boolean);
  }

  if (Array.isArray(rawContent)) {
    const result: string[] = [];
    for (const item of rawContent) {
      if (typeof item === "string") {
        if (item.trim()) result.push(item.trim());
      } else if (typeof item === "object" && item !== null) {
        const text =
          item.content ||
          item.text ||
          item.description ||
          item.body ||
          item.paragraph ||
          item.detail;
        if (typeof text === "string" && text.trim()) {
          result.push(text.trim());
        }
      }
    }
    return result;
  }

  if (typeof rawContent === "object" && rawContent !== null) {
    const textFields = [
      rawContent.content,
      rawContent.text,
      rawContent.body,
      rawContent.description,
      rawContent.details,
      rawContent.summary,
      rawContent.paragraphs,
      rawContent.info,
    ];

    for (const field of textFields) {
      if (field && field !== rawContent) {
        const parsed = parseContentParagraphs(field);
        if (parsed.length > 0) return parsed;
      }
    }

    return [];
  }

  return [];
}

function checkAnswerCorrectness(
  userAnswerText: string,
  optionId: string | number | undefined,
  optionIndex: number,
  correctAnswer?: string
): boolean {
  if (!correctAnswer) return true;
  const normCorrect = String(correctAnswer).trim().toLowerCase();
  const normUserText = String(userAnswerText).trim().toLowerCase();
  const normOptionId = optionId !== undefined ? String(optionId).trim().toLowerCase() : "";
  const optionLetter = String.fromCharCode(65 + optionIndex).toLowerCase();
  const optionIndexStr = String(optionIndex);

  return (
    normUserText === normCorrect ||
    normOptionId === normCorrect ||
    optionLetter === normCorrect ||
    optionIndexStr === normCorrect
  );
}

function normalizeSectionData(section: Section, index: number = 0) {
  const sources = getSectionSources(section);

  const rawType = String(
    findProp(sources, ["type_of_section", "section_type", "type", "kind", "category"]) || ""
  )
    .toLowerCase()
    .trim()
    .replace(/[\s-]+/g, "_");

  let type = "info_panel";
  if (
    rawType.includes("mcq") ||
    rawType.includes("multiple") ||
    rawType.includes("choice") ||
    rawType.includes("quiz")
  ) {
    type = "mcq";
  } else if (
    rawType.includes("blank") ||
    rawType.includes("fill") ||
    rawType.includes("coding") ||
    rawType.includes("short_answer")
  ) {
    type = "blank";
  } else if (
    rawType.includes("video") ||
    rawType.includes("media") ||
    rawType.includes("youtube") ||
    rawType.includes("vimeo")
  ) {
    type = "video";
  } else if (
    rawType.includes("info") ||
    rawType.includes("text") ||
    rawType.includes("panel") ||
    rawType.includes("lesson") ||
    rawType.includes("overview")
  ) {
    type = "info_panel";
  } else {
    const hasOptions = findProp(sources, ["options", "choices", "answers", "items", "mcq_options"]);
    const hasUrl = findProp(sources, ["url", "video_url", "videoUrl", "src", "link", "embed_url"]);
    const hasMcqQuestion = findProp(sources, ["mcq_question"]);
    const hasBlankQuestion = findProp(sources, ["blank_question", "blank_text"]);

    if (hasOptions || hasMcqQuestion) type = "mcq";
    else if (hasUrl) type = "video";
    else if (hasBlankQuestion) type = "blank";
    else type = "info_panel";
  }

  const title = String(
    findProp(sources, ["title", "heading", "name", "section_title", "topic"]) || ""
  ).trim();

  const subtitle = String(
    findProp(sources, ["subtitle", "subheading", "section_subtitle"]) || ""
  ).trim();

  const description = String(
    findProp(sources, ["description", "body", "summary", "details", "info"]) || ""
  ).trim();

  let question = "";
  if (type === "mcq" || type === "blank") {
    const questionKeys = [
      "question",
      "question_text",
      "questionText",
      "prompt",
      "mcq_question",
      "blank_question",
      "blank_text",
      "blankText",
      "coding_question",
      "statement",
      "problem_statement",
      "query",
      "code_snippet",
      "template",
      "content",
      "text",
      "blank",
      "description",
      "title",
    ];

    let rawQuestion = findProp(sources, questionKeys);
    if (typeof rawQuestion === "object" && rawQuestion !== null) {
      rawQuestion =
        rawQuestion.question ||
        rawQuestion.question_text ||
        rawQuestion.prompt ||
        rawQuestion.text ||
        rawQuestion.content ||
        rawQuestion.blank ||
        String(rawQuestion);
    }

    question = String(rawQuestion || "").trim();

    const isGenericQuestion =
      !question ||
      question.toLowerCase() === "question" ||
      question.toLowerCase().startsWith("question ");

    if (isGenericQuestion) {
      if (description && description.toLowerCase() !== "question") {
        question = description;
      } else if (title && title.toLowerCase() !== "question" && !title.toLowerCase().startsWith("fill in")) {
        question = title;
      }
    }
  }

  const url = String(
    findProp(sources, ["url", "video_url", "videoUrl", "link", "src", "embed_url", "video"]) || ""
  ).trim();

  const correctAnswer = String(
    findProp(sources, [
      "correct_answer",
      "correctAnswer",
      "answer",
      "correct_option",
      "correct",
      "solution",
    ]) || ""
  ).trim();

  let rawOptions = findProp(sources, ["options", "choices", "answers", "items", "mcq_options"]);
  if (typeof rawOptions === "string") {
    const trimmed = rawOptions.trim();
    if ((trimmed.startsWith("[") && trimmed.endsWith("]")) || (trimmed.startsWith("{") && trimmed.endsWith("}"))) {
      try {
        rawOptions = JSON.parse(trimmed);
      } catch {
        rawOptions = trimmed.split(",").map((s) => s.trim()).filter(Boolean);
      }
    } else if (trimmed.includes(",")) {
      rawOptions = trimmed.split(",").map((s) => s.trim()).filter(Boolean);
    } else {
      rawOptions = [trimmed];
    }
  }

  if (typeof rawOptions === "object" && rawOptions !== null && !Array.isArray(rawOptions)) {
    rawOptions = Object.entries(rawOptions).map(([key, val]) => {
      if (typeof val === "string") return { id: key, text: val };
      if (typeof val === "object" && val !== null) {
        return { id: key, text: (val as any).text || (val as any).label || (val as any).option || key };
      }
      return { id: key, text: String(val) };
    });
  }

  const options: Option[] = Array.isArray(rawOptions)
    ? rawOptions.map((opt, i) => {
        if (typeof opt === "string") {
          return { id: String(i), text: opt };
        }
        if (typeof opt === "object" && opt !== null) {
          return {
            id: String(opt.id ?? opt.key ?? i),
            text: String(
              opt.text ?? opt.label ?? opt.option ?? opt.value ?? opt.choice ?? opt.title ?? opt.content ?? String(i)
            ),
          };
        }
        return { id: String(i), text: String(opt) };
      })
    : [];

  const rawContent = findProp(sources, ["content", "text", "body", "paragraphs", "details", "info", "summary"]);
  let contentParagraphs = parseContentParagraphs(rawContent);

  if (contentParagraphs.length === 0 && description) {
    contentParagraphs = parseContentParagraphs(description);
  }

  if (contentParagraphs.length === 0 && type === "info_panel") {
    const altText = findProp(sources, ["statement", "overview", "note", "heading"]);
    if (typeof altText === "string" && altText.trim()) {
      contentParagraphs = [altText.trim()];
    }
  }

  contentParagraphs = contentParagraphs.filter((p) => {
    const normP = p.trim();
    if (!normP) return false;
    if (normP === url) return false;
    if (normP.startsWith("http://") || normP.startsWith("https://") || normP.startsWith("www.")) return false;
    if (question && normP === question) return false;
    return true;
  });

  const rawKeyPoints = findProp(sources, ["keyPoints", "key_points", "takeaways", "bullets", "highlights"]);
  const keyPoints = Array.isArray(rawKeyPoints)
    ? rawKeyPoints.map((kp) => {
        if (typeof kp === "string") return { description: kp };
        if (typeof kp === "object" && kp !== null) {
          return {
            title: kp.title || kp.heading || kp.name,
            description: kp.description || kp.text || kp.content || String(kp),
          };
        }
        return { description: String(kp) };
      })
    : undefined;

  const calloutNote = String(
    findProp(sources, ["calloutNote", "callout_note", "note", "tip", "warning", "info_note"]) || ""
  ).trim();

  const placeholder = String(
    findProp(sources, ["placeholder", "input_placeholder", "hint"]) || ""
  ).trim();

  const displayTitle = title || (type === "info_panel" ? `Section ${index + 1}` : "");

  return {
    type,
    title: displayTitle,
    subtitle,
    description,
    url,
    question,
    options,
    correctAnswer,
    contentParagraphs,
    keyPoints,
    calloutNote,
    placeholder,
  };
}

export default function QuizPage() {
  const params = useParams();
  const { data: session } = useSession();

  const courseId = params?.course_id as string;
  const moduleId = params?.module_id as string;

  const userAddress = session?.user?.id || "";
  const accessToken = (session as any)?.accessToken;

  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [submissionStatus, setSubmissionStatus] = useState<
    Record<string | number, { submitting: boolean; isCorrect?: boolean; message?: string }>
  >({});

  // Module Completion State
  const [completingModule, setCompletingModule] = useState(false);
  const [moduleCompleted, setModuleCompleted] = useState(false);
  const [completionError, setCompletionError] = useState<string | null>(null);
  const [completionMessage, setCompletionMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadSections() {
      if (!moduleId) return;
      setLoading(true);
      const data = await getModuleSections(moduleId);
      setSections(data);
      setLoading(false);
    }
    loadSections();
  }, [moduleId]);

  // Handle MCQ submission
  const handleMcqSubmit = async (
    sectionId: string | number,
    selectedOption: Option,
    optionIndex: number,
    correctAnswer?: string
  ) => {
    const isCorrect = checkAnswerCorrectness(
      selectedOption.text,
      selectedOption.id,
      optionIndex,
      correctAnswer
    );

    setSubmissionStatus((prev) => ({
      ...prev,
      [sectionId]: { submitting: true },
    }));

    let backendResponse: { success: boolean; is_correct?: boolean; message?: string } = { success: true };

    if (userAddress && sectionId) {
      backendResponse = await submitSectionAnswer(
        sectionId,
        userAddress,
        selectedOption.text,
        isCorrect,
        accessToken
      );
    }

    const finalIsCorrect =
      typeof backendResponse.is_correct === "boolean"
        ? backendResponse.is_correct
        : isCorrect;

    setSubmissionStatus((prev) => ({
      ...prev,
      [sectionId]: {
        submitting: false,
        isCorrect: finalIsCorrect,
        message:
          backendResponse.message ||
          (finalIsCorrect ? "✓ Correct answer!" : "✗ Incorrect, try again."),
      },
    }));
  };

  // Handle Fill-In-The-Blank submission
  const handleBlankSubmit = async (
    sectionId: string | number,
    userAnswer: string,
    correctAnswer?: string
  ) => {
    if (!userAnswer.trim()) return;

    const isCorrect = correctAnswer
      ? userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase()
      : true;

    setSubmissionStatus((prev) => ({
      ...prev,
      [sectionId]: { submitting: true },
    }));

    let backendResponse: { success: boolean; is_correct?: boolean; message?: string } = { success: true };

    if (userAddress && sectionId) {
      backendResponse = await submitSectionAnswer(
        sectionId,
        userAddress,
        userAnswer,
        isCorrect,
        accessToken
      );
    }

    const finalIsCorrect =
      typeof backendResponse.is_correct === "boolean"
        ? backendResponse.is_correct
        : isCorrect;

    setSubmissionStatus((prev) => ({
      ...prev,
      [sectionId]: {
        submitting: false,
        isCorrect: finalIsCorrect,
        message:
          backendResponse.message ||
          (finalIsCorrect ? "✓ Correct answer!" : "✗ Incorrect, try again."),
      },
    }));
  };

  // Filter ONLY genuine quiz question sections (mcq, blank)
  const quizSections = sections.filter((s, idx) => {
    const { type } = normalizeSectionData(s, idx);
    return type === "mcq" || type === "blank";
  });

  const correctQuizCount = quizSections.filter((s, idx) => {
    const secId = s.section_id ?? s.id ?? idx;
    return submissionStatus[secId]?.isCorrect === true;
  }).length;

  const isReadyToComplete =
    quizSections.length === 0 || correctQuizCount === quizSections.length;

  // Handle module completion action
  const handleCompleteModule = async () => {
    if (!userAddress) {
      setCompletionError("Please connect your wallet first.");
      return;
    }

    setCompletingModule(true);
    setCompletionError(null);

    // 1. Sequentially register Info_panel and Video sections with backend one at a time to prevent SQLite database locks
    for (let idx = 0; idx < sections.length; idx++) {
      const sec = sections[idx];
      const { type } = normalizeSectionData(sec, idx);
      const secId = sec.section_id ?? sec.id ?? idx;

      if (type === "info_panel" || type === "video") {
        try {
          await submitSectionAnswer(
            secId,
            userAddress,
            "completed",
            true,
            accessToken
          );
        } catch (err) {
          console.warn(`Sequential answer submit skipped for section ${secId}:`, err);
        }
      }
    }

    // 2. Call check_completion endpoint
    const checkResult = await checkModuleCompletion(moduleId, userAddress, accessToken);

    if (!checkResult.success || checkResult.is_complete === false) {
      setCompletionError(
        checkResult.message || "Unable to complete module. Please ensure all questions are answered correctly."
      );
      setCompletingModule(false);
      return;
    }

    // 3. Call minting endpoint: web3/mint_module_completion_by_id/
    const mintResult = await mintModuleCompletion(moduleId, userAddress, accessToken);

    if (!mintResult.success) {
      setCompletionError(
        mintResult.message || "Module check passed, but Web3 token minting failed."
      );
      setCompletingModule(false);
      return;
    }

    setModuleCompleted(true);
    setCompletionMessage(
      mintResult.message || checkResult.message || "Module completed successfully!"
    );
    setCompletingModule(false);
  }

  return (
    <div className="py-10 space-y-8 max-w-4xl mx-auto">
      {/* Navigation Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <Link
          href={`/courses/${courseId}`}
          className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-[#0B0E14] transition-colors"
        >
          ← Back to Course
        </Link>
        <span className="font-mono text-xs font-semibold text-slate-500 uppercase bg-slate-100 px-3 py-1 border border-slate-200">
          Module {moduleId}
        </span>
      </div>

      {loading ? (
        <div className="py-12 text-center font-mono text-xs text-slate-500">
          Loading module content...
        </div>
      ) : sections.length > 0 ? (
        <div className="space-y-6 flex flex-col items-center">
          {sections.map((section, idx) => {
            const secId = section.section_id ?? section.id ?? idx;
            const status = submissionStatus[secId];
            const {
              type: secType,
              title,
              subtitle,
              description,
              url,
              question,
              options,
              correctAnswer,
              contentParagraphs,
              keyPoints,
              calloutNote,
              placeholder,
            } = normalizeSectionData(section, idx);

            return (
              <QuizBox key={secId}>
                {secType === "video" && (
                  <div className="space-y-3">
                    <VideoPlayerSection
                      title={title || `Video Lesson`}
                      description={description}
                      videoUrl={url}
                    />
                    {contentParagraphs.length > 0 &&
                      contentParagraphs.some(
                        (p) =>
                          p !== title &&
                          p !== description &&
                          p !== url &&
                          !p.startsWith("http") &&
                          isNaN(Number(p))
                      ) && (
                        <div className="text-sm text-white/90 leading-relaxed pt-2 space-y-2 border-t border-slate-800">
                          {contentParagraphs
                            .filter(
                              (p) =>
                                p !== title &&
                                p !== description &&
                                p !== url &&
                                !p.startsWith("http") &&
                                isNaN(Number(p))
                            )
                            .map((p, i) => (
                              <p key={i}>{p}</p>
                            ))}
                        </div>
                      )}
                  </div>
                )}

                {secType === "mcq" && (
                  <div className="space-y-3">
                    {title && title !== question && (
                      <h4 className="font-bold text-lg text-white mb-1">{title}</h4>
                    )}
                    {description && description !== question && (
                      <p className="text-sm text-white/80 mb-2">{description}</p>
                    )}
                    <QuizQuestion
                      question={question}
                      options={options}
                      onSubmitAnswer={(opt) => {
                        const optIdx = options.findIndex((o) => o.id === opt.id);
                        handleMcqSubmit(secId, opt, optIdx >= 0 ? optIdx : 0, correctAnswer);
                      }}
                      disabled={status?.submitting || moduleCompleted}
                    />
                    {status?.message && (
                      <div
                        className={`font-mono text-xs p-2.5 rounded border mt-2 ${
                          status.isCorrect
                            ? "bg-emerald-950/80 text-emerald-300 border-emerald-600"
                            : "bg-rose-950/80 text-rose-300 border-rose-600"
                        }`}
                      >
                        {status.message}
                      </div>
                    )}
                  </div>
                )}

                {(secType === "blank" || secType === "coding_problem") && (
                  <div className="space-y-3">
                    {title && title !== question && (
                      <h4 className="font-bold text-lg text-white mb-1">{title}</h4>
                    )}
                    {description && description !== question && description !== title && (
                      <p className="text-sm text-white/80 mb-2">{description}</p>
                    )}
                    <FillInTheBlankQuestion
                      question={question || title || description || "Please fill in the blank:"}
                      placeholder={placeholder || "Type your answer..."}
                      onAnswerSubmit={(ans) =>
                        handleBlankSubmit(secId, ans, correctAnswer)
                      }
                      disabled={status?.submitting || moduleCompleted}
                    />
                    {status?.message && (
                      <div
                        className={`font-mono text-xs p-2.5 rounded border mt-2 ${
                          status.isCorrect
                            ? "bg-emerald-950/80 text-emerald-300 border-emerald-600"
                            : "bg-rose-950/80 text-rose-300 border-rose-600"
                        }`}
                      >
                        {status.message}
                      </div>
                    )}
                  </div>
                )}

                {secType === "info_panel" && (
                  <TextLessonSection
                    title={title}
                    subtitle={subtitle}
                    content={
                      contentParagraphs.length > 0
                        ? contentParagraphs
                        : [description || "No lesson content provided."]
                    }
                    keyPoints={keyPoints}
                    calloutNote={calloutNote}
                  />
                )}
              </QuizBox>
            );
          })}

          {/* Module Completion Box */}
          <div className="w-full max-w-2xl bg-white border border-[#0B0E14] p-6 space-y-4">
            {moduleCompleted ? (
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 text-emerald-700 font-mono text-xl font-bold border border-emerald-600">
                  ✓
                </div>
                <div>
                  <h3 className="font-bold text-xl text-[#0B0E14]">
                    Module Completed!
                  </h3>
                  <p className="text-xs font-mono text-emerald-700 mt-1">
                    {completionMessage || "Module completed successfully!"}
                  </p>
                </div>
                <div className="pt-2 flex justify-center gap-4">
                  <Link
                    href={`/courses/${courseId}`}
                    className="inline-block bg-[#0B0E14] text-[#F8FAFC] font-mono text-xs font-bold uppercase tracking-wider px-6 py-3 border border-[#0B0E14] hover:bg-[#F8FAFC] hover:text-[#0B0E14] transition-colors"
                  >
                    ← Return to Course Overview
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-600">
                    Module Progress
                  </h3>
                  {quizSections.length > 0 && (
                    <span className="font-mono text-xs font-bold text-primary">
                      Questions Answered: {correctQuizCount} / {quizSections.length}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {quizSections.length > 0
                    ? isReadyToComplete
                      ? "You have answered all questions correctly! Click below to complete this module."
                      : "Answer all questions above correctly to complete this module."
                    : "Read through the lesson material above and click below to complete this module."}
                </p>

                {completionError && (
                  <div className="font-mono text-xs text-rose-600 bg-rose-50 p-2.5 border border-rose-300">
                    {completionError}
                  </div>
                )}

                <button
                  onClick={handleCompleteModule}
                  disabled={!isReadyToComplete || completingModule}
                  className="w-full h-12 bg-primary text-white font-mono text-xs font-bold uppercase tracking-wider border border-[#0B0E14] hover:bg-[#0B0E14] hover:text-[#F8FAFC] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  {completingModule ? "Completing Module..." : "Complete Module"}
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-8 border border-[#0B0E14] bg-white text-center font-mono text-xs text-slate-600">
          No sections available for this module yet.
        </div>
      )}
    </div>
  );
}