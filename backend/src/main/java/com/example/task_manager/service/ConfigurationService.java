package com.example.task_manager.service;

import com.example.task_manager.model.ProductCharacteristic;
import com.example.task_manager.model.ProductPackage;
import com.example.task_manager.repository.ProductCharacteristicRepository;
import com.example.task_manager.repository.ProductPackageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ConfigurationService {
    private final ProductCharacteristicRepository characteristicRepository;
    private final ProductPackageRepository packageRepository;

    public List<ProductCharacteristic> getRequirements(Long packageId) {
        ProductPackage pkg = packageRepository.findById(packageId)
                .orElseThrow(() -> new RuntimeException("Package not found: " + packageId));

        List<ProductCharacteristic> requirements = new ArrayList<>();
        pkg.getProducts().forEach(product -> {
            requirements.addAll(characteristicRepository.findByProductId(product.getId()));
        });
        return requirements;
    }

    public List<ProductCharacteristic> getRequirementsByProductId(Long productId) {
        return characteristicRepository.findByProductId(productId);
    }
}
