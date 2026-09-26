"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ShieldAlert, Plus, UserCheck, Calendar, Building2 } from "lucide-react";

export default function AdminInvigilatorsPage() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();
  }, []);

  async function fetchAssignments() {
    try {
      const res = await fetch("/api/admin/invigilators");
      const data = await res.json();
      setAssignments(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
              Invigilator Duty Assignments
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Supervise examination hall proctoring duties and faculty invigilator schedules.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-500">Loading assignments...</div>
        ) : assignments.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-500">
            No invigilator duty assignments found.
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-medium">
                  <th className="p-4">Invigilator Name</th>
                  <th className="p-4">Emp ID</th>
                  <th className="p-4">Assigned Hall</th>
                  <th className="p-4">Exam Title</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {assignments.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-4 font-semibold text-slate-900 dark:text-white">
                      {a.facultyName}
                    </td>
                    <td className="p-4 text-slate-500">{a.employeeId}</td>
                    <td className="p-4 font-medium text-indigo-600 dark:text-indigo-400">
                      {a.hallName}
                    </td>
                    <td className="p-4 text-slate-700 dark:text-slate-300">{a.examTitle}</td>
                    <td className="p-4 text-slate-500">{new Date(a.date).toLocaleDateString()}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 rounded-full text-xs font-semibold">
                        {a.status}
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
