package com.example.task_manager.controller;

import com.example.task_manager.model.FlowInitRequest;
import com.example.task_manager.model.FlowSession;
import com.example.task_manager.service.FlowService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/flow")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class FlowController {
    private final FlowService flowService;

    @PostMapping("/init")
    public FlowSession initFlow(@RequestBody FlowInitRequest request) {
        return flowService.initSession(request.getProductIds(), request.getFlowType());
    }
}
