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

    // YouTube match (watch, embed, shorts, youtu.be)
    const ytMatch = url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/i
    );
    if (ytMatch && ytMatch[1]) {
      return `https://www.youtube.com/embed/${ytMatch[1]}`;
    }

    // Vimeo match
    const vimeoMatch = url.match(
      /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)/i
    );
    if (vimeoMatch && vimeoMatch[1]) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }

    // Loom match
    const loomMatch = url.match(/loom\.com\/share\/([\w-]+)/i);
    if (loomMatch && loomMatch[1]) {
      return `https://www.loom.com/embed/${loomMatch[1]}`;
    }

    return null;
  };

  const embedUrl = getEmbedUrl(videoUrl);

  return (
    <div className="flex flex-col gap-4 text-white">
      {(title || description) && (
        <div className="flex flex-col gap-1">
          {title && (
            <h3 className="text-xl font-bold tracking-wide">{title}</h3>
          )}
          {description && (
            <p className="text-sm text-white/80">{description}</p>
          )}
        </div>
      )}

      <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-primary/50 bg-black/40 shadow-inner flex items-center justify-center">
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
          <div className="font-mono text-xs text-white/60 p-4 text-center">
            [ Video player unavailable or URL missing ]
          </div>
        )}
      </div>
    </div>
  );
}