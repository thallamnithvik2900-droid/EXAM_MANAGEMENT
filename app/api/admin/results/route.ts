export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await requireAuth(["ADMIN", "FACULTY"], req);
    const results = await prisma.result.findMany({
      include: { student: { include: { user: true } }, exam: { include: { subject: true } } },
      orderBy: { generatedAt: "desc" },
    });
    return NextResponse.json(results.map(r => ({
      id: r.id, studentName: r.student.user.name, rollNumber: r.student.rollNumber,
      examTitle: r.exam.title, subject: r.exam.subject.name, score: r.score,
      maxScore: r.maxScore, percentage: r.percentage, isPassed: r.isPassed,
      accuracy: r.accuracy, correctCount: r.correctCount, wrongCount: r.wrongCount,
      unansweredCount: r.unansweredCount, date: r.generatedAt.toISOString(),
    })));
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

