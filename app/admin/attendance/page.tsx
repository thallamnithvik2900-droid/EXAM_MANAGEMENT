"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ClipboardCheck, CheckCircle2, XCircle, Clock, AlertTriangle, ShieldCheck, Lock, Filter } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export default function AdminAttendancePage() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState("ALL");

  useEffect(() => {
    fetchAttendance();
  }, []);

  async function fetchAttendance() {
    try {
      const res = await fetch("/api/admin/attendance");
      const data = await res.json();
      setRecords(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function toggleConfirm(attendanceId: string, isConfirmed: boolean) {
    try {
      await fetch("/api/admin/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendanceId, isConfirmed }),
      });
      fetchAttendance();
    } catch (e) {
      console.error(e);
    }
  }

  const filteredRecords = records.filter((r) => {
    if (filterTab === "ALL") return true;
    if (filterTab === "CONFIRMED") return r.isConfirmed;
    if (filterTab === "PENDING") return !r.isConfirmed;
    return r.status === filterTab;
  });

  return (
    <DashboardLayout>
      <div className="p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ClipboardCheck className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
              Examination Attendance Verification
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Real-time candidate attendance records, malpractice logs, and invigilator verifications.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            {["ALL", "CONFIRMED", "PENDING", "PRESENT", "ABSENT"].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  filterTab === tab
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-500">Loading attendance logs...</div>
        ) : filteredRecords.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-500">
            No attendance records found for selected filter.
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-medium text-xs">
                  <th className="p-4">Student Name</th>
                  <th className="p-4">Roll Number</th>
                  <th className="p-4">Exam & Hall</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Invigilator Verification</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-4 font-semibold text-slate-900 dark:text-white">
                      {r.studentName}
                    </td>
                    <td className="p-4 text-slate-500 font-mono">{r.rollNumber}</td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{r.examTitle}</div>
                      <div className="text-xs text-slate-500">Hall: {r.hallName}</div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          r.status === "PRESENT"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                            : r.status === "ABSENT"
                            ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="p-4">
                      {r.isConfirmed ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          Confirmed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 rounded-lg border border-amber-200">
                          <Lock className="w-3 h-3 text-amber-600" />
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => toggleConfirm(r.id, !r.isConfirmed)}
                        className="text-xs font-semibold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition"
                      >
                        {r.isConfirmed ? "Mark Pending" : "Confirm"}
                      </button>
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
