package com.exam.controller;

import com.exam.dto.MarkAttendanceRequest;
import com.exam.model.*;
import com.exam.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/invigilator")
public class InvigilatorController {

    private final UserRepository userRepository;
    private final FacultyRepository facultyRepository;
    private final InvigilatorAssignmentRepository invigilatorAssignmentRepository;
    private final StudentRepository studentRepository;
    private final AttendanceRepository attendanceRepository;
    private final ExamScheduleRepository examScheduleRepository;

    public InvigilatorController(
            UserRepository userRepository,
            FacultyRepository facultyRepository,
            InvigilatorAssignmentRepository invigilatorAssignmentRepository,
            StudentRepository studentRepository,
            AttendanceRepository attendanceRepository,
            ExamScheduleRepository examScheduleRepository) {
        this.userRepository = userRepository;
        this.facultyRepository = facultyRepository;
        this.invigilatorAssignmentRepository = invigilatorAssignmentRepository;
        this.studentRepository = studentRepository;
        this.attendanceRepository = attendanceRepository;
        this.examScheduleRepository = examScheduleRepository;
    }

    @GetMapping("/dashboard-data")
    public ResponseEntity<?> getDashboardData(Principal principal) {
        Optional<User> userOpt = userRepository.findByEmail(principal.getName());
        if (userOpt.isEmpty()) return ResponseEntity.badRequest().build();

        User user = userOpt.get();
        Optional<Faculty> facOpt = facultyRepository.findByUserId(user.getId());

        List<InvigilatorAssignment> assignments = facOpt.isPresent() ?
                invigilatorAssignmentRepository.findByFacultyId(facOpt.get().getId()) :
                invigilatorAssignmentRepository.findAll();

        List<Map<String, Object>> assignList = assignments.stream().map(a -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", a.getId());
            map.put("hallName", a.getHall().getName());
            map.put("hallCode", a.getHall().getHallCode());
            map.put("examTitle", a.getExamSchedule().getExam().getTitle());
            map.put("subject", a.getExamSchedule().getExam().getSubject().getName());
            map.put("date", a.getExamSchedule().getDate().toString());
            map.put("startTime", a.getExamSchedule().getStartTime());
            map.put("endTime", a.getExamSchedule().getEndTime());
            map.put("scheduleId", a.getExamSchedule().getId());
            map.put("status", a.getStatus());

            List<Attendance> atts = attendanceRepository.findByExamScheduleId(a.getExamSchedule().getId());
            List<Map<String, Object>> attList = atts.stream().map(at -> Map.<String, Object>of(
                    "id", at.getId(),
                    "studentId", at.getStudent().getId(),
                    "studentName", at.getStudent().getUser().getName(),
                    "rollNumber", at.getStudent().getRollNumber(),
                    "status", at.getStatus(),
                    "notes", at.getNotes() != null ? at.getNotes() : ""
            )).collect(Collectors.toList());

            map.put("attendance", attList);
            return map;
        }).collect(Collectors.toList());

        List<Student> students = studentRepository.findAll();
        List<Map<String, String>> studentList = students.stream().map(s -> Map.of(
                "id", s.getId(),
                "name", s.getUser().getName(),
                "rollNumber", s.getRollNumber()
        )).collect(Collectors.toList());

        return ResponseEntity.ok(Map.of("assignments", assignList, "allStudents", studentList));
    }

    @PostMapping("/mark-attendance")
    public ResponseEntity<?> markAttendance(@RequestBody MarkAttendanceRequest req, Principal principal) {
        Optional<User> userOpt = userRepository.findByEmail(principal.getName());
        String userId = userOpt.map(User::getId).orElse(null);

        Optional<ExamSchedule> schedOpt = examScheduleRepository.findById(req.getExamScheduleId());
        Optional<Student> stuOpt = studentRepository.findById(req.getStudentId());

        if (schedOpt.isEmpty() || stuOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Schedule or Student not found"));
        }

        Optional<Attendance> existing = attendanceRepository.findByExamScheduleIdAndStudentId(req.getExamScheduleId(), req.getStudentId());
        Attendance record;

        if (existing.isPresent()) {
            record = existing.get();
            record.setStatus(req.getStatus());
            record.setNotes(req.getNotes());
            record.setMarkedById(userId);
        } else {
            record = Attendance.builder()
                    .examSchedule(schedOpt.get())
                    .student(stuOpt.get())
                    .status(req.getStatus())
                    .notes(req.getNotes())
                    .markedById(userId)
                    .build();
        }

        Attendance saved = attendanceRepository.save(record);
        return ResponseEntity.ok(Map.of("success", true, "id", saved.getId()));
    }
}
