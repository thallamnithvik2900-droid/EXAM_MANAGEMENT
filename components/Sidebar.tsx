"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UserCog,
  Building2,
  BookOpen,
  FileSpreadsheet,
  FileQuestion,
  Calendar,
  Grid,
  ShieldAlert,
  ClipboardCheck,
  Award,
  BarChart3,
  Bell,
  Ticket,
  Clock,
} from "lucide-react";
import { SessionUser } from "@/types";

interface SidebarProps {
  user: SessionUser | null;
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  const adminLinks = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/students", label: "Students", icon: Users },
    { href: "/admin/faculty", label: "Faculty", icon: UserCog },
    { href: "/admin/subjects", label: "Subjects & Depts", icon: BookOpen },
    { href: "/admin/exams", label: "Exams", icon: FileSpreadsheet },
    { href: "/admin/question-bank", label: "Question Bank", icon: FileQuestion },
    { href: "/admin/halls", label: "Halls & Rooms", icon: Building2 },
    { href: "/admin/seating", label: "Seat Allocation", icon: Grid },
    { href: "/admin/invigilators", label: "Invigilators", icon: ShieldAlert },
    { href: "/admin/attendance", label: "Attendance", icon: ClipboardCheck },
    { href: "/admin/results", label: "Results", icon: Award },
    { href: "/admin/reports", label: "Reports & Analytics", icon: BarChart3 },
  ];

  const facultyLinks = [
    { href: "/faculty/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/faculty/questions", label: "Question Bank", icon: FileQuestion },
    { href: "/faculty/exams", label: "Assigned Exams", icon: FileSpreadsheet },
    { href: "/faculty/evaluations", label: "Evaluations & Marks", icon: Award },
    { href: "/faculty/performance", label: "Student Performance", icon: BarChart3 },
  ];

  const invigilatorLinks = [
    { href: "/invigilator/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/invigilator/seating", label: "Seating Arrangement", icon: Grid },
    { href: "/invigilator/attendance", label: "Mark Attendance", icon: ClipboardCheck },
  ];

  const studentLinks = [
    { href: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/student/attendance", label: "My Attendance", icon: ClipboardCheck },
    { href: "/student/exams", label: "Online Exams", icon: Clock },
    { href: "/student/hall-tickets", label: "Hall Tickets", icon: Ticket },
    { href: "/student/results", label: "Exam Results", icon: Award },
    { href: "/student/analytics", label: "Performance Analytics", icon: BarChart3 },
  ];

  let links = studentLinks;
  if (user?.role === "ADMIN") links = adminLinks;
  else if (user?.role === "FACULTY") links = facultyLinks;
  else if (user?.role === "INVIGILATOR") links = invigilatorLinks;

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between hidden md:flex shrink-0">
      <div className="space-y-1">
        <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Navigation
        </div>
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                isActive
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-800 text-xs text-slate-400">
        <div className="font-medium text-slate-200">ExamSecure Portal v2.0</div>
        <div className="text-[11px] text-slate-500 mt-0.5">Role: {user?.role || "GUEST"}</div>
      </div>
    </aside>
  );
}
