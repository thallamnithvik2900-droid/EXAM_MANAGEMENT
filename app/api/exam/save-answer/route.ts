export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { attemptId, questionId, studentAnswer, isMarkedForReview, currentQuestionIndex } = await req.json();

    if (!attemptId || !questionId) {
      return NextResponse.json({ error: "Attempt ID and Question ID are required" }, { status: 400 });
    }

    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: { student: true },
    });

    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    // Ownership check
    if (user.role === "STUDENT" && attempt.student.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized attempt access" }, { status: 403 });
    }

    // Status check
    if (attempt.status !== "IN_PROGRESS") {
      return NextResponse.json({ error: "This examination has already been finalized.", isLocked: true }, { status: 400 });
    }

    // Time deadline check (with 20s network latency grace window)
    const now = Date.now();
    const deadline = new Date(attempt.expectedEndTime).getTime() + 20000;
    if (now > deadline) {
      return NextResponse.json({
        error: "Exam duration has expired. Answers can no longer be modified.",
        isExpired: true,
      }, { status: 400 });
    }

    const isAnswered = studentAnswer !== null && studentAnswer !== undefined && studentAnswer !== "";

    // Atomic Upsert Answer
    const saved = await prisma.attemptAnswer.upsert({
      where: {
        attemptId_questionId: {
          attemptId,
          questionId,
        },
      },
      update: {
        studentAnswer: studentAnswer !== undefined ? String(studentAnswer) : undefined,
        isMarkedForReview: isMarkedForReview !== undefined ? Boolean(isMarkedForReview) : undefined,
        isAnswered: isAnswered,
        savedAt: new Date(),
      },
      create: {
        attemptId,
        questionId,
        studentAnswer: studentAnswer !== undefined ? String(studentAnswer) : null,
        isMarkedForReview: Boolean(isMarkedForReview),
        isAnswered: isAnswered,
      },
    });

    // Optionally update current question index in attempt
    if (typeof currentQuestionIndex === "number") {
      await prisma.examAttempt.update({
        where: { id: attemptId },
        data: { currentQuestionIndex },
      });
    }

    return NextResponse.json({
      success: true,
      savedAt: saved.savedAt.toISOString(),
      questionId: saved.questionId,
      isAnswered: saved.isAnswered,
      isMarkedForReview: saved.isMarkedForReview,
    });
  } catch (error: any) {
    console.error("Save answer error:", error);
    return NextResponse.json({ error: error.message || "Failed to save answer" }, { status: 500 });
  }
}

