package com.exam.controller;

import com.exam.model.*;
import com.exam.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/student")
public class StudentController {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final ExamRepository examRepository;
    private final ExamAttemptRepository examAttemptRepository;
    private final SeatAllocationRepository seatAllocationRepository;
    private final ResultRepository resultRepository;

    public StudentController(
            UserRepository userRepository,
            StudentRepository studentRepository,
            ExamRepository examRepository,
            ExamAttemptRepository examAttemptRepository,
            SeatAllocationRepository seatAllocationRepository,
            ResultRepository resultRepository) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.examRepository = examRepository;
        this.examAttemptRepository = examAttemptRepository;
        this.seatAllocationRepository = seatAllocationRepository;
        this.resultRepository = resultRepository;
    }

    @GetMapping("/dashboard-data")
    public ResponseEntity<?> getDashboardData(Principal principal) {
        Optional<User> userOpt = userRepository.findByEmail(principal.getName());
        if (userOpt.isEmpty()) return ResponseEntity.badRequest().build();

        User user = userOpt.get();
        Optional<Student> stuOpt = studentRepository.findByUserId(user.getId());

        List<Exam> exams = examRepository.findAll();
        List<ExamAttempt> attempts = stuOpt.isPresent() ? examAttemptRepository.findByStudentId(stuOpt.get().getId()) : Collections.emptyList();
        List<Result> results = stuOpt.isPresent() ? resultRepository.findByStudentId(stuOpt.get().getId()) : Collections.emptyList();

        double avgPercentage = results.isEmpty() ? 0.0 : results.stream().mapToDouble(Result::getPercentage).average().orElse(0.0);

        Map<String, Object> response = new HashMap<>();
        response.put("student", stuOpt.map(s -> Map.of(
                "name", user.getName(),
                "rollNumber", s.getRollNumber(),
                "registrationNo", s.getRegistrationNo(),
                "department", s.getDepartment() != null ? s.getDepartment().getName() : "Computer Science"
        )).orElse(null));

        List<Map<String, Object>> examList = exams.stream().map(e -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", e.getId());
            map.put("title", e.getTitle());
            map.put("code", e.getCode());
            map.put("subject", e.getSubject().getName());
            map.put("durationMinutes", e.getDurationMinutes());
            map.put("totalMarks", e.getTotalMarks());
            map.put("passMarks", e.getPassMarks());

            Optional<ExamAttempt> attOpt = attempts.stream().filter(a -> a.getExam().getId().equals(e.getId())).findFirst();
            map.put("attemptStatus", attOpt.map(ExamAttempt::getStatus).orElse("NOT_STARTED"));
            map.put("attemptId", attOpt.map(ExamAttempt::getId).orElse(null));
            return map;
        }).collect(Collectors.toList());

        response.put("exams", examList);
        response.put("results", results);
        response.put("stats", Map.of(
                "completedExams", results.size(),
                "avgPercentage", Math.round(avgPercentage),
                "upcomingExams", exams.size() - results.size()
        ));

        return ResponseEntity.ok(response);
    }

    @GetMapping("/hall-tickets")
    public ResponseEntity<?> getHallTickets(Principal principal) {
        Optional<User> userOpt = userRepository.findByEmail(principal.getName());
        if (userOpt.isEmpty()) return ResponseEntity.badRequest().build();

        Optional<Student> stuOpt = studentRepository.findByUserId(userOpt.get().getId());
        if (stuOpt.isEmpty()) return ResponseEntity.ok(Collections.emptyList());

        List<SeatAllocation> allocations = seatAllocationRepository.findByStudentId(stuOpt.get().getId());
        List<Map<String, Object>> response = allocations.stream().map(a -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", a.getId());
            map.put("studentName", stuOpt.get().getUser().getName());
            map.put("rollNumber", stuOpt.get().getRollNumber());
            map.put("examTitle", a.getExamSchedule().getExam().getTitle());
            map.put("subject", a.getExamSchedule().getExam().getSubject().getName());
            map.put("date", a.getExamSchedule().getDate().toString());
            map.put("startTime", a.getExamSchedule().getStartTime());
            map.put("endTime", a.getExamSchedule().getEndTime());
            map.put("hallName", a.getHall().getName());
            map.put("hallCode", a.getHall().getHallCode());
            map.put("building", a.getHall().getBuilding());
            map.put("seatNumber", a.getSeatNumber());
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }
}
