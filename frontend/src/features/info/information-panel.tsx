interface KeyPoint {
  title?: string;
  description: string;
}

interface TextLessonSectionProps {
  title?: string;
  subtitle?: string;
  content: string[];
  keyPoints?: KeyPoint[];
  calloutNote?: string;
}

export default function TextLessonSection({
  title,
  subtitle,
  content,
  keyPoints,
  calloutNote,
}: TextLessonSectionProps) {
  return (
    <div className="flex flex-col gap-5 text-[#0B0E14]">
      {/* Section Header */}
      {(title || subtitle) && (
        <div className="flex flex-col gap-1 border-b border-slate-200 pb-3">
          {subtitle && (
            <span className="font-mono text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {subtitle}
            </span>
          )}
          {title && (
            <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#0B0E14]">
              {title}
            </h3>
          )}
        </div>
      )}

      {/* Main Paragraphs */}
      <div className="flex flex-col gap-3 text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
        {content.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>

      {/* Key Takeaways / Bullet Points */}
      {keyPoints && keyPoints.length > 0 && (
        <div className="flex flex-col gap-3 mt-1">
          <h4 className="font-mono text-xs font-bold uppercase tracking-widest text-slate-500">
            Key Concepts
          </h4>
          <ul className="flex flex-col gap-2">
            {keyPoints.map((point, index) => (
              <li
                key={index}
                className="flex items-start gap-3 bg-slate-50 p-3.5 border border-slate-200 text-sm text-slate-800"
              >
                <span className="flex items-center justify-center w-5 h-5 bg-[#0B0E14] text-white font-mono text-xs font-bold shrink-0 mt-0.5">
                  ✓
                </span>
                <div>
                  {point.title && (
                    <span className="font-bold text-[#0B0E14] mr-1">
                      {point.title}:
                    </span>
                  )}
                  <span className="text-slate-700">{point.description}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Callout / Note Box */}
      {calloutNote && (
        <div className="bg-amber-50 text-slate-800 p-4 border border-amber-300 border-l-4 border-l-amber-500 flex gap-3 items-start mt-2 text-xs sm:text-sm">
          <span className="text-base">💡</span>
          <div className="leading-relaxed">
            <span className="font-bold text-[#0B0E14] block mb-0.5 font-mono text-xs uppercase tracking-wider">
              Important Note
            </span>
            {calloutNote}
          </div>
        </div>
      )}
    </div>
  );
}