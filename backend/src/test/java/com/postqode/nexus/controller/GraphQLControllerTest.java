package com.postqode.nexus.controller;

import com.postqode.nexus.dto.ProductResponse;
import com.postqode.nexus.dto.graphql.DashboardMetrics;
import com.postqode.nexus.dto.graphql.ProductConnection;
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

import java.util.Collections;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class GraphQLControllerTest {

    @Mock
    private ProductService productService;

    @Mock
    private DashboardService dashboardService;

    @InjectMocks
    private GraphQLController graphQLController;

    @Test
    public void shouldReturnProducts() {
        ProductResponse response = ProductResponse.builder()
                .id(UUID.randomUUID())
                .sku("SKU-001")
                .name("Test Product")
                .build();
        
        Page<ProductResponse> page = new PageImpl<>(Collections.singletonList(response), PageRequest.of(0, 10), 1);

        when(productService.getProducts(any(), any(), any())).thenReturn(page);

        ProductConnection connection = graphQLController.products(null, null, 0, 10);

        assertNotNull(connection);
        assertEquals(1, connection.getTotalCount());
        assertEquals("SKU-001", connection.getItems().get(0).getSku());
    }

    @Test
    public void shouldReturnDashboardMetrics() {
        DashboardMetrics metrics = DashboardMetrics.builder()
                .totalProducts(10)
                .activeProducts(5)
                .build();

        when(dashboardService.getDashboardMetrics()).thenReturn(metrics);

        DashboardMetrics result = graphQLController.dashboardMetrics();

        assertNotNull(result);
        assertEquals(10, result.getTotalProducts());
        assertEquals(5, result.getActiveProducts());
    }
}
