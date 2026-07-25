// src/lib/section/create.ts

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export type SectionType = "Video" | "MCQ" | "InfoPanel" | "FillInTheBlank";

export interface VideoSectionPayload {
  type_of_section: "Video";
  url: string;
}

export interface MCQSectionPayload {
  type_of_section: "MCQ";
  question: string;
  options: string[];
  correct_answer: string;
}

export interface InfoPanelSectionPayload {
  type_of_section: "InfoPanel";
  title: string;
  content: string;
}

export interface FillInTheBlankSectionPayload {
  type_of_section: "FillInTheBlank";
  sentence: string; // e.g. "React uses a _____ DOM for fast rendering."
  correct_answer: string; // e.g. "virtual"
}

export type CreateSectionPayload =
  | VideoSectionPayload
  | MCQSectionPayload
  | InfoPanelSectionPayload
  | FillInTheBlankSectionPayload;

export interface SectionItem {
  id?: string;
  type_of_section: SectionType;
  url?: string;
  question?: string;
  options?: string[];
  correct_answer?: string;
  title?: string;
  content?: string;
  sentence?: string;
}

export interface CreateModulePayload {
  title: string;
}

export interface ModuleItem {
  id: string;
  title: string;
  course_id?: string;
}

// ---------------- MODULE ENDPOINTS ----------------

export async function getCourseModules(
  courseId: string,
): Promise<ModuleItem[]> {
  const res = await fetch(`${BACKEND_URL}/courses/${courseId}/modules/`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch modules.");
  return res.json();
}

export async function createModule(
  courseId: string,
  payload: CreateModulePayload,
  token?: string,
): Promise<ModuleItem> {
  const res = await fetch(`${BACKEND_URL}/courses/${courseId}/modules/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to create module.");
  }
  return res.json();
}

// ---------------- SECTION ENDPOINTS ----------------

export async function getModuleSections(
  moduleId: string,
): Promise<SectionItem[]> {
  const res = await fetch(`${BACKEND_URL}/modules/${moduleId}/sections/`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch sections.");
  return res.json();
}

export async function createSection(
  moduleId: string,
  payload: CreateSectionPayload,
  token?: string,
): Promise<SectionItem> {
  const res = await fetch(`${BACKEND_URL}/modules/${moduleId}/sections/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to create section.");
  }
  return res.json();
}
