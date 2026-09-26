"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  ShieldCheck,
  UserCheck,
  BookOpen,
  Lock,
  Mail,
  ArrowRight,
  Loader2,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [returnUrl, setReturnUrl] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setReturnUrl(params.get("returnUrl"));
  }, []);

  const [email, setEmail] = useState("student1@exam.edu");
  const [password, setPassword] = useState("Student@123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Authentication failed. Please check credentials.");
      }

      localStorage.setItem("user", JSON.stringify(data.user));

      if (returnUrl) {
        router.push(returnUrl);
      } else {
        switch (data.user.role) {
          case "ADMIN":
            router.push("/admin/dashboard");
            break;
          case "FACULTY":
            router.push("/faculty/dashboard");
            break;
          case "INVIGILATOR":
            router.push("/invigilator/dashboard");
            break;
          case "STUDENT":
          default:
            router.push("/student/dashboard");
            break;
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to log in");
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (role: string) => {
    if (role === "ADMIN") {
      setEmail("admin@exam.edu");
      setPassword("Admin@123");
    } else if (role === "FACULTY") {
      setEmail("prof.sharma@exam.edu");
      setPassword("Faculty@123");
    } else if (role === "INVIGILATOR") {
      setEmail("invigilator.rao@exam.edu");
      setPassword("Invigilator@123");
    } else if (role === "STUDENT") {
      setEmail("student1@exam.edu");
      setPassword("Student@123");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col justify-center items-center p-4">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 mb-4">
            <GraduationCap className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">ExamSecure Portal</h1>
          <p className="text-sm text-slate-500 mt-1">
            Enterprise Online Assessment & Examination System
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
            Quick Demo Login:
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setDemoCredentials("STUDENT")}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition ${email === "student1@exam.edu"
                  ? "bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Student (Rahul)</span>
            </button>

            <button
              type="button"
              onClick={() => setDemoCredentials("ADMIN")}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition ${email === "admin@exam.edu"
                  ? "bg-purple-50 border-purple-500 text-purple-700 shadow-sm"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
              <span>Admin (Dean)</span>
            </button>

            <button
              type="button"
              onClick={() => setDemoCredentials("FACULTY")}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition ${email === "prof.sharma@exam.edu"
                  ? "bg-blue-50 border-blue-500 text-blue-700 shadow-sm"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              <span>Faculty (Sharma)</span>
            </button>

            <button
              type="button"
              onClick={() => setDemoCredentials("INVIGILATOR")}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition ${email === "invigilator.rao@exam.edu"
                  ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Invigilator (Rao)</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2">
            <span className="font-bold">!</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@exam.edu"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-medium text-sm rounded-xl shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign in to Portal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-4 border-t border-slate-100 text-center text-xs text-slate-400">
          Secure Examination System &bull; Active Academic Year 2026
        </div>
      </div>
    </div>
  );
}
