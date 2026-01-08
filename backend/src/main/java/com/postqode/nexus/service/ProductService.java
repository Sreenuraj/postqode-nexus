package com.postqode.nexus.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.postqode.nexus.dto.ProductRequest;
import com.postqode.nexus.dto.ProductResponse;
import com.postqode.nexus.model.*;
import com.postqode.nexus.repository.ActivityLogRepository;
import com.postqode.nexus.repository.ProductRepository;
import com.postqode.nexus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ActivityLogRepository activityLogRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public Page<ProductResponse> getProducts(ProductStatus status, String search, Pageable pageable) {
        Page<Product> products;
        if (status != null || search != null) {
            products = productRepository.findByStatusAndSearch(status, search, pageable);
        } else {
            products = productRepository.findAll(pageable);
        }
        return products.map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public ProductResponse getProduct(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        return mapToResponse(product);
    }

    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        if (productRepository.existsBySku(request.getSku())) {
            throw new RuntimeException("Product with SKU " + request.getSku() + " already exists");
        }

        User currentUser = getCurrentUser();
        ProductStatus status = calculateStatus(request.getQuantity(), request.getStatus());

        Product product = Product.builder()
                .sku(request.getSku())
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .quantity(request.getQuantity())
                .status(status)
                .createdBy(currentUser)
                .updatedBy(currentUser)
                .build();

        product = productRepository.save(product);
        logActivity(currentUser, product, ActionType.CREATE, null, product);

        return mapToResponse(product);
    }

    @Transactional
    public ProductResponse updateProduct(UUID id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // Check SKU uniqueness if changed
        if (!product.getSku().equals(request.getSku()) && productRepository.existsBySku(request.getSku())) {
            throw new RuntimeException("Product with SKU " + request.getSku() + " already exists");
        }

        User currentUser = getCurrentUser();
        Product oldProduct = copyProduct(product);

        product.setSku(request.getSku());
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setQuantity(request.getQuantity());
        
        // Auto-update status based on quantity if not explicitly provided or if logic dictates
        // If request has status, use it, otherwise recalculate based on quantity
        if (request.getStatus() != null) {
            product.setStatus(request.getStatus());
        } else {
            product.setStatus(calculateStatus(request.getQuantity(), product.getStatus()));
        }
        
        product.setUpdatedBy(currentUser);

        product = productRepository.save(product);
        logActivity(currentUser, product, ActionType.UPDATE, oldProduct, product);

        return mapToResponse(product);
    }

    @Transactional
    public void deleteProduct(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        User currentUser = getCurrentUser();
        productRepository.delete(product);
        logActivity(currentUser, product, ActionType.DELETE, product, null);
    }

    @Transactional
    public ProductResponse updateStatus(UUID id, ProductStatus newStatus) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        User currentUser = getCurrentUser();
        Product oldProduct = copyProduct(product);

        product.setStatus(newStatus);
        product.setUpdatedBy(currentUser);

        product = productRepository.save(product);
        logActivity(currentUser, product, ActionType.STATE_CHANGE, oldProduct, product);

        return mapToResponse(product);
    }

    private ProductStatus calculateStatus(Integer quantity, ProductStatus currentStatus) {
        if (quantity == 0) {
            return ProductStatus.OUT_OF_STOCK;
        } else if (quantity < 10) { // Threshold for low stock
            return ProductStatus.LOW_STOCK;
        } else {
            // If currently OUT_OF_STOCK or LOW_STOCK and quantity is high enough, go back to ACTIVE
            // Or if it's a new product (currentStatus is null or whatever)
            return ProductStatus.ACTIVE;
        }
    }

    private User getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String username;
        if (principal instanceof UserDetails) {
            username = ((UserDetails) principal).getUsername();
        } else {
            username = principal.toString();
        }
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private void logActivity(User user, Product product, ActionType actionType, Object oldValue, Object newValue) {
        Map<String, Object> oldMap = oldValue != null ? objectMapper.convertValue(oldValue, Map.class) : null;
        Map<String, Object> newMap = newValue != null ? objectMapper.convertValue(newValue, Map.class) : null;

        ActivityLog log = ActivityLog.builder()
                .user(user)
                .product(product)
                .actionType(actionType)
                .oldValue(oldMap)
                .newValue(newMap)
                .build();
        
        activityLogRepository.save(log);
    }

    private ProductResponse mapToResponse(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .sku(product.getSku())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .quantity(product.getQuantity())
                .status(product.getStatus())
                .createdBy(product.getCreatedBy() != null ? product.getCreatedBy().getUsername() : null)
                .updatedBy(product.getUpdatedBy() != null ? product.getUpdatedBy().getUsername() : null)
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
    
    private Product copyProduct(Product product) {
        return Product.builder()
                .id(product.getId())
                .sku(product.getSku())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .quantity(product.getQuantity())
                .status(product.getStatus())
                .build();
    }
}
