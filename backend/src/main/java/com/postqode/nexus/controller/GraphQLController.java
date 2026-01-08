package com.postqode.nexus.controller;

import com.postqode.nexus.dto.ProductResponse;
import com.postqode.nexus.dto.graphql.*;
import com.postqode.nexus.model.ProductStatus;
import com.postqode.nexus.service.DashboardService;
import com.postqode.nexus.service.ProductService;
import graphql.kickstart.tools.GraphQLQueryResolver;
import io.swagger.v3.oas.annotations.Hidden;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * GraphQL Query Resolver
 * 
 * Access GraphQL endpoint at: http://localhost:8080/graphql
 * GraphiQL UI available at: http://localhost:8080/graphiql
 * 
 * Note: GraphQL endpoints are not shown in Swagger UI as they use a different protocol.
 * Use GraphiQL or a GraphQL client to test these endpoints.
 */
@Controller
@RequiredArgsConstructor
@Hidden // Hide from Swagger UI as GraphQL uses different protocol
public class GraphQLController implements GraphQLQueryResolver {

    private final ProductService productService;
    private final DashboardService dashboardService;

    public ProductConnection products(String search, ProductStatus status, Integer page, Integer pageSize) {
        int p = page != null ? page : 0;
        int s = pageSize != null ? pageSize : 10;
        
        Page<ProductResponse> productPage = productService.getProducts(status, search, PageRequest.of(p, s));
        
        return ProductConnection.builder()
                .items(productPage.getContent())
                .totalCount((int) productPage.getTotalElements())
                .pageInfo(PageInfo.builder()
                        .currentPage(productPage.getNumber())
                        .pageSize(productPage.getSize())
                        .totalPages(productPage.getTotalPages())
                        .hasNextPage(productPage.hasNext())
                        .hasPreviousPage(productPage.hasPrevious())
                        .build())
                .build();
    }

    public ProductResponse product(UUID id) {
        return productService.getProduct(id);
    }

    public DashboardMetrics dashboardMetrics() {
        return dashboardService.getDashboardMetrics();
    }

    public int productsAddedToday() {
        return dashboardService.getProductsAddedToday();
    }

    public List<StatusCount> productsByStatus() {
        return dashboardService.getProductsByStatus();
    }

    public List<UserActivity> activityByUser(Integer days) {
        return dashboardService.getActivityByUser(days != null ? days : 7);
    }

    public List<ActivityLogResponse> recentActivity(Integer limit) {
        return dashboardService.getRecentActivity(limit != null ? limit : 10);
    }
}
