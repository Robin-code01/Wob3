const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://wob3.onrender.com";

export interface Course {
  course_id?: string | number;
  title: string;
  description: string;
  outcomes?: string;
  creator_id?: string;
  author?: string;
  image?: string;
  [key: string]: any;
}

export interface Module {
  module_id?: string | number;
  title: string;
  [key: string]: any;
}

export interface CreateCoursePayload {
  title: string;
  description: string;
  outcomes: string;
  creator_id: string;
}

/**
 * GET /courses/
 * Returns an array of all courses
 */
export async function getAllCourses(): Promise<Course[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/courses/`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!res.ok) {
      console.error(`Failed to fetch all courses (${res.status})`);
      return [];
    }

    const data = await res.json();
    return Array.isArray(data) ? data : data.results || [];
  } catch (err) {
    console.error("Error fetching courses:", err);
    return [];
  }
}

/**
 * POST /courses/
 * Create a new course
 */
export async function createCourse(
  payload: CreateCoursePayload,
  accessToken?: string
): Promise<Course | null> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    const res = await fetch(`${API_BASE_URL}/courses/`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error(`Failed to create course (${res.status})`);
      return null;
    }

    return await res.json();
  } catch (err) {
    console.error("Error creating course:", err);
    return null;
  }
}

/**
 * GET /courses/<course_id>/
 * Get details of a specific course
 */
export async function getCourseById(courseId: string | number): Promise<Course | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/courses/${courseId}/`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!res.ok) {
      console.error(`Failed to fetch course ${courseId} (${res.status})`);
      return null;
    }

    return await res.json();
  } catch (err) {
    console.error(`Error fetching course ${courseId}:`, err);
    return null;
  }
}

/**
 * PATCH /courses/<course_id>/
 * Edit specific fields of a course
 */
export async function updateCourse(
  courseId: string | number,
  updates: Partial<CreateCoursePayload>,
  accessToken?: string
): Promise<Course | null> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    const res = await fetch(`${API_BASE_URL}/courses/${courseId}/`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(updates),
    });

    if (!res.ok) {
      console.error(`Failed to update course ${courseId} (${res.status})`);
      return null;
    }

    return await res.json();
  } catch (err) {
    console.error(`Error updating course ${courseId}:`, err);
    return null;
  }
}

/**
 * DELETE /courses/<course_id>/
 * Delete a course
 */
export async function deleteCourse(
  courseId: string | number,
  accessToken?: string
): Promise<boolean> {
  try {
    const headers: Record<string, string> = {};
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    const res = await fetch(`${API_BASE_URL}/courses/${courseId}/`, {
      method: "DELETE",
      headers,
    });

    return res.ok;
  } catch (err) {
    console.error(`Error deleting course ${courseId}:`, err);
    return false;
  }
}

/**
 * GET /users/<public_key>/courses/
 * Returns array of course objects the user is currently enrolled in
 */
export async function getEnrolledCourses(
  publicKey: string,
  accessToken?: string
): Promise<Course[]> {
  try {
    const headers: Record<string, string> = {
      Accept: "application/json",
    };
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    const res = await fetch(
      `${API_BASE_URL}/users/${publicKey.toLowerCase()}/courses/`,
      {
        headers,
        cache: "no-store",
      }
    );

    if (!res.ok) {
      console.error(
        `Failed to fetch enrolled courses for ${publicKey} (${res.status})`
      );
      return [];
    }

    const data = await res.json();
    return Array.isArray(data) ? data : data.results || [];
  } catch (err) {
    console.error(`Error fetching enrolled courses for ${publicKey}:`, err);
    return [];
  }
}

/**
 * GET /courses/<course_id>/modules/
 * Returns array of modules for a specific course
 */
export async function getCourseModules(
  courseId: string | number
): Promise<Module[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/courses/${courseId}/modules/`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!res.ok) {
      console.error(`Failed to fetch modules for course ${courseId} (${res.status})`);
      return [];
    }

    const data = await res.json();
    return Array.isArray(data) ? data : data.results || [];
  } catch (err) {
    console.error(`Error fetching modules for course ${courseId}:`, err);
    return [];
  }
}

/**
 * POST /enroll/
 * Enroll a user in a course
 */
export async function enrollInCourse(
  publicKey: string,
  courseId: string | number,
  accessToken?: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    const parsedCourseId =
      typeof courseId === "string" && !isNaN(Number(courseId))
        ? Number(courseId)
        : courseId;

    const res = await fetch(`${API_BASE_URL}/enroll/`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        public_key: publicKey,
        course_id: parsedCourseId,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`Failed to enroll (${res.status}): ${errText}`);
      return { success: false, message: `Enrollment failed (${res.status})` };
    }

    return { success: true };
  } catch (err) {
    console.error("Error enrolling in course:", err);
    return { success: false, message: "Network error during enrollment" };
  }
}