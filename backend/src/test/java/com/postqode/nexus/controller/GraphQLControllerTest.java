package com.postqode.nexus.controller;

import com.postqode.nexus.dto.ProductResponse;
import com.postqode.nexus.dto.graphql.*;
import com.postqode.nexus.model.ActionType;
import com.postqode.nexus.model.ProductStatus;
import com.postqode.nexus.service.DashboardService;
import com.postqode.nexus.service.ProductService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
public class GraphQLControllerTest {

    @Mock
    private ProductService productService;

    @Mock
    private DashboardService dashboardService;

    @InjectMocks
    private GraphQLController graphQLController;

    // ==================== PRODUCTS QUERY TESTS ====================

    @Test
    public void shouldReturnProducts() {
        ProductResponse response = ProductResponse.builder()
                .id(UUID.randomUUID())
                .sku("SKU-001")
                .name("Test Product")
                .price(BigDecimal.valueOf(99.99))
                .quantity(50)
                .status(ProductStatus.ACTIVE)
                .build();

        Page<ProductResponse> page = new PageImpl<>(Collections.singletonList(response), PageRequest.of(0, 10), 1);

        when(productService.getProducts(any(), any(), any())).thenReturn(page);

        ProductConnection connection = graphQLController.products(null, null, 0, 10);

        assertNotNull(connection);
        assertEquals(1, connection.getTotalCount());
        assertEquals("SKU-001", connection.getItems().get(0).getSku());
        assertNotNull(connection.getPageInfo());
        assertEquals(0, connection.getPageInfo().getCurrentPage());
    }

    @Test
    public void shouldReturnProductsFilteredByStatus() {
        ProductResponse lowStockProduct = ProductResponse.builder()
                .id(UUID.randomUUID())
                .sku("SKU-LOW")
                .name("Low Stock Product")
                .status(ProductStatus.LOW_STOCK)
                .build();

        Page<ProductResponse> page = new PageImpl<>(Collections.singletonList(lowStockProduct), PageRequest.of(0, 10),
                1);

        when(productService.getProducts(eq(ProductStatus.LOW_STOCK), any(), any())).thenReturn(page);

        ProductConnection connection = graphQLController.products(null, ProductStatus.LOW_STOCK, 0, 10);

        assertNotNull(connection);
        assertEquals(ProductStatus.LOW_STOCK, connection.getItems().get(0).getStatus());
    }

    @Test
    public void shouldReturnProductsWithSearch() {
        ProductResponse product = ProductResponse.builder()
                .id(UUID.randomUUID())
                .sku("LAPTOP-001")
                .name("Gaming Laptop")
                .build();

        Page<ProductResponse> page = new PageImpl<>(Collections.singletonList(product), PageRequest.of(0, 10), 1);

        when(productService.getProducts(any(), eq("laptop"), any())).thenReturn(page);

        ProductConnection connection = graphQLController.products("laptop", null, 0, 10);

        assertNotNull(connection);
        assertTrue(connection.getItems().get(0).getName().toLowerCase().contains("laptop"));
    }

    // ==================== SINGLE PRODUCT QUERY TESTS ====================

    @Test
    public void shouldReturnSingleProduct() {
        UUID productId = UUID.randomUUID();
        ProductResponse response = ProductResponse.builder()
                .id(productId)
                .sku("SKU-001")
                .name("Test Product")
                .build();

        when(productService.getProduct(productId)).thenReturn(response);

        ProductResponse result = graphQLController.product(productId);

        assertNotNull(result);
        assertEquals(productId, result.getId());
        assertEquals("SKU-001", result.getSku());
    }

    // ==================== DASHBOARD METRICS TESTS ====================

    @Test
    public void shouldReturnDashboardMetrics() {
        DashboardMetrics metrics = DashboardMetrics.builder()
                .totalProducts(100)
                .activeProducts(80)
                .lowStockProducts(15)
                .outOfStockProducts(5)
                .productsAddedToday(10)
                .actionsToday(50)
                .build();

        when(dashboardService.getDashboardMetrics()).thenReturn(metrics);

        DashboardMetrics result = graphQLController.dashboardMetrics();

        assertNotNull(result);
        assertEquals(100, result.getTotalProducts());
        assertEquals(80, result.getActiveProducts());
        assertEquals(15, result.getLowStockProducts());
        assertEquals(5, result.getOutOfStockProducts());
    }

    @Test
    public void shouldReturnProductsAddedToday() {
        when(dashboardService.getProductsAddedToday()).thenReturn(5);

        int result = graphQLController.productsAddedToday();

        assertEquals(5, result);
    }

    // ==================== PRODUCTS BY STATUS TESTS ====================

    @Test
    public void shouldReturnProductsByStatus() {
        List<StatusCount> statusCounts = Arrays.asList(
                StatusCount.builder().status(ProductStatus.ACTIVE).count(80).build(),
                StatusCount.builder().status(ProductStatus.LOW_STOCK).count(15).build(),
                StatusCount.builder().status(ProductStatus.OUT_OF_STOCK).count(5).build());

        when(dashboardService.getProductsByStatus()).thenReturn(statusCounts);

        List<StatusCount> result = graphQLController.productsByStatus();

        assertNotNull(result);
        assertEquals(3, result.size());
        assertEquals(ProductStatus.ACTIVE, result.get(0).getStatus());
        assertEquals(80, result.get(0).getCount());
    }

    // ==================== ACTIVITY BY USER TESTS ====================

    @Test
    public void shouldReturnActivityByUser() {
        List<UserActivity> activities = Arrays.asList(
                UserActivity.builder().username("admin").actionCount(25).lastAction("2026-01-08T10:00:00").build(),
                UserActivity.builder().username("user").actionCount(10).lastAction("2026-01-08T09:30:00").build());

        when(dashboardService.getActivityByUser(7)).thenReturn(activities);

        List<UserActivity> result = graphQLController.activityByUser(7);

        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("admin", result.get(0).getUsername());
        assertEquals(25, result.get(0).getActionCount());
    }

    @Test
    public void shouldReturnActivityByUserWithDefaultDays() {
        List<UserActivity> activities = Collections.singletonList(
                UserActivity.builder().username("admin").actionCount(10).build());

        when(dashboardService.getActivityByUser(7)).thenReturn(activities);

        // Pass null - should default to 7 days
        List<UserActivity> result = graphQLController.activityByUser(null);

        assertNotNull(result);
        assertEquals(1, result.size());
    }

    // ==================== RECENT ACTIVITY TESTS ====================

    @Test
    public void shouldReturnRecentActivity() {
        List<ActivityLogResponse> logs = Arrays.asList(
                ActivityLogResponse.builder().id(UUID.randomUUID()).actionType(ActionType.CREATE)
                        .productName("Product 1").build(),
                ActivityLogResponse.builder().id(UUID.randomUUID()).actionType(ActionType.UPDATE)
                        .productName("Product 2").build());

        when(dashboardService.getRecentActivity(10)).thenReturn(logs);

        List<ActivityLogResponse> result = graphQLController.recentActivity(10);

        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals(ActionType.CREATE, result.get(0).getActionType());
    }

    @Test
    public void shouldReturnRecentActivityWithDefaultLimit() {
        List<ActivityLogResponse> logs = Collections.singletonList(
                ActivityLogResponse.builder().id(UUID.randomUUID()).actionType(ActionType.CREATE).build());

        when(dashboardService.getRecentActivity(10)).thenReturn(logs);

        // Pass null - should default to 10
        List<ActivityLogResponse> result = graphQLController.recentActivity(null);

        assertNotNull(result);
    }
}
