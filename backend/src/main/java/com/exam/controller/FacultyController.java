package com.exam.controller;

import com.exam.model.*;
import com.exam.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/faculty")
public class FacultyController {

    private final UserRepository userRepository;
    private final FacultyRepository facultyRepository;
    private final SubjectRepository subjectRepository;
    private final ExamRepository examRepository;
    private final QuestionRepository questionRepository;
    private final ResultRepository resultRepository;

    public FacultyController(
            UserRepository userRepository,
            FacultyRepository facultyRepository,
            SubjectRepository subjectRepository,
            ExamRepository examRepository,
            QuestionRepository questionRepository,
            ResultRepository resultRepository) {
        this.userRepository = userRepository;
        this.facultyRepository = facultyRepository;
        this.subjectRepository = subjectRepository;
        this.examRepository = examRepository;
        this.questionRepository = questionRepository;
        this.resultRepository = resultRepository;
    }

    @GetMapping("/dashboard-data")
    public ResponseEntity<?> getDashboardData(Principal principal) {
        Optional<User> userOpt = userRepository.findByEmail(principal.getName());
        if (userOpt.isEmpty()) return ResponseEntity.badRequest().build();

        User user = userOpt.get();
        Optional<Faculty> facOpt = facultyRepository.findByUserId(user.getId());

        List<Subject> subjects = facOpt.isPresent() && facOpt.get().getDepartment() != null ?
                subjectRepository.findByDepartmentId(facOpt.get().getDepartment().getId()) :
                subjectRepository.findAll();

        List<String> subjectIds = subjects.stream().map(Subject::getId).collect(Collectors.toList());

        List<Exam> exams = subjectIds.isEmpty() ? Collections.emptyList() : examRepository.findBySubjectIdIn(subjectIds);
        long questionCount = subjectIds.isEmpty() ? 0 : questionRepository.countBySubjectIdIn(subjectIds);
        List<Result> results = resultRepository.findAll();

        Map<String, Object> response = new HashMap<>();
        response.put("faculty", facOpt.map(f -> Map.of("name", user.getName(), "department", f.getDepartment() != null ? f.getDepartment().getName() : "General", "designation", f.getDesignation())).orElse(null));
        response.put("subjects", subjects);
        response.put("exams", exams);
        response.put("questionCount", questionCount);
        response.put("recentResults", results);

        return ResponseEntity.ok(response);
    }
}
