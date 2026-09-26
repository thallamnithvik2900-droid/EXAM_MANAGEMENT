package com.exam.repository;

import com.exam.model.Faculty;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface FacultyRepository extends JpaRepository<Faculty, String> {
    Optional<Faculty> findByUserId(String userId);
    Optional<Faculty> findByEmployeeId(String employeeId);
}
