export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(["STUDENT", "ADMIN"], req);

    let student = await prisma.student.findFirst({
      where: { userId: user.id },
      include: { department: true, user: true },
    });

    if (!student && user.role === "ADMIN") {
      student = await prisma.student.findFirst({ include: { department: true, user: true } });
    }

    if (!student) {
      return NextResponse.json({ error: "Student profile not found" }, { status: 404 });
    }

    const allocations = await prisma.seatAllocation.findMany({
      where: { studentId: student.id },
      include: {
        examSchedule: {
          include: {
            exam: { include: { subject: true } },
            hall: true,
            attendances: {
              where: { studentId: student.id },
            },
          },
        },
      },
      orderBy: { examSchedule: { date: "asc" } },
    });

    return NextResponse.json({
      student: {
        name: student.user.name,
        email: student.user.email,
        rollNumber: student.rollNumber,
        registrationNo: student.registrationNo,
        semester: student.semester,
        department: student.department?.name || "Engineering",
      },
      tickets: allocations.map((alloc) => {
        const att = alloc.examSchedule.attendances[0];
        return {
          allocationId: alloc.id,
          scheduleId: alloc.examScheduleId,
          examTitle: alloc.examSchedule.exam.title,
          examCode: alloc.examSchedule.exam.code,
          subject: alloc.examSchedule.exam.subject.name,
          subjectCode: alloc.examSchedule.exam.subject.code,
          date: alloc.examSchedule.date.toISOString(),
          startTime: alloc.examSchedule.startTime,
          endTime: alloc.examSchedule.endTime,
          durationMinutes: alloc.examSchedule.exam.durationMinutes,
          hallName: alloc.examSchedule.hall?.name || "TBA",
          hallCode: alloc.examSchedule.hall?.hallCode || "TBA",
          building: alloc.examSchedule.hall?.building || "",
          floor: alloc.examSchedule.hall?.floor || "",
          seatNumber: alloc.seatNumber,
          rowNumber: alloc.rowNumber,
          colNumber: alloc.colNumber,
          attendanceStatus: att?.status || "NOT_MARKED",
          isConfirmed: att?.isConfirmed || false,
          confirmedAt: att?.confirmedAt ? att.confirmedAt.toISOString() : null,
        };
      }),
    });
  } catch (error: any) {
    console.error("Hall ticket error:", error);
    return NextResponse.json({ error: error.message || "Failed to load hall tickets" }, { status: 500 });
  }
}

