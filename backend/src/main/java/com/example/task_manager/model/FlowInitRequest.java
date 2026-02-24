package com.example.task_manager.model;

import lombok.Data;
import java.util.List;

@Data
public class FlowInitRequest {
    private List<Long> productIds;
    private String flowType;
}
