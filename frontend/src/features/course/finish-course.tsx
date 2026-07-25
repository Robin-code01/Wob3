"use client";

import { useState } from "react";

interface FinishCourseButtonProps {
  courseId: string;
  accessToken?: string;
}

export default function FinishCourseButton({
  courseId,
  accessToken,
}: FinishCourseButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleFinishCourse = async () => {
    setLoading(true);
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    try {
      // 1. Fetch course title
      const courseRes = await fetch(`${backendUrl}/courses/${courseId}/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const courseData = await courseRes.json();

      // 2. Fetch module titles
      const modulesRes = await fetch(
        `${backendUrl}/courses/${courseId}/modules/`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
      const modulesData = await modulesRes.json();

      // Extract titles
      const course_name = courseData.title;
      const module_names = Array.isArray(modulesData)
        ? modulesData.map((m: any) => m.title)
        : [];

      // 3. POST to Web3 register endpoint
      const res = await fetch(`${backendUrl}/web3/register_course`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          course_name,
          module_names,
        }),
      });

      if (res.ok) {
        alert("Course registered successfully!");
      } else {
        alert("Failed to register course.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while registering the course.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleFinishCourse}
      disabled={loading}
      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
    >
      {loading ? "Registering..." : "Let's finish making the course"}
    </button>
  );
}
