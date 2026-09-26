package com.exam.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "seat_allocations", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"exam_schedule_id", "student_id"}),
    @UniqueConstraint(columnNames = {"exam_schedule_id", "hall_id", "seatNumber"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SeatAllocation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "exam_schedule_id", nullable = false)
    private ExamSchedule examSchedule;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "hall_id", nullable = false)
    private Hall hall;

    @Column(nullable = false)
    private Integer rowNumber;

    @Column(nullable = false)
    private Integer colNumber;

    @Column(nullable = false)
    private String seatNumber;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
