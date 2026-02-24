package com.example.task_manager.repository;

import com.example.task_manager.model.ProductPackage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ProductPackageRepository extends JpaRepository<ProductPackage, Long> {
    @Query("SELECT DISTINCT pp FROM ProductPackage pp JOIN pp.products p WHERE p.id IN :productIds")
    List<ProductPackage> findByProductIds(@Param("productIds") List<Long> productIds);
}
