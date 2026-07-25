import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { getModuleSections } from "@/lib/section/create";
import ModuleSectionsManager from "@/features/section/create-sections";
import Link from "next/link";
import FinishCourseButton from "@/features/course/finish-course";

interface PageProps {
  params: Promise<{
    course_id: string;
    module_id: string;
  }>;
}

export default async function CreateSectionsPage({ params }: PageProps) {
  const session = await auth();

  if (!session) {
    redirect("/");
  }

  const { course_id, module_id } = await params;
  const accessToken = session?.accessToken;

  if (!session?) {
    console.error("AccessToken is missing or expired.");
    // 必要に応じてリダイレクトやエラーハンドリング
    redirect("/");
  }

  let initialSections: any[] = [];
  try {
    initialSections = await getModuleSections(module_id);
    console.log(initialSections);
  } catch (err) {
    console.error("Could not load sections:", err);
  }

  return (
    <div className="py-8 space-y-6 max-w-6xl mx-auto px-4">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#0B0E14]">
          Module Sections
        </h1>
        <p className="mt-1 text-sm text-slate-700">
          Create and view sections for Module #{module_id}.
        </p>
      </div>

      <ModuleSectionsManager
        courseId={course_id}
        moduleId={module_id}
        initialSections={initialSections}
        accessToken={accessToken}
      />
      <Link href={`/courses/${course_id}/modules/create/`}>
        Create more MODULESSSS!
      </Link>
      <FinishCourseButton courseId={course_id} accessToken={accessToken} />
    </div>
  );
}
