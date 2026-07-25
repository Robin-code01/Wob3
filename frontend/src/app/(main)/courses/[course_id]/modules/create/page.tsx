import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import CreateModuleForm from "@/features/module/create";

interface PageProps {
  params: Promise<{
    course_id: string;
  }>;
}

export default async function CreateModulePage({ params }: PageProps) {
  const session = await auth();

  if (!session) {
    redirect("/");
  }

  const { course_id } = await params;
  const accessToken = (session as any)?.accessToken;

  return (
    <div className="py-10 space-y-8">
      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-extrabold tracking-tight text-[#0B0E14]">
          Add New Module
        </h1>
        <p className="mt-1 text-base text-slate-700">
          Create a module section to organize lessons and quizzes.
        </p>
      </div>

      <CreateModuleForm courseId={course_id} accessToken={accessToken} />
    </div>
  );
}
