import Image, { StaticImageData } from "next/image";
import Link from "next/link";

type CourseCardProps = {
  course_id?: string | number;
  id?: string | number;
  src?: StaticImageData | string;
  title: string;
  author: string;
  description: string;
  actionText?: string;
  isCompleted?: boolean;
};

export default function CourseCard({
  course_id,
  id,
  src,
  title,
  author,
  description,
  actionText = "Start Learning →",
  isCompleted = false,
}: CourseCardProps) {
  function truncateText(str: string, maxLength: number) {
    if (str.length > maxLength) {
      return str.substring(0, maxLength) + "...";
    }
    return str;
  }
  const truncatedDescription = truncateText(description, 65);

  // Safely resolve the ID so we never navigate to /courses/undefined
  const resolvedId = course_id ?? id;

  const cardContent = (
    <div className="group relative flex flex-col bg-white border border-[#0B0E14] w-72 h-64 overflow-hidden hover:cursor-pointer transition-all hover:-translate-y-1 shrink-0">
      {/* Completed Badge Indicator */}
      {isCompleted && (
        <div className="absolute top-2 right-2 z-10 font-mono text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-600 px-2 py-0.5 shadow-sm">
          Completed ✓
        </div>
      )}

      {/* Image / Header Container */}
      <div className="relative w-full h-36 bg-slate-100 overflow-hidden border-b border-[#0B0E14]">
        {src ? (
          <Image
            src={src}
            alt={title}
            fill
            unoptimized={typeof src === "string" && src.startsWith("http")}
            className="object-cover group-hover:scale-105 group-hover:brightness-75 transition duration-300"
          />
        ) : (
          <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-500 font-mono text-xs font-semibold">
            <span>[ NO IMAGE ]</span>
          </div>
        )}
      </div>

      {/* Card Content Body */}
      <div className="p-4 flex flex-col justify-between flex-1 bg-white group-hover:opacity-10 transition duration-300">
        <div>
          <div className="flex items-baseline justify-between gap-2 mb-1.5">
            <h3 className="font-bold text-base text-[#0B0E14] truncate">{title}</h3>
            <span className="font-mono text-[11px] text-slate-500 shrink-0">{author}</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
            {truncatedDescription}
          </p>
        </div>
      </div>

      {/* Sharp Hover Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 bg-[#0B0E14] p-5 text-center">
        <p className="text-[#F8FAFC] font-bold text-base leading-tight mb-3">
          {title}
        </p>
        <span className="font-mono text-xs text-[#F8FAFC] border border-[#F8FAFC] px-3 py-1.5 font-semibold uppercase tracking-wider group-hover:bg-[#F8FAFC] group-hover:text-[#0B0E14] transition-colors">
          {actionText}
        </span>
      </div>
    </div>
  );

  if (resolvedId !== undefined && resolvedId !== null) {
    return <Link href={`/courses/${resolvedId}`}>{cardContent}</Link>;
  }

  return cardContent;
}