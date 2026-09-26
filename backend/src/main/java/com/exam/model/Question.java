package com.exam.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "questions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @Builder.Default
    private String topic = "General";

    private String chapter;

    @Builder.Default
    private String difficulty = "MEDIUM"; // EASY, MEDIUM, HARD

    @Builder.Default
    private String questionType = "MCQ_SINGLE";

    @Column(columnDefinition = "TEXT", nullable = false)
    private String questionText;

    @Column(columnDefinition = "TEXT")
    private String optionsJson; // JSON string array of choices

    @Column(columnDefinition = "TEXT", nullable = false)
    private String correctAnswer;

    @Column(columnDefinition = "TEXT")
    private String explanation;

    @Builder.Default
    private Double marks = 1.0;

    @Builder.Default
    private Double negativeMarks = 0.0;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
