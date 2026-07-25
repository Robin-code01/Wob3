interface QuizDetailProps {
  children: React.ReactNode;
}

export default function QuizBox({ children }: QuizDetailProps) {
  return (
    <div className="w-2xl bg-red-400 py-6 px-6 rounded-xl">{children}</div>
  );
}