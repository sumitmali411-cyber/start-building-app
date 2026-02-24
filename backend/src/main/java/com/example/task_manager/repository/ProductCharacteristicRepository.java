package com.example.task_manager.repository;

import com.example.task_manager.model.ProductCharacteristic;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProductCharacteristicRepository extends JpaRepository<ProductCharacteristic, Long> {
    List<ProductCharacteristic> findByProductId(Long productId);
}
