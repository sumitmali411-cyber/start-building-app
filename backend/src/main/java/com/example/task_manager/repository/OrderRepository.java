package com.example.task_manager.repository;

import com.example.task_manager.model.CustomerOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<CustomerOrder, Long> {
    Optional<CustomerOrder> findBySessionId(String sessionId);
}
