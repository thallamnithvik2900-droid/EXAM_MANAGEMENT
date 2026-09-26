"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ClipboardCheck, ShieldCheck, CheckCircle2, XCircle, Clock, AlertTriangle, Building2, Calendar, Loader2 } from "lucide-react";
import { formatDate, formatDateTime } from "@/lib/utils";

export default function StudentAttendancePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    async function loadAttendance() {
      try {
        const res = await fetch("/api/student/attendance");
        const json = await res.json();
        if (res.ok) setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadAttendance();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
          <p className="text-slate-600 font-medium">Loading your exam attendance records...</p>
        </div>
      </DashboardLayout>
    );
  }

  const { student, stats, records } = data || {};

  const filteredRecords = (records || []).filter((r: any) => {
    if (filter === "ALL") return true;
    if (filter === "CONFIRMED") return r.isConfirmed;
    return r.status === filter;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <ClipboardCheck className="w-7 h-7 text-indigo-600" />
              My Examination Attendance Record
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Live candidate attendance logs and official invigilator verification badges for all scheduled exams.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
            {["ALL", "CONFIRMED", "PRESENT", "ABSENT", "LATE"].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  filter === tab
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Attendance Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
            <span className="text-xs text-slate-400 font-semibold uppercase block">Exams Scheduled</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">{stats?.totalExams || 0}</span>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
            <span className="text-xs text-slate-400 font-semibold uppercase block">Present</span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block">{stats?.presentCount || 0}</span>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
            <span className="text-xs text-slate-400 font-semibold uppercase block">Absent / Late</span>
            <span className="text-2xl font-black text-rose-600 mt-1 block">{(stats?.absentCount || 0) + (stats?.lateCount || 0)}</span>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
            <span className="text-xs text-slate-400 font-semibold uppercase block">Confirmed Verifications</span>
            <span className="text-2xl font-black text-indigo-600 mt-1 block">{stats?.confirmedCount || 0}</span>
          </div>
        </div>

        {/* Records Table / List */}
        {filteredRecords.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 text-sm">
            No attendance records found matching current filter.
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium text-xs">
                  <th className="p-4">Exam & Subject</th>
                  <th className="p-4">Date & Time</th>
                  <th className="p-4">Hall & Seat</th>
                  <th className="p-4">Attendance Status</th>
                  <th className="p-4">Invigilator Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((r: any) => (
                  <tr key={r.scheduleId} className="hover:bg-slate-50/60 transition">
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{r.examTitle}</div>
                      <div className="text-xs text-slate-500 font-mono">{r.subject} ({r.subjectCode})</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-slate-800">{formatDate(r.date)}</div>
                      <div className="text-xs text-slate-500 font-mono">{r.startTime} - {r.endTime}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-800">{r.hallName} ({r.hallCode})</div>
                      <div className="text-xs text-indigo-600 font-mono font-bold">Seat: {r.seatNumber}</div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          r.status === "PRESENT"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : r.status === "ABSENT"
                            ? "bg-rose-100 text-rose-800 border border-rose-200"
                            : r.status === "LATE"
                            ? "bg-amber-100 text-amber-800 border border-amber-200"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                      >
                        {r.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="p-4">
                      {r.isConfirmed ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-300">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          Confirmed by Invigilator
                        </span>
                      ) : r.status !== "NOT_MARKED" ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          Pending Verification
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Not Marked Yet</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
