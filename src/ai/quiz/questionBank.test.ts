import { describe, expect, it } from "vitest";
import { parseQuizQuestion, pickQuestions, QUESTION_BANK, QUIZ_TOPICS } from "./questionBank";

const valid = {
  question: "What is diversification?",
  options: ["One stock", "Spreading across sectors", "Cash only", "Timing the market"],
  correctIndex: 1,
  explanation: "Spreading money reduces the impact of one bad investment.",
};

describe("question bank", () => {
  it("has 12 valid questions with a topic from the allowed set", () => {
    expect(QUESTION_BANK).toHaveLength(12);
    for (const q of QUESTION_BANK) {
      expect(q.options).toHaveLength(4);
      expect(q.correctIndex).toBeGreaterThanOrEqual(0);
      expect(q.correctIndex).toBeLessThan(4);
      expect(QUIZ_TOPICS).toContain(q.topic);
      expect(q.explanation.length).toBeGreaterThan(10);
    }
  });

  it("picks 5 unique questions, preferring the requested topic", () => {
    const picked = pickQuestions(5, ["crash", "diversification"]);
    expect(picked).toHaveLength(5);
    expect(new Set(picked.map((q) => q.id)).size).toBe(5);
    expect(picked[0].topic === "crash" || picked[0].topic === "diversification").toBe(true);
  });
});

describe("parseQuizQuestion", () => {
  it("accepts a valid model question", () => {
    expect(parseQuizQuestion({ ...valid, topic: "crash" })).toMatchObject({
      question: valid.question,
      correctIndex: 1,
      topic: "crash",
    });
  });

  it("rejects malformed or malicious shapes", () => {
    expect(parseQuizQuestion(null)).toBeNull();
    expect(parseQuizQuestion("hi")).toBeNull();
    expect(parseQuizQuestion({ ...valid, options: ["a", "b", "c"] })).toBeNull();
    expect(parseQuizQuestion({ ...valid, options: ["same", "same", "b", "c"] })).toBeNull();
    expect(parseQuizQuestion({ ...valid, correctIndex: 4 })).toBeNull();
    expect(parseQuizQuestion({ ...valid, correctIndex: "1" })).toBeNull();
    expect(parseQuizQuestion({ ...valid, question: "" })).toBeNull();
    expect(parseQuizQuestion({ ...valid, options: ["a", "b", "c", 42] })).toBeNull();
    expect(parseQuizQuestion({ ...valid, explanation: undefined })).toBeNull();
  });
});
