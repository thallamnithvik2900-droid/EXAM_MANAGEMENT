package com.exam.repository;

import com.exam.model.InvigilatorAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InvigilatorAssignmentRepository extends JpaRepository<InvigilatorAssignment, String> {
    List<InvigilatorAssignment> findByFacultyId(String facultyId);
    List<InvigilatorAssignment> findByExamScheduleId(String examScheduleId);
}
