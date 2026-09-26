"use client";
import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Users, UserCog, FileSpreadsheet, Building2, Award, Calendar, ClipboardCheck, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function AdminDashboard() {
  const [d, setD] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard-stats").then(r => r.json()).then(setD).finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardLayout><div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-10 h-10 text-indigo-600 animate-spin" /></div></DashboardLayout>;

  const cards = [
    { label: "Students", value: d?.studentCount || 0, icon: Users, color: "text-indigo-600 bg-indigo-50" },
    { label: "Faculty", value: d?.facultyCount || 0, icon: UserCog, color: "text-blue-600 bg-blue-50" },
    { label: "Total Exams", value: d?.examCount || 0, icon: FileSpreadsheet, color: "text-emerald-600 bg-emerald-50" },
    { label: "Confirmed Attendance", value: d?.confirmedAttendanceCount || 0, icon: ClipboardCheck, color: "text-amber-600 bg-amber-50" },
    { label: "Halls", value: d?.hallCount || 0, icon: Building2, color: "text-purple-600 bg-purple-50" },
    { label: "Completed Attempts", value: d?.attemptCount || 0, icon: Award, color: "text-rose-600 bg-rose-50" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-xs text-slate-500">Overview of the ExamSecure Portal system.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {cards.map(c => (
            <div key={c.label} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className={`w-10 h-10 rounded-xl ${c.color} flex items-center justify-center mb-3`}>
                <c.icon className="w-5 h-5" />
              </div>
              <div className="text-2xl font-black text-slate-900">{c.value}</div>
              <div className="text-xs text-slate-500 font-medium">{c.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Calendar className="w-4 h-4 text-indigo-600" /> Upcoming Schedules</h3>
            <div className="space-y-3">
              {(d?.upcomingSchedules || []).map((s: any) => (
                <div key={s.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-slate-800">{s.examTitle}</div>
                    <div className="text-xs text-slate-500">{s.subject} &bull; {s.hallName}</div>
                  </div>
                  <div className="text-xs text-slate-600 font-mono">{formatDate(s.date)}<br/>{s.startTime}</div>
                </div>
              ))}
              {(!d?.upcomingSchedules || d.upcomingSchedules.length === 0) && <p className="text-xs text-slate-400 text-center py-4">No upcoming schedules.</p>}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Award className="w-4 h-4 text-emerald-600" /> Recent Results</h3>
            <div className="space-y-3">
              {(d?.recentResults || []).map((r: any) => (
                <div key={r.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-slate-800">{r.studentName}</div>
                    <div className="text-xs text-slate-500">{r.examTitle}</div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-sm text-slate-900">{r.score}/{r.maxScore}</span>
                    <span className={`ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${r.isPassed ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                      {r.percentage}%
                    </span>
                  </div>
                </div>
              ))}
              {(!d?.recentResults || d.recentResults.length === 0) && <p className="text-xs text-slate-400 text-center py-4">No results yet.</p>}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
