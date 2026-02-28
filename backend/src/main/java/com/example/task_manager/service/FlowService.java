package com.example.task_manager.service;

import com.example.task_manager.model.FlowSession;
import io.jsonwebtoken.Claims;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class FlowService {

    private final JwtService jwtService;

    public FlowService(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    public FlowSession initSession(List<Long> productIds, String flowType) {
        String sessionId = UUID.randomUUID().toString();
        String token = jwtService.generateToken(sessionId, productIds, flowType);

        FlowSession session = new FlowSession();
        session.setToken(token);
        session.setProductIds(productIds);
        session.setFlowType(flowType);
        session.setCreatedAt(LocalDateTime.now());
        return session;
    }

    public FlowSession getSession(String token) {
        Claims claims = jwtService.validateAndExtract(token);

        FlowSession session = new FlowSession();
        session.setToken(token);
        session.setFlowType(claims.get("flowType", String.class));

        @SuppressWarnings("unchecked")
        List<Integer> rawIds = claims.get("productIds", List.class);
        List<Long> productIds = rawIds == null ? List.of() : rawIds.stream()
                .map(id -> ((Number) id).longValue())
                .toList();

        session.setProductIds(productIds);
        session.setCreatedAt(LocalDateTime.now());
        return session;
    }
}
