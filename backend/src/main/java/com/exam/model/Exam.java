package com.exam.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "exams")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Exam {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String title;

    @Column(length = 1000)
    private String description;

    @Column(unique = true, nullable = false)
    private String code;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @Builder.Default
    private String examType = "ONLINE_OBJECTIVE";

    @Builder.Default
    private Integer durationMinutes = 60;

    @Builder.Default
    private Double totalMarks = 100.0;

    @Builder.Default
    private Double passMarks = 40.0;

    @Builder.Default
    private Double negativeMarking = 0.0;

    @Builder.Default
    private Boolean isRandomized = true;

    @Builder.Default
    private Boolean canReviewSolutions = true;

    @Builder.Default
    private Boolean isPublished = true;

    @Builder.Default
    private LocalDateTime startDate = LocalDateTime.now();

    private LocalDateTime endDate;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
