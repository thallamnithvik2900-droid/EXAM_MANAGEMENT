package com.exam.controller;

import com.exam.dto.SaveAnswerRequest;
import com.exam.dto.StartExamRequest;
import com.exam.model.*;
import com.exam.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/exam")
public class ExamController {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final ExamRepository examRepository;
    private final ExamQuestionRepository examQuestionRepository;
    private final ExamAttemptRepository examAttemptRepository;
    private final AttemptAnswerRepository attemptAnswerRepository;
    private final ResultRepository resultRepository;

    public ExamController(
            UserRepository userRepository,
            StudentRepository studentRepository,
            ExamRepository examRepository,
            ExamQuestionRepository examQuestionRepository,
            ExamAttemptRepository examAttemptRepository,
            AttemptAnswerRepository attemptAnswerRepository,
            ResultRepository resultRepository) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.examRepository = examRepository;
        this.examQuestionRepository = examQuestionRepository;
        this.examAttemptRepository = examAttemptRepository;
        this.attemptAnswerRepository = attemptAnswerRepository;
        this.resultRepository = resultRepository;
    }

    @PostMapping("/start")
    public ResponseEntity<?> startExam(@RequestBody StartExamRequest req, Principal principal) {
        Optional<User> userOpt = userRepository.findByEmail(principal.getName());
        if (userOpt.isEmpty()) return ResponseEntity.badRequest().build();

        Optional<Student> stuOpt = studentRepository.findByUserId(userOpt.get().getId());
        Optional<Exam> examOpt = examRepository.findById(req.getExamId());

        if (stuOpt.isEmpty() || examOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Student or Exam not found"));
        }

        Exam exam = examOpt.get();
        Student student = stuOpt.get();

        Optional<ExamAttempt> existing = examAttemptRepository.findByStudentIdAndExamId(student.getId(), exam.getId());
        if (existing.isPresent()) {
            return ResponseEntity.ok(Map.of("success", true, "attemptId", existing.get().getId()));
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime endTime = now.plusMinutes(exam.getDurationMinutes());

        ExamAttempt attempt = examAttemptRepository.save(ExamAttempt.builder()
                .student(student)
                .exam(exam)
                .startTime(now)
                .expectedEndTime(endTime)
                .status("IN_PROGRESS")
                .build());

        return ResponseEntity.ok(Map.of("success", true, "attemptId", attempt.getId()));
    }

    @GetMapping("/{attemptId}")
    public ResponseEntity<?> getAttemptDetails(@PathVariable String attemptId) {
        Optional<ExamAttempt> attOpt = examAttemptRepository.findById(attemptId);
        if (attOpt.isEmpty()) return ResponseEntity.notFound().build();

        ExamAttempt attempt = attOpt.get();
        Exam exam = attempt.getExam();

        List<ExamQuestion> eqList = examQuestionRepository.findByExamIdOrderByOrderIndexAsc(exam.getId());
        List<AttemptAnswer> answers = attemptAnswerRepository.findByAttemptId(attempt.getId());

        Map<String, AttemptAnswer> answerMap = answers.stream()
                .collect(Collectors.toMap(a -> a.getQuestion().getId(), a -> a));

        List<Map<String, Object>> questions = eqList.stream().map(eq -> {
            Question q = eq.getQuestion();
            AttemptAnswer ans = answerMap.get(q.getId());
            Map<String, Object> map = new HashMap<>();
            map.put("id", q.getId());
            map.put("topic", q.getTopic());
            map.put("difficulty", q.getDifficulty());
            map.put("questionType", q.getQuestionType());
            map.put("questionText", q.getQuestionText());
            map.put("optionsJson", q.getOptionsJson());
            map.put("marks", q.getMarks());
            map.put("studentAnswer", ans != null ? ans.getStudentAnswer() : null);
            map.put("isMarkedForReview", ans != null && Boolean.TRUE.equals(ans.getIsMarkedForReview()));
            map.put("isAnswered", ans != null && Boolean.TRUE.equals(ans.getIsAnswered()));
            return map;
        }).collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("attemptId", attempt.getId());
        response.put("examTitle", exam.getTitle());
        response.put("subject", exam.getSubject().getName());
        response.put("durationMinutes", exam.getDurationMinutes());
        response.put("expectedEndTime", attempt.getExpectedEndTime().toString());
        response.put("status", attempt.getStatus());
        response.put("questions", questions);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/save-answer")
    public ResponseEntity<?> saveAnswer(@RequestBody SaveAnswerRequest req) {
        Optional<ExamAttempt> attOpt = examAttemptRepository.findById(req.getAttemptId());
        Optional<Question> qOpt = questionRepository.findById(req.getQuestionId());

        if (attOpt.isEmpty() || qOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Attempt or Question not found"));
        }

        ExamAttempt attempt = attOpt.get();
        Question question = qOpt.get();

        Optional<AttemptAnswer> ansOpt = attemptAnswerRepository.findByAttemptIdAndQuestionId(attempt.getId(), question.getId());
        AttemptAnswer ans;

        boolean isAnswered = req.getStudentAnswer() != null && !req.getStudentAnswer().trim().isEmpty();

        if (ansOpt.isPresent()) {
            ans = ansOpt.get();
            ans.setStudentAnswer(req.getStudentAnswer());
            ans.setIsAnswered(isAnswered);
            if (req.getIsMarkedForReview() != null) ans.setIsMarkedForReview(req.getIsMarkedForReview());
        } else {
            ans = AttemptAnswer.builder()
                    .attempt(attempt)
                    .question(question)
                    .studentAnswer(req.getStudentAnswer())
                    .isAnswered(isAnswered)
                    .isMarkedForReview(req.getIsMarkedForReview() != null ? req.getIsMarkedForReview() : false)
                    .build();
        }

        attemptAnswerRepository.save(ans);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @PostMapping("/submit")
    public ResponseEntity<?> submitExam(@RequestBody Map<String, String> body) {
        String attemptId = body.get("attemptId");
        Optional<ExamAttempt> attOpt = examAttemptRepository.findById(attemptId);
        if (attOpt.isEmpty()) return ResponseEntity.badRequest().body(Map.of("error", "Attempt not found"));

        ExamAttempt attempt = attOpt.get();
        Exam exam = attempt.getExam();
        attempt.setStatus("SUBMITTED");
        attempt.setSubmittedAt(LocalDateTime.now());
        examAttemptRepository.save(attempt);

        List<ExamQuestion> eqList = examQuestionRepository.findByExamIdOrderByOrderIndexAsc(exam.getId());
        List<AttemptAnswer> answers = attemptAnswerRepository.findByAttemptId(attempt.getId());
        Map<String, AttemptAnswer> answerMap = answers.stream().collect(Collectors.toMap(a -> a.getQuestion().getId(), a -> a));

        double totalScore = 0.0;
        double maxScore = 0.0;
        int correctCount = 0;
        int wrongCount = 0;
        int unansweredCount = 0;

        for (ExamQuestion eq : eqList) {
            Question q = eq.getQuestion();
            maxScore += q.getMarks();
            AttemptAnswer ans = answerMap.get(q.getId());

            if (ans == null || ans.getStudentAnswer() == null || ans.getStudentAnswer().trim().isEmpty()) {
                unansweredCount++;
            } else if (ans.getStudentAnswer().trim().equalsIgnoreCase(q.getCorrectAnswer().trim())) {
                correctCount++;
                totalScore += q.getMarks();
                ans.setIsCorrect(true);
                ans.setMarksAwarded(q.getMarks());
                attemptAnswerRepository.save(ans);
            } else {
                wrongCount++;
                totalScore -= (q.getNegativeMarks() != null ? q.getNegativeMarks() : 0.0);
                ans.setIsCorrect(false);
                ans.setMarksAwarded(-(q.getNegativeMarks() != null ? q.getNegativeMarks() : 0.0));
                attemptAnswerRepository.save(ans);
            }
        }

        totalScore = Math.max(0.0, totalScore);
        double percentage = maxScore > 0 ? (totalScore / maxScore) * 100.0 : 0.0;
        boolean isPassed = totalScore >= exam.getPassMarks();
        double accuracy = (correctCount + wrongCount) > 0 ? ((double) correctCount / (correctCount + wrongCount)) * 100.0 : 0.0;

        Result result = resultRepository.save(Result.builder()
                .student(attempt.getStudent())
                .exam(exam)
                .attempt(attempt)
                .score(totalScore)
                .maxScore(maxScore)
                .percentage(Math.round(percentage * 100.0) / 100.0)
                .isPassed(isPassed)
                .correctCount(correctCount)
                .wrongCount(wrongCount)
                .unansweredCount(unansweredCount)
                .accuracy(Math.round(accuracy * 100.0) / 100.0)
                .build());

        return ResponseEntity.ok(Map.of("success", true, "resultId", result.getId()));
    }

    @GetMapping("/result/{resultId}")
    public ResponseEntity<?> getResultDetails(@PathVariable String resultId) {
        Optional<Result> resOpt = resultRepository.findById(resultId);
        if (resOpt.isEmpty()) return ResponseEntity.notFound().build();

        Result r = resOpt.get();
        Map<String, Object> map = new HashMap<>();
        map.put("id", r.getId());
        map.put("studentName", r.getStudent().getUser().getName());
        map.put("rollNumber", r.getStudent().getRollNumber());
        map.put("examTitle", r.getExam().getTitle());
        map.put("subject", r.getExam().getSubject().getName());
        map.put("score", r.getScore());
        map.put("maxScore", r.getMaxScore());
        map.put("percentage", r.getPercentage());
        map.put("isPassed", r.getIsPassed());
        map.put("accuracy", r.getAccuracy());
        map.put("correctCount", r.getCorrectCount());
        map.put("wrongCount", r.getWrongCount());
        map.put("unansweredCount", r.getUnansweredCount());

        return ResponseEntity.ok(map);
    }
}
