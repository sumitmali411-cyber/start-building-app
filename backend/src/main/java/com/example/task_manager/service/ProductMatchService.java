package com.example.task_manager.service;

import com.example.task_manager.model.ProductPackage;
import com.example.task_manager.repository.ProductPackageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductMatchService {
    private final ProductPackageRepository packageRepository;

    public List<ProductPackage> matchPackages(List<Long> productIds) {
        if (productIds == null || productIds.isEmpty()) {
            return packageRepository.findAll();
        }
        return packageRepository.findByProductIds(productIds);
    }

    public ProductPackage getPackageById(Long id) {
        return packageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Package not found: " + id));
    }
}
