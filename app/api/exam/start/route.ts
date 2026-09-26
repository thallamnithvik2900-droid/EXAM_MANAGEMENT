export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { examId } = await req.json();
    if (!examId) {
      return NextResponse.json({ error: "Exam ID is required" }, { status: 400 });
    }

    // Verify student profile
    let studentId = user.studentId;
    if (!studentId) {
      const student = await prisma.student.findFirst({ where: { userId: user.id } });
      if (student) {
        studentId = student.id;
      } else {
        return NextResponse.json({ error: "No student profile found for this user account." }, { status: 403 });
      }
    }

    // Fetch Exam
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        examQuestions: {
          include: { question: true },
          orderBy: { order: "asc" },
        },
      },
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    if (!exam.isPublished) {
      return NextResponse.json({ error: "This exam has not yet been published." }, { status: 403 });
    }

    // 1. Check for an ACTIVE existing attempt
    let activeAttempt = await prisma.examAttempt.findFirst({
      where: {
        studentId,
        examId,
        status: "IN_PROGRESS",
      },
      include: {
        answers: true,
      },
    });

    // 2. If already submitted and completed
    if (!activeAttempt) {
      const pastAttempt = await prisma.examAttempt.findFirst({
        where: {
          studentId,
          examId,
          status: { in: ["SUBMITTED", "TIMED_OUT"] },
        },
        include: { result: true },
      });

      // If already submitted and not a practice test that allows multiple attempts
      if (pastAttempt && exam.examType !== "PRACTICE_TEST") {
        return NextResponse.json({
          error: "You have already completed this examination.",
          alreadySubmitted: true,
          resultId: pastAttempt.result?.id,
        }, { status: 400 });
      }

      // Create new attempt
      const startTime = new Date();
      const expectedEndTime = new Date(startTime.getTime() + exam.durationMinutes * 60 * 1000);

      activeAttempt = await prisma.examAttempt.create({
        data: {
          studentId,
          examId,
          startTime,
          expectedEndTime,
          status: "IN_PROGRESS",
          currentQuestionIndex: 0,
        },
        include: {
          answers: true,
        },
      });

      // Initialize blank answers for all questions
      for (const eq of exam.examQuestions) {
        await prisma.attemptAnswer.create({
          data: {
            attemptId: activeAttempt.id,
            questionId: eq.questionId,
            isAnswered: false,
            isMarkedForReview: false,
          },
        });
      }
    }

    // Prepare questions list SANITIZED (No correctAnswer or explanation)
    let questionsList = exam.examQuestions.map((eq) => {
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

    if (exam.isRandomized) {
      // Deterministically or randomly shuffle
      questionsList = questionsList.sort(() => Math.random() - 0.5);
    }

    // Calculate server remaining seconds
    const remainingSeconds = Math.max(
      0,
      Math.floor((new Date(activeAttempt.expectedEndTime).getTime() - Date.now()) / 1000)
    );

    // Refresh answers map
    const freshAnswers = await prisma.attemptAnswer.findMany({
      where: { attemptId: activeAttempt.id },
    });

    const savedAnswersMap: Record<string, any> = {};
    for (const ans of freshAnswers) {
      savedAnswersMap[ans.questionId] = {
        questionId: ans.questionId,
        studentAnswer: ans.studentAnswer,
        isMarkedForReview: ans.isMarkedForReview,
        isAnswered: ans.isAnswered,
      };
    }

    return NextResponse.json({
      attemptId: activeAttempt.id,
      examId: exam.id,
      examTitle: exam.title,
      examType: exam.examType,
      durationMinutes: exam.durationMinutes,
      totalMarks: exam.totalMarks,
      negativeMarking: exam.negativeMarking,
      startTime: activeAttempt.startTime.toISOString(),
      expectedEndTime: activeAttempt.expectedEndTime.toISOString(),
      remainingSeconds,
      currentQuestionIndex: activeAttempt.currentQuestionIndex,
      questions: questionsList,
      savedAnswers: savedAnswersMap,
    });
  } catch (error: any) {
    console.error("Exam start error:", error);
    return NextResponse.json({ error: error.message || "Failed to start examination" }, { status: 500 });
  }
}

