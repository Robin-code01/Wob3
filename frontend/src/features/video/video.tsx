interface VideoPlayerSectionProps {
  title?: string;
  description?: string;
  videoUrl: string;
}

export default function VideoPlayerSection({
  title,
  description,
  videoUrl,
}: VideoPlayerSectionProps) {
  const getEmbedUrl = (url: string) => {
    if (!url) return null;

    const ytMatch = url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/i
    );
    if (ytMatch && ytMatch[1]) {
      return `https://www.youtube.com/embed/${ytMatch[1]}`;
    }

    const vimeoMatch = url.match(
      /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)/i
    );
    if (vimeoMatch && vimeoMatch[1]) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }

    const loomMatch = url.match(/loom\.com\/share\/([\w-]+)/i);
    if (loomMatch && loomMatch[1]) {
      return `https://www.loom.com/embed/${loomMatch[1]}`;
    }

    return null;
  };

  const embedUrl = getEmbedUrl(videoUrl);

  return (
    <div className="flex flex-col gap-4 text-[#0B0E14]">
      {(title || description) && (
        <div className="flex flex-col gap-1 border-b border-slate-200 pb-3">
          {title && (
            <h3 className="text-xl font-bold tracking-tight text-[#0B0E14]">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-slate-600">{description}</p>
          )}
        </div>
      )}

      <div className="relative w-full aspect-video border border-[#0B0E14] bg-slate-900 overflow-hidden flex items-center justify-center">
        {embedUrl ? (
          <iframe
            src={embedUrl}
            title={title || "Video player"}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : videoUrl ? (
          <video src={videoUrl} controls className="w-full h-full object-cover">
            Your browser does not support the video tag.
          </video>
        ) : (
          <div className="font-mono text-xs text-slate-500 bg-slate-100 w-full h-full p-4 flex items-center justify-center text-center">
            [ Video player unavailable or URL missing ]
          </div>
        )}
      </div>
    </div>
  );
}