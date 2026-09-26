"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ShieldAlert, Building2, ClipboardCheck, Calendar } from "lucide-react";
import Link from "next/link";

export default function InvigilatorDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/invigilator/dashboard-data")
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Invigilator Proctoring Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Supervise examination halls, candidate seat placement, and live attendance logging.
          </p>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-500">Loading duty assignments...</div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data?.assignments?.map((a: any) => (
                <div
                  key={a.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded">
                      {a.hallCode}
                    </span>
                    {a.isConfirmed ? (
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-2.5 py-1 rounded border border-emerald-300">
                        ✓ CONFIRMED
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded border border-amber-200">
                        {a.status}
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{a.hallName}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">Exam: {a.examTitle}</p>
                  <p className="text-xs text-slate-500">Subject: {a.subject}</p>

                  {/* Attendance Stats Pills */}
                  <div className="flex items-center gap-2 pt-1 text-xs">
                    <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded font-semibold border border-emerald-200">
                      {a.stats?.present || 0} Present
                    </span>
                    <span className="px-2 py-0.5 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 rounded font-semibold border border-rose-200">
                      {a.stats?.absent || 0} Absent
                    </span>
                    <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 rounded font-semibold border border-amber-200">
                      {a.stats?.late || 0} Late
                    </span>
                  </div>

                  <div className="pt-2 flex flex-wrap gap-2">
                    <Link
                      href="/invigilator/attendance"
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition"
                    >
                      {a.isConfirmed ? "View Attendance" : "Mark & Confirm Attendance"}
                    </Link>
                    <Link
                      href="/invigilator/seating"
                      className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                    >
                      Seating Map
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
