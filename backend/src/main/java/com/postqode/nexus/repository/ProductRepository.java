package com.postqode.nexus.repository;

import com.postqode.nexus.model.Product;
import com.postqode.nexus.model.ProductStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
@SuppressWarnings("unused")
public interface ProductRepository extends JpaRepository<Product, UUID> {

    boolean existsBySku(String sku);

    Page<Product> findByStatus(ProductStatus status, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE " +
            "(:status IS NULL OR p.status = :status) AND " +
            "(:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.sku) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Product> findByStatusAndSearch(@Param("status") ProductStatus status, @Param("search") String search,
            Pageable pageable);

    long countByStatus(ProductStatus status);

    @Query("SELECT COUNT(p) FROM Product p WHERE p.createdAt >= CURRENT_DATE")
    long countProductsAddedToday();
}
