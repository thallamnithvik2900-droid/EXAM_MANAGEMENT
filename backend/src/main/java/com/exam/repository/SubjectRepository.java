package com.exam.repository;

import com.exam.model.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface SubjectRepository extends JpaRepository<Subject, String> {
    Optional<Subject> findByCode(String code);
    List<Subject> findByDepartmentId(String departmentId);
}
