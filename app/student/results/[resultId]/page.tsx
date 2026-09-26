"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  BarChart3,
  BookOpen,
  ArrowLeft,
  Printer,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Loader2,
  FileText,
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { formatDuration, formatDateTime } from "@/lib/utils";

export default function ResultPage() {
  const params = useParams();
  const router = useRouter();
  const resultId = params?.resultId as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedSolutions, setExpandedSolutions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function fetchResult() {
      try {
        setLoading(true);
        const res = await fetch(`/api/exam/result/${resultId}`);
        const resultData = await res.json();
        if (!res.ok) {
          throw new Error(resultData.error || "Failed to load result.");
        }
        setData(resultData);
      } catch (err: any) {
        setError(err.message || "Failed to retrieve results");
      } finally {
        setLoading(false);
      }
    }

    if (resultId) {
      fetchResult();
    }
  }, [resultId]);

  const toggleSolution = (qId: string) => {
    setExpandedSolutions((prev) => ({
      ...prev,
      [qId]: !prev[qId],
    }));
  };

  const expandAll = () => {
    if (!data?.solutions) return;
    const next: Record<string, boolean> = {};
    data.solutions.forEach((s: any) => {
      next[s.id] = true;
    });
    setExpandedSolutions(next);
  };

  const collapseAll = () => {
    setExpandedSolutions({});
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
          <p className="text-slate-600 font-medium">Compiling examination report & analytics...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !data) {
    return (
      <DashboardLayout>
        <div className="max-w-md mx-auto bg-white rounded-2xl p-8 shadow-sm border border-slate-200 text-center mt-12">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900">Result Not Accessible</h2>
          <p className="text-sm text-slate-600 mt-2">{error || "The requested result could not be located."}</p>
          <Link
            href="/student/dashboard"
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const topicEntries = Object.entries(data.topicWise || {});

  return (
    <DashboardLayout>
      <div className="space-y-8 print:p-0">
        {/* Navigation & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 no-print">
          <Link
            href="/student/dashboard"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Print Scorecard</span>
          </button>
        </div>

        {/* 1. Score Summary Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-indigo-200 border border-white/10 mb-3">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Performance Evaluation Report</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                {data.exam.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 mt-2">
                <span>Code: {data.exam.code}</span>
                <span>&bull;</span>
                <span>Student: {data.student.name} ({data.student.rollNumber})</span>
                <span>&bull;</span>
                <span>Completed: {formatDateTime(data.generatedAt)}</span>
              </div>
            </div>

            {/* Score Pill Card */}
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/15">
              <div className="text-right">
                <div className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
                  {data.score} <span className="text-lg font-normal text-slate-300">/ {data.maxScore}</span>
                </div>
                <div className="text-xs font-semibold uppercase tracking-wider text-indigo-300 mt-0.5">
                  Percentage: {data.percentage}%
                </div>
              </div>

              <div
                className={`px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider border ${
                  data.isPassed
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                    : "bg-red-500/20 text-red-300 border-red-500/40"
                }`}
              >
                {data.isPassed ? "PASSED" : "NEEDS IMPROVEMENT"}
              </div>
            </div>
          </div>
        </div>

        {/* 2. Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Correct Answers
            </div>
            <div className="text-2xl font-bold text-emerald-600 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6" />
              <span>{data.correctCount}</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Wrong Answers
            </div>
            <div className="text-2xl font-bold text-red-600 flex items-center gap-2">
              <XCircle className="w-6 h-6" />
              <span>{data.wrongCount}</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Unanswered
            </div>
            <div className="text-2xl font-bold text-slate-600 flex items-center gap-2">
              <HelpCircle className="w-6 h-6" />
              <span>{data.unansweredCount}</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Accuracy
            </div>
            <div className="text-2xl font-bold text-indigo-600 flex items-center gap-2">
              <BarChart3 className="w-6 h-6" />
              <span>{data.accuracy}%</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm col-span-2 md:col-span-1">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Time Taken
            </div>
            <div className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Clock className="w-6 h-6 text-slate-500" />
              <span>{formatDuration(data.timeTakenSeconds || 0)}</span>
            </div>
          </div>
        </div>

        {/* 3. Topic-Wise Performance Mastery */}
        {topicEntries.length > 0 && (
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Topic-wise Performance Mastery</h2>
                <p className="text-xs text-slate-500">Breakdown of accuracy and mastery per topic module</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topicEntries.map(([topic, stats]: [string, any]) => {
                const topicPercentage = stats.maxMarks > 0
                  ? Math.round((stats.marks / stats.maxMarks) * 100)
                  : 0;

                return (
                  <div key={topic} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm text-slate-800">{topic}</span>
                      <span className="text-xs font-bold text-indigo-600 font-mono">
                        {topicPercentage}% ({stats.correct}/{stats.total} correct)
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          topicPercentage >= 75
                            ? "bg-emerald-500"
                            : topicPercentage >= 50
                            ? "bg-amber-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${topicPercentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. Solution Review Section */}
        {data.canReviewSolutions && data.solutions && data.solutions.length > 0 && (
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Detailed Solution & Answer Review</h2>
                  <p className="text-xs text-slate-500">
                    Compare your chosen answer with verified model answers and comprehensive explanations.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 no-print">
                <button
                  onClick={expandAll}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                >
                  Expand All
                </button>
                <button
                  onClick={collapseAll}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                >
                  Collapse All
                </button>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              {data.solutions.map((sol: any) => {
                const isOpen = expandedSolutions[sol.id] ?? true;

                return (
                  <div
                    key={sol.id}
                    className={`rounded-2xl border transition ${
                      sol.isCorrect
                        ? "border-emerald-200 bg-emerald-50/20"
                        : sol.isAnswered
                        ? "border-red-200 bg-red-50/20"
                        : "border-slate-200 bg-slate-50/40"
                    }`}
                  >
                    {/* Header bar */}
                    <div
                      onClick={() => toggleSolution(sol.id)}
                      className="p-4 flex items-center justify-between cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                            sol.isCorrect
                              ? "bg-emerald-600 text-white"
                              : sol.isAnswered
                              ? "bg-red-600 text-white"
                              : "bg-slate-300 text-slate-700"
                          }`}
                        >
                          {sol.questionNumber}
                        </span>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-200/80 text-slate-700">
                            {sol.topic}
                          </span>
                          <span className="text-xs text-slate-500 hidden sm:inline">
                            Marks: {sol.marksAwarded} / {sol.maxMarks}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                            sol.isCorrect
                              ? "bg-emerald-100 text-emerald-800"
                              : sol.isAnswered
                              ? "bg-red-100 text-red-800"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {sol.isCorrect
                            ? "Correct ?"
                            : sol.isAnswered
                            ? "Incorrect ?"
                            : "Unanswered"}
                        </span>
                        {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </div>
                    </div>

                    {/* Collapsible Content */}
                    {isOpen && (
                      <div className="p-5 pt-0 space-y-4 text-sm">
                        <div className="text-slate-900 font-medium leading-relaxed bg-white p-4 rounded-xl border border-slate-200">
                          {sol.questionText}
                        </div>

                        {/* Options if present */}
                        {sol.options && sol.options.length > 0 && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                            {sol.options.map((opt: string, optIdx: number) => {
                              const isStudentPick = sol.studentAnswer === opt || (sol.studentAnswer && sol.studentAnswer.includes(opt));
                              const isCorrectPick = sol.correctAnswer === opt || (sol.correctAnswer && sol.correctAnswer.includes(opt));

                              let optBorder = "border-slate-200 bg-white";
                              if (isCorrectPick) {
                                optBorder = "border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold";
                              } else if (isStudentPick && !sol.isCorrect) {
                                optBorder = "border-red-400 bg-red-50 text-red-900";
                              }

                              return (
                                <div key={optIdx} className={`p-3 rounded-xl border ${optBorder} flex items-center justify-between`}>
                                  <span>{opt}</span>
                                  <div className="flex items-center gap-1.5 font-bold">
                                    {isCorrectPick && <span className="text-emerald-700 text-[11px]">Correct Model Answer ?</span>}
                                    {isStudentPick && !isCorrectPick && <span className="text-red-600 text-[11px]">Your Choice ?</span>}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Comparison Summary */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div className="p-3 bg-slate-100 rounded-xl">
                            <span className="font-semibold text-slate-500 block mb-1">Your Answer:</span>
                            <span className="font-mono text-slate-800">
                              {sol.studentAnswer ? String(sol.studentAnswer) : "(No answer provided)"}
                            </span>
                          </div>

                          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                            <span className="font-semibold text-emerald-800 block mb-1">Official Correct Answer:</span>
                            <span className="font-mono font-bold text-emerald-900">
                              {String(sol.correctAnswer)}
                            </span>
                          </div>
                        </div>

                        {/* Explanation Box */}
                        {sol.explanation && (
                          <div className="p-4 bg-indigo-50/70 rounded-xl border border-indigo-100 text-xs leading-relaxed text-indigo-950">
                            <span className="font-bold text-indigo-800 block mb-1">Detailed Explanation:</span>
                            {sol.explanation}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
