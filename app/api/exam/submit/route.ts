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

    const { attemptId, autoSubmit } = await req.json();
    if (!attemptId) {
      return NextResponse.json({ error: "Attempt ID is required" }, { status: 400 });
    }

    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: {
        exam: {
          include: {
            examQuestions: {
              include: { question: true },
            },
          },
        },
        student: { include: { user: true } },
        answers: true,
        result: true,
      },
    });

    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    // Student authorization
    if (user.role === "STUDENT" && attempt.student.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden access" }, { status: 403 });
    }

    // If already submitted, return existing result
    if (attempt.status === "SUBMITTED" || attempt.status === "TIMED_OUT") {
      return NextResponse.json({
        success: true,
        message: "Attempt already submitted",
        resultId: attempt.result?.id,
      });
    }

    const exam = attempt.exam;
    const allQuestions = exam.examQuestions.map((eq) => eq.question);
    const answersMap = new Map(attempt.answers.map((a) => [a.questionId, a]));

    let totalScore = 0;
    let maxScore = 0;
    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;

    const topicStats: Record<string, { total: number; correct: number; wrong: number; marks: number; maxMarks: number }> = {};

    for (const q of allQuestions) {
      maxScore += q.marks;
      const topic = q.topic || "General";
      if (!topicStats[topic]) {
        topicStats[topic] = { total: 0, correct: 0, wrong: 0, marks: 0, maxMarks: 0 };
      }
      topicStats[topic].total += 1;
      topicStats[topic].maxMarks += q.marks;

      const userAns = answersMap.get(q.id);
      const studentAnsText = userAns?.studentAnswer?.trim() || "";

      if (!studentAnsText) {
        unansweredCount++;
        if (userAns) {
          await prisma.attemptAnswer.update({
            where: { id: userAns.id },
            data: { isCorrect: false, marksAwarded: 0, isAnswered: false },
          });
        }
        continue;
      }

      // Evaluate correctness
      let isCorrect = false;

      if (q.questionType === "MCQ_MULTIPLE") {
        try {
          const studentArr = JSON.parse(studentAnsText).sort();
          const correctArr = JSON.parse(q.correctAnswer).sort();
          isCorrect = JSON.stringify(studentArr) === JSON.stringify(correctArr);
        } catch {
          isCorrect = false;
        }
      } else if (q.questionType === "NUMERICAL") {
        const studentNum = parseFloat(studentAnsText);
        const correctNum = parseFloat(q.correctAnswer.trim());
        if (!isNaN(studentNum) && !isNaN(correctNum)) {
          isCorrect = Math.abs(studentNum - correctNum) < 0.01;
        } else {
          isCorrect = studentAnsText.toLowerCase() === q.correctAnswer.trim().toLowerCase();
        }
      } else {
        // MCQ_SINGLE or TRUE_FALSE
        isCorrect = studentAnsText.toLowerCase() === q.correctAnswer.trim().toLowerCase();
      }

      let marksAwarded = 0;
      if (isCorrect) {
        marksAwarded = q.marks;
        correctCount++;
        topicStats[topic].correct += 1;
      } else {
        marksAwarded = -(q.negativeMarks || 0);
        wrongCount++;
        topicStats[topic].wrong += 1;
      }

      totalScore += marksAwarded;
      topicStats[topic].marks += Math.max(0, marksAwarded);

      if (userAns) {
        await prisma.attemptAnswer.update({
          where: { id: userAns.id },
          data: { isCorrect, marksAwarded, isAnswered: true },
        });
      }
    }

    // Clamp score to >= 0
    const finalScore = Math.max(0, Number(totalScore.toFixed(2)));
    const percentage = maxScore > 0 ? Number(((finalScore / maxScore) * 100).toFixed(2)) : 0;
    const isPassed = finalScore >= exam.passMarks;
    const totalAnswered = correctCount + wrongCount;
    const accuracy = totalAnswered > 0 ? Number(((correctCount / totalAnswered) * 100).toFixed(2)) : 0;

    const submittedAt = new Date();
    const timeSpentSeconds = Math.max(
      0,
      Math.floor((submittedAt.getTime() - new Date(attempt.startTime).getTime()) / 1000)
    );

    // Update Attempt
    await prisma.examAttempt.update({
      where: { id: attempt.id },
      data: {
        status: autoSubmit ? "TIMED_OUT" : "SUBMITTED",
        submittedAt,
        totalTimeSpentSeconds: timeSpentSeconds,
      },
    });

    // Create Result
    const result = await prisma.result.upsert({
      where: { attemptId: attempt.id },
      update: {
        score: finalScore,
        maxScore,
        percentage,
        isPassed,
        correctCount,
        wrongCount,
        unansweredCount,
        accuracy,
        topicWiseJson: JSON.stringify(topicStats),
      },
      create: {
        studentId: attempt.studentId,
        examId: exam.id,
        attemptId: attempt.id,
        score: finalScore,
        maxScore,
        percentage,
        isPassed,
        correctCount,
        wrongCount,
        unansweredCount,
        accuracy,
        topicWiseJson: JSON.stringify(topicStats),
      },
    });

    // Send Notification to student
    await prisma.notification.create({
      data: {
        userId: attempt.student.userId,
        title: `Exam Completed: ${exam.title}`,
        message: `Your exam has been submitted. Score: ${finalScore}/${maxScore} (${percentage}%). Status: ${isPassed ? "PASSED" : "FAILED"}.`,
        type: "RESULT",
      },
    });

    return NextResponse.json({
      success: true,
      message: autoSubmit ? "Exam automatically submitted due to time limit." : "Exam successfully submitted.",
      resultId: result.id,
      score: finalScore,
      maxScore,
      percentage,
      isPassed,
    });
  } catch (error: any) {
    console.error("Submit error:", error);
    return NextResponse.json({ error: error.message || "Failed to submit exam" }, { status: 500 });
  }
}

