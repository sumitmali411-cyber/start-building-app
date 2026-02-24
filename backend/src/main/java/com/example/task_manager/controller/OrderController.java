package com.example.task_manager.controller;

import com.example.task_manager.model.CustomerOrder;
import com.example.task_manager.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class OrderController {
    private final OrderService orderService;

    @PostMapping
    public CustomerOrder createOrder(@RequestBody Map<String, String> body) {
        String sessionId = body.get("sessionId");
        return orderService.createOrder(sessionId);
    }

    @GetMapping("/{id}")
    public CustomerOrder getOrder(@PathVariable("id") Long id) {
        return orderService.getOrder(id);
    }
}
