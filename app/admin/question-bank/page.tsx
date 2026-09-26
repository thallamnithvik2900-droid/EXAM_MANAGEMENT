"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Plus, Search, Filter, HelpCircle, FileQuestion, X, Check } from "lucide-react";

export default function AdminQuestionBankPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    subjectId: "",
    topic: "General",
    chapter: "",
    difficulty: "MEDIUM",
    questionType: "MCQ_SINGLE",
    questionText: "",
    option1: "",
    option2: "",
    option3: "",
    option4: "",
    correctAnswer: "",
    explanation: "",
    marks: 2,
    negativeMarks: 0.5,
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [qRes, sRes] = await Promise.all([
        fetch("/api/admin/questions").then((r) => r.json()),
        fetch("/api/admin/subjects").then((r) => r.json()),
      ]);
      const fetchedSubjects = Array.isArray(sRes) ? sRes : [];
      setQuestions(Array.isArray(qRes) ? qRes : []);
      setSubjects(fetchedSubjects);
      if (fetchedSubjects.length > 0 && !formData.subjectId) {
        setFormData((prev) => ({ ...prev, subjectId: fetchedSubjects[0].id }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.questionText || !formData.subjectId) {
      alert("Please fill in the question text and select a subject.");
      return;
    }

    const options = [formData.option1, formData.option2, formData.option3, formData.option4].filter(Boolean);
    const payload = {
      subjectId: formData.subjectId,
      topic: formData.topic || "General",
      chapter: formData.chapter,
      difficulty: formData.difficulty,
      questionType: formData.questionType,
      questionText: formData.questionText,
      optionsJson: options.length > 0 ? JSON.stringify(options) : null,
      correctAnswer: formData.correctAnswer || options[0] || "",
      explanation: formData.explanation,
      marks: Number(formData.marks) || 1,
      negativeMarks: Number(formData.negativeMarks) || 0,
    };

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowModal(false);
        setFormData({
          subjectId: subjects[0]?.id || "",
          topic: "General",
          chapter: "",
          difficulty: "MEDIUM",
          questionType: "MCQ_SINGLE",
          questionText: "",
          option1: "",
          option2: "",
          option3: "",
          option4: "",
          correctAnswer: "",
          explanation: "",
          marks: 2,
          negativeMarks: 0.5,
        });
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to add question.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while creating the question.");
    } finally {
      setSubmitting(false);
    }
  }

  const filtered = questions.filter((q) => {
    const matchesSearch =
      q.questionText.toLowerCase().includes(search.toLowerCase()) ||
      (q.topic && q.topic.toLowerCase().includes(search.toLowerCase()));
    const matchesSub = !selectedSubject || q.subjectId === selectedSubject;
    return matchesSearch && matchesSub;
  });

  return (
    <DashboardLayout>
      <div className="p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileQuestion className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
              Question Bank Repository
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Manage items, multiple-choice questions, and mark allocations across subjects.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium text-sm transition shadow-lg shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" /> Add Question
          </button>
        </div>

        {/* Filter Bar */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search question text or topic..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 dark:text-slate-300"
          >
            <option value="">All Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.code})
              </option>
            ))}
          </select>
        </div>

        {/* Questions List */}
        {loading ? (
          <div className="text-center py-12 text-slate-500">Loading questions...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-500">
            No questions found matching your filter.
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((q, idx) => (
              <div
                key={q.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-3 py-1 rounded-full">
                    <span>Q{idx + 1}</span>
                    <span>•</span>
                    <span>{q.subject}</span>
                    <span>•</span>
                    <span>{q.topic}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium">
                    <span
                      className={`px-2.5 py-0.5 rounded-full ${
                        q.difficulty === "HARD"
                          ? "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400"
                          : q.difficulty === "MEDIUM"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"
                          : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                      }`}
                    >
                      {q.difficulty}
                    </span>
                    <span className="text-slate-500">{q.marks} Marks</span>
                  </div>
                </div>

                <p className="text-slate-900 dark:text-slate-100 font-medium text-base">
                  {q.questionText}
                </p>

                {q.optionsJson && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2">
                    {JSON.parse(q.optionsJson).map((opt: string, i: number) => {
                      const isCorrect = opt === q.correctAnswer;
                      return (
                        <div
                          key={i}
                          className={`px-3.5 py-2 rounded-xl text-xs font-medium border ${
                            isCorrect
                              ? "bg-emerald-50 border-emerald-300 text-emerald-900 dark:bg-emerald-950/30 dark:border-emerald-700 dark:text-emerald-300"
                              : "bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-800/50 dark:border-slate-800 dark:text-slate-300"
                          }`}
                        >
                          {opt} {isCorrect && "✓ (Correct Answer)"}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add Question Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-indigo-600" />
                  Create New Question Item
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Subject *
                    </label>
                    <select
                      value={formData.subjectId}
                      onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {subjects.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Topic / Unit
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Data Structures, Graphs, OOP"
                      value={formData.topic}
                      onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Question Text *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Enter the question formulation..."
                    value={formData.questionText}
                    onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Multiple Choice Options */}
                <div className="space-y-2 pt-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Multiple Choice Options
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Option 1"
                      value={formData.option1}
                      onChange={(e) => setFormData({ ...formData, option1: e.target.value })}
                      className="px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Option 2"
                      value={formData.option2}
                      onChange={(e) => setFormData({ ...formData, option2: e.target.value })}
                      className="px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Option 3"
                      value={formData.option3}
                      onChange={(e) => setFormData({ ...formData, option3: e.target.value })}
                      className="px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Option 4"
                      value={formData.option4}
                      onChange={(e) => setFormData({ ...formData, option4: e.target.value })}
                      className="px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Correct Answer *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Exact matching answer text"
                      value={formData.correctAnswer}
                      onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Difficulty Level
                    </label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="EASY">EASY</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HARD">HARD</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Marks (Score)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={formData.marks}
                      onChange={(e) => setFormData({ ...formData, marks: parseFloat(e.target.value) })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-medium shadow-lg shadow-indigo-600/20"
                  >
                    {submitting ? "Saving..." : "Save Question"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
