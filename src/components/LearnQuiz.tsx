"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, RotateCcw, ChevronRight } from "lucide-react";

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface Props {
  quizId: string;
  questions: QuizQuestion[];
}

const PASS_THRESHOLD = 0.75;
const XP_REWARD = 25;
const STORAGE_PREFIX = "crys_quiz_completed_";

export default function LearnQuiz({ quizId, questions }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);
  const [awardingXp, setAwardingXp] = useState(false);
  const [xpAwarded, setXpAwarded] = useState(false);

  const storageKey = `${STORAGE_PREFIX}${quizId}`;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const val = localStorage.getItem(storageKey);
      if (val === "true") setAlreadyCompleted(true);
    }
  }, [storageKey]);

  const current = questions[currentIndex];
  const totalQuestions = questions.length;
  const progress = ((currentIndex) / totalQuestions) * 100;

  function handleAnswer(idx: number) {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(idx);
  }

  function handleNext() {
    if (selectedAnswer === null) return;
    const newAnswers = [...answers, selectedAnswer];
    if (currentIndex + 1 < totalQuestions) {
      setAnswers(newAnswers);
      setSelectedAnswer(null);
      setCurrentIndex((i) => i + 1);
    } else {
      setAnswers(newAnswers);
      setFinished(true);
    }
  }

  async function handleComplete(score: number) {
    const passed = score / totalQuestions >= PASS_THRESHOLD;
    if (!passed || alreadyCompleted) return;
    setAwardingXp(true);
    try {
      await fetch(`/api/user/quiz/${quizId}/complete`, {
        method: "POST",
        credentials: "include",
      });
      localStorage.setItem(storageKey, "true");
      setAlreadyCompleted(true);
      setXpAwarded(true);
    } catch {
      // silently fail — award is best-effort
    } finally {
      setAwardingXp(false);
    }
  }

  function handleReset() {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setAnswers([]);
    setFinished(false);
    setXpAwarded(false);
  }

  // Trigger XP call when quiz finishes for the first time
  useEffect(() => {
    if (finished) {
      const score = answers.filter((a, i) => a === questions[i].correct).length;
      handleComplete(score);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  if (finished) {
    const score = answers.filter((a, i) => a === questions[i].correct).length;
    const passed = score / totalQuestions >= PASS_THRESHOLD;

    return (
      <div
        style={{
          background: "#191f31",
          border: "1px solid #2e3447",
          borderRadius: "16px",
          padding: "28px",
          marginTop: "32px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        {/* Progress bar (filled) */}
        <div style={{ height: "2px", background: "#2e3447", borderRadius: "2px", overflow: "hidden" }}>
          <div style={{ height: "100%", width: "100%", background: "#4edea3", transition: "width 0.4s" }} />
        </div>

        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "40px", marginBottom: "8px" }}>{passed ? "🎉" : "📚"}</div>
          <div style={{ fontSize: "28px", fontWeight: "bold", color: "#dce1fb" }}>
            {score}/{totalQuestions} correct
          </div>
          <div style={{ fontSize: "14px", color: "#909097", marginTop: "4px" }}>
            {Math.round((score / totalQuestions) * 100)}% score
          </div>
        </div>

        {/* Pass / fail banner */}
        {passed ? (
          <div
            style={{
              background: "rgba(78,222,163,0.12)",
              border: "1px solid rgba(78,222,163,0.35)",
              borderRadius: "12px",
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <CheckCircle2 style={{ color: "#4edea3", flexShrink: 0 }} size={20} />
            <div>
              <div style={{ color: "#4edea3", fontWeight: "600", fontSize: "14px" }}>
                Quiz Passed!{" "}
                {!alreadyCompleted || xpAwarded ? `+${XP_REWARD} XP` : ""}
              </div>
              {alreadyCompleted && !xpAwarded && !awardingXp && (
                <div style={{ color: "#909097", fontSize: "12px", marginTop: "2px" }}>
                  Already completed — no XP awarded again.
                </div>
              )}
              {awardingXp && (
                <div style={{ color: "#909097", fontSize: "12px", marginTop: "2px" }}>
                  Awarding XP...
                </div>
              )}
            </div>
          </div>
        ) : (
          <div
            style={{
              background: "rgba(255,179,173,0.1)",
              border: "1px solid rgba(255,179,173,0.3)",
              borderRadius: "12px",
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <XCircle style={{ color: "#ffb3ad", flexShrink: 0 }} size={20} />
            <div style={{ color: "#ffb3ad", fontSize: "14px" }}>
              You need {Math.ceil(PASS_THRESHOLD * totalQuestions)}/{totalQuestions} to pass. Give it another go!
            </div>
          </div>
        )}

        {/* Result summary */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {questions.map((q, i) => {
            const correct = answers[i] === q.correct;
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  background: correct ? "rgba(78,222,163,0.07)" : "rgba(255,179,173,0.07)",
                  border: `1px solid ${correct ? "rgba(78,222,163,0.2)" : "rgba(255,179,173,0.2)"}`,
                }}
              >
                {correct
                  ? <CheckCircle2 size={15} style={{ color: "#4edea3", flexShrink: 0, marginTop: "1px" }} />
                  : <XCircle size={15} style={{ color: "#ffb3ad", flexShrink: 0, marginTop: "1px" }} />}
                <div style={{ fontSize: "12px", color: "#dce1fb", lineHeight: "1.5" }}>
                  <span style={{ fontWeight: "600" }}>Q{i + 1}:</span> {q.question}
                  {!correct && (
                    <div style={{ color: "#909097", marginTop: "2px" }}>
                      Correct: <span style={{ color: "#4edea3" }}>{q.options[q.correct]}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={handleReset}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "9px 18px",
              borderRadius: "8px",
              background: "rgba(140,205,255,0.1)",
              border: "1px solid rgba(140,205,255,0.25)",
              color: "#8ccdff",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            <RotateCcw size={14} />
            {passed ? "Retake" : "Try Again"}
          </button>
        </div>
      </div>
    );
  }

  // Active quiz
  return (
    <div
      style={{
        background: "#191f31",
        border: "1px solid #2e3447",
        borderRadius: "16px",
        padding: "28px",
        marginTop: "32px",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "11px", fontWeight: "600", color: "#8ccdff", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Knowledge Check
          </span>
          {alreadyCompleted && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "11px",
                fontWeight: "600",
                color: "#4edea3",
                background: "rgba(78,222,163,0.12)",
                border: "1px solid rgba(78,222,163,0.3)",
                borderRadius: "99px",
                padding: "2px 10px",
              }}
            >
              <CheckCircle2 size={12} />
              Completed
            </span>
          )}
          <span style={{ fontSize: "12px", color: "#909097" }}>
            {currentIndex + 1} / {totalQuestions}
          </span>
        </div>

        {/* Progress bar */}
        <div style={{ height: "2px", background: "#2e3447", borderRadius: "2px", overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              background: "#8ccdff",
              transition: "width 0.3s ease",
              borderRadius: "2px",
            }}
          />
        </div>
      </div>

      {/* Question */}
      <div style={{ fontSize: "15px", fontWeight: "600", color: "#dce1fb", lineHeight: "1.5" }}>
        {current.question}
      </div>

      {/* Options */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {current.options.map((option, idx) => {
          const isSelected = selectedAnswer === idx;
          const isCorrect = idx === current.correct;
          const answered = selectedAnswer !== null;

          let bg = "#0c1324";
          let border = "#2e3447";
          let color = "#dce1fb";

          if (answered) {
            if (isCorrect) {
              bg = "rgba(78,222,163,0.15)";
              border = "#4edea3";
              color = "#4edea3";
            } else if (isSelected && !isCorrect) {
              bg = "rgba(255,179,173,0.15)";
              border = "#ffb3ad";
              color = "#ffb3ad";
            } else {
              bg = "#0c1324";
              border = "#2e3447";
              color = "#909097";
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleAnswer(idx)}
              disabled={answered}
              style={{
                background: bg,
                border: `1px solid ${border}`,
                borderRadius: "10px",
                padding: "12px 16px",
                textAlign: "left",
                color,
                fontSize: "13px",
                fontWeight: isSelected || (answered && isCorrect) ? "600" : "400",
                cursor: answered ? "default" : "pointer",
                transition: "background 0.15s, border-color 0.15s, color 0.15s",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <span
                style={{
                  width: "22px",
                  height: "22px",
                  borderRadius: "50%",
                  border: `1px solid ${border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "11px",
                  fontWeight: "700",
                  flexShrink: 0,
                  background: answered && isCorrect ? "#4edea3" : answered && isSelected ? "#ffb3ad" : "transparent",
                  color: answered && (isCorrect || isSelected) ? "#0b1222" : color,
                }}
              >
                {String.fromCharCode(65 + idx)}
              </span>
              {option}
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {selectedAnswer !== null && (
        <div
          style={{
            background: "rgba(140,205,255,0.07)",
            border: "1px solid rgba(140,205,255,0.2)",
            borderRadius: "10px",
            padding: "12px 16px",
            fontSize: "13px",
            color: "#dce1fb",
            lineHeight: "1.6",
          }}
        >
          <span style={{ color: "#8ccdff", fontWeight: "600" }}>Explanation: </span>
          {current.explanation}
        </div>
      )}

      {/* Next button */}
      {selectedAnswer !== null && (
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={handleNext}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "9px 20px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #8ccdff, #004e7c)",
              border: "none",
              color: "#fff",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            {currentIndex + 1 === totalQuestions ? "See Results" : "Next"}
            <ChevronRight size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
