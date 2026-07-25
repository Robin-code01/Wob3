interface KeyPoint {
  title?: string;
  description: string;
}

interface TextLessonSectionProps {
  title?: string;
  subtitle?: string;
  content: string[]; // Pass paragraphs as an array of strings
  keyPoints?: KeyPoint[]; // Optional bullet points/takeaways
  calloutNote?: string; // Optional highlighted tip or warning box
}

export default function TextLessonSection({
  title,
  subtitle,
  content,
  keyPoints,
  calloutNote,
}: TextLessonSectionProps) {
  return (
    <div className="flex flex-col gap-5 text-white">
      {/* Section Header */}
      {title && (
        <div className="flex flex-col gap-1 border-b border-primary/40 pb-3">
          <h3 className="text-2xl font-bold tracking-wide">{title}</h3>
          {subtitle && <p className="text-sm text-white/80">{subtitle}</p>}
        </div>
      )}

      {/* Main Paragraphs */}
      <div className="flex flex-col gap-3 text-base text-white/90 leading-relaxed font-normal">
        {content.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>

      {/* Key Takeaways / Bullet Points */}
      {keyPoints && keyPoints.length > 0 && (
        <div className="flex flex-col gap-2 mt-1">
          <h4 className="text-sm uppercase font-bold tracking-wider text-teal-200">
            Key Concepts
          </h4>
          <ul className="flex flex-col gap-2">
            {keyPoints.map((point, index) => (
              <li
                key={index}
                className="flex items-start gap-3 bg-primary/40 p-3 rounded-lg border border-primary/40"
              >
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white text-slate-900 text-xs font-bold shrink-0 mt-0.5">
                  ✓
                </span>
                <div className="text-sm">
                  {point.title && (
                    <span className="font-semibold text-white mr-1">
                      {point.title}:
                    </span>
                  )}
                  <span className="text-white/85">{point.description}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Callout / Note Box */}
      {calloutNote && (
        <div className="bg-white text-slate-900 p-4 rounded-lg shadow-md flex gap-3 items-start border-l-4 border-teal-300 mt-2">
          <span className="text-xl">💡</span>
          <div className="text-sm font-medium leading-snug">
            <span className="font-bold block mb-0.5">Important Note:</span>
            {calloutNote}
          </div>
        </div>
      )}
    </div>
  );
}