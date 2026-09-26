package com.exam.repository;

import com.exam.model.ExamQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ExamQuestionRepository extends JpaRepository<ExamQuestion, String> {
    List<ExamQuestion> findByExamIdOrderByOrderIndexAsc(String examId);
    Optional<ExamQuestion> findByExamIdAndQuestionId(String examId, String questionId);
}
