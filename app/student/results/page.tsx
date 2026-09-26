"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Award, CheckCircle2, XCircle, ArrowRight, Calendar, BarChart3, Loader2 } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export default function StudentResultsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadResults() {
      try {
        const res = await fetch("/api/student/dashboard-data");
        const json = await res.json();
        if (res.ok) setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadResults();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
          <p className="text-slate-600 font-medium">Fetching examination records...</p>
        </div>
      </DashboardLayout>
    );
  }

  const results = data?.recentResults || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Your Examination Results</h1>
          <p className="text-xs text-slate-500">
            Historical assessment scorecards, answer sheet reviews, and topic accuracy.
          </p>
        </div>

        {results.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map((r: any) => (
              <div
                key={r.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {r.subject}
                    </span>
                    <span
                      className={`text-xs font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                        r.isPassed
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-red-50 text-red-700 border-red-200"
                      }`}
                    >
                      {r.isPassed ? "Passed ?" : "Failed ?"}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-1">{r.examTitle}</h3>
                  <div className="text-xs text-slate-400 mb-4">{formatDateTime(r.date)}</div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 grid grid-cols-3 gap-2 text-center mb-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Score</span>
                      <span className="text-base font-extrabold text-slate-900">
                        {r.score} <span className="text-xs font-normal text-slate-500">/ {r.maxScore}</span>
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Percentage</span>
                      <span className="text-base font-extrabold text-indigo-600">{r.percentage}%</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Accuracy</span>
                      <span className="text-base font-extrabold text-emerald-600">{r.accuracy}%</span>
                    </div>
                  </div>
                </div>

                <Link
                  href={`/student/results/${r.id}`}
                  className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition"
                >
                  <span>View Full Scorecard & Explanations</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500">
            <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No Exams Completed Yet</h3>
            <p className="text-xs text-slate-500 mt-1 mb-6">
              You haven't completed any online examinations. Start a mock test to see detailed performance.
            </p>
            <Link
              href="/student/exams"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 transition"
            >
              Take Online Mock Test
            </Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
