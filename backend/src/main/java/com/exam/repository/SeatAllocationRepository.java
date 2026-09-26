package com.exam.repository;

import com.exam.model.SeatAllocation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface SeatAllocationRepository extends JpaRepository<SeatAllocation, String> {
    List<SeatAllocation> findByExamScheduleId(String examScheduleId);
    List<SeatAllocation> findByStudentId(String studentId);
    Optional<SeatAllocation> findByExamScheduleIdAndStudentId(String examScheduleId, String studentId);
    void deleteByExamScheduleId(String examScheduleId);
}
