"use client";
import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { BookOpen, Plus, Loader2, X } from "lucide-react";

export default function AdminSubjectsPage() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [depts, setDepts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", code: "", departmentId: "", credits: 3, semester: 1 });

  const loadData = () => {
    fetch("/api/admin/subjects").then(r => r.json()).then(d => { if (Array.isArray(d)) setSubjects(d); }).finally(() => setLoading(false));
    fetch("/api/admin/subjects?type=departments").then(r => r.json()).then(d => { if (Array.isArray(d)) setDepts(d); });
  };
  useEffect(() => { loadData(); }, []);

  const handleCreate = async () => {
    const res = await fetch("/api/admin/subjects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (res.ok) { setShowModal(false); loadData(); } else { const e = await res.json(); alert(e.error); }
  };

  if (loading) return <DashboardLayout><div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-10 h-10 text-indigo-600 animate-spin" /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold text-slate-900">Subjects & Departments</h1></div>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl shadow-md hover:bg-indigo-700"><Plus className="w-4 h-4" /> Add Subject</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {depts.map((d: any) => (
            <div key={d.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <div className="font-bold text-slate-900">{d.name}</div>
              <div className="text-xs font-mono text-slate-500">Code: {d.code}</div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200"><tr>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Subject</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Code</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Department</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Credits</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Semester</th>
            </tr></thead>
            <tbody>{subjects.map(s => (
              <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{s.name}</td>
                <td className="px-4 py-3 font-mono text-slate-700">{s.code}</td>
                <td className="px-4 py-3 text-slate-600">{s.department}</td>
                <td className="px-4 py-3 text-slate-600">{s.credits}</td>
                <td className="px-4 py-3 text-slate-600">{s.semester}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-bold">Add Subject</h3><button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-slate-400" /></button></div>
            <div className="space-y-3">
              <input placeholder="Subject Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              <input placeholder="Subject Code" value={form.code} onChange={e => setForm({...form, code: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              <select value={form.departmentId} onChange={e => setForm({...form, departmentId: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"><option value="">Select Department</option>{depts.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}</select>
              <div className="grid grid-cols-2 gap-3">
                <input type="number" placeholder="Credits" value={form.credits} onChange={e => setForm({...form, credits: parseInt(e.target.value) || 3})} className="px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                <input type="number" placeholder="Semester" value={form.semester} onChange={e => setForm({...form, semester: parseInt(e.target.value) || 1})} className="px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>
            </div>
            <button onClick={handleCreate} className="w-full mt-4 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700">Create Subject</button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
