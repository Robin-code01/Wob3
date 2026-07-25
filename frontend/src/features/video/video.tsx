interface VideoPlayerSectionProps {
  title?: string;
  description?: string;
  videoUrl: string; // Accepts YouTube links or direct .mp4 links
}

export default function VideoPlayerSection({
  title,
  description,
  videoUrl,
}: VideoPlayerSectionProps) {
  // Helper to extract YouTube embed URL if a standard YouTube link is provided
  const getYouTubeEmbedUrl = (url: string) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11
      ? `https://www.youtube.com/embed/${match[2]}`
      : null;
  };

  const youtubeEmbedUrl = getYouTubeEmbedUrl(videoUrl);

  return (
    <div className="flex flex-col gap-4 text-white">
      {/* Optional Title & Description */}
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

      {/* Video Container (Aspect Ratio 16:9 with theme border & styling) */}
      <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-primary/50 bg-black/40 shadow-inner">
        {youtubeEmbedUrl ? (
          <iframe
            src={youtubeEmbedUrl}
            title={title || "Video player"}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <video src={videoUrl} controls className="w-full h-full object-cover">
            Your browser does not support the video tag.
          </video>
        )}
      </div>
    </div>
  );
}
