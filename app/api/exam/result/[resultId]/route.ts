import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { resultId: string } }
) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { resultId } = params;

    const result = await prisma.result.findUnique({
      where: { id: resultId },
      include: {
        exam: {
          include: {
            examQuestions: {
              include: { question: true },
              orderBy: { order: "asc" },
            },
          },
        },
        student: {
          include: {
            user: true,
            department: true,
          },
        },
        attempt: {
          include: {
            answers: true,
          },
        },
      },
    });

    if (!result) {
      return NextResponse.json({ error: "Result not found" }, { status: 404 });
    }

    // Access control
    if (user.role === "STUDENT" && result.student.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden access to this result" }, { status: 403 });
    }

    // Topic wise parse
    let topicWise: any = {};
    try {
      if (result.topicWiseJson) {
        topicWise = JSON.parse(result.topicWiseJson);
      }
    } catch {
      topicWise = {};
    }

    // Solution review
    let solutions: any[] = [];
    const canReview = result.exam.canReviewSolutions || user.role === "ADMIN" || user.role === "FACULTY";

    if (canReview) {
      const answersMap = new Map(result.attempt.answers.map((a) => [a.questionId, a]));

      solutions = result.exam.examQuestions.map((eq, idx) => {
        const q = eq.question;
        const studentAns = answersMap.get(q.id);

        let options: string[] = [];
        try {
          if (q.optionsJson) options = JSON.parse(q.optionsJson);
        } catch {
          options = [];
        }

        return {
          questionNumber: idx + 1,
          id: q.id,
          topic: q.topic,
          chapter: q.chapter,
          questionType: q.questionType,
          questionText: q.questionText,
          options,
          studentAnswer: studentAns?.studentAnswer || null,
          correctAnswer: q.correctAnswer,
          isAnswered: Boolean(studentAns?.isAnswered),
          isCorrect: studentAns?.isCorrect ?? false,
          marksAwarded: studentAns?.marksAwarded ?? 0,
          maxMarks: q.marks,
          explanation: q.explanation,
        };
      });
    }

    return NextResponse.json({
      id: result.id,
      score: result.score,
      maxScore: result.maxScore,
      percentage: result.percentage,
      isPassed: result.isPassed,
      correctCount: result.correctCount,
      wrongCount: result.wrongCount,
      unansweredCount: result.unansweredCount,
      accuracy: result.accuracy,
      timeTakenSeconds: result.attempt.totalTimeSpentSeconds,
      generatedAt: result.generatedAt.toISOString(),
      topicWise,
      canReviewSolutions: canReview,
      exam: {
        id: result.exam.id,
        title: result.exam.title,
        code: result.exam.code,
        description: result.exam.description,
        durationMinutes: result.exam.durationMinutes,
        passMarks: result.exam.passMarks,
        examType: result.exam.examType,
      },
      student: {
        name: result.student.user.name,
        email: result.student.user.email,
        rollNumber: result.student.rollNumber,
        registrationNo: result.student.registrationNo,
        department: result.student.department?.name || "General",
      },
      solutions,
    });
  } catch (error: any) {
    console.error("Result fetch error:", error);
    return NextResponse.json({ error: error.message || "Failed to load result" }, { status: 500 });
  }
}
