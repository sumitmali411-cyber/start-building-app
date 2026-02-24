package com.example.task_manager.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductCharacteristic {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long productId;
    private String name;
    private String label;
    private String type; // NUMBER, TEXT, SELECT
    private Boolean required = true;
    @Column(length = 500)
    private String options; // comma-separated for SELECT type
    private String defaultValue;
}
