import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import CreateCourseForm from "@/features/course/create-course";

export default async function CreateCoursePage() {
  const session = await auth();

  if (!session) {
    redirect("/");
  }

  const userAddress = session.user?.id || "";
  const accessToken = (session as any)?.accessToken;

  return (
    <div className="py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#0B0E14]">
          Create New Course
        </h1>
        <p className="mt-1 text-base text-slate-700">
          Fill out the details below to publish your Web3 course.
        </p>
      </div>

      <CreateCourseForm userAddress={userAddress} accessToken={accessToken} />
    </div>
  );
}
