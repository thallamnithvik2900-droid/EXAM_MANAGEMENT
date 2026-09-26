"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Clock,
  Award,
  BookOpen,
  Calendar,
  Ticket,
  Bell,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  BarChart3,
  Building2,
  FileText,
  Loader2,
  ClipboardCheck,
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { formatDate, formatDateTime } from "@/lib/utils";

export default function StudentDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [startingExamId, setStartingExamId] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await fetch("/api/student/dashboard-data");
        const resData = await res.json();
        if (res.ok) {
          setData(resData);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const handleStartExam = async (examId: string) => {
    setStartingExamId(examId);
    try {
      const res = await fetch("/api/exam/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examId }),
      });

      const examSession = await res.json();
      if (!res.ok) {
        if (examSession.alreadySubmitted && examSession.resultId) {
          router.push(`/student/results/${examSession.resultId}`);
          return;
        }
        alert(examSession.error || "Unable to start exam session.");
        return;
      }

      router.push(`/exam/${examSession.attemptId}`);
    } catch (err: any) {
      alert(err.message || "Failed to launch exam");
    } finally {
      setStartingExamId(null);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
          <p className="text-slate-600 font-medium">Loading your student portal...</p>
        </div>
      </DashboardLayout>
    );
  }

  const { student, analytics, availableExams, scheduledExams, recentResults, notifications } = data || {};

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* 1. Welcome & Profile Banner */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-indigo-200 border border-white/10 mb-3">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Academic Session 2026</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                Welcome back, {student?.name}!
              </h1>
              <p className="text-sm text-indigo-200 mt-1">
                Roll No: <span className="font-mono font-bold text-white">{student?.rollNumber}</span> &bull;{" "}
                Semester {student?.semester} &bull; {student?.department}
              </p>
            </div>

            {/* Quick Analytics Counters */}
            <div className="flex items-center gap-3">
              <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 text-center">
                <div className="text-2xl font-black text-white">{analytics?.totalTaken || 0}</div>
                <div className="text-[10px] uppercase font-semibold text-indigo-200">Exams Taken</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 text-center">
                <div className="text-2xl font-black text-emerald-400">{analytics?.passedCount || 0}</div>
                <div className="text-[10px] uppercase font-semibold text-indigo-200">Passed</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 text-center">
                <div className="text-2xl font-black text-amber-300">{analytics?.avgPercentage || 0}%</div>
                <div className="text-[10px] uppercase font-semibold text-indigo-200">Avg Score</div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Quick Actions Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <Link
            href="/student/exams"
            className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-500 hover:shadow-md transition group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition">
              <Play className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800">Start Exam</div>
              <div className="text-[11px] text-slate-500">Live tests</div>
            </div>
          </Link>

          <Link
            href="/student/attendance"
            className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-500 hover:shadow-md transition group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800">Attendance</div>
              <div className="text-[11px] text-slate-500">Live verifications</div>
            </div>
          </Link>

          <Link
            href="/student/hall-tickets"
            className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-500 hover:shadow-md transition group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800">Hall Ticket</div>
              <div className="text-[11px] text-slate-500">Seats & admit card</div>
            </div>
          </Link>

          <Link
            href="/student/results"
            className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-500 hover:shadow-md transition group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800">Results</div>
              <div className="text-[11px] text-slate-500">Scores & solutions</div>
            </div>
          </Link>

          <Link
            href="/student/analytics"
            className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-500 hover:shadow-md transition group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800">Analytics</div>
              <div className="text-[11px] text-slate-500">Topic mastery</div>
            </div>
          </Link>
        </div>

        {/* 3. Primary Section: AVAILABLE ONLINE EXAMS (PRD CORE) */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Available Online Assessments</h2>
              <p className="text-xs text-slate-500">
                Active examinations ready for immediate attempt with server timer and auto-save.
              </p>
            </div>
            <Link
              href="/student/exams"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {availableExams && availableExams.length > 0 ? (
              availableExams.map((exam: any) => {
                const isCompleted = exam.attemptStatus === "SUBMITTED" || exam.attemptStatus === "TIMED_OUT";
                const isInProgress = exam.attemptStatus === "IN_PROGRESS";

                return (
                  <div
                    key={exam.id}
                    className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div>
                      {/* Badges */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {exam.subjectName}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500">
                          {exam.examType.replace("_", " ")}
                        </span>
                      </div>

                      <h3 className="font-bold text-base text-slate-900 leading-snug mb-2">
                        {exam.title}
                      </h3>

                      <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                        {exam.description || "Comprehensive test assessing core subject competencies."}
                      </p>

                      {/* Info Pills */}
                      <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 text-center mb-5">
                        <div>
                          <span className="text-[11px] text-slate-400 block">Questions</span>
                          <span className="text-xs font-bold text-slate-800">{exam.questionCount}</span>
                        </div>
                        <div>
                          <span className="text-[11px] text-slate-400 block">Duration</span>
                          <span className="text-xs font-bold text-slate-800">{exam.durationMinutes} Mins</span>
                        </div>
                        <div>
                          <span className="text-[11px] text-slate-400 block">Total Marks</span>
                          <span className="text-xs font-bold text-slate-800">{exam.totalMarks}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action button */}
                    <div>
                      {isCompleted ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200">
                            <span className="text-slate-500">Completed Score:</span>
                            <span className="font-bold text-slate-900">{exam.score} / {exam.totalMarks}</span>
                          </div>
                          <Link
                            href={`/student/results/${exam.resultId}`}
                            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition"
                          >
                            <Award className="w-4 h-4 text-indigo-600" />
                            <span>View Score & Solutions</span>
                          </Link>
                        </div>
                      ) : isInProgress ? (
                        <button
                          onClick={() => router.push(`/exam/${exam.attemptId}`)}
                          className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition"
                        >
                          <RotateCcw className="w-4 h-4" />
                          <span>Resume Active Exam</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStartExam(exam.id)}
                          disabled={startingExamId === exam.id}
                          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
                        >
                          {startingExamId === exam.id ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Starting...</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 fill-current" />
                              <span>START EXAM</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-3 text-center py-8 bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm">
                No active exams available at this moment.
              </div>
            )}
          </div>
        </div>

        {/* 4. Two-Column Row: Upcoming Scheduled Exams + Recent Results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Upcoming Scheduled Exams & Seating */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">Upcoming Scheduled Exams</h3>
                </div>
                <Link
                  href="/student/hall-tickets"
                  className="text-xs font-semibold text-purple-600 hover:text-purple-800"
                >
                  Hall Tickets &rarr;
                </Link>
              </div>

              <div className="space-y-3">
                {scheduledExams && scheduledExams.length > 0 ? (
                  scheduledExams.map((sch: any) => (
                    <div
                      key={sch.scheduleId}
                      className="p-4 rounded-2xl border border-slate-100 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-800">{sch.examTitle}</span>
                          {sch.isConfirmed ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Confirmed by Invigilator
                            </span>
                          ) : sch.attendanceStatus !== "NOT_MARKED" ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                              Marked ({sch.attendanceStatus})
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">
                              Pending Invigilator
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {sch.subject} &bull; {formatDate(sch.date)} ({sch.startTime} - {sch.endTime})
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center gap-2 justify-end mb-1">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                              sch.attendanceStatus === "PRESENT"
                                ? "bg-emerald-100 text-emerald-700"
                                : sch.attendanceStatus === "ABSENT"
                                ? "bg-rose-100 text-rose-700"
                                : sch.attendanceStatus === "LATE"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            Attendance: {sch.attendanceStatus.replace("_", " ")}
                          </span>
                        </div>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-100 text-purple-800 font-mono text-xs font-bold">
                          <Building2 className="w-3.5 h-3.5" />
                          <span>{sch.hallName}</span>
                        </span>
                        <div className="text-[11px] font-semibold text-slate-600 mt-1">
                          Seat: <span className="text-indigo-600 font-mono">{sch.seatNumber}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-slate-400 text-xs">
                    No offline scheduled exams currently queued.
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100">
              <Link
                href="/student/hall-tickets"
                className="w-full py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition"
              >
                <Ticket className="w-4 h-4" />
                <span>Download Official Hall Ticket / Admit Card</span>
              </Link>
            </div>
          </div>

          {/* Right: Recent Results & Performance */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Award className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">Recent Examination Results</h3>
                </div>
                <Link
                  href="/student/results"
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-800"
                >
                  All Results &rarr;
                </Link>
              </div>

              <div className="space-y-3">
                {recentResults && recentResults.length > 0 ? (
                  recentResults.map((r: any) => (
                    <Link
                      key={r.id}
                      href={`/student/results/${r.id}`}
                      className="p-4 rounded-2xl border border-slate-100 hover:border-emerald-300 bg-slate-50/70 flex items-center justify-between transition group"
                    >
                      <div>
                        <div className="font-bold text-sm text-slate-800 group-hover:text-indigo-600 transition">
                          {r.examTitle}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {r.subject} &bull; {formatDateTime(r.date)}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-bold text-slate-900">
                          {r.score} / {r.maxScore}
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            r.isPassed ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                          }`}
                        >
                          {r.percentage}% &bull; {r.isPassed ? "Pass" : "Fail"}
                        </span>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-6 text-slate-400 text-xs">
                    No results recorded yet. Complete an online exam to see results.
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100">
              <Link
                href="/student/analytics"
                className="w-full py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition"
              >
                <BarChart3 className="w-4 h-4" />
                <span>View Comprehensive Performance Analytics</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 5. Notifications Section */}
        {notifications && notifications.length > 0 && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Portal Announcements & Alerts</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {notifications.map((n: any) => (
                <div key={n.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-xs text-slate-800">{n.title}</span>
                    <span className="text-[10px] text-slate-400">{formatDateTime(n.createdAt)}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
