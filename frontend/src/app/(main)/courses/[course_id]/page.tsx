import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  getCourseById,
  getCourseModules,
  getEnrolledCourses,
  checkModuleCompletion,
  Course,
} from "@/lib/courses";
import EnrollButton from "@/components/course/enroll-button";
import MintCourseButton from "@/features/course/obtain-certificate";

const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1622979135225-d2ba269bc1bd?auto=format&fit=crop&w=600&q=80",
];

function getCourseImage(course: Course, defaultImages: string[]) {
  if (course.image) return course.image;

  const rawId = course.course_id ?? course.id ?? course.title ?? "0";
  const num = typeof rawId === "number" ? rawId : parseInt(String(rawId), 10);

  if (!isNaN(num)) {
    return defaultImages[Math.abs(num) % defaultImages.length];
  }

  let hash = 0;
  const str = String(rawId);
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return defaultImages[Math.abs(hash) % defaultImages.length];
}

function formatAuthor(creatorId?: string, author?: string) {
  if (author) return author;
  if (creatorId && creatorId.startsWith("0x") && creatorId.length > 10) {
    return `${creatorId.slice(0, 6)}...${creatorId.slice(-4)}`;
  }
  return creatorId || "NFTeach";
}

type CourseOverviewPageProps = {
  params: Promise<{ course_id: string }>;
};

export default async function CourseOverviewPage({
  params,
}: CourseOverviewPageProps) {
  const session = await auth();

  if (!session) {
    redirect("/");
  }

  const { course_id } = await params;
  const userAddress = session.user?.id || "";
  const accessToken = (session as any)?.accessToken;

  const [course, modules, enrolledCourses] = await Promise.all([
    getCourseById(course_id),
    getCourseModules(course_id),
    userAddress
      ? getEnrolledCourses(userAddress, accessToken)
      : Promise.resolve([]),
  ]);

  if (!course) {
    return (
      <div className="py-16 text-center space-y-6">
        <h1 className="text-2xl font-bold text-[#0B0E14]">Course Not Found</h1>
        <p className="text-slate-600 text-sm max-w-md mx-auto">
          Could not load details for course ID{" "}
          <code className="font-mono bg-slate-100 px-1 py-0.5">
            {course_id}
          </code>
          .
        </p>
        <div>
          <Link
            href="/home"
            className="inline-block bg-[#0B0E14] text-[#F8FAFC] font-mono text-xs uppercase tracking-wider px-5 py-2.5 font-semibold"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const activeCourseId = String(course.course_id ?? course.id ?? course_id);

  const isEnrolled = enrolledCourses.some((c) => {
    const enrolledId = c.course_id ?? c.id ?? c.course?.id ?? c.course;
    return String(enrolledId) === activeCourseId;
  });

  // Check completion status for each module if the user is enrolled
  const completedModuleMap: Record<string, boolean> = {};
  if (isEnrolled && userAddress && modules.length > 0) {
    const completionResults = await Promise.all(
      modules.map(async (mod) => {
        const modId = mod.module_id ?? mod.id;
        if (!modId) return { id: null, isComplete: false };
        const res = await checkModuleCompletion(
          modId,
          userAddress,
          accessToken,
        );
        return { id: String(modId), isComplete: Boolean(res.is_complete) };
      }),
    );

    for (const res of completionResults) {
      if (res.id) {
        completedModuleMap[res.id] = res.isComplete;
      }
    }
  }

  const completedCount =
    Object.values(completedModuleMap).filter(Boolean).length;
  const isCourseComplete =
    modules.length > 0 && completedCount === modules.length;

  const formattedAuthor = formatAuthor(course.creator_id, course.author);
  const courseImage = getCourseImage(course, DEFAULT_IMAGES);

  return (
    <div className="py-10 space-y-10">
      {/* Back Link */}
      <div>
        <Link
          href="/home"
          className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-[#0B0E14] transition-colors"
        >
          ← Back to Courses
        </Link>
      </div>

      {/* Main Header Card */}
      <div className="border border-[#0B0E14] bg-white overflow-hidden">
        <div className="grid md:grid-cols-3">
          {/* Image Column */}
          <div className="relative min-h-50 md:min-h-full bg-slate-100 border-b md:border-b-0 md:border-r border-[#0B0E14]">
            {courseImage ? (
              <Image
                src={courseImage}
                alt={course.title}
                fill
                unoptimized={
                  typeof courseImage === "string" &&
                  courseImage.startsWith("http")
                }
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full min-h-50 flex items-center justify-center font-mono text-xs font-semibold text-slate-400">
                [ NO IMAGE ]
              </div>
            )}
          </div>

          {/* Details Column */}
          <div className="md:col-span-2 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <span className="font-mono text-xs font-bold tracking-widest text-primary uppercase">
                  Course Overview
                </span>
                <span className="font-mono text-xs text-slate-500 border border-slate-300 px-2.5 py-1 bg-slate-50">
                  Instructor: {formattedAuthor}
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#0B0E14] leading-tight">
                {course.title}
              </h1>

              <p className="mt-4 text-base text-slate-700 leading-relaxed">
                {course.description}
              </p>
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-slate-500">
                  {modules.length} {modules.length === 1 ? "Module" : "Modules"}
                </span>

                {isEnrolled && modules.length > 0 && (
                  <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-1">
                    {completedCount} / {modules.length} Completed
                  </span>
                )}
              </div>

              <EnrollButton
                courseId={activeCourseId}
                userAddress={userAddress}
                accessToken={accessToken}
                initialEnrolled={isEnrolled}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {course.outcomes && (
            <section className="border border-[#0B0E14] bg-white p-6 sm:p-8">
              <h2 className="font-mono text-xs font-bold tracking-widest text-slate-500 uppercase mb-4">
                Learning Outcomes
              </h2>
              <div className="text-slate-700 text-sm leading-relaxed space-y-2 whitespace-pre-line">
                {course.outcomes}
              </div>
            </section>
          )}

          {/* Curriculum / Modules List */}
          <section className="border border-[#0B0E14] bg-white p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-mono text-xs font-bold tracking-widest text-slate-500 uppercase">
                Course Curriculum ({modules.length})
              </h2>
              {isEnrolled ? (
                isCourseComplete ? (
                  <span className="font-mono text-[11px] font-bold text-emerald-800 uppercase bg-emerald-100 px-2 py-0.5 border border-emerald-400">
                    Course Completed 🏆
                  </span>
                ) : (
                  <span className="font-mono text-[11px] font-bold text-emerald-700 uppercase bg-emerald-50 px-2 py-0.5 border border-emerald-300">
                    Unlocked
                  </span>
                )
              ) : (
                <span className="font-mono text-[11px] font-bold text-slate-500 uppercase bg-slate-100 px-2 py-0.5 border border-slate-300">
                  Locked
                </span>
              )}
            </div>

            {modules.length > 0 ? (
              <div className="divide-y divide-slate-200 border border-slate-200">
                {modules.map((module, idx) => {
                  const modNumber = String(idx + 1).padStart(2, "0");
                  const moduleId = module.module_id ?? module.id ?? idx + 1;
                  const moduleLink = `/courses/${activeCourseId}/modules/${moduleId}`;
                  const isCompleted = Boolean(
                    completedModuleMap[String(moduleId)],
                  );

                  const content = (
                    <div
                      className={`p-4 flex items-center justify-between gap-4 transition-colors ${
                        isCompleted
                          ? "bg-emerald-50/40 hover:bg-emerald-50/80"
                          : "bg-white hover:bg-slate-50"
                      } ${isEnrolled ? "group cursor-pointer" : ""}`}
                    >
                      <div className="flex items-center gap-4">
                        <span
                          className={`font-mono text-xs font-bold shrink-0 px-2 py-1 border ${
                            isCompleted
                              ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                              : "bg-slate-100 text-primary border-slate-200"
                          }`}
                        >
                          {isCompleted ? "✓" : modNumber}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm text-[#0B0E14] group-hover:text-primary transition-colors">
                              {module.title}
                            </h3>
                          </div>
                        </div>
                      </div>

                      {isEnrolled ? (
                        isCompleted ? (
                          <span className="font-mono text-xs text-emerald-800 font-bold bg-emerald-100 px-2.5 py-1 border border-emerald-300 shrink-0">
                            Completed ✓
                          </span>
                        ) : (
                          <span className="font-mono text-xs text-primary font-semibold shrink-0 group-hover:translate-x-1 transition-transform">
                            Start Module →
                          </span>
                        )
                      ) : (
                        <span className="font-mono text-xs text-slate-400 shrink-0">
                          Locked
                        </span>
                      )}
                    </div>
                  );

                  if (isEnrolled) {
                    return (
                      <Link
                        key={module.module_id || module.id || idx}
                        href={moduleLink}
                        className="block"
                      >
                        {content}
                      </Link>
                    );
                  }

                  return (
                    <div key={module.module_id || module.id || idx}>
                      {content}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 bg-slate-50 border border-dashed border-slate-300 text-center text-slate-500 font-mono text-xs">
                No modules available for this course yet.
              </div>
            )}
          </section>
          <MintCourseButton
            courseName={course.name}
            userAddress={userAddress}
          />
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          <div className="border border-[#0B0E14] bg-white p-6 space-y-4">
            <h3 className="font-mono text-xs font-bold tracking-widest text-slate-500 uppercase">
              Course Details
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-mono">Status</span>
                <span
                  className={`font-bold ${isEnrolled ? "text-emerald-700" : "text-[#0B0E14]"}`}
                >
                  {isEnrolled ? "Enrolled" : "Not Enrolled"}
                </span>
              </div>

              {isEnrolled && modules.length > 0 && (
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-mono">Progress</span>
                  <span className="font-bold text-emerald-700 font-mono">
                    {completedCount} / {modules.length} Modules
                  </span>
                </div>
              )}

              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-mono">Total Modules</span>
                <span className="font-bold text-[#0B0E14]">
                  {modules.length}
                </span>
              </div>

              <div className="flex justify-between py-2">
                <span className="text-slate-500 font-mono">Cost</span>
                <span className="font-bold text-emerald-600 font-mono">
                  Free
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
