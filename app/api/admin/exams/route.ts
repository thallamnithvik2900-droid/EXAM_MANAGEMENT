export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await requireAuth(["ADMIN", "FACULTY"], req);
    const exams = await prisma.exam.findMany({
      include: { subject: true, examQuestions: true, schedules: { include: { hall: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(exams.map(e => ({
      id: e.id, title: e.title, description: e.description, code: e.code,
      subject: e.subject.name, subjectId: e.subjectId, examType: e.examType,
      durationMinutes: e.durationMinutes, totalMarks: e.totalMarks, passMarks: e.passMarks,
      negativeMarking: e.negativeMarking, isPublished: e.isPublished,
      questionCount: e.examQuestions.length, isRandomized: e.isRandomized,
      canReviewSolutions: e.canReviewSolutions,
      startDate: e.startDate.toISOString(), endDate: e.endDate?.toISOString(),
      schedules: e.schedules.map(s => ({ id: s.id, date: s.date.toISOString(), startTime: s.startTime, endTime: s.endTime, hall: s.hall?.name })),
    })));
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAuth(["ADMIN"], req);
    const b = await req.json();
    const exam = await prisma.exam.create({
      data: {
        title: b.title, description: b.description, code: b.code, subjectId: b.subjectId,
        examType: b.examType || "ONLINE_OBJECTIVE", durationMinutes: b.durationMinutes || 60,
        totalMarks: b.totalMarks || 100, passMarks: b.passMarks || 40,
        negativeMarking: b.negativeMarking || 0, isRandomized: b.isRandomized ?? true,
        canReviewSolutions: b.canReviewSolutions ?? true, isPublished: b.isPublished ?? false,
        startDate: b.startDate ? new Date(b.startDate) : new Date(),
        endDate: b.endDate ? new Date(b.endDate) : null,
      },
    });
    if (b.questionIds && Array.isArray(b.questionIds)) {
      for (let i = 0; i < b.questionIds.length; i++) {
        await prisma.examQuestion.create({ data: { examId: exam.id, questionId: b.questionIds[i], order: i + 1 } });
      }
    }
    return NextResponse.json({ success: true, id: exam.id });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

