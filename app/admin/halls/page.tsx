"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Building2, Plus, Users, Grid, Layers } from "lucide-react";

export default function AdminHallsPage() {
  const [halls, setHalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    hallCode: "",
    name: "",
    building: "Main Academic Block",
    floor: "1st Floor",
    capacity: 30,
    rows: 5,
    cols: 6,
  });

  useEffect(() => {
    fetchHalls();
  }, []);

  async function fetchHalls() {
    try {
      const res = await fetch("/api/admin/halls");
      const data = await res.json();
      setHalls(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/halls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setShowModal(false);
        fetchHalls();
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <DashboardLayout>
      <div className="p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
              Halls & Examination Rooms
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Configure examination centers, seat dimensions, and capacity limits.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium text-sm transition shadow-lg shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" /> Add Hall
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-500">Loading halls...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {halls.map((hall) => (
              <div
                key={hall.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 hover:border-indigo-500 transition"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded-md">
                      {hall.hallCode}
                    </span>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-2">
                      {hall.name}
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs pt-2">
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl">
                    <span className="text-slate-400 block mb-0.5">Building</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{hall.building}</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl">
                    <span className="text-slate-400 block mb-0.5">Floor</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{hall.floor}</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl">
                    <span className="text-slate-400 block mb-0.5">Capacity</span>
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">{hall.capacity} Seats</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl">
                    <span className="text-slate-400 block mb-0.5">Matrix Grid</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{hall.rows} R × {hall.cols} C</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
