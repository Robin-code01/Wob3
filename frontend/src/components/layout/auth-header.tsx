import Link from "next/link";
import { ConnectButtonCustom } from "@/features/auth/connect-button";

export default function AuthHeader() {
  return (
    <nav className="border-b bg-primary border-[#0B0E14] px-6 py-4">
      <div className="text-[#F8FAFC] max-w-6xl mx-auto flex justify-between items-center">
        <Link
          href="/home"
          className="font-mono font-bold text-2xl tracking-tight text-[#F8FAFC]"
        >
          NFTeach
        </Link>
        <div className="flex items-center gap-6 text-sm font-medium">
          <ConnectButtonCustom />
        </div>
      </div>
    </nav>
  );
}