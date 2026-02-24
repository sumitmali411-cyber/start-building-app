package com.example.task_manager.model;

import lombok.Data;
import java.util.List;
import java.time.LocalDateTime;

@Data
public class FlowSession {
    private String token;
    private String flowType;
    private List<Long> productIds;
    private LocalDateTime createdAt;
}
