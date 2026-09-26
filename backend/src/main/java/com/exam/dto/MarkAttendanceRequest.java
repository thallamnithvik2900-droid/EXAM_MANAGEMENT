package com.exam.dto;

import lombok.Data;

@Data
public class MarkAttendanceRequest {
    private String examScheduleId;
    private String studentId;
    private String status;
    private String notes;
}
