export type Role = "ADMIN" | "FACULTY" | "INVIGILATOR" | "STUDENT";

export type QuestionType = "MCQ_SINGLE" | "MCQ_MULTIPLE" | "TRUE_FALSE" | "NUMERICAL" | "CODING" | "DESCRIPTIVE";

export type QuestionDifficulty = "EASY" | "MEDIUM" | "HARD";

export type ExamType = "ONLINE_OBJECTIVE" | "MID_TERM" | "FINAL_SEMESTER" | "PRACTICE_TEST";

export type AttemptStatus = "IN_PROGRESS" | "SUBMITTED" | "TIMED_OUT" | "CANCELLED";

export type PaletteState = "NOT_VISITED" | "ANSWERED" | "NOT_ANSWERED" | "MARKED_FOR_REVIEW" | "ANSWERED_AND_MARKED";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  studentId?: string;
  facultyId?: string;
  rollNumber?: string;
  departmentName?: string;
}

export interface SanitizedQuestion {
  id: string;
  subjectId: string;
  topic: string;
  chapter?: string | null;
  difficulty: QuestionDifficulty;
  questionType: QuestionType;
  questionText: string;
  options: string[];
  marks: number;
  negativeMarks: number;
  order: number;
}

export interface QuestionAnswerState {
  questionId: string;
  studentAnswer: string | null;
  isMarkedForReview: boolean;
  isAnswered: boolean;
  savedAt?: string;
}

export interface ExamAttemptDetail {
  attemptId: string;
  examId: string;
  examTitle: string;
  durationMinutes: number;
  totalMarks: number;
  negativeMarking: number;
  startTime: string;
  expectedEndTime: string;
  remainingSeconds: number;
  status: AttemptStatus;
  currentQuestionIndex: number;
  questions: SanitizedQuestion[];
  savedAnswers: Record<string, QuestionAnswerState>;
}

export interface TopicPerformance {
  topic: string;
  totalQuestions: number;
  correct: number;
  wrong: number;
  accuracy: number;
}
