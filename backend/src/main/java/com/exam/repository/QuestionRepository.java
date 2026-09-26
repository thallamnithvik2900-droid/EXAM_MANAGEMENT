package com.exam.repository;

import com.exam.model.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface QuestionRepository extends JpaRepository<Question, String> {
    List<Question> findBySubjectId(String subjectId);
    List<Question> findBySubjectIdIn(List<String> subjectIds);
    long countBySubjectIdIn(List<String> subjectIds);
}
