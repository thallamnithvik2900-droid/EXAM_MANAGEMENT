package com.exam.dto;

import lombok.Data;

@Data
public class SaveAnswerRequest {
    private String attemptId;
    private String questionId;
    private String studentAnswer;
    private Boolean isMarkedForReview;
    private Integer timeSpentSeconds;
}
