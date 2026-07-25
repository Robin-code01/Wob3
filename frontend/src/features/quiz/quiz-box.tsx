interface QuizDetailProps {
  children: React.ReactNode;
}

export default function QuizBox({ children }: QuizDetailProps) {
  return (
    <div className="w-full max-w-2xl bg-white border border-[#0B0E14] p-6 sm:p-8 space-y-4">
      {children}
    </div>
  );
}