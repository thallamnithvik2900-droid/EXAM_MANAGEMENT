"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, LogOut, Bell, User } from "lucide-react";
import { SessionUser } from "@/types";

interface NavbarProps {
  user: SessionUser | null;
}

export function Navbar({ user }: NavbarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      localStorage.removeItem("user");
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "FACULTY":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "INVIGILATOR":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "STUDENT":
      default:
        return "bg-indigo-100 text-indigo-700 border-indigo-200";
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-6 flex items-center justify-between">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
          <GraduationCap className="w-6 h-6" />
        </div>
        <div>
          <span className="font-bold text-slate-900 text-base tracking-tight block">ExamSecure</span>
          <span className="text-[11px] text-slate-500 block -mt-0.5">Online Assessment & Portal</span>
        </div>
      </div>

      {/* User Info & Controls */}
      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-3 border-r border-slate-200 pr-4">
            <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
              <User className="w-4 h-4" />
            </div>
            <div className="hidden sm:block text-right">
              <div className="text-sm font-semibold text-slate-800 leading-tight">{user.name}</div>
              <div className="flex items-center justify-end gap-1.5 mt-0.5">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border uppercase tracking-wider ${getRoleBadge(user.role)}`}>
                  {user.role}
                </span>
                {user.rollNumber && (
                  <span className="text-[11px] text-slate-400 font-mono">({user.rollNumber})</span>
                )}
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
