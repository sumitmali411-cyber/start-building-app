package com.example.task_manager.controller;

import com.example.task_manager.model.ProductCharacteristic;
import com.example.task_manager.service.ConfigurationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/config")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class ConfigurationController {
    private final ConfigurationService configurationService;

    @GetMapping("/package/{packageId}")
    public List<ProductCharacteristic> getRequirements(@PathVariable("packageId") Long packageId) {
        return configurationService.getRequirements(packageId);
    }

    @GetMapping("/product/{productId}")
    public List<ProductCharacteristic> getProductRequirements(@PathVariable("productId") Long productId) {
        return configurationService.getRequirementsByProductId(productId);
    }
}
