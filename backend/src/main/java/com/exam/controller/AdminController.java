package com.exam.controller;

import com.exam.dto.SeatingRequest;
import com.exam.model.*;
import com.exam.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final FacultyRepository facultyRepository;
    private final DepartmentRepository departmentRepository;
    private final SubjectRepository subjectRepository;
    private final ExamRepository examRepository;
    private final QuestionRepository questionRepository;
    private final HallRepository hallRepository;
    private final ExamScheduleRepository examScheduleRepository;
    private final SeatAllocationRepository seatAllocationRepository;
    private final InvigilatorAssignmentRepository invigilatorAssignmentRepository;
    private final AttendanceRepository attendanceRepository;
    private final ResultRepository resultRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminController(
            UserRepository userRepository,
            StudentRepository studentRepository,
            FacultyRepository facultyRepository,
            DepartmentRepository departmentRepository,
            SubjectRepository subjectRepository,
            ExamRepository examRepository,
            QuestionRepository questionRepository,
            HallRepository hallRepository,
            ExamScheduleRepository examScheduleRepository,
            SeatAllocationRepository seatAllocationRepository,
            InvigilatorAssignmentRepository invigilatorAssignmentRepository,
            AttendanceRepository attendanceRepository,
            ResultRepository resultRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.facultyRepository = facultyRepository;
        this.departmentRepository = departmentRepository;
        this.subjectRepository = subjectRepository;
        this.examRepository = examRepository;
        this.questionRepository = questionRepository;
        this.hallRepository = hallRepository;
        this.examScheduleRepository = examScheduleRepository;
        this.seatAllocationRepository = seatAllocationRepository;
        this.invigilatorAssignmentRepository = invigilatorAssignmentRepository;
        this.attendanceRepository = attendanceRepository;
        this.resultRepository = resultRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/dashboard-stats")
    public ResponseEntity<?> getDashboardStats() {
        long totalStudents = studentRepository.count();
        long totalFaculty = facultyRepository.count();
        long totalExams = examRepository.count();
        long totalHalls = hallRepository.count();
        long totalResults = resultRepository.count();

        List<Result> results = resultRepository.findAll();
        double avgPassRate = results.isEmpty() ? 85.0 :
                (double) results.stream().filter(Result::getIsPassed).count() / results.size() * 100.0;

        return ResponseEntity.ok(Map.of(
                "totalStudents", totalStudents,
                "totalFaculty", totalFaculty,
                "totalExams", totalExams,
                "totalHalls", totalHalls,
                "totalResults", totalResults,
                "passRate", Math.round(avgPassRate)
        ));
    }

    @GetMapping("/students")
    public ResponseEntity<?> getStudents() {
        List<Student> students = studentRepository.findAll();
        List<Map<String, Object>> response = students.stream().map(s -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", s.getId());
            map.put("name", s.getUser().getName());
            map.put("email", s.getUser().getEmail());
            map.put("rollNumber", s.getRollNumber());
            map.put("registrationNo", s.getRegistrationNo());
            map.put("department", s.getDepartment() != null ? s.getDepartment().getName() : "N/A");
            map.put("semester", s.getSemester());
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/faculty")
    public ResponseEntity<?> getFaculty() {
        List<Faculty> list = facultyRepository.findAll();
        List<Map<String, Object>> response = list.stream().map(f -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", f.getId());
            map.put("name", f.getUser().getName());
            map.put("email", f.getUser().getEmail());
            map.put("employeeId", f.getEmployeeId());
            map.put("designation", f.getDesignation());
            map.put("department", f.getDepartment() != null ? f.getDepartment().getName() : "N/A");
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/subjects")
    public ResponseEntity<?> getSubjects() {
        List<Subject> subjects = subjectRepository.findAll();
        return ResponseEntity.ok(subjects);
    }

    @GetMapping("/exams")
    public ResponseEntity<?> getExams() {
        List<Exam> list = examRepository.findAll();
        List<Map<String, Object>> response = list.stream().map(e -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", e.getId());
            map.put("title", e.getTitle());
            map.put("code", e.getCode());
            map.put("subject", e.getSubject().getName());
            map.put("examType", e.getExamType());
            map.put("durationMinutes", e.getDurationMinutes());
            map.put("totalMarks", e.getTotalMarks());
            map.put("isPublished", e.getIsPublished());
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/questions")
    public ResponseEntity<?> getQuestions(@RequestParam(required = false) String subjectId) {
        List<Question> list = subjectId != null ? questionRepository.findBySubjectId(subjectId) : questionRepository.findAll();
        List<Map<String, Object>> response = list.stream().map(q -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", q.getId());
            map.put("subjectId", q.getSubject().getId());
            map.put("subject", q.getSubject().getName());
            map.put("topic", q.getTopic());
            map.put("chapter", q.getChapter());
            map.put("difficulty", q.getDifficulty());
            map.put("questionType", q.getQuestionType());
            map.put("questionText", q.getQuestionText());
            map.put("optionsJson", q.getOptionsJson());
            map.put("correctAnswer", q.getCorrectAnswer());
            map.put("explanation", q.getExplanation());
            map.put("marks", q.getMarks());
            map.put("negativeMarks", q.getNegativeMarks());
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/questions")
    public ResponseEntity<?> createQuestion(@RequestBody Map<String, Object> body) {
        String subjectId = (String) body.get("subjectId");
        Optional<Subject> subOpt = subjectRepository.findById(subjectId);
        if (subOpt.isEmpty()) return ResponseEntity.badRequest().body(Map.of("error", "Subject not found"));

        Question q = questionRepository.save(Question.builder()
                .subject(subOpt.get())
                .topic((String) body.getOrDefault("topic", "General"))
                .chapter((String) body.get("chapter"))
                .difficulty((String) body.getOrDefault("difficulty", "MEDIUM"))
                .questionType((String) body.getOrDefault("questionType", "MCQ_SINGLE"))
                .questionText((String) body.get("questionText"))
                .optionsJson((String) body.get("optionsJson"))
                .correctAnswer((String) body.get("correctAnswer"))
                .explanation((String) body.get("explanation"))
                .marks(body.get("marks") != null ? Double.parseDouble(body.get("marks").toString()) : 1.0)
                .negativeMarks(body.get("negativeMarks") != null ? Double.parseDouble(body.get("negativeMarks").toString()) : 0.0)
                .build());

        return ResponseEntity.ok(Map.of("success", true, "id", q.getId()));
    }

    @GetMapping("/halls")
    public ResponseEntity<?> getHalls() {
        return ResponseEntity.ok(hallRepository.findAll());
    }

    @PostMapping("/halls")
    public ResponseEntity<?> createHall(@RequestBody Hall hall) {
        Hall saved = hallRepository.save(hall);
        return ResponseEntity.ok(Map.of("success", true, "id", saved.getId()));
    }

    @GetMapping("/seating")
    public ResponseEntity<?> getSeating(@RequestParam(required = false) String scheduleId) {
        if (scheduleId == null) {
            List<ExamSchedule> schedules = examScheduleRepository.findAll();
            List<Map<String, Object>> response = schedules.stream().map(s -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", s.getId());
                map.put("examTitle", s.getExam().getTitle());
                map.put("hall", s.getHall() != null ? s.getHall().getName() : "Unassigned");
                map.put("date", s.getDate().toString());
                map.put("startTime", s.getStartTime());
                return map;
            }).collect(Collectors.toList());
            return ResponseEntity.ok(Map.of("schedules", response));
        }

        List<SeatAllocation> allocations = seatAllocationRepository.findByExamScheduleId(scheduleId);
        Optional<ExamSchedule> schedOpt = examScheduleRepository.findById(scheduleId);

        List<Map<String, Object>> allocList = allocations.stream().map(a -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", a.getId());
            map.put("studentName", a.getStudent().getUser().getName());
            map.put("rollNumber", a.getStudent().getRollNumber());
            map.put("seatNumber", a.getSeatNumber());
            map.put("row", a.getRowNumber());
            map.put("col", a.getColNumber());
            map.put("hallName", a.getHall().getName());
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(Map.of("schedule", schedOpt.orElse(null), "allocations", allocList));
    }

    @PostMapping("/seating")
    public ResponseEntity<?> generateSeating(@RequestBody SeatingRequest req) {
        Optional<ExamSchedule> schedOpt = examScheduleRepository.findById(req.getExamScheduleId());
        if (schedOpt.isEmpty() || schedOpt.get().getHall() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Schedule or hall not found"));
        }

        ExamSchedule schedule = schedOpt.get();
        Hall hall = schedule.getHall();
        seatAllocationRepository.deleteByExamScheduleId(schedule.getId());

        List<Student> students = studentRepository.findAll();
        int allocated = 0;
        for (int i = 0; i < students.size() && allocated < hall.getCapacity(); i++) {
            int row = (i / hall.getCols()) + 1;
            int col = (i % hall.getCols()) + 1;
            String seatNumber = String.format("%s-R%d-S%02d", hall.getHallCode(), row, col);

            seatAllocationRepository.save(SeatAllocation.builder()
                    .examSchedule(schedule)
                    .student(students.get(i))
                    .hall(hall)
                    .rowNumber(row)
                    .colNumber(col)
                    .seatNumber(seatNumber)
                    .build());
            allocated++;
        }

        return ResponseEntity.ok(Map.of("success", true, "allocated", allocated));
    }

    @GetMapping("/invigilators")
    public ResponseEntity<?> getInvigilators() {
        List<InvigilatorAssignment> list = invigilatorAssignmentRepository.findAll();
        List<Map<String, Object>> response = list.stream().map(a -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", a.getId());
            map.put("facultyName", a.getFaculty().getUser().getName());
            map.put("employeeId", a.getFaculty().getEmployeeId());
            map.put("hallName", a.getHall().getName());
            map.put("examTitle", a.getExamSchedule().getExam().getTitle());
            map.put("date", a.getExamSchedule().getDate().toString());
            map.put("status", a.getStatus());
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/attendance")
    public ResponseEntity<?> getAttendance(@RequestParam(required = false) String scheduleId) {
        List<Attendance> list = scheduleId != null ? attendanceRepository.findByExamScheduleId(scheduleId) : attendanceRepository.findAll();
        List<Map<String, Object>> response = list.stream().map(a -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", a.getId());
            map.put("studentName", a.getStudent().getUser().getName());
            map.put("rollNumber", a.getStudent().getRollNumber());
            map.put("examTitle", a.getExamSchedule().getExam().getTitle());
            map.put("status", a.getStatus());
            map.put("notes", a.getNotes());
            map.put("date", a.getExamSchedule().getDate().toString());
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/results")
    public ResponseEntity<?> getResults() {
        List<Result> list = resultRepository.findAll();
        List<Map<String, Object>> response = list.stream().map(r -> {
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
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/reports")
    public ResponseEntity<?> getReports() {
        List<Result> results = resultRepository.findAll();
        long passCount = results.stream().filter(Result::getIsPassed).count();
        long failCount = results.size() - passCount;

        Map<String, List<Result>> subjectMap = results.stream()
                .collect(Collectors.groupingBy(r -> r.getExam().getSubject().getName()));

        List<Map<String, Object>> subjectStats = subjectMap.entrySet().stream().map(e -> {
            List<Result> rList = e.getValue();
            double avgPct = rList.stream().mapToDouble(Result::getPercentage).average().orElse(0.0);
            long p = rList.stream().filter(Result::getIsPassed).count();
            return Map.<String, Object>of(
                    "subject", e.getKey(),
                    "total", rList.size(),
                    "avgPercentage", Math.round(avgPct),
                    "pass", p,
                    "fail", rList.size() - p
            );
        }).collect(Collectors.toList());

        List<Attendance> attendanceList = attendanceRepository.findAll();
        long present = attendanceList.stream().filter(a -> "PRESENT".equals(a.getStatus())).count();
        long absent = attendanceList.stream().filter(a -> "ABSENT".equals(a.getStatus())).count();
        long late = attendanceList.stream().filter(a -> "LATE".equals(a.getStatus())).count();

        return ResponseEntity.ok(Map.of(
                "totalResults", results.size(),
                "passCount", passCount,
                "failCount", failCount,
                "subjectStats", subjectStats,
                "attendance", Map.of("total", attendanceList.size(), "present", present, "absent", absent, "late", late)
        ));
    }
}
