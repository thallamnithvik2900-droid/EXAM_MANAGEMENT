export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await requireAuth(["ADMIN"], req);
    const assignments = await prisma.invigilatorAssignment.findMany({
      include: { faculty: { include: { user: true } }, hall: true, examSchedule: { include: { exam: true } } },
    });
    return NextResponse.json(assignments.map(a => ({
      id: a.id, facultyName: a.faculty.user.name, employeeId: a.faculty.employeeId,
      hallName: a.hall.name, examTitle: a.examSchedule.exam.title,
      date: a.examSchedule.date.toISOString(), status: a.status,
    })));
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAuth(["ADMIN"], req);
    const b = await req.json();
    const a = await prisma.invigilatorAssignment.create({
      data: { examScheduleId: b.examScheduleId, facultyId: b.facultyId, hallId: b.hallId },
    });
    return NextResponse.json({ success: true, id: a.id });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

