package com.exam.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "results")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Result {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "exam_id", nullable = false)
    private Exam exam;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "attempt_id", unique = true, nullable = false)
    private ExamAttempt attempt;

    private Double score;
    private Double maxScore;
    private Double percentage;

    @Builder.Default
    private Boolean isPassed = false;

    @Builder.Default
    private Integer correctCount = 0;

    @Builder.Default
    private Integer wrongCount = 0;

    @Builder.Default
    private Integer unansweredCount = 0;

    @Builder.Default
    private Double accuracy = 0.0;

    @Column(columnDefinition = "TEXT")
    private String topicWiseJson;

    @Builder.Default
    private LocalDateTime generatedAt = LocalDateTime.now();
}
