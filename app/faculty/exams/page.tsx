"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { FileSpreadsheet, Clock, CheckCircle } from "lucide-react";

export default function FacultyExamsPage() {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/faculty/dashboard-data")
      .then((r) => r.json())
      .then((d) => setExams(d.exams || []))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileSpreadsheet className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Assigned Exams & Course Schedules
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Overview of course exams assigned to your department.
          </p>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-500">Loading exams...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {exams.map((e) => (
              <div
                key={e.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-3"
              >
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded">
                    {e.code}
                  </span>
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded">
                    {e.isPublished ? "PUBLISHED" : "DRAFT"}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{e.title}</h3>
                <p className="text-xs text-slate-500">Subject: {e.subject}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
