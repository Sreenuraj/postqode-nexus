package com.postqode.nexus.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.postqode.nexus.dto.graphql.DashboardMetrics;
import com.postqode.nexus.dto.graphql.UserActivity;
import com.postqode.nexus.model.ProductStatus;
import com.postqode.nexus.model.User;
import com.postqode.nexus.repository.ActivityLogRepository;
import com.postqode.nexus.repository.ProductRepository;
import com.postqode.nexus.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("unused")
public class DashboardServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ActivityLogRepository activityLogRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private DashboardService dashboardService;

    @Test
    public void shouldGetDashboardMetrics() {
        when(productRepository.count()).thenReturn(100L);
        when(productRepository.countByStatus(ProductStatus.ACTIVE)).thenReturn(80L);
        when(productRepository.countByStatus(ProductStatus.LOW_STOCK)).thenReturn(15L);
        when(productRepository.countByStatus(ProductStatus.OUT_OF_STOCK)).thenReturn(5L);
        when(productRepository.countProductsAddedToday()).thenReturn(10L);
        when(activityLogRepository.countActionsToday()).thenReturn(50L);

        DashboardMetrics metrics = dashboardService.getDashboardMetrics();

        assertNotNull(metrics);
        assertEquals(100, metrics.getTotalProducts());
        assertEquals(80, metrics.getActiveProducts());
        assertEquals(15, metrics.getLowStockProducts());
        assertEquals(5, metrics.getOutOfStockProducts());
        assertEquals(10, metrics.getProductsAddedToday());
        assertEquals(50, metrics.getActionsToday());
    }

    @Test
    public void shouldGetActivityByUser() {
        UUID userId = UUID.randomUUID();
        LocalDateTime lastAction = LocalDateTime.now();
        Object[] row = { userId, 10L, lastAction };

        when(activityLogRepository.getUserActivityStats(any())).thenReturn(Collections.singletonList(row));

        User user = new User();
        user.setId(userId);
        user.setUsername("testuser");

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        List<UserActivity> activities = dashboardService.getActivityByUser(7);

        assertNotNull(activities);
        assertEquals(1, activities.size());
        assertEquals("testuser", activities.get(0).getUsername());
        assertEquals(10, activities.get(0).getActionCount());
        assertEquals(lastAction.toString(), activities.get(0).getLastAction());
    }
}
