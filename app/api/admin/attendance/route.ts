export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await requireAuth(["ADMIN", "INVIGILATOR", "FACULTY"], req);
    const url = new URL(req.url);
    const scheduleId = url.searchParams.get("scheduleId");
    const statusFilter = url.searchParams.get("status");

    const where: any = {};
    if (scheduleId) where.examScheduleId = scheduleId;
    if (statusFilter && statusFilter !== "ALL") where.status = statusFilter;

    const records = await prisma.attendance.findMany({
      where,
      include: {
        student: { include: { user: true } },
        examSchedule: { include: { exam: true, hall: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      records.map((r) => ({
        id: r.id,
        scheduleId: r.examScheduleId,
        studentId: r.studentId,
        studentName: r.student.user.name,
        rollNumber: r.student.rollNumber,
        examTitle: r.examSchedule.exam.title,
        hallName: r.examSchedule.hall?.name || "Unassigned",
        status: r.status,
        notes: r.notes,
        isConfirmed: r.isConfirmed,
        confirmedAt: r.confirmedAt ? r.confirmedAt.toISOString() : null,
        date: r.examSchedule.date.toISOString(),
      }))
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAuth(["ADMIN"], req);
    const { attendanceId, status, isConfirmed } = await req.json();

    const updateData: any = {};
    if (status) updateData.status = status;
    if (typeof isConfirmed === "boolean") {
      updateData.isConfirmed = isConfirmed;
      updateData.confirmedAt = isConfirmed ? new Date() : null;
    }

    const updated = await prisma.attendance.update({
      where: { id: attendanceId },
      data: updateData,
    });

    return NextResponse.json({ success: true, record: updated });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
