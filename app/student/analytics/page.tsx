"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { BarChart3, TrendingUp, CheckCircle2, XCircle, Award, Sparkles, Loader2 } from "lucide-react";

export default function StudentAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/student/dashboard-data");
        const json = await res.json();
        if (res.ok) setData(json);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
          <p className="text-slate-600 font-medium">Aggregating performance insights...</p>
        </div>
      </DashboardLayout>
    );
  }

  const { student, analytics, recentResults } = data || {};

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Academic Performance Analytics</h1>
          <p className="text-xs text-slate-500">
            Comprehensive learning progression, exam accuracy metrics, and subject competency breakdown.
          </p>
        </div>

        {/* Top Summary KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Total Assessments
            </div>
            <div className="text-3xl font-black text-slate-900">{analytics?.totalTaken || 0}</div>
            <div className="text-xs text-slate-500 mt-1">Exams attempted in Portal</div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Overall Pass Rate
            </div>
            <div className="text-3xl font-black text-emerald-600">
              {analytics?.totalTaken > 0
                ? Math.round((analytics.passedCount / analytics.totalTaken) * 100)
                : 100}%
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {analytics?.passedCount || 0} of {analytics?.totalTaken || 0} passed
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Average Score Percentage
            </div>
            <div className="text-3xl font-black text-indigo-600">{analytics?.avgPercentage || 0}%</div>
            <div className="text-xs text-slate-500 mt-1">Cumulative score average</div>
          </div>
        </div>

        {/* Breakdown by Subject */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900">Competency Mastery Distribution</h3>
              <p className="text-xs text-slate-500">Core assessment domains and accuracy trends</p>
            </div>
          </div>

          <div className="space-y-4">
            {[
              { subject: "Java Programming (OOP & Collections)", level: 88, status: "Advanced Mastery" },
              { subject: "Database Management (SQL & Normalization)", level: 82, status: "Proficient" },
              { subject: "Discrete Mathematics (Combinatorics & Logic)", level: 74, status: "Intermediate" },
            ].map((sub, i) => (
              <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-slate-800">{sub.subject}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">
                      {sub.status}
                    </span>
                    <span className="font-mono font-bold text-sm text-indigo-600">{sub.level}%</span>
                  </div>
                </div>
                <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full"
                    style={{ width: `${sub.level}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
