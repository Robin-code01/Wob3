import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import CourseCard from "@/components/card/course-card";
import { getAllCourses, getEnrolledCourses } from "@/lib/courses";

// Fallback images if a course does not provide a custom image
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

export default async function HomePage() {
  const session = await auth();

  if (!session) {
    redirect("/");
  }

  const userAddress = session.user?.id || "";
  const accessToken = (session as any)?.accessToken;

  // Fetch enrolled courses and popular courses in parallel
  const [enrolledCourses, allCourses] = await Promise.all([
    userAddress ? getEnrolledCourses(userAddress, accessToken) : Promise.resolve([]),
    getAllCourses(),
  ]);

  return (
    <div className="py-10 space-y-12">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0B0E14]">
          Welcome
        </h1>
        <p className="mt-2 text-base text-slate-700 leading-relaxed">
          Let's get learning.
        </p>
      </div>

      {/* Continue Learning Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-mono text-xs font-bold tracking-widest text-slate-500 uppercase">
            Continue Learning
          </h2>
        </div>
        {enrolledCourses.length > 0 ? (
          <div className="flex gap-6 overflow-x-auto py-2 px-1 -mx-1 scrollbar-thin">
            {enrolledCourses.map((course, idx) => (
              <CourseCard
                key={course.id || course.course_id || idx}
                id={course.id || course.course_id}
                title={course.title}
                author={formatAuthor(course.creator_id, course.author)}
                description={course.description}
                src={course.image || DEFAULT_IMAGES[idx % DEFAULT_IMAGES.length]}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 border border-[#0B0E14] bg-white text-center">
            <div className="font-mono text-xs font-bold uppercase tracking-widest text-primary mb-2">
              0 Enrolled Courses
            </div>
            <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
              You haven't enrolled in any courses yet.
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
            {allCourses.map((course, idx) => (
              <CourseCard
                key={course.id || course.course_id || idx}
                id={course.id || course.course_id}
                title={course.title}
                author={formatAuthor(course.creator_id, course.author)}
                description={course.description}
                src={course.image || DEFAULT_IMAGES[idx % DEFAULT_IMAGES.length]}
              />
            ))}
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
    </div>
  );
}