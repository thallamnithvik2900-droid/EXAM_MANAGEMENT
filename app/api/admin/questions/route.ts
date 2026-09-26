export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await requireAuth(["ADMIN", "FACULTY"], req);
    const url = new URL(req.url);
    const subjectId = url.searchParams.get("subjectId");
    const where = subjectId ? { subjectId } : {};
    const questions = await prisma.question.findMany({
      where, include: { subject: true }, orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(questions.map(q => ({
      id: q.id, subjectId: q.subjectId, subject: q.subject.name,
      topic: q.topic, chapter: q.chapter, difficulty: q.difficulty,
      questionType: q.questionType, questionText: q.questionText,
      optionsJson: q.optionsJson, correctAnswer: q.correctAnswer,
      explanation: q.explanation, marks: q.marks, negativeMarks: q.negativeMarks,
      createdAt: q.createdAt.toISOString(),
    })));
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAuth(["ADMIN", "FACULTY"], req);
    const b = await req.json();
    const q = await prisma.question.create({
      data: {
        subjectId: b.subjectId, topic: b.topic || "General", chapter: b.chapter,
        difficulty: b.difficulty || "MEDIUM", questionType: b.questionType || "MCQ_SINGLE",
        questionText: b.questionText, optionsJson: b.optionsJson, correctAnswer: b.correctAnswer,
        explanation: b.explanation, marks: b.marks || 1, negativeMarks: b.negativeMarks || 0,
      },
    });
    return NextResponse.json({ success: true, id: q.id });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

