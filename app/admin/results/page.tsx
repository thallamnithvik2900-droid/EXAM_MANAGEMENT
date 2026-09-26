"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Award, CheckCircle2, XCircle, BarChart, Percent } from "lucide-react";

export default function AdminResultsPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, []);

  async function fetchResults() {
    try {
      const res = await fetch("/api/admin/results");
      const data = await res.json();
      setResults(Array.isArray(data) ? data : []);
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
            <Award className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Exam Results Portal
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Student marks, percentage scores, pass/fail status, and accuracy evaluation.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-500">Loading results...</div>
        ) : results.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-500">
            No published results found.
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-medium">
                  <th className="p-4">Student</th>
                  <th className="p-4">Roll No</th>
                  <th className="p-4">Exam Title</th>
                  <th className="p-4">Subject</th>
                  <th className="p-4">Score</th>
                  <th className="p-4">Percentage</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {results.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-4 font-semibold text-slate-900 dark:text-white">
                      {r.studentName}
                    </td>
                    <td className="p-4 text-slate-500">{r.rollNumber}</td>
                    <td className="p-4 text-slate-700 dark:text-slate-300">{r.examTitle}</td>
                    <td className="p-4 text-slate-500">{r.subject}</td>
                    <td className="p-4 font-semibold text-slate-900 dark:text-white">
                      {r.score} / {r.maxScore}
                    </td>
                    <td className="p-4 font-bold text-indigo-600 dark:text-indigo-400">
                      {r.percentage}%
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          r.isPassed
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                            : "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400"
                        }`}
                      >
                        {r.isPassed ? "PASS" : "FAIL"}
                      </span>
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
