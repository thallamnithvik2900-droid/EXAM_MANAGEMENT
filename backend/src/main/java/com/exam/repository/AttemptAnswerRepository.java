package com.exam.repository;

import com.exam.model.AttemptAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface AttemptAnswerRepository extends JpaRepository<AttemptAnswer, String> {
    List<AttemptAnswer> findByAttemptId(String attemptId);
    Optional<AttemptAnswer> findByAttemptIdAndQuestionId(String attemptId, String questionId);
}
