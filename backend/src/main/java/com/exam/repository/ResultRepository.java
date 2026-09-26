package com.exam.repository;

import com.exam.model.Result;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ResultRepository extends JpaRepository<Result, String> {
    List<Result> findByStudentId(String studentId);
    List<Result> findByExamId(String examId);
    Optional<Result> findByAttemptId(String attemptId);
}
