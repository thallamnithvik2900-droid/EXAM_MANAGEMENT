"use client";
import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { UserCog, Plus, Loader2, X } from "lucide-react";

export default function AdminFacultyPage() {
  const [faculty, setFaculty] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "Faculty@123", employeeId: "", designation: "Assistant Professor", departmentId: "", role: "FACULTY" });
  const [depts, setDepts] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/admin/faculty").then(r => r.json()).then(d => { if (Array.isArray(d)) setFaculty(d); }).finally(() => setLoading(false));
    fetch("/api/admin/subjects?type=departments").then(r => r.json()).then(d => { if (Array.isArray(d)) setDepts(d); });
  }, []);

  const handleCreate = async () => {
    const res = await fetch("/api/admin/faculty", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (res.ok) { setShowModal(false); const r = await fetch("/api/admin/faculty"); const d = await r.json(); if (Array.isArray(d)) setFaculty(d); }
    else { const e = await res.json(); alert(e.error); }
  };

  if (loading) return <DashboardLayout><div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-10 h-10 text-indigo-600 animate-spin" /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold text-slate-900">Faculty Management</h1><p className="text-xs text-slate-500">{faculty.length} faculty members</p></div>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl shadow-md hover:bg-indigo-700"><Plus className="w-4 h-4" /> Add Faculty</button>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200"><tr>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Name</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Email</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Employee ID</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Designation</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Department</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Role</th>
            </tr></thead>
            <tbody>{faculty.map(f => (
              <tr key={f.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{f.name}</td>
                <td className="px-4 py-3 text-slate-600">{f.email}</td>
                <td className="px-4 py-3 font-mono text-slate-700">{f.employeeId}</td>
                <td className="px-4 py-3 text-slate-600">{f.designation}</td>
                <td className="px-4 py-3 text-slate-600">{f.department}</td>
                <td className="px-4 py-3"><span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{f.role}</span></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-bold">Add Faculty</h3><button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-slate-400" /></button></div>
            <div className="space-y-3">
              <input placeholder="Full Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              <input placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              <input placeholder="Employee ID" value={form.employeeId} onChange={e => setForm({...form, employeeId: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              <input placeholder="Designation" value={form.designation} onChange={e => setForm({...form, designation: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              <select value={form.departmentId} onChange={e => setForm({...form, departmentId: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"><option value="">Select Department</option>{depts.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}</select>
            </div>
            <button onClick={handleCreate} className="w-full mt-4 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700">Create Faculty</button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
