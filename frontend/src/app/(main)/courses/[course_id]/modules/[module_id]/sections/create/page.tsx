import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { getModuleSections } from "@/lib/section/create";
import ModuleSectionsManager from "@/features/section/create-sections";

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
  const accessToken = (session as any)?.accessToken;

  let initialSections = [];
  try {
    initialSections = await getModuleSections(module_id);
  } catch (err) {
    console.error("Could not load sections:", err);
  }

  return (
    <div className="py-10 space-y-8 max-w-6xl mx-auto px-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Module Section Builder
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Create video lessons, quizzes, fill-in-blanks, and info panels for
            Module #{module_id}.
          </p>
        </div>
      </div>

      <ModuleSectionsManager
        courseId={course_id}
        moduleId={module_id}
        initialSections={initialSections}
        accessToken={accessToken}
      />
    </div>
  );
}
