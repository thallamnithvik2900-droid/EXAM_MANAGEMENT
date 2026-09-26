"use client";
import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { FileSpreadsheet, Plus, Loader2, X, CheckCircle2 } from "lucide-react";

export default function AdminExamsPage() {
  const [exams, setExams] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", code: "", subjectId: "", examType: "ONLINE_OBJECTIVE", durationMinutes: 60, totalMarks: 100, passMarks: 40, negativeMarking: 0, isRandomized: true, canReviewSolutions: true, isPublished: true });

  const loadData = () => {
    fetch("/api/admin/exams").then(r => r.json()).then(d => { if (Array.isArray(d)) setExams(d); }).finally(() => setLoading(false));
    fetch("/api/admin/subjects").then(r => r.json()).then(d => { if (Array.isArray(d)) setSubjects(d); });
  };
  useEffect(() => { loadData(); }, []);

  const handleCreate = async () => {
    const res = await fetch("/api/admin/exams", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (res.ok) { setShowModal(false); loadData(); } else { const e = await res.json(); alert(e.error); }
  };

  if (loading) return <DashboardLayout><div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-10 h-10 text-indigo-600 animate-spin" /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold text-slate-900">Exam Management</h1><p className="text-xs text-slate-500">{exams.length} exams configured</p></div>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl shadow-md hover:bg-indigo-700"><Plus className="w-4 h-4" /> Create Exam</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exams.map(e => (
            <div key={e.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">{e.subject}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${e.isPublished ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{e.isPublished ? "Published" : "Draft"}</span>
              </div>
              <h3 className="font-bold text-slate-900 mb-1">{e.title}</h3>
              <div className="text-xs text-slate-500 mb-3 font-mono">{e.code}</div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs border-t border-slate-100 pt-3">
                <div><span className="text-slate-400 block">Questions</span><span className="font-bold text-slate-800">{e.questionCount}</span></div>
                <div><span className="text-slate-400 block">Duration</span><span className="font-bold text-slate-800">{e.durationMinutes}m</span></div>
                <div><span className="text-slate-400 block">Marks</span><span className="font-bold text-slate-800">{e.totalMarks}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-bold">Create Exam</h3><button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-slate-400" /></button></div>
            <div className="space-y-3">
              <input placeholder="Exam Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              <input placeholder="Exam Code (unique)" value={form.code} onChange={e => setForm({...form, code: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              <textarea placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" rows={2} />
              <select value={form.subjectId} onChange={e => setForm({...form, subjectId: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"><option value="">Select Subject</option>{subjects.map((s: any) => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}</select>
              <select value={form.examType} onChange={e => setForm({...form, examType: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"><option value="ONLINE_OBJECTIVE">Online Objective</option><option value="MID_TERM">Mid Term</option><option value="FINAL_SEMESTER">Final Semester</option><option value="PRACTICE_TEST">Practice Test</option></select>
              <div className="grid grid-cols-2 gap-3">
                <input type="number" placeholder="Duration (mins)" value={form.durationMinutes} onChange={e => setForm({...form, durationMinutes: parseInt(e.target.value) || 60})} className="px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                <input type="number" placeholder="Total Marks" value={form.totalMarks} onChange={e => setForm({...form, totalMarks: parseInt(e.target.value) || 100})} className="px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                <input type="number" placeholder="Pass Marks" value={form.passMarks} onChange={e => setForm({...form, passMarks: parseInt(e.target.value) || 40})} className="px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                <input type="number" step="0.25" placeholder="Negative Marking" value={form.negativeMarking} onChange={e => setForm({...form, negativeMarking: parseFloat(e.target.value) || 0})} className="px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>
            </div>
            <button onClick={handleCreate} className="w-full mt-4 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700">Create Exam</button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
