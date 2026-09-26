export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await requireAuth(["ADMIN"], req);
    const [studentCount, facultyCount, examCount, hallCount, attemptCount, scheduleCount, attendanceCount, confirmedAttendanceCount] = await Promise.all([
      prisma.student.count(),
      prisma.faculty.count(),
      prisma.exam.count(),
      prisma.hall.count(),
      prisma.examAttempt.count({ where: { status: { in: ["SUBMITTED", "TIMED_OUT"] } } }),
      prisma.examSchedule.count(),
      prisma.attendance.count(),
      prisma.attendance.count({ where: { isConfirmed: true } }),
    ]);
    const activeExams = await prisma.exam.count({ where: { isPublished: true } });
    const recentResults = await prisma.result.findMany({
      take: 5, orderBy: { generatedAt: "desc" },
      include: { student: { include: { user: true } }, exam: true },
    });
    const upcomingSchedules = await prisma.examSchedule.findMany({
      take: 5, orderBy: { date: "asc" },
      include: { exam: { include: { subject: true } }, hall: true },
    });
    return NextResponse.json({
      studentCount, facultyCount, examCount, hallCount, attemptCount, scheduleCount, activeExams,
      attendanceCount, confirmedAttendanceCount,
      recentResults: recentResults.map(r => ({
        id: r.id, studentName: r.student.user.name, examTitle: r.exam.title,
        score: r.score, maxScore: r.maxScore, percentage: r.percentage, isPassed: r.isPassed,
        date: r.generatedAt.toISOString(),
      })),
      upcomingSchedules: upcomingSchedules.map(s => ({
        id: s.id, examTitle: s.exam.title, subject: s.exam.subject.name,
        date: s.date.toISOString(), startTime: s.startTime, endTime: s.endTime,
        hallName: s.hall?.name || "TBA",
      })),
    });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (e.message === "FORBIDDEN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

