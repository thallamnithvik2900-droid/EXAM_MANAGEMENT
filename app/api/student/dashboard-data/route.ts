export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { MOCK_STUDENT_DASHBOARD } from "@/lib/mockData";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(["STUDENT", "ADMIN"], req);

    try {
      let student = await prisma.student.findFirst({
        where: { userId: user.id },
        include: { department: true },
      });

      if (!student && user.role === "ADMIN") {
        student = await prisma.student.findFirst({ include: { department: true } });
      }

      if (student) {
        const allExams = await prisma.exam.findMany({
          where: { isPublished: true },
          include: {
            subject: true,
            examQuestions: true,
            attempts: {
              where: { studentId: student.id },
              include: { result: true },
            },
          },
          orderBy: { createdAt: "desc" },
        });

        const schedules = await prisma.examSchedule.findMany({
          include: {
            exam: { include: { subject: true } },
            hall: true,
            seatAllocations: { where: { studentId: student.id } },
            attendances: { where: { studentId: student.id } },
          },
          orderBy: { date: "asc" },
        });

        const results = await prisma.result.findMany({
          where: { studentId: student.id },
          include: { exam: { include: { subject: true } } },
          orderBy: { generatedAt: "desc" },
          take: 5,
        });

        const notifications = await prisma.notification.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: "desc" },
          take: 6,
        });

        const totalTaken = results.length;
        const passedCount = results.filter((r) => r.isPassed).length;
        const avgPercentage =
          totalTaken > 0 ? Math.round(results.reduce((acc, r) => acc + r.percentage, 0) / totalTaken) : 0;

        return NextResponse.json({
          student: {
            id: student.id,
            name: user.name,
            email: user.email,
            rollNumber: student.rollNumber,
            registrationNo: student.registrationNo,
            semester: student.semester,
            department: student.department?.name || "Computer Science",
          },
          analytics: { totalTaken, passedCount, avgPercentage },
          availableExams: allExams.map((ex) => {
            const myAttempt = ex.attempts[0];
            return {
              id: ex.id,
              title: ex.title,
              description: ex.description,
              code: ex.code,
              subjectName: ex.subject.name,
              examType: ex.examType,
              durationMinutes: ex.durationMinutes,
              totalMarks: ex.totalMarks,
              passMarks: ex.passMarks,
              negativeMarking: ex.negativeMarking,
              questionCount: ex.examQuestions.length,
              attemptStatus: myAttempt?.status || "NOT_STARTED",
              attemptId: myAttempt?.id,
              resultId: myAttempt?.result?.id,
              score: myAttempt?.result?.score,
            };
          }),
          scheduledExams: schedules.map((sch) => {
            const seat = sch.seatAllocations[0];
            const att = sch.attendances[0];
            return {
              scheduleId: sch.id,
              examTitle: sch.exam.title,
              examCode: sch.exam.code,
              subject: sch.exam.subject.name,
              date: sch.date.toISOString(),
              startTime: sch.startTime,
              endTime: sch.endTime,
              hallName: sch.hall?.name || "TBA",
              hallCode: sch.hall?.hallCode || "TBA",
              building: sch.hall?.building || "",
              floor: sch.hall?.floor || "",
              seatNumber: seat?.seatNumber || "Unassigned",
              attendanceStatus: att?.status || "NOT_MARKED",
              isConfirmed: att?.isConfirmed || false,
              confirmedAt: att?.confirmedAt ? att.confirmedAt.toISOString() : null,
              notes: att?.notes || null,
            };
          }),
          recentResults: results.map((r) => ({
            id: r.id,
            examTitle: r.exam.title,
            examCode: r.exam.code,
            subject: r.exam.subject.name,
            score: r.score,
            maxScore: r.maxScore,
            percentage: r.percentage,
            isPassed: r.isPassed,
            accuracy: r.accuracy,
            date: r.generatedAt.toISOString(),
          })),
          notifications,
        });
      }
    } catch (dbError) {
      console.warn("Prisma student dashboard query failed, using mock data fallback:", dbError);
    }

    // Return in-memory fallback student data if database is not active
    return NextResponse.json({
      ...MOCK_STUDENT_DASHBOARD,
      student: {
        ...MOCK_STUDENT_DASHBOARD.student,
        name: user.name || MOCK_STUDENT_DASHBOARD.student.name,
        email: user.email || MOCK_STUDENT_DASHBOARD.student.email,
        rollNumber: user.rollNumber || MOCK_STUDENT_DASHBOARD.student.rollNumber,
      },
    });
  } catch (error: any) {
    console.error("Student dashboard error:", error);
    return NextResponse.json({ error: error.message || "Failed to load dashboard" }, { status: 500 });
  }
}
