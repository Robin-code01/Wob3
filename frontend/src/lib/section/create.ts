// src/lib/section/create.ts

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export type SectionType = "Video" | "MCQ" | "FillInBlank" | "InfoPanel";

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

export interface FillInBlankPayload {
  type_of_section: "FillInBlank";
  sentence_with_blank: string; // e.g. "Solidity is used for [blank] contracts."
  correct_answer: string;
}

export interface InfoPanelPayload {
  type_of_section: "InfoPanel";
  title: string;
  body_text: string;
}

export type CreateSectionPayload =
  | VideoSectionPayload
  | MCQSectionPayload
  | FillInBlankPayload
  | InfoPanelPayload;

export interface SectionItem {
  id?: string;
  type_of_section: SectionType;
  url?: string;
  question?: string;
  options?: string[];
  correct_answer?: string;
  sentence_with_blank?: string;
  title?: string;
  body_text?: string;
}

export async function getModuleSections(
  moduleId: string,
): Promise<SectionItem[]> {
  const res = await fetch(`${BACKEND_URL}/modules/${moduleId}/sections/`, {
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Failed to fetch sections");
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
