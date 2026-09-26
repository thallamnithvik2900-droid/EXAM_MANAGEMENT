"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { BookOpen, FileQuestion, FileSpreadsheet, Award, Users, Plus, ClipboardCheck } from "lucide-react";
import Link from "next/link";

export default function FacultyDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/faculty/dashboard-data")
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Faculty Portal & Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Welcome, {data?.faculty?.name || "Professor"}. Department: {data?.faculty?.department || "Academic Department"}
          </p>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-500">Loading dashboard...</div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
                <span className="text-xs text-slate-400 font-semibold uppercase">Assigned Subjects</span>
                <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">
                  {data?.subjects?.length || 0}
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
                <span className="text-xs text-slate-400 font-semibold uppercase">Question Items</span>
                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
                  {data?.questionCount || 0}
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
                <span className="text-xs text-slate-400 font-semibold uppercase">Active Exams</span>
                <p className="text-3xl font-bold text-amber-600 dark:text-amber-400 mt-2">
                  {data?.exams?.length || 0}
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
                <span className="text-xs text-slate-400 font-semibold uppercase">Confirmed Attendance</span>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">
                  {data?.attendanceStats?.confirmed || 0}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-4">
              <Link
                href="/faculty/questions"
                className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition"
              >
                <Plus className="w-4 h-4" /> Add Questions to Bank
              </Link>
              <Link
                href="/faculty/exams"
                className="flex items-center gap-2 px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-semibold transition"
              >
                View Assigned Exams
              </Link>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
