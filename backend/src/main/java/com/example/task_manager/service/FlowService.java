package com.example.task_manager.service;

import com.example.task_manager.model.FlowSession;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class FlowService {
    private final Map<String, FlowSession> sessions = new ConcurrentHashMap<>();

    public FlowSession initSession(List<Long> productIds, String flowType) {
        String token = UUID.randomUUID().toString();
        FlowSession session = new FlowSession();
        session.setToken(token);
        session.setProductIds(productIds);
        session.setFlowType(flowType);
        session.setCreatedAt(LocalDateTime.now());
        sessions.put(token, session);
        return session;
    }

    public FlowSession getSession(String token) {
        if (!sessions.containsKey(token)) {
            throw new RuntimeException("Invalid or expired flow token");
        }
        return sessions.get(token);
    }
}
