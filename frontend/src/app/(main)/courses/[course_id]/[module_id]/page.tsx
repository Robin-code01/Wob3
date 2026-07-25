"use client";

import QuizBox from "@/features/quiz/quiz-box";
import QuizQuestion from "@/features/quiz/multiple-choice";

export default function QuizPage() {
  const sampleOptions = [
    { id: "1", text: "React / Next.js" },
    { id: "2", text: "Vue / Nuxt" },
    { id: "3", text: "Angular" },
    { id: "4", text: "SvelteKit" },
  ];

  const handleAnswer = (option: { id: string | number; text: string }) => {
    console.log("Selected answer:", option);
  };

  return (
    <QuizBox>
      <QuizQuestion
        question="Which framework are you using for this project?"
        options={sampleOptions}
        onSelectOption={handleAnswer}
      />
    </QuizBox>
  );
}
