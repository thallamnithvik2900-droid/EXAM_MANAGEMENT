export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(["STUDENT", "ADMIN"], req);

    let student = await prisma.student.findFirst({
      where: { userId: user.id },
      include: { user: true, department: true },
    });

    if (!student && user.role === "ADMIN") {
      student = await prisma.student.findFirst({ include: { user: true, department: true } });
    }

    if (!student) {
      return NextResponse.json({ error: "Student profile not found" }, { status: 404 });
    }

    // Get all schedules for the student
    const schedules = await prisma.examSchedule.findMany({
      include: {
        exam: { include: { subject: true } },
        hall: true,
        seatAllocations: {
          where: { studentId: student.id },
        },
        attendances: {
          where: { studentId: student.id },
        },
      },
      orderBy: { date: "desc" },
    });

    const records = schedules.map((sch) => {
      const seat = sch.seatAllocations[0];
      const att = sch.attendances[0];

      return {
        scheduleId: sch.id,
        examTitle: sch.exam.title,
        examCode: sch.exam.code,
        subject: sch.exam.subject.name,
        subjectCode: sch.exam.subject.code,
        date: sch.date.toISOString(),
        startTime: sch.startTime,
        endTime: sch.endTime,
        hallName: sch.hall?.name || "TBA",
        hallCode: sch.hall?.hallCode || "TBA",
        seatNumber: seat?.seatNumber || "Unassigned",
        status: att?.status || "NOT_MARKED",
        isConfirmed: att?.isConfirmed || false,
        confirmedAt: att?.confirmedAt ? att.confirmedAt.toISOString() : null,
        notes: att?.notes || null,
      };
    });

    const totalExams = records.length;
    const presentCount = records.filter((r) => r.status === "PRESENT").length;
    const absentCount = records.filter((r) => r.status === "ABSENT").length;
    const lateCount = records.filter((r) => r.status === "LATE").length;
    const confirmedCount = records.filter((r) => r.isConfirmed).length;

    return NextResponse.json({
      student: {
        name: student.user.name,
        rollNumber: student.rollNumber,
        department: student.department?.name || "Department",
        semester: student.semester,
      },
      stats: {
        totalExams,
        presentCount,
        absentCount,
        lateCount,
        confirmedCount,
      },
      records,
    });
  } catch (e: any) {
    console.error("Student attendance fetch error:", e);
    return NextResponse.json({ error: e.message || "Failed to fetch attendance" }, { status: 500 });
  }
}
