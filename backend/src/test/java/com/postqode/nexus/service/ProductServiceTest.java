package com.postqode.nexus.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.postqode.nexus.dto.ProductRequest;
import com.postqode.nexus.dto.ProductResponse;
import com.postqode.nexus.model.*;
import com.postqode.nexus.repository.ActivityLogRepository;
import com.postqode.nexus.repository.ProductRepository;
import com.postqode.nexus.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

import java.math.BigDecimal;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ActivityLogRepository activityLogRepository;

    @Mock
    private UserRepository userRepository;

    @Spy
    private ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private ProductService productService;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @Mock
    private UserDetails userDetails;

    private User adminUser;
    private Product existingProduct;

    @BeforeEach
    void setUp() {
        // Setup Security Context
        SecurityContextHolder.setContext(securityContext);
        lenient().when(securityContext.getAuthentication()).thenReturn(authentication);
        lenient().when(authentication.getPrincipal()).thenReturn(userDetails);
        lenient().when(userDetails.getUsername()).thenReturn("admin");

        adminUser = User.builder()
                .id(UUID.randomUUID())
                .username("admin")
                .role(UserRole.ADMIN)
                .build();

        lenient().when(userRepository.findByUsername("admin")).thenReturn(Optional.of(adminUser));

        existingProduct = Product.builder()
                .id(UUID.randomUUID())
                .sku("SKU-001")
                .name("Test Product")
                .price(BigDecimal.valueOf(100.0))
                .quantity(10)
                .status(ProductStatus.ACTIVE)
                .build();
    }

    @Test
    void shouldCreateProductAndLogActivity() {
        ProductRequest request = ProductRequest.builder()
                .sku("SKU-NEW")
                .name("New Product")
                .price(BigDecimal.valueOf(200.0))
                .quantity(5)
                .build();

        when(productRepository.existsBySku("SKU-NEW")).thenReturn(false);
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> {
            Product p = invocation.getArgument(0);
            p.setId(UUID.randomUUID());
            return p;
        });

        ProductResponse response = productService.createProduct(request);

        assertNotNull(response);
        verify(productRepository).save(any(Product.class));

        // Verify Activity Log
        ArgumentCaptor<ActivityLog> logCaptor = ArgumentCaptor.forClass(ActivityLog.class);
        verify(activityLogRepository).save(logCaptor.capture());
        ActivityLog log = logCaptor.getValue();

        assertEquals(ActionType.CREATE, log.getActionType());
        assertNotNull(log.getProduct());
        assertNotNull(log.getNewValue());
        assertNull(log.getOldValue());
    }

    @Test
    void shouldUpdateProductAndLogActivity() {
        when(productRepository.findById(existingProduct.getId())).thenReturn(Optional.of(existingProduct));
        when(productRepository.save(any(Product.class))).thenReturn(existingProduct);

        ProductRequest request = ProductRequest.builder()
                .sku("SKU-001")
                .name("Updated Name")
                .price(BigDecimal.valueOf(150.0))
                .quantity(20)
                .status(ProductStatus.ACTIVE)
                .build();

        productService.updateProduct(existingProduct.getId(), request);

        verify(productRepository).save(any(Product.class));

        // Verify Activity Log
        ArgumentCaptor<ActivityLog> logCaptor = ArgumentCaptor.forClass(ActivityLog.class);
        verify(activityLogRepository).save(logCaptor.capture());
        ActivityLog log = logCaptor.getValue();

        assertEquals(ActionType.UPDATE, log.getActionType());
        assertEquals(existingProduct, log.getProduct());
        assertNotNull(log.getOldValue(), "Old value should not be null");
        assertNotNull(log.getNewValue(), "New value should not be null");

        // Ensure values are Maps (serialized safe objects)
        assertTrue(log.getOldValue() instanceof Map);
        assertTrue(log.getNewValue() instanceof Map);
    }

    @Test
    void shouldDeleteProductAndLogActivityWithoutFKViolation() {
        when(productRepository.findById(existingProduct.getId())).thenReturn(Optional.of(existingProduct));

        productService.deleteProduct(existingProduct.getId());

        verify(productRepository).delete(existingProduct);

        // Verify Activity Log
        ArgumentCaptor<ActivityLog> logCaptor = ArgumentCaptor.forClass(ActivityLog.class);
        verify(activityLogRepository).save(logCaptor.capture());
        ActivityLog log = logCaptor.getValue();

        assertEquals(ActionType.DELETE, log.getActionType());
        // CRITICAL: Product reference in log must be NULL to avoid FK violation
        assertNull(log.getProduct(), "Product reference in log must be null for DELETE action");
        assertNotNull(log.getOldValue(), "Old value should be preserved");
        assertNull(log.getNewValue(), "New value should be null");
    }

    @Test
    void shouldUpdateStatusAndLogActivity() {
        when(productRepository.findById(existingProduct.getId())).thenReturn(Optional.of(existingProduct));
        when(productRepository.save(any(Product.class))).thenReturn(existingProduct);

        productService.updateStatus(existingProduct.getId(), ProductStatus.OUT_OF_STOCK);

        verify(productRepository).save(existingProduct);

        // Verify Activity Log
        ArgumentCaptor<ActivityLog> logCaptor = ArgumentCaptor.forClass(ActivityLog.class);
        verify(activityLogRepository).save(logCaptor.capture());
        ActivityLog log = logCaptor.getValue();

        assertEquals(ActionType.STATE_CHANGE, log.getActionType());
        assertEquals(existingProduct, log.getProduct());
        assertNotNull(log.getOldValue());
        assertNotNull(log.getNewValue());
    }
}
