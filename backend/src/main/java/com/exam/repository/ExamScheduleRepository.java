package com.exam.repository;

import com.exam.model.ExamSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ExamScheduleRepository extends JpaRepository<ExamSchedule, String> {
    List<ExamSchedule> findByExamId(String examId);
}
