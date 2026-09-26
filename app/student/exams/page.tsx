"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Clock, Play, Award, CheckCircle2, RotateCcw, Loader2, BookOpen, Filter } from "lucide-react";

export default function StudentExamsPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("ALL");
  const [startingId, setStartingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchExams() {
      try {
        const res = await fetch("/api/student/dashboard-data");
        const json = await res.json();
        if (res.ok) setData(json);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchExams();
  }, []);

  const handleStartExam = async (examId: string) => {
    setStartingId(examId);
    try {
      const res = await fetch("/api/exam/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examId }),
      });

      const json = await res.json();
      if (!res.ok) {
        if (json.alreadySubmitted && json.resultId) {
          router.push(`/student/results/${json.resultId}`);
          return;
        }
        alert(json.error || "Failed to start exam");
        return;
      }

      router.push(`/exam/${json.attemptId}`);
    } catch (err: any) {
      alert(err.message || "Failed to launch exam");
    } finally {
      setStartingId(null);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
          <p className="text-slate-600 font-medium">Loading examination catalog...</p>
        </div>
      </DashboardLayout>
    );
  }

  const exams = (data?.availableExams || []).filter((ex: any) => {
    if (filterType === "ALL") return true;
    return ex.examType === filterType;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Available Online Examinations</h1>
            <p className="text-xs text-slate-500">
              Take official and practice assessments with server-verified timing and live auto-save.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
            {["ALL", "ONLINE_OBJECTIVE", "MID_TERM", "PRACTICE_TEST"].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  filterType === t
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {t === "ALL" ? "All Tests" : t.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Exams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam: any) => {
            const isCompleted = exam.attemptStatus === "SUBMITTED" || exam.attemptStatus === "TIMED_OUT";
            const isInProgress = exam.attemptStatus === "IN_PROGRESS";

            return (
              <div
                key={exam.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {exam.subjectName}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {exam.examType.replace("_", " ")}
                    </span>
                  </div>

                  <h3 className="font-bold text-lg text-slate-900 mb-2 leading-snug">{exam.title}</h3>
                  <p className="text-xs text-slate-600 mb-5 leading-relaxed line-clamp-3">
                    {exam.description || "Official assessment."}
                  </p>

                  <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 text-center mb-5">
                    <div>
                      <span className="text-[11px] text-slate-400 block">Questions</span>
                      <span className="text-xs font-bold text-slate-800">{exam.questionCount}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block">Duration</span>
                      <span className="text-xs font-bold text-slate-800">{exam.durationMinutes}m</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block">Max Marks</span>
                      <span className="text-xs font-bold text-slate-800">{exam.totalMarks}</span>
                    </div>
                  </div>
                </div>

                <div>
                  {isCompleted ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs px-3 py-2 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200">
                        <span className="font-semibold">Completed Score:</span>
                        <span className="font-bold">{exam.score} / {exam.totalMarks}</span>
                      </div>
                      <Link
                        href={`/student/results/${exam.resultId}`}
                        className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition"
                      >
                        <Award className="w-4 h-4 text-indigo-600" />
                        <span>Review Solutions</span>
                      </Link>
                    </div>
                  ) : isInProgress ? (
                    <button
                      onClick={() => router.push(`/exam/${exam.attemptId}`)}
                      className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Resume Active Attempt</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStartExam(exam.id)}
                      disabled={startingId === exam.id}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition disabled:opacity-50"
                    >
                      {startingId === exam.id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Preparing Room...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-current" />
                          <span>START EXAMINATION</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
