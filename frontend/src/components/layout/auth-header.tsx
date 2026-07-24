import Link from "next/link";

export default function AuthHeader() {
  return (
    <header className="bg-primary py-4 px-8">
      <Link href="/" className="text-background text-2xl">
        [ N A M E ]
      </Link>
    </header>
  );
}
