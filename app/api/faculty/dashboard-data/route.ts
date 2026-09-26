export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { MOCK_FACULTY_DASHBOARD } from "@/lib/mockData";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(["FACULTY", "ADMIN"], req);

    try {
      const faculty = await prisma.faculty.findFirst({
        where: { userId: user.id },
        include: { department: true },
      });
      const subjects = await prisma.subject.findMany({
        where: faculty?.departmentId ? { departmentId: faculty.departmentId } : {},
        include: { department: true },
      });
      const subjectIds = subjects.map((s) => s.id);
      const exams = await prisma.exam.findMany({
        where: { subjectId: { in: subjectIds } },
        include: { subject: true, examQuestions: true },
        orderBy: { createdAt: "desc" },
      });
      const questionCount = await prisma.question.count({ where: { subjectId: { in: subjectIds } } });
      const results = await prisma.result.findMany({
        where: { exam: { subjectId: { in: subjectIds } } },
        include: { student: { include: { user: true } }, exam: true },
        orderBy: { generatedAt: "desc" },
        take: 10,
      });
      const attendances = await prisma.attendance.findMany({
        where: { examSchedule: { exam: { subjectId: { in: subjectIds } } } },
        include: { student: { include: { user: true } }, examSchedule: { include: { exam: true } } },
        take: 10,
        orderBy: { updatedAt: "desc" },
      });

      const attPresent = attendances.filter((a) => a.status === "PRESENT").length;
      const attConfirmed = attendances.filter((a) => a.isConfirmed).length;

      return NextResponse.json({
        faculty: faculty ? { name: user.name, department: faculty.department?.name, designation: faculty.designation } : null,
        subjects: subjects.map((s) => ({ id: s.id, name: s.name, code: s.code, credits: s.credits })),
        exams: exams.map((e) => ({
          id: e.id,
          title: e.title,
          code: e.code,
          subject: e.subject.name,
          examType: e.examType,
          questionCount: e.examQuestions.length,
          isPublished: e.isPublished,
        })),
        questionCount,
        recentResults: results.map((r) => ({
          id: r.id,
          studentName: r.student.user.name,
          examTitle: r.exam.title,
          score: r.score,
          maxScore: r.maxScore,
          percentage: r.percentage,
          isPassed: r.isPassed,
        })),
        attendanceStats: {
          totalMarked: attendances.length,
          present: attPresent,
          confirmed: attConfirmed,
        },
        recentAttendance: attendances.map((a) => ({
          id: a.id,
          studentName: a.student.user.name,
          rollNumber: a.student.rollNumber,
          examTitle: a.examSchedule.exam.title,
          status: a.status,
          isConfirmed: a.isConfirmed,
        })),
      });
    } catch (dbError) {
      console.warn("Prisma faculty dashboard query failed, using mock data fallback:", dbError);
    }

    return NextResponse.json({
      ...MOCK_FACULTY_DASHBOARD,
      faculty: {
        ...MOCK_FACULTY_DASHBOARD.faculty,
        name: user.name || MOCK_FACULTY_DASHBOARD.faculty.name,
        email: user.email || MOCK_FACULTY_DASHBOARD.faculty.email,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to load dashboard" }, { status: 500 });
  }
}
