"use client";
import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Users, Plus, Loader2, X, Search } from "lucide-react";

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "Student@123", rollNumber: "", registrationNo: "", semester: 1, departmentId: "" });
  const [depts, setDepts] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/admin/students").then(r => r.json()).then(d => { if (Array.isArray(d)) setStudents(d); }).finally(() => setLoading(false));
    fetch("/api/admin/subjects?type=departments").then(r => r.json()).then(d => { if (Array.isArray(d)) setDepts(d); });
  }, []);

  const handleCreate = async () => {
    const res = await fetch("/api/admin/students", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (res.ok) { setShowModal(false); setForm({ name: "", email: "", password: "Student@123", rollNumber: "", registrationNo: "", semester: 1, departmentId: "" }); const r = await fetch("/api/admin/students"); const d = await r.json(); if (Array.isArray(d)) setStudents(d); }
    else { const e = await res.json(); alert(e.error || "Failed to create student"); }
  };

  const filtered = students.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.rollNumber.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <DashboardLayout><div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-10 h-10 text-indigo-600 animate-spin" /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold text-slate-900">Student Management</h1><p className="text-xs text-slate-500">{students.length} registered students</p></div>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl shadow-md hover:bg-indigo-700"><Plus className="w-4 h-4" /> Add Student</button>
        </div>
        <div className="relative max-w-sm"><Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or roll..." className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none" /></div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200"><tr>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Name</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Email</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Roll Number</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Reg. No</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Sem</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Department</th>
            </tr></thead>
            <tbody>{filtered.map(s => (
              <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{s.name}</td>
                <td className="px-4 py-3 text-slate-600">{s.email}</td>
                <td className="px-4 py-3 font-mono text-slate-700">{s.rollNumber}</td>
                <td className="px-4 py-3 font-mono text-slate-600">{s.registrationNo}</td>
                <td className="px-4 py-3 text-slate-600">{s.semester}</td>
                <td className="px-4 py-3 text-slate-600">{s.department}</td>
              </tr>
            ))}</tbody>
          </table>
          {filtered.length === 0 && <p className="text-center py-8 text-slate-400 text-sm">No students found.</p>}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-bold text-slate-900">Add New Student</h3><button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-slate-400" /></button></div>
            <div className="space-y-3">
              <input placeholder="Full Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              <input placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              <input placeholder="Roll Number" value={form.rollNumber} onChange={e => setForm({...form, rollNumber: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              <input placeholder="Registration No" value={form.registrationNo} onChange={e => setForm({...form, registrationNo: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              <select value={form.departmentId} onChange={e => setForm({...form, departmentId: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                <option value="">Select Department</option>
                {depts.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              <input type="number" placeholder="Semester" value={form.semester} onChange={e => setForm({...form, semester: parseInt(e.target.value) || 1})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
            </div>
            <button onClick={handleCreate} className="w-full mt-4 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700">Create Student</button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
