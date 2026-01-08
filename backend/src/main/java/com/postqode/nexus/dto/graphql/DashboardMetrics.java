package com.postqode.nexus.dto.graphql;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardMetrics {
    private int totalProducts;
    private int activeProducts;
    private int lowStockProducts;
    private int outOfStockProducts;
    private int productsAddedToday;
    private int actionsToday;
}
