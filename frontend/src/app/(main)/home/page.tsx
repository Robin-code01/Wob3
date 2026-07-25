import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import CourseCard from "@/components/card/course-card";
import {
  getAllCourses,
  getEnrolledCourses,
  getCourseModules,
  checkModuleCompletion,
  Course,
} from "@/lib/courses";
import Link from "next/link";

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

export default async function HomePage() {
  const session = await auth();

  if (!session) {
    redirect("/");
  }

  const userAddress = session.user?.id || "";
  const accessToken = (session as any)?.accessToken;

  // Fetch enrolled courses and popular courses in parallel
  const [enrolledCourses, allCourses] = await Promise.all([
    userAddress
      ? getEnrolledCourses(userAddress, accessToken)
      : Promise.resolve([]),
    getAllCourses(),
  ]);

  // Determine completion status for each enrolled course
  const enrolledWithStatus = await Promise.all(
    enrolledCourses.map(async (course) => {
      const courseId = course.course_id ?? course.id;
      if (!courseId) return { course, isComplete: false };

      const modules = await getCourseModules(courseId);
      if (!modules || modules.length === 0) {
        return { course, isComplete: false };
      }

      const completionChecks = await Promise.all(
        modules.map(async (mod) => {
          const modId = mod.module_id ?? mod.id;
          if (!modId) return false;
          const res = await checkModuleCompletion(modId, userAddress, accessToken);
          return Boolean(res.is_complete);
        })
      );

      const isComplete = completionChecks.length > 0 && completionChecks.every(Boolean);
      return { course, isComplete };
    })
  );

  // Separate active in-progress courses vs fully completed courses
  const inProgressCourses = enrolledWithStatus
    .filter((item) => !item.isComplete)
    .map((item) => item.course);

  const completedCourses = enrolledWithStatus
    .filter((item) => item.isComplete)
    .map((item) => item.course);

  return (
    <div className="py-10 space-y-12">
      {/* Welcome Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0B0E14]">
            Welcome
          </h1>
          <p className="mt-2 text-base text-slate-700 leading-relaxed">
            Let's get learning.
          </p>
        </div>

        {/* Create Course Button */}
        <Link
          href="/courses/create"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 h-fit font-mono text-xs font-bold uppercase tracking-wider text-white bg-[#0B0E14] border border-[#0B0E14] hover:bg-slate-800 transition-all shadow-sm active:translate-y-0.5"
        >
          <span className="text-sm font-normal">+</span> Create Course
        </Link>
      </div>

      {/* Continue Learning Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-mono text-xs font-bold tracking-widest text-slate-500 uppercase">
            Continue Learning
          </h2>
        </div>
        {inProgressCourses.length > 0 ? (
          <div className="flex gap-6 overflow-x-auto py-2 px-1 -mx-1 scrollbar-thin">
            {inProgressCourses.map((course, idx) => {
              const courseId = course.course_id ?? course.id ?? idx;
              return (
                <CourseCard
                  key={courseId}
                  course_id={courseId}
                  title={course.title}
                  author={formatAuthor(course.creator_id, course.author)}
                  description={course.description}
                  src={getCourseImage(course, DEFAULT_IMAGES)}
                  actionText="Continue Learning →"
                />
              );
            })}
          </div>
        ) : (
          <div className="p-8 border border-[#0B0E14] bg-white text-center">
            <div className="font-mono text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
              0 Active Courses
            </div>
            <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
              {completedCourses.length > 0
                ? "You've completed all your enrolled courses!"
                : "You haven't enrolled in any active courses."}
            </p>
          </div>
        )}
      </section>

      {/* Popular Courses Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-mono text-xs font-bold tracking-widest text-slate-500 uppercase">
            Popular Courses
          </h2>
        </div>
        {allCourses.length > 0 ? (
          <div className="flex gap-6 overflow-x-auto py-2 px-1 -mx-1 scrollbar-thin">
            {allCourses.map((course, idx) => {
              const courseId = course.course_id ?? course.id ?? idx;
              
              const isEnrolled = enrolledCourses.some((c) => {
                const cId = c.course_id ?? c.id ?? c.course;
                return String(cId) === String(courseId);
              });

              const isCompleted = completedCourses.some((c) => {
                const cId = c.course_id ?? c.id ?? c.course;
                return String(cId) === String(courseId);
              });

              let actionText = "Start Learning →";
              if (isCompleted) {
                actionText = "Review Course ✓";
              } else if (isEnrolled) {
                actionText = "Continue Learning →";
              }

              return (
                <CourseCard
                  key={courseId}
                  course_id={courseId}
                  title={course.title}
                  author={formatAuthor(course.creator_id, course.author)}
                  description={course.description}
                  src={getCourseImage(course, DEFAULT_IMAGES)}
                  actionText={actionText}
                  isCompleted={isCompleted}
                />
              );
            })}
          </div>
        ) : (
          <div className="p-8 border border-[#0B0E14] bg-white text-center">
            <div className="font-mono text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
              No Courses Available
            </div>
            <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
              There are no courses listed at the moment. Please check back later.
            </p>
          </div>
        )}
      </section>

      {/* Completed Courses Section */}
      {completedCourses.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-mono text-xs font-bold tracking-widest text-emerald-700 uppercase flex items-center gap-2">
              <span>Completed Courses</span>
              <span className="font-mono text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5">
                {completedCourses.length}
              </span>
            </h2>
          </div>
          <div className="flex gap-6 overflow-x-auto py-2 px-1 -mx-1 scrollbar-thin">
            {completedCourses.map((course, idx) => {
              const courseId = course.course_id ?? course.id ?? idx;
              return (
                <CourseCard
                  key={courseId}
                  course_id={courseId}
                  title={course.title}
                  author={formatAuthor(course.creator_id, course.author)}
                  description={course.description}
                  src={getCourseImage(course, DEFAULT_IMAGES)}
                  actionText="Review Course ✓"
                  isCompleted={true}
                />
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}