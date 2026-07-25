import QuizBox from "@/features/quiz/quiz-box";
import CreateQuizQuestion, {
  type CreatedQuestionPayload,
} from "@/features/quiz/create-multiple-choice";

export default function CreatorPage() {
  const handleSave = (questionData: CreatedQuestionPayload) => {
    console.log("Question created payload:", questionData);
    // Send to Django backend or local state here!
  };

  return (
    <QuizBox>
      <CreateQuizQuestion onSaveQuestion={handleSave} />
    </QuizBox>
  );
}
