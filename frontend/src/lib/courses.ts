import { getAddress } from "viem";

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

export interface Section {
  section_id?: string | number;
  id?: string | number;
  type_of_section: "Video" | "MCQ" | "Info_panel" | "Coding_problem" | "Blank" | string;
  title?: string;
  subtitle?: string;
  description?: string;
  url?: string;
  question?: string;
  options?: string[] | { id: string | number; text: string }[];
  correct_answer?: string;
  content?: string | string[];
  keyPoints?: { title?: string; description: string }[];
  calloutNote?: string;
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
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.results)) return data.results;
    if (Array.isArray(data.courses)) return data.courses;
    if (Array.isArray(data.data)) return data.data;
    return [];
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
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.results)) return data.results;
    if (Array.isArray(data.courses)) return data.courses;
    if (Array.isArray(data.data)) return data.data;
    return [];
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
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.results)) return data.results;
    if (Array.isArray(data.modules)) return data.modules;
    if (Array.isArray(data.data)) return data.data;
    return [];
  } catch (err) {
    console.error(`Error fetching modules for course ${courseId}:`, err);
    return [];
  }
}

/**
 * GET /modules/<module_id>/sections/
 * Returns all sections in the module, including nested content data
 */
export async function getModuleSections(
  moduleId: string | number
): Promise<Section[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/modules/${moduleId}/sections/`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!res.ok) {
      console.error(`Failed to fetch sections for module ${moduleId} (${res.status})`);
      return [];
    }

    const data = await res.json();
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.results)) return data.results;
    if (Array.isArray(data.sections)) return data.sections;
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.items)) return data.items;
    return [];
  } catch (err) {
    console.error(`Error fetching sections for module ${moduleId}:`, err);
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
      if (errText.toLowerCase().includes("already enrolled") || errText.toLowerCase().includes("already exists")) {
        return { success: true };
      }
      return { success: false, message: `Enrollment failed (${res.status})` };
    }

    return { success: true };
  } catch (err) {
    console.error("Error enrolling in course:", err);
    return { success: false, message: "Network error during enrollment" };
  }
}

/**
 * POST /sections/<section_id>/answer/
 * Submit an answer for a specific section
 */
export async function submitSectionAnswer(
  sectionId: string | number,
  publicKey: string,
  userAnswer: string,
  isCorrect?: boolean,
  accessToken?: string
): Promise<{ success: boolean; is_correct?: boolean; message?: string }> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    const res = await fetch(`${API_BASE_URL}/sections/${sectionId}/answer/`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        public_key: publicKey,
        user_answer: userAnswer,
        ...(typeof isCorrect === "boolean" ? { is_correct: isCorrect ? 1 : 0 } : {}),
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(
        `Failed to submit answer for section ${sectionId} (${res.status}): ${errText}`
      );
      return { success: false, message: `Submission failed (${res.status})` };
    }

    const data = await res.json().catch(() => ({}));
    const backendIsCorrect =
      data.is_correct ?? data.correct ?? data.isCorrect ?? isCorrect;

    return {
      success: true,
      is_correct: typeof backendIsCorrect === "boolean" ? backendIsCorrect : Boolean(backendIsCorrect),
      message: data.message || data.detail,
    };
  } catch (err) {
    console.error(`Error submitting answer for section ${sectionId}:`, err);
    return { success: false, message: "Network error submitting answer" };
  }
}

/**
 * POST /modules/<module_id>/check_completion/
 * Checks if a user has answered all sections in the module.
 */
export async function checkModuleCompletion(
  moduleId: string | number,
  publicKey: string,
  accessToken?: string
): Promise<{ success: boolean; is_complete?: boolean; message?: string }> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    const res = await fetch(`${API_BASE_URL}/modules/${moduleId}/check_completion/`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        public_key: publicKey,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(
        `Failed to check completion for module ${moduleId} (${res.status}): ${errText}`
      );
      return {
        success: false,
        is_complete: false,
        message: `Completion failed (${res.status})`,
      };
    }

    const data = await res.json().catch(() => ({}));
    const isComplete =
      data.is_complete ?? data.complete ?? data.completed ?? data.success ?? true;

    return {
      success: true,
      is_complete: Boolean(isComplete),
      message: data.message || data.detail || "Module completed successfully!",
    };
  } catch (err) {
    console.error(`Error completing module ${moduleId}:`, err);
    return { success: false, message: "Network error completing module" };
  }
}

/**
 * POST /web3/mint_module_completion_by_id/
 * Triggers minting/recording of module completion by student public key and module ID.
 */
export async function mintModuleCompletion(
  moduleId: string | number,
  publicKey: string,
  accessToken?: string
): Promise<{ success: boolean; message?: string; tx_hash?: string }> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    const parsedModuleId =
      typeof moduleId === "string" && !isNaN(Number(moduleId))
        ? Number(moduleId)
        : moduleId;

    // Format valid checksummed address
    let checksummedAddress = publicKey;
    try {
      if (publicKey && publicKey.startsWith("0x")) {
        checksummedAddress = getAddress(publicKey);
      }
    } catch {
      checksummedAddress = publicKey;
    }

    // Supply all address aliases so backend json.loads lookups do not receive None
    const res = await fetch(`${API_BASE_URL}/web3/mint_module_completion_by_id/`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        student_public_key: checksummedAddress,
        public_key: checksummedAddress,
        student_address: checksummedAddress,
        address: checksummedAddress,
        module_id: parsedModuleId,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(
        `Failed to mint module completion for module ${moduleId} (${res.status}): ${errText}`
      );

      let errJson: any = {};
      try {
        errJson = JSON.parse(errText);
      } catch {}

      return {
        success: false,
        message:
          errJson.error ||
          errJson.detail ||
          errJson.message ||
          `Minting request failed (${res.status})`,
      };
    }

    const data = await res.json().catch(() => ({}));
    return {
      success: true,
      tx_hash: data.tx_hash || data.hash || data.transaction_hash,
      message: data.message || data.detail || "Module completion minted successfully!",
    };
  } catch (err) {
    console.error(`Error minting completion for module ${moduleId}:`, err);
    return { success: false, message: "Network error during minting request" };
  }
}