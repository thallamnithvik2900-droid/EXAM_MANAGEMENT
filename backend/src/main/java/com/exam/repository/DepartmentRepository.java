package com.exam.repository;

import com.exam.model.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface DepartmentRepository extends JpaRepository<Department, String> {
    Optional<Department> findByCode(String code);
}
