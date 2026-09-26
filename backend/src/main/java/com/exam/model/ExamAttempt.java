package com.exam.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "exam_attempts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "exam_id", nullable = false)
    private Exam exam;

    @Builder.Default
    private LocalDateTime startTime = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime expectedEndTime;

    @Builder.Default
    private String status = "IN_PROGRESS"; // IN_PROGRESS, SUBMITTED, TIMED_OUT, CANCELLED

    @Builder.Default
    private Integer currentQuestionIndex = 0;

    private LocalDateTime submittedAt;

    @Builder.Default
    private Integer totalTimeSpentSeconds = 0;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();
}
