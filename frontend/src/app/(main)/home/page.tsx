import CourseCard from "@/components/card/course-card";
import fish from "../../../../public/IMG_1096.jpeg";

export default function Home() {
  return (
    <CourseCard
      src={fish}
      title="COSC122"
      author="Daigo KItagawa"
      description="Joy to the world!"
    />
  );
}
