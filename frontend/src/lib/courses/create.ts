// src/lib/courses.ts

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export interface CreateCoursePayload {
  title: string;
  description: string;
  outcomes: string;
  creator_id: string;
}

export async function createCourse(
  payload: CreateCoursePayload,
  token?: string,
) {
  const res = await fetch(`${BACKEND_URL}/courses/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  const funny = await fetch(`${BACKEND_URL}/web3/register_course/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to create course");
  }
  if (!funny.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to register course on web3");
  }

  return res.json();
}
