package com.exam.repository;

import com.exam.model.ExamAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ExamAttemptRepository extends JpaRepository<ExamAttempt, String> {
    List<ExamAttempt> findByStudentId(String studentId);
    Optional<ExamAttempt> findByStudentIdAndExamId(String studentId, String examId);
}
