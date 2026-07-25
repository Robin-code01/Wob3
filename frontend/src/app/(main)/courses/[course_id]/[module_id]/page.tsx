"use client";

import QuizBox from "@/features/quiz/quiz-box";
import QuizQuestion from "@/features/quiz/multiple-choice";
import FillInTheBlankQuestion from "@/features/quiz/fill-in-the-blank";
import VideoPlayerSection from "@/features/video/video";
import TextLessonSection from "@/features/info/information-panel";

export default function QuizPage() {
  const sampleOptions = [
    { id: "1", text: "React / Next.js" },
    { id: "2", text: "Vue / Nuxt" },
    { id: "3", text: "Angular" },
    { id: "4", text: "SvelteKit" },
  ];

  const lessonParagraphs = [
    "Smart contracts are self-executing contracts with the terms of the agreement directly written into lines of code. They run on blockchain networks like Ethereum, ensuring transparency and security.",
    "Once deployed, a smart contract cannot be altered or tampered with. This creates trust between parties without needing a centralized middleman like a bank or escrow service.",
  ];

  const takeaways = [
    {
      title: "Immutable",
      description: "Code cannot be changed once deployed to the blockchain.",
    },
    {
      title: "Automated",
      description: "Executes automatically when predefined conditions are met.",
    },
  ];

  const handleAnswer = (option: { id: string | number; text: string }) => {
    console.log("Selected answer:", option);
  };

  const handleAnswerChange = (userAnswer: string) => {
    console.log("Current answer:", userAnswer);
  };

  return (
    <>
      <QuizBox>
        <QuizQuestion
          question="Which framework are you using for this project?"
          options={sampleOptions}
          onSelectOption={handleAnswer}
        />
      </QuizBox>
      <QuizBox>
        <FillInTheBlankQuestion
          question="Next.js App Router uses Server Components by ___."
          placeholder="e.g. default"
          onAnswerSubmit={handleAnswerChange}
        />
      </QuizBox>
      {/*I need to remember to make the answers get sent to the DB after every check of a question. Or if the answer is going to be sent all at once, the answers should be stored in a list and manipulated to be correctly stored in DB. What do you think?*/}
      <QuizBox>
        <VideoPlayerSection
          title="Lesson 1: Introduction to Web3 & Smart Contracts"
          description="Watch this short introduction before taking the module quiz below."
          videoUrl="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        />
      </QuizBox>
      <QuizBox>
        <TextLessonSection
          title="Understanding Smart Contracts"
          subtitle="Module 1 — Core Web3 Foundations"
          content={lessonParagraphs}
          keyPoints={takeaways}
          calloutNote="Always test your smart contract logic on a local testnet before deploying to mainnet, as gas fees are non-refundable."
        />
      </QuizBox>
    </>
  );
}
