package com.example.task_manager.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String sessionId;
    private Long productId;
    private Long packageId;
    private String productName;
    private Double price;
    private Integer quantity = 1;
    @Column(length = 2000)
    private String characteristicValues; // JSON string
}
