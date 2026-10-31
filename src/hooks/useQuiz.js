import { useState, useCallback } from 'react';
import { soundFX } from '../utils/audio';

export function useQuiz(quizData, onQuizFinish) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);

  const totalQuestions = quizData?.questions?.length || 0;
  const currentQuestion = quizData?.questions?.[currentQuestionIndex] || null;

  const selectOption = useCallback(
    (index) => {
      if (isSubmitted) return;
      soundFX.playClick();
      setSelectedOption(index);
    },
    [isSubmitted]
  );

  const submitAnswer = useCallback(() => {
    if (selectedOption === null || isSubmitted || !currentQuestion) return;

    const isCorrect = selectedOption === currentQuestion.correctIndex;
    if (isCorrect) {
      soundFX.playCorrect();
    } else {
      soundFX.playIncorrect();
    }

    setIsSubmitted(true);
    setAnswers((prev) => [
      ...prev,
      {
        questionId: currentQuestion.id,
        questionIndex: currentQuestionIndex,
        selectedOption,
        correctIndex: currentQuestion.correctIndex,
        isCorrect,
      },
    ]);
  }, [selectedOption, isSubmitted, currentQuestion, currentQuestionIndex]);

  const nextQuestion = useCallback(() => {
    soundFX.playClick();
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
    } else {
      // Quiz finished
      setIsCompleted(true);
      const correctCount = answers.filter((a) => a.isCorrect).length + (selectedOption === currentQuestion?.correctIndex ? 0 : 0);
      if (onQuizFinish) {
        onQuizFinish(correctCount, totalQuestions);
      }
    }
  }, [currentQuestionIndex, totalQuestions, answers, selectedOption, currentQuestion, onQuizFinish]);

  const toggleReviewMode = useCallback(() => {
    soundFX.playClick();
    setReviewMode((prev) => !prev);
  }, []);

  const restartQuiz = useCallback(() => {
    soundFX.playClick();
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsSubmitted(false);
    setAnswers([]);
    setIsCompleted(false);
    setReviewMode(false);
  }, []);

  const score = answers.filter((a) => a.isCorrect).length;

  return {
    currentQuestionIndex,
    currentQuestion,
    totalQuestions,
    selectedOption,
    isSubmitted,
    answers,
    isCompleted,
    reviewMode,
    score,
    selectOption,
    submitAnswer,
    nextQuestion,
    toggleReviewMode,
    restartQuiz,
  };
}
