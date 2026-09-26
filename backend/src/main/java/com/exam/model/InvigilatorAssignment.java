package com.exam.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "invigilator_assignments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvigilatorAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "exam_schedule_id", nullable = false)
    private ExamSchedule examSchedule;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "faculty_id", nullable = false)
    private Faculty faculty;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "hall_id", nullable = false)
    private Hall hall;

    @Builder.Default
    private String status = "ASSIGNED"; // ASSIGNED, REPORTED, COMPLETED

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
