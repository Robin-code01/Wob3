import { auth } from "@/lib/auth/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getCourseById, getCourseModules, getEnrolledCourses } from "@/lib/courses";
import EnrollButton from "@/components/course/enroll-button";

const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1622979135225-d2ba269bc1bd?auto=format&fit=crop&w=600&q=80",
];

function formatAuthor(creatorId?: string, author?: string) {
  if (author) return author;
  if (creatorId && creatorId.startsWith("0x") && creatorId.length > 10) {
    return `${creatorId.slice(0, 6)}...${creatorId.slice(-4)}`;
  }
  return creatorId || "NFTeach";
}

type CourseOverviewPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CourseOverviewPage({ params }: CourseOverviewPageProps) {
  const session = await auth();

  if (!session) {
    redirect("/");
  }

  const { id } = await params;
  const userAddress = session.user?.id || "";
  const accessToken = (session as any)?.accessToken;

  // Fetch course details, course modules, and user's enrolled courses in parallel
  const [course, modules, enrolledCourses] = await Promise.all([
    getCourseById(id),
    getCourseModules(id),
    userAddress ? getEnrolledCourses(userAddress, accessToken) : Promise.resolve([]),
  ]);

  if (!course) {
    notFound();
  }

  const courseIdStr = String(course.id || course.course_id || id);

  const isEnrolled = enrolledCourses.some((c) => {
    const cId = String(c.id || c.course_id);
    return cId === courseIdStr;
  });

  const formattedAuthor = formatAuthor(course.creator_id, course.author);
  const imageIndex = typeof course.id === "number" ? course.id : 0;
  const courseImage = course.image || DEFAULT_IMAGES[imageIndex % DEFAULT_IMAGES.length];

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
          <div className="relative min-h-55 md:min-h-full bg-slate-100 border-b md:border-b-0 md:border-r border-[#0B0E14]">
            {courseImage ? (
              <Image
                src={courseImage}
                alt={course.title}
                fill
                unoptimized={typeof courseImage === "string" && courseImage.startsWith("http")}
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
              <div className="font-mono text-xs text-slate-500">
                {modules.length} {modules.length === 1 ? "Module" : "Modules"}
              </div>

              <EnrollButton
                courseId={courseIdStr}
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
        {/* Left 2 Columns: Outcomes & Modules */}
        <div className="md:col-span-2 space-y-8">
          {/* Learning Outcomes */}
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
                Course Modules ({modules.length})
              </h2>
              {isEnrolled ? (
                <span className="font-mono text-[11px] font-bold text-emerald-700 uppercase bg-emerald-50 px-2 py-0.5 border border-emerald-300">
                  Unlocked
                </span>
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
                  return (
                    <div
                      key={module.id || module.module_id || idx}
                      className="p-4 flex items-center justify-between gap-4 bg-white hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <span className="font-mono text-sm font-bold text-primary shrink-0">
                          {modNumber}
                        </span>
                        <div>
                          <h3 className="font-bold text-sm text-[#0B0E14]">
                            {module.title}
                          </h3>
                        </div>
                      </div>

                      {isEnrolled ? (
                        <span className="font-mono text-xs text-primary font-semibold shrink-0">
                          Available →
                        </span>
                      ) : (
                        <span className="font-mono text-xs text-slate-400 shrink-0">
                          Locked
                        </span>
                      )}
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
        </div>

        {/* Right Sidebar: Quick Details */}
        <div className="space-y-6">
          <div className="border border-[#0B0E14] bg-white p-6 space-y-4">
            <h3 className="font-mono text-xs font-bold tracking-widest text-slate-500 uppercase">
              Course Details
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-mono">Status</span>
                <span className="font-bold text-[#0B0E14]">
                  {isEnrolled ? "Enrolled" : "Not Enrolled"}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-mono">Total Modules</span>
                <span className="font-bold text-[#0B0E14]">{modules.length}</span>
              </div>

              <div className="flex justify-between py-2">
                <span className="text-slate-500 font-mono">Cost</span>
                <span className="font-bold text-emerald-600 font-mono">Free</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}