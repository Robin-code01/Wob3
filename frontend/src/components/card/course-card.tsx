import Image, { StaticImageData } from "next/image";

type CourseCardProps = {
  src?: StaticImageData;
  title: string;
  author: string;
  description: string;
};

export default function CourseCard({
  src,
  title,
  author,
  description,
}: CourseCardProps) {
  function truncateText(str: string, maxLength: number) {
    if (str.length > maxLength) {
      return str.substring(0, maxLength) + "...";
    }
    return str;
  }
  const truncatedDescription = truncateText(description, 60);
  return (
    <div className="group relative flex flex-col rounded-xl shadow-sm bg-background max-w-75 h-53 hover:cursor-pointer">
      <div className="flex">
        {src ? (
          <Image
            src={src}
            alt="Course card"
            width={300}
            className="object-cover rounded-xl group-hover:brightness-65 transition"
          />
        ) : (
          <div className="bg-gray-500 justify-center items-center text-background rounded-t-xl text-center text-xl">
            <p className="">No Image</p>
          </div>
        )}
      </div>
      <div className="absolute top-[65%] left-3 group-hover:opacity-0 transition">
        <div className=" flex gap-4 items-center mb-1">
          <h2 className="text-2xl text-gray-300">{title}</h2>
          <i className="text-gray-400">{author}</i>
        </div>
        <p className="text-sm text-gray-400">{truncatedDescription}</p>
      </div>
      <div className="absolute top-[55%] left-[50%] translate-x-[-50%] translate-y-[-50%] opacity-0 group-hover:opacity-100 transition">
        <p className="text-gray-300 text-2xl">Go to {title}</p>
      </div>
    </div>
  );
}
