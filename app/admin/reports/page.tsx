"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { BarChart3, TrendingUp, Users, CheckCircle2, XCircle } from "lucide-react";

export default function AdminReportsPage() {
  const [reports, setReports] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  async function fetchReports() {
    try {
      const res = await fetch("/api/admin/reports");
      const data = await res.json();
      setReports(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Analytics & Comprehensive Reports
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Subject-wise pass percentages, candidate attempt distribution, and performance metrics.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-500">Loading analytics...</div>
        ) : !reports ? (
          <div className="text-center py-12 text-slate-500">No report data available.</div>
        ) : (
          <div className="space-y-6">
            {/* Stat Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl">
                <span className="text-xs text-slate-400 uppercase font-semibold">Total Evaluated</span>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {reports.totalResults} Candidates
                </p>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl">
                <span className="text-xs text-emerald-500 uppercase font-semibold">Passed</span>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  {reports.passCount}
                </p>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl">
                <span className="text-xs text-rose-500 uppercase font-semibold">Failed</span>
                <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">
                  {reports.failCount}
                </p>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl">
                <span className="text-xs text-indigo-500 uppercase font-semibold">Attendance Rate</span>
                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                  {reports.attendance?.total > 0
                    ? Math.round((reports.attendance.present / reports.attendance.total) * 100)
                    : 100}%
                </p>
              </div>
            </div>

            {/* Subject Stats */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="font-semibold text-slate-900 dark:text-white text-lg">
                Subject Performance Breakdown
              </h3>
              <div className="space-y-4">
                {reports.subjectStats?.map((s: any) => (
                  <div key={s.subject} className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-slate-800 dark:text-slate-200">{s.subject}</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                        Avg: {s.avgPercentage}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden flex">
                      <div
                        style={{ width: `${s.avgPercentage}%` }}
                        className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
