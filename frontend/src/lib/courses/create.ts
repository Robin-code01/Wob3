// src/lib/courses/create.ts

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
  // 1. Create the course in the database
  const res = await fetch(`${BACKEND_URL}/courses/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || errorData.message || "Failed to create course");
  }

  // Parse created course details (contains course_id)
  const courseData = await res.json();

  // 2. Register the course on the Web3 smart contract backend
  const web3Res = await fetch(`${BACKEND_URL}/web3/register_course/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      ...payload,
      course_id: courseData.course_id ?? courseData.id,
    }),
  });

  if (!web3Res.ok) {
    const errorData = await web3Res.json().catch(() => ({}));
    throw new Error(
      errorData.detail || errorData.message || "Failed to register course on web3"
    );
  }

  return courseData;
}