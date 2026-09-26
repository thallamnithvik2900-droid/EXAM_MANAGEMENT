export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(["INVIGILATOR", "FACULTY", "ADMIN"], req);
    const faculty = await prisma.faculty.findFirst({ where: { userId: user.id } });
    const assignments = await prisma.invigilatorAssignment.findMany({
      where: faculty ? { facultyId: faculty.id } : {},
      include: {
        examSchedule: { include: { exam: { include: { subject: true } }, attendances: { include: { student: { include: { user: true } } } } } },
        hall: true,
      },
    });
    const students = await prisma.student.findMany({ include: { user: true }, orderBy: { rollNumber: "asc" } });
    
    return NextResponse.json({
      assignments: assignments.map(a => {
        const attList = a.examSchedule.attendances || [];
        const isScheduleConfirmed = a.isConfirmed || attList.some(at => at.isConfirmed);
        const presentCount = attList.filter(at => at.status === "PRESENT").length;
        const absentCount = attList.filter(at => at.status === "ABSENT").length;
        const lateCount = attList.filter(at => at.status === "LATE").length;
        const malpracticeCount = attList.filter(at => at.status === "MALPRACTICE").length;

        return {
          id: a.id, 
          hallId: a.hallId,
          hallName: a.hall.name, 
          hallCode: a.hall.hallCode,
          examTitle: a.examSchedule.exam.title, 
          subject: a.examSchedule.exam.subject.name,
          date: a.examSchedule.date.toISOString(), 
          startTime: a.examSchedule.startTime, 
          endTime: a.examSchedule.endTime,
          scheduleId: a.examScheduleId, 
          status: a.status,
          isConfirmed: isScheduleConfirmed,
          confirmedAt: a.confirmedAt ? a.confirmedAt.toISOString() : (attList.find(at => at.confirmedAt)?.confirmedAt?.toISOString() || null),
          stats: {
            totalMarked: attList.length,
            present: presentCount,
            absent: absentCount,
            late: lateCount,
            malpractice: malpracticeCount,
            totalStudents: students.length,
          },
          attendance: attList.map(at => ({
            id: at.id, 
            studentId: at.studentId, 
            studentName: at.student.user.name,
            rollNumber: at.student.rollNumber, 
            status: at.status, 
            notes: at.notes,
            isConfirmed: at.isConfirmed,
            confirmedAt: at.confirmedAt ? at.confirmedAt.toISOString() : null,
          })),
        };
      }),
      allStudents: students.map(s => ({ id: s.id, name: s.user.name, rollNumber: s.rollNumber })),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

