package com.exam.repository;

import com.exam.model.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, String> {
    List<Attendance> findByExamScheduleId(String examScheduleId);
    Optional<Attendance> findByExamScheduleIdAndStudentId(String examScheduleId, String studentId);
}
