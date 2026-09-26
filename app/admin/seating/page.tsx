"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Grid, Sparkles, User, RefreshCw, Layers } from "lucide-react";

export default function AdminSeatingPage() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState("");
  const [allocations, setAllocations] = useState<any[]>([]);
  const [scheduleInfo, setScheduleInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchSchedules();
  }, []);

  useEffect(() => {
    if (selectedSchedule) {
      fetchSeating(selectedSchedule);
    }
  }, [selectedSchedule]);

  async function fetchSchedules() {
    try {
      const res = await fetch("/api/admin/seating");
      const data = await res.json();
      if (data.schedules && data.schedules.length > 0) {
        setSchedules(data.schedules);
        setSelectedSchedule(data.schedules[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function fetchSeating(schedId: string) {
    try {
      const res = await fetch(`/api/admin/seating?scheduleId=${schedId}`);
      const data = await res.json();
      setAllocations(data.allocations || []);
      setScheduleInfo(data.schedule || null);
    } catch (e) {
      console.error(e);
    }
  }

  async function handleGenerate(randomize: boolean = true) {
    if (!selectedSchedule) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/admin/seating", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examScheduleId: selectedSchedule, randomize }),
      });
      if (res.ok) {
        fetchSeating(selectedSchedule);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Grid className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
              Randomized Seat Allocation
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Generate randomized candidate seat placement maps and room seating blueprints.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedSchedule}
              onChange={(e) => setSelectedSchedule(e.target.value)}
              className="px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            >
              {schedules.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.examTitle} ({s.hall || "Hall"})
                </option>
              ))}
            </select>

            <button
              onClick={() => handleGenerate(true)}
              disabled={generating}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-medium text-sm transition shadow-lg shadow-indigo-600/20"
            >
              <Sparkles className="w-4 h-4" />
              {generating ? "Shuffling & Allocating..." : "Randomize Seating Allocation"}
            </button>
          </div>
        </div>

        {/* Visual Seating Map */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Hall Seating Layout Map
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Total Allocated: {allocations.length} Candidates
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span> Allocated Seat
              </span>
            </div>
          </div>

          {allocations.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              No seating allocation generated yet for this schedule. Click "Auto-Allocate Seats" above.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {allocations.map((a) => (
                <div
                  key={a.id}
                  className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-3 rounded-xl flex flex-col justify-between space-y-2 text-center"
                >
                  <span className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded">
                    {a.seatNumber}
                  </span>
                  <div className="py-1">
                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {a.studentName}
                    </p>
                    <p className="text-[11px] text-slate-500">{a.rollNumber}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
