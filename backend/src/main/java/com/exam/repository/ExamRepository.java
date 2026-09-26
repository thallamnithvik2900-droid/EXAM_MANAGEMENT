package com.exam.repository;

import com.exam.model.Exam;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ExamRepository extends JpaRepository<Exam, String> {
    Optional<Exam> findByCode(String code);
    List<Exam> findBySubjectIdIn(List<String> subjectIds);
}
