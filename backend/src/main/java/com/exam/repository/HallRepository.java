package com.exam.repository;

import com.exam.model.Hall;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface HallRepository extends JpaRepository<Hall, String> {
    Optional<Hall> findByHallCode(String hallCode);
}
