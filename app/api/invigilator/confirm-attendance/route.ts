export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(["INVIGILATOR", "ADMIN", "FACULTY"], req);
    const { examScheduleId, isConfirmed = true, hallId } = await req.json();

    if (!examScheduleId) {
      return NextResponse.json({ error: "examScheduleId is required" }, { status: 400 });
    }

    const now = new Date();

    // 1. Update all Attendance records for this schedule
    await prisma.attendance.updateMany({
      where: { examScheduleId },
      data: {
        isConfirmed,
        confirmedAt: isConfirmed ? now : null,
      },
    });

    // 2. Update InvigilatorAssignment status
    const assignmentWhere: any = { examScheduleId };
    if (hallId) assignmentWhere.hallId = hallId;

    await prisma.invigilatorAssignment.updateMany({
      where: assignmentWhere,
      data: {
        status: isConfirmed ? "CONFIRMED" : "ASSIGNED",
        isConfirmed,
        confirmedAt: isConfirmed ? now : null,
      },
    });

    // Count marked records
    const recordsCount = await prisma.attendance.count({
      where: { examScheduleId },
    });

    return NextResponse.json({
      success: true,
      isConfirmed,
      confirmedAt: isConfirmed ? now.toISOString() : null,
      recordsConfirmedCount: recordsCount,
      message: isConfirmed ? "Attendance successfully confirmed and locked." : "Attendance unlocked for edits.",
    });
  } catch (e: any) {
    console.error("Confirm attendance error:", e);
    return NextResponse.json({ error: e.message || "Failed to confirm attendance" }, { status: 500 });
  }
}
