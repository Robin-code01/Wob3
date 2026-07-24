import Link from "next/link";

export default function AuthHeader() {
  return (
    <header className="bg-primary py-4 px-8">
      <Link href="/home" className="text-background text-2xl">
        NFTeach
      </Link>
    </header>
  );
}
