"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ClipboardCheck, CheckCircle2, XCircle, AlertTriangle, ShieldCheck, Lock, Unlock, Loader2 } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export default function InvigilatorAttendancePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [confirmingScheduleId, setConfirmingScheduleId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const res = await fetch("/api/invigilator/dashboard-data");
      const d = await res.json();
      setData(d);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function markStatus(scheduleId: string, studentId: string, status: string) {
    setUpdatingId(studentId);
    try {
      await fetch("/api/invigilator/mark-attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examScheduleId: scheduleId, studentId, status }),
      });
      fetchData();
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  }

  async function toggleConfirmAttendance(scheduleId: string, hallId: string, isConfirmed: boolean) {
    setConfirmingScheduleId(scheduleId);
    try {
      const res = await fetch("/api/invigilator/confirm-attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examScheduleId: scheduleId, hallId, isConfirmed }),
      });
      const resJson = await res.json();
      if (!res.ok) {
        alert(resJson.error || "Failed to update attendance confirmation status");
        return;
      }
      fetchData();
    } catch (e: any) {
      alert(e.message || "Failed to confirm attendance");
    } finally {
      setConfirmingScheduleId(null);
    }
  }

  return (
    <DashboardLayout>
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ClipboardCheck className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Live Candidate Attendance & Verification
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Mark student attendance status in real time and confirm to lock and broadcast to Student & Admin portals.
          </p>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-500 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
            <span>Loading hall candidate list...</span>
          </div>
        ) : (
          <div className="space-y-8">
            {data?.assignments?.map((assignment: any) => {
              const stats = assignment.stats || {};
              const isConfirmed = assignment.isConfirmed;

              return (
                <div
                  key={assignment.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6"
                >
                  {/* Hall Header & Confirm Bar */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                          {assignment.hallName} ({assignment.hallCode})
                        </h3>
                        {isConfirmed ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Confirmed by Invigilator
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200">
                            <Lock className="w-3 h-3" />
                            Pending Confirmation
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Exam: <span className="font-semibold text-slate-700 dark:text-slate-300">{assignment.examTitle}</span> &bull; Subject: {assignment.subject}
                      </p>
                      {isConfirmed && assignment.confirmedAt && (
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                          Confirmed on: {formatDateTime(assignment.confirmedAt)}
                        </p>
                      )}
                    </div>

                    {/* Stats & Confirm Action Button */}
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded font-bold">{stats.present || 0} Present</span>
                        <span className="px-2 py-1 bg-rose-100 text-rose-800 rounded font-bold">{stats.absent || 0} Absent</span>
                        <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded font-bold">{stats.late || 0} Late</span>
                      </div>

                      {isConfirmed ? (
                        <button
                          onClick={() => toggleConfirmAttendance(assignment.scheduleId, assignment.hallId, false)}
                          disabled={confirmingScheduleId === assignment.scheduleId}
                          className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition border border-slate-300 dark:border-slate-600"
                        >
                          <Unlock className="w-3.5 h-3.5" />
                          <span>Unlock & Edit</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => toggleConfirmAttendance(assignment.scheduleId, assignment.hallId, true)}
                          disabled={confirmingScheduleId === assignment.scheduleId}
                          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition disabled:opacity-50"
                        >
                          {confirmingScheduleId === assignment.scheduleId ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Confirming...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Confirm Attendance</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Candidate List Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data?.allStudents?.map((student: any) => {
                      const existingAtt = assignment.attendance?.find(
                        (at: any) => at.studentId === student.id
                      );
                      const currentStatus = existingAtt ? existingAtt.status : "NOT_MARKED";

                      return (
                        <div
                          key={student.id}
                          className={`border p-4 rounded-xl space-y-3 transition ${
                            currentStatus === "PRESENT"
                              ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60"
                              : currentStatus === "ABSENT"
                              ? "bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/60"
                              : currentStatus === "LATE"
                              ? "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/60"
                              : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white text-sm">
                                {student.name}
                              </p>
                              <p className="text-xs text-slate-500 font-mono">{student.rollNumber}</p>
                            </div>
                            <span
                              className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                                currentStatus === "PRESENT"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : currentStatus === "ABSENT"
                                  ? "bg-rose-100 text-rose-800"
                                  : currentStatus === "LATE"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-slate-200 text-slate-700"
                              }`}
                            >
                              {currentStatus.replace("_", " ")}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 pt-1">
                            <button
                              onClick={() =>
                                markStatus(assignment.scheduleId, student.id, "PRESENT")
                              }
                              disabled={updatingId === student.id}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                                currentStatus === "PRESENT"
                                  ? "bg-emerald-600 text-white shadow-sm"
                                  : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                              }`}
                            >
                              Present
                            </button>
                            <button
                              onClick={() =>
                                markStatus(assignment.scheduleId, student.id, "ABSENT")
                              }
                              disabled={updatingId === student.id}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                                currentStatus === "ABSENT"
                                  ? "bg-rose-600 text-white shadow-sm"
                                  : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                              }`}
                            >
                              Absent
                            </button>
                            <button
                              onClick={() =>
                                markStatus(assignment.scheduleId, student.id, "LATE")
                              }
                              disabled={updatingId === student.id}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                                currentStatus === "LATE"
                                  ? "bg-amber-600 text-white shadow-sm"
                                  : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                              }`}
                            >
                              Late
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
