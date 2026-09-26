import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { attemptId: string } }
) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { attemptId } = params;

    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: {
        exam: {
          include: {
            examQuestions: {
              include: { question: true },
              orderBy: { order: "asc" },
            },
          },
        },
        student: true,
        answers: true,
        result: true,
      },
    });

    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    // Security: Student can only view their own attempt unless admin
    if (user.role === "STUDENT" && attempt.student.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden access" }, { status: 403 });
    }

    // Calculate remaining seconds based on server clock
    const now = Date.now();
    const endTime = new Date(attempt.expectedEndTime).getTime();
    const remainingSeconds = Math.max(0, Math.floor((endTime - now) / 1000));

    // Strip correct answers and explanations for ongoing attempt!
    const questionsList = attempt.exam.examQuestions.map((eq) => {
      let options: string[] = [];
      try {
        if (eq.question.optionsJson) {
          options = JSON.parse(eq.question.optionsJson);
        }
      } catch (e) {
        options = [];
      }

      return {
        id: eq.question.id,
        subjectId: eq.question.subjectId,
        topic: eq.question.topic,
        chapter: eq.question.chapter,
        difficulty: eq.question.difficulty,
        questionType: eq.question.questionType,
        questionText: eq.question.questionText,
        options,
        marks: eq.question.marks,
        negativeMarks: eq.question.negativeMarks,
        order: eq.order,
      };
    });

    const savedAnswersMap: Record<string, any> = {};
    for (const ans of attempt.answers) {
      savedAnswersMap[ans.questionId] = {
        questionId: ans.questionId,
        studentAnswer: ans.studentAnswer,
        isMarkedForReview: ans.isMarkedForReview,
        isAnswered: ans.isAnswered,
      };
    }

    return NextResponse.json({
      attemptId: attempt.id,
      examId: attempt.exam.id,
      examTitle: attempt.exam.title,
      examType: attempt.exam.examType,
      durationMinutes: attempt.exam.durationMinutes,
      totalMarks: attempt.exam.totalMarks,
      negativeMarking: attempt.exam.negativeMarking,
      status: attempt.status,
      startTime: attempt.startTime.toISOString(),
      expectedEndTime: attempt.expectedEndTime.toISOString(),
      remainingSeconds,
      currentQuestionIndex: attempt.currentQuestionIndex,
      questions: questionsList,
      savedAnswers: savedAnswersMap,
      resultId: attempt.result?.id,
    });
  } catch (error: any) {
    console.error("Fetch attempt error:", error);
    return NextResponse.json({ error: error.message || "Failed to load attempt" }, { status: 500 });
  }
}
