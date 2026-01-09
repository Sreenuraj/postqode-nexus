package com.postqode.nexus.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.postqode.nexus.dto.ProductRequest;
import com.postqode.nexus.dto.ProductResponse;
import com.postqode.nexus.model.ActionType;
import com.postqode.nexus.model.ActivityLog;
import com.postqode.nexus.model.Category;
import com.postqode.nexus.model.Product;
import com.postqode.nexus.model.ProductStatus;
import com.postqode.nexus.model.User;
import com.postqode.nexus.repository.ActivityLogRepository;
import com.postqode.nexus.repository.CategoryRepository;
import com.postqode.nexus.repository.ProductRepository;
import com.postqode.nexus.repository.UserRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ActivityLogRepository activityLogRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public Page<ProductResponse> getProducts(ProductStatus status, UUID categoryId, String search, Pageable pageable) {
        Specification<Product> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            if (categoryId != null) {
                predicates.add(cb.equal(root.get("category").get("id"), categoryId));
            }

            if (search != null && !search.trim().isEmpty()) {
                String searchPattern = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), searchPattern),
                        cb.like(cb.lower(root.get("sku")), searchPattern)
                ));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Product> products = productRepository.findAll(spec, pageable);
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

        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
        }

        Product product = Product.builder()
                .sku(request.getSku())
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .quantity(request.getQuantity())
                .status(status)
                .category(category)
                .createdBy(currentUser)
                .updatedBy(currentUser)
                .build();

        product = productRepository.save(product);
        logActivity(currentUser, product, ActionType.CREATE, null, mapToResponse(product));

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
        ProductResponse oldProduct = mapToResponse(product);

        product.setSku(request.getSku());
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setQuantity(request.getQuantity());

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            product.setCategory(category);
        } else {
            product.setCategory(null);
        }

        // Auto-update status based on quantity if not explicitly provided or if logic
        // dictates
        // If request has status, use it, otherwise recalculate based on quantity
        if (request.getStatus() != null) {
            product.setStatus(request.getStatus());
        } else {
            product.setStatus(calculateStatus(request.getQuantity(), product.getStatus()));
        }

        product.setUpdatedBy(currentUser);

        product = productRepository.save(product);
        logActivity(currentUser, product, ActionType.UPDATE, oldProduct, mapToResponse(product));

        return mapToResponse(product);
    }

    @Transactional
    public void deleteProduct(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        User currentUser = getCurrentUser();
        ProductResponse oldProduct = mapToResponse(product);

        // Unlink existing activity logs to prevent FK violation
        activityLogRepository.unlinkProduct(id);

        productRepository.delete(product);
        // Pass null for product to avoid FK constraint violation since it's deleted
        logActivity(currentUser, null, ActionType.DELETE, oldProduct, null);
    }

    @Transactional
    public ProductResponse updateStatus(UUID id, ProductStatus newStatus) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        User currentUser = getCurrentUser();
        ProductResponse oldProduct = mapToResponse(product);

        product.setStatus(newStatus);
        product.setUpdatedBy(currentUser);

        product = productRepository.save(product);
        logActivity(currentUser, product, ActionType.STATE_CHANGE, oldProduct, mapToResponse(product));

        return mapToResponse(product);
    }

    private ProductStatus calculateStatus(Integer quantity, ProductStatus currentStatus) {
        if (quantity == null || quantity == 0) {
            return ProductStatus.OUT_OF_STOCK;
        } else if (quantity < 10) { // Threshold for low stock
            return ProductStatus.LOW_STOCK;
        } else {
            // If currently OUT_OF_STOCK or LOW_STOCK and quantity is high enough, go back
            // to ACTIVE
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
        Map<String, Object> oldMap = oldValue != null
                ? objectMapper.convertValue(oldValue, new TypeReference<Map<String, Object>>() {
                })
                : null;
        Map<String, Object> newMap = newValue != null
                ? objectMapper.convertValue(newValue, new TypeReference<Map<String, Object>>() {
                })
                : null;

        ActivityLog log = ActivityLog.builder()
                .user(user)
                .product(product) // This can be null for DELETE
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
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .createdBy(product.getCreatedBy() != null ? product.getCreatedBy().getUsername() : null)
                .updatedBy(product.getUpdatedBy() != null ? product.getUpdatedBy().getUsername() : null)
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }

    // Removed unused copyProduct method
}
