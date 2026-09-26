export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await requireAuth(["ADMIN", "INVIGILATOR"], req);
    const url = new URL(req.url);
    const scheduleId = url.searchParams.get("scheduleId");
    if (!scheduleId) {
      const schedules = await prisma.examSchedule.findMany({ include: { exam: true, hall: true }, orderBy: { date: "asc" } });
      return NextResponse.json({ schedules: schedules.map(s => ({ id: s.id, examTitle: s.exam.title, hall: s.hall?.name, date: s.date.toISOString(), startTime: s.startTime })) });
    }
    const allocations = await prisma.seatAllocation.findMany({
      where: { examScheduleId: scheduleId },
      include: { student: { include: { user: true } }, hall: true },
      orderBy: [{ rowNumber: "asc" }, { colNumber: "asc" }],
    });
    const schedule = await prisma.examSchedule.findUnique({ where: { id: scheduleId }, include: { hall: true } });
    return NextResponse.json({ schedule, allocations: allocations.map(a => ({ id: a.id, studentName: a.student.user.name, rollNumber: a.student.rollNumber, seatNumber: a.seatNumber, row: a.rowNumber, col: a.colNumber, hallName: a.hall.name })) });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAuth(["ADMIN"], req);
    const { examScheduleId, randomize = true } = await req.json();
    const schedule = await prisma.examSchedule.findUnique({ where: { id: examScheduleId }, include: { hall: true } });
    if (!schedule || !schedule.hall) return NextResponse.json({ error: "Schedule or hall not found" }, { status: 404 });
    
    await prisma.seatAllocation.deleteMany({ where: { examScheduleId } });
    
    const students = await prisma.student.findMany({ include: { user: true } });
    
    // Fisher-Yates Randomization Algorithm
    if (randomize) {
      for (let i = students.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [students[i], students[j]] = [students[j], students[i]];
      }
    } else {
      students.sort((a, b) => a.rollNumber.localeCompare(b.rollNumber));
    }

    const hall = schedule.hall;
    let allocated = 0;
    for (let i = 0; i < students.length && allocated < hall.capacity; i++) {
      const row = Math.floor(i / hall.cols) + 1;
      const col = (i % hall.cols) + 1;
      const seatNumber = `${hall.hallCode}-R${row}-S${col.toString().padStart(2, "0")}`;
      await prisma.seatAllocation.create({
        data: { examScheduleId, studentId: students[i].id, hallId: hall.id, rowNumber: row, colNumber: col, seatNumber },
      });
      allocated++;
    }
    return NextResponse.json({ success: true, allocated, isRandomized: randomize });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

