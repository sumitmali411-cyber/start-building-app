package com.example.task_manager.controller;

import com.example.task_manager.model.ProductPackage;
import com.example.task_manager.model.FlowSession;
import com.example.task_manager.service.FlowService;
import com.example.task_manager.service.ProductMatchService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/match")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class ProductMatchController {
    private final ProductMatchService productMatchService;
    private final FlowService flowService;

    @GetMapping
    public List<ProductPackage> matchPackages(@RequestHeader("X-Flow-Token") String token) {
        FlowSession session = flowService.getSession(token);
        return productMatchService.matchPackages(session.getProductIds());
    }

    @GetMapping("/{id}")
    public ProductPackage getPackage(@PathVariable("id") Long id) {
        return productMatchService.getPackageById(id);
    }
}
