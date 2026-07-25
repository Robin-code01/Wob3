// src/lib/modules.ts

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "https://wob3.onrender.com";

export interface CreateModulePayload {
  title: string;
}

export async function createModule(
  courseId: string,
  payload: CreateModulePayload,
  token?: string,
) {
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
