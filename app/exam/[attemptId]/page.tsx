"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Send,
  Loader2,
  Shield,
  Menu,
  X,
  RotateCcw,
  Check,
} from "lucide-react";
import { SanitizedQuestion, QuestionAnswerState, PaletteState } from "@/types";
import { formatDuration } from "@/lib/utils";

export default function OnlineExamRoom() {
  const router = useRouter();
  const params = useParams();
  const attemptId = params?.attemptId as string;

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [examData, setExamData] = useState<any>(null);
  const [questions, setQuestions] = useState<SanitizedQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, QuestionAnswerState>>({});
  const [visitedQuestions, setVisitedQuestions] = useState<Set<string>>(new Set());

  // Timer
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [timerAlert, setTimerAlert] = useState(false);

  // Auto-Save Status
  const [saveStatus, setSaveStatus] = useState<"IDLE" | "SAVING" | "SAVED" | "ERROR">("IDLE");

  // Modals
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoSubmittedAlert, setAutoSubmittedAlert] = useState(false);

  // Mobile drawer
  const [paletteOpen, setPaletteOpen] = useState(false);

  // Load Attempt Data
  useEffect(() => {
    async function loadAttempt() {
      try {
        setLoading(true);
        const res = await fetch(`/api/exam/${attemptId}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to load examination.");
        }

        if (data.status === "SUBMITTED" || data.status === "TIMED_OUT") {
          if (data.resultId) {
            router.replace(`/student/results/${data.resultId}`);
            return;
          }
        }

        setExamData(data);
        setQuestions(data.questions || []);
        setCurrentIndex(data.currentQuestionIndex || 0);
        setAnswers(data.savedAnswers || {});
        setRemainingSeconds(data.remainingSeconds || 0);

        // Mark first question visited
        if (data.questions && data.questions.length > 0) {
          const firstQId = data.questions[data.currentQuestionIndex || 0]?.id;
          if (firstQId) {
            setVisitedQuestions(new Set([firstQId]));
          }
        }
      } catch (err: any) {
        setError(err.message || "Could not load examination session");
      } finally {
        setLoading(false);
      }
    }

    if (attemptId) {
      loadAttempt();
    }
  }, [attemptId, router]);

  // Reliable Server-Validated Countdown Timer
  useEffect(() => {
    if (loading || remainingSeconds <= 0 || isSubmitting) return;

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          triggerAutoSubmit();
          return 0;
        }
        if (prev === 300) {
          setTimerAlert(true); // Alert 5 minutes remaining
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, remainingSeconds, isSubmitting]);

  // Mark current question as visited
  useEffect(() => {
    if (questions.length > 0 && questions[currentIndex]) {
      const qId = questions[currentIndex].id;
      setVisitedQuestions((prev) => new Set([...Array.from(prev), qId]));
    }
  }, [currentIndex, questions]);

  // Auto-Save Handler
  const autoSave = async (questionId: string, studentAnswer: string | null, isMarked: boolean) => {
    setSaveStatus("SAVING");
    try {
      const res = await fetch("/api/exam/save-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId,
          questionId,
          studentAnswer,
          isMarkedForReview: isMarked,
          currentQuestionIndex: currentIndex,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.isExpired || data.isLocked) {
          triggerAutoSubmit();
        }
        setSaveStatus("ERROR");
        return;
      }

      setSaveStatus("SAVED");
      setTimeout(() => setSaveStatus("IDLE"), 2500);
    } catch (err) {
      console.error("Auto-save failed", err);
      setSaveStatus("ERROR");
    }
  };

  // Answer modification
  const handleSelectAnswer = (newAnswer: string) => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    let finalAnswer = newAnswer;

    // If multiple choice MCQ, toggle checkbox
    if (currentQ.questionType === "MCQ_MULTIPLE") {
      const existing = answers[currentQ.id]?.studentAnswer;
      let arr: string[] = [];
      try {
        if (existing) arr = JSON.parse(existing);
      } catch {
        arr = [];
      }
      if (arr.includes(newAnswer)) {
        arr = arr.filter((x) => x !== newAnswer);
      } else {
        arr.push(newAnswer);
      }
      finalAnswer = JSON.stringify(arr);
    }

    const currentMarked = answers[currentQ.id]?.isMarkedForReview || false;

    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: {
        questionId: currentQ.id,
        studentAnswer: finalAnswer,
        isMarkedForReview: currentMarked,
        isAnswered: Boolean(finalAnswer && finalAnswer !== "[]"),
      },
    }));

    autoSave(currentQ.id, finalAnswer, currentMarked);
  };

  // Clear current response
  const handleClearResponse = () => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;
    const currentMarked = answers[currentQ.id]?.isMarkedForReview || false;

    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: {
        questionId: currentQ.id,
        studentAnswer: null,
        isMarkedForReview: currentMarked,
        isAnswered: false,
      },
    }));

    autoSave(currentQ.id, null, currentMarked);
  };

  // Toggle Mark for Review
  const handleToggleMarkForReview = () => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    const currentAns = answers[currentQ.id]?.studentAnswer ?? null;
    const currentMarked = answers[currentQ.id]?.isMarkedForReview || false;
    const newMarked = !currentMarked;

    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: {
        questionId: currentQ.id,
        studentAnswer: currentAns,
        isMarkedForReview: newMarked,
        isAnswered: Boolean(currentAns && currentAns !== "[]"),
      },
    }));

    autoSave(currentQ.id, currentAns, newMarked);
  };

  // Navigation
  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Submit Exam
  const submitExam = async (isAuto = false) => {
    setIsSubmitting(true);
    setShowSubmitModal(false);

    try {
      const res = await fetch("/api/exam/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId, autoSubmit: isAuto }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit examination.");
      }

      if (isAuto) {
        setAutoSubmittedAlert(true);
        setTimeout(() => {
          router.replace(`/student/results/${data.resultId}`);
        }, 3000);
      } else {
        router.replace(`/student/results/${data.resultId}`);
      }
    } catch (err: any) {
      setError(err.message || "Failed to submit exam");
      setIsSubmitting(false);
    }
  };

  const triggerAutoSubmit = () => {
    if (!isSubmitting) {
      submitExam(true);
    }
  };

  // Palette State Calculation
  const getPaletteState = (qId: string): PaletteState => {
    const ans = answers[qId];
    const isVisited = visitedQuestions.has(qId);
    const hasAnswer = Boolean(ans?.studentAnswer && ans.studentAnswer !== "[]");
    const isMarked = ans?.isMarkedForReview || false;

    if (hasAnswer && isMarked) return "ANSWERED_AND_MARKED";
    if (isMarked) return "MARKED_FOR_REVIEW";
    if (hasAnswer) return "ANSWERED";
    if (isVisited) return "NOT_ANSWERED";
    return "NOT_VISITED";
  };

  // Counts for summary
  const summaryCounts = {
    answered: Object.values(answers).filter((a) => a.studentAnswer && a.studentAnswer !== "[]" && !a.isMarkedForReview).length,
    answeredAndMarked: Object.values(answers).filter((a) => a.studentAnswer && a.studentAnswer !== "[]" && a.isMarkedForReview).length,
    marked: Object.values(answers).filter((a) => (!a.studentAnswer || a.studentAnswer === "[]") && a.isMarkedForReview).length,
    notAnswered: questions.filter((q) => {
      const state = getPaletteState(q.id);
      return state === "NOT_ANSWERED";
    }).length,
    notVisited: questions.filter((q) => !visitedQuestions.has(q.id)).length,
  };

  const totalAnsweredCount = summaryCounts.answered + summaryCounts.answeredAndMarked;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-4">
        <Loader2 className="w-10 h-10 text-indigo-400 animate-spin mb-4" />
        <h2 className="text-xl font-bold">Preparing Examination Room...</h2>
        <p className="text-slate-400 text-sm mt-1">Verifying credentials and loading encrypted questions.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md shadow-xl border border-slate-200 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900">Exam Access Notice</h2>
          <p className="text-slate-600 text-sm mt-2">{error}</p>
          <button
            onClick={() => router.push("/student/dashboard")}
            className="mt-6 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition"
          >
            Return to Student Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const currentAnswerState = currentQ ? answers[currentQ.id] : null;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col select-none">
      {/* 1. Header Bar */}
      <header className="h-16 bg-slate-900 text-white px-4 md:px-8 flex items-center justify-between shadow-md border-b border-slate-800 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm md:text-base font-bold tracking-tight text-white line-clamp-1">
              {examData?.examTitle}
            </h1>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>{examData?.examType?.replace("_", " ")}</span>
              <span>&bull;</span>
              <span>{questions.length} Questions</span>
              <span>&bull;</span>
              <span>{examData?.totalMarks} Marks</span>
            </div>
          </div>
        </div>

        {/* Center: Save Indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-xs font-mono">
          {saveStatus === "SAVING" && (
            <>
              <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              <span className="text-amber-400">Saving...</span>
            </>
          )}
          {saveStatus === "SAVED" && (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Saved ?</span>
            </>
          )}
          {saveStatus === "ERROR" && (
            <>
              <AlertCircle className="w-3.5 h-3.5 text-red-400" />
              <span className="text-red-400">Sync Error</span>
            </>
          )}
          {saveStatus === "IDLE" && <span className="text-slate-400">Auto-Save Active</span>}
        </div>

        {/* Right: Timer & Submit */}
        <div className="flex items-center gap-4">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono text-sm font-bold border transition ${
              remainingSeconds < 300
                ? "bg-red-950/80 border-red-500 text-red-400 animate-pulse"
                : "bg-slate-800 border-slate-700 text-emerald-400"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{formatDuration(remainingSeconds)}</span>
          </div>

          <button
            onClick={() => setShowSubmitModal(true)}
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs rounded-xl shadow-md transition"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit Exam</span>
          </button>

          {/* Mobile Palette Toggle */}
          <button
            onClick={() => setPaletteOpen(!paletteOpen)}
            className="md:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
          >
            {paletteOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* 2. Main Work Area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left: Question Area */}
        <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-y-auto p-4 md:p-8">
          {currentQ ? (
            <div className="max-w-4xl mx-auto w-full bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col flex-1">
              {/* Question Header */}
              <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70 rounded-t-2xl">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-lg bg-indigo-600 text-white font-bold text-sm">
                    Question {currentIndex + 1}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-200 text-slate-700">
                    {currentQ.topic}
                  </span>
                  {currentQ.difficulty && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded text-slate-500 border border-slate-300">
                      {currentQ.difficulty}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                    +{currentQ.marks} marks
                  </span>
                  {currentQ.negativeMarks > 0 && (
                    <span className="text-red-700 font-semibold bg-red-50 px-2 py-1 rounded border border-red-200">
                      -{currentQ.negativeMarks} marks
                    </span>
                  )}
                </div>
              </div>

              {/* Question Content */}
              <div className="p-6 md:p-8 flex-1">
                <div className="text-slate-900 text-base md:text-lg font-medium leading-relaxed mb-6">
                  {currentQ.questionText}
                </div>

                {/* Multiple Choice / True-False Options */}
                {currentQ.options && currentQ.options.length > 0 && (
                  <div className="space-y-3">
                    {currentQ.options.map((opt, idx) => {
                      const optLabel = String.fromCharCode(65 + idx); // A, B, C, D
                      const isMultiple = currentQ.questionType === "MCQ_MULTIPLE";

                      let isSelected = false;
                      if (isMultiple) {
                        try {
                          const arr = JSON.parse(currentAnswerState?.studentAnswer || "[]");
                          isSelected = arr.includes(opt);
                        } catch {
                          isSelected = false;
                        }
                      } else {
                        isSelected = currentAnswerState?.studentAnswer === opt;
                      }

                      return (
                        <div
                          key={idx}
                          onClick={() => handleSelectAnswer(opt)}
                          className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${
                            isSelected
                              ? "border-indigo-600 bg-indigo-50/70 shadow-sm"
                              : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition ${
                              isSelected
                                ? "bg-indigo-600 text-white"
                                : "border border-slate-300 text-slate-500 bg-white"
                            }`}
                          >
                            {optLabel}
                          </div>
                          <div className="text-sm md:text-base text-slate-800 flex-1 pt-0.5">
                            {opt}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Numerical Input Question */}
                {currentQ.questionType === "NUMERICAL" && (
                  <div className="mt-4 p-6 bg-slate-50 rounded-xl border border-slate-200">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Enter Numerical Value:
                    </label>
                    <input
                      type="number"
                      step="any"
                      placeholder="e.g. 64"
                      value={currentAnswerState?.studentAnswer || ""}
                      onChange={(e) => handleSelectAnswer(e.target.value)}
                      className="w-full max-w-xs px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-lg font-mono font-bold text-slate-900 focus:outline-none focus:border-indigo-600 transition"
                    />
                    <p className="text-xs text-slate-500 mt-2">
                      Enter the exact numerical answer. Decimal or integers accepted.
                    </p>
                  </div>
                )}
              </div>

              {/* Navigation & Action Footer */}
              <div className="p-4 md:p-6 border-t border-slate-200 bg-slate-50/90 rounded-b-2xl flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleMarkForReview}
                    className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl border transition ${
                      currentAnswerState?.isMarkedForReview
                        ? "bg-purple-600 border-purple-600 text-white shadow-sm"
                        : "bg-white border-slate-300 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>
                      {currentAnswerState?.isMarkedForReview
                        ? "Marked for Review ?"
                        : "Mark for Review"}
                    </span>
                  </button>

                  {currentAnswerState?.isAnswered && (
                    <button
                      onClick={handleClearResponse}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Clear Response</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  {currentIndex < questions.length - 1 ? (
                    <button
                      onClick={handleNext}
                      className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-sm transition"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowSubmitModal(true)}
                      className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Review & Submit</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-500 py-12">No questions available.</div>
          )}
        </div>

        {/* Right: Question Palette (Desktop sidebar & Mobile drawer) */}
        <div
          className={`fixed md:static inset-y-0 right-0 z-50 md:z-auto w-80 bg-white border-l border-slate-200 flex flex-col shadow-xl md:shadow-none transition-transform duration-200 ${
            paletteOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"
          }`}
        >
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div>
              <h2 className="font-bold text-sm text-slate-900">Question Palette</h2>
              <span className="text-xs text-slate-500">{questions.length} Total Questions</span>
            </div>
            <button
              onClick={() => setPaletteOpen(false)}
              className="md:hidden p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Palette Legend */}
          <div className="p-4 border-b border-slate-100 text-[11px] grid grid-cols-2 gap-2 bg-white">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-emerald-600 text-white flex items-center justify-center font-bold text-[9px]">
                {summaryCounts.answered}
              </span>
              <span className="text-slate-600">Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-amber-500 text-white flex items-center justify-center font-bold text-[9px]">
                {summaryCounts.notAnswered}
              </span>
              <span className="text-slate-600">Not Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-purple-600 text-white flex items-center justify-center font-bold text-[9px]">
                {summaryCounts.marked}
              </span>
              <span className="text-slate-600">Marked for Review</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-purple-700 border-2 border-emerald-400 text-white flex items-center justify-center font-bold text-[9px]">
                {summaryCounts.answeredAndMarked}
              </span>
              <span className="text-slate-600">Answered & Marked</span>
            </div>
            <div className="flex items-center gap-2 col-span-2">
              <span className="w-4 h-4 rounded bg-slate-100 border border-slate-300 text-slate-500 flex items-center justify-center font-bold text-[9px]">
                {summaryCounts.notVisited}
              </span>
              <span className="text-slate-600">Not Visited</span>
            </div>
          </div>

          {/* Grid of Question Numbers */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-5 gap-2.5">
              {questions.map((q, idx) => {
                const state = getPaletteState(q.id);
                const isCurrent = idx === currentIndex;

                let stateClass = "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200";

                if (state === "ANSWERED") {
                  stateClass = "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm";
                } else if (state === "NOT_ANSWERED") {
                  stateClass = "bg-amber-500 text-white hover:bg-amber-600";
                } else if (state === "MARKED_FOR_REVIEW") {
                  stateClass = "bg-purple-600 text-white hover:bg-purple-700";
                } else if (state === "ANSWERED_AND_MARKED") {
                  stateClass = "bg-purple-700 text-white border-2 border-emerald-400 font-extrabold";
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setPaletteOpen(false);
                    }}
                    className={`h-10 rounded-xl font-bold text-xs flex items-center justify-center transition relative ${stateClass} ${
                      isCurrent ? "ring-2 ring-offset-2 ring-indigo-600 scale-105" : ""
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mobile Submit Bottom */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 md:hidden">
            <button
              onClick={() => {
                setPaletteOpen(false);
                setShowSubmitModal(true);
              }}
              className="w-full py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Submit Examination</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Confirmation Submission Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                <Send className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Confirm Exam Submission</h3>
              <p className="text-xs text-slate-500 mt-1">
                Please review your answer status before final submission.
              </p>
            </div>

            {/* Breakdown Table */}
            <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-200 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Total Questions:</span>
                <span className="font-bold text-slate-900">{questions.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-emerald-700 font-medium">Answered:</span>
                <span className="font-bold text-emerald-700">{totalAnsweredCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-amber-700 font-medium">Not Answered:</span>
                <span className="font-bold text-amber-700">
                  {questions.length - totalAnsweredCount}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-purple-700 font-medium">Marked for Review:</span>
                <span className="font-bold text-purple-700">
                  {summaryCounts.marked + summaryCounts.answeredAndMarked}
                </span>
              </div>
            </div>

            <div className="text-xs text-slate-500 text-center mb-6">
              Are you sure you want to finalize and submit your exam? You cannot modify answers after submission.
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
              >
                Return to Exam
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => submitExam(false)}
                className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md flex items-center justify-center gap-2 transition"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Grading...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Yes, Submit Exam</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Auto-Submitted Notification Modal */}
      {autoSubmittedAlert && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center border border-slate-200 animate-in fade-in zoom-in duration-300">
            <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Time Has Expired</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Your allotted time has finished. Your answers have been automatically saved and submitted securely.
            </p>
            <div className="mt-5 flex items-center justify-center gap-2 text-indigo-600 text-xs font-medium">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating performance analytics...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
