package com.postqode.nexus.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.postqode.nexus.dto.graphql.ActivityLogResponse;
import com.postqode.nexus.dto.graphql.DashboardMetrics;
import com.postqode.nexus.dto.graphql.StatusCount;
import com.postqode.nexus.dto.graphql.UserActivity;
import com.postqode.nexus.model.ActivityLog;
import com.postqode.nexus.model.ProductStatus;
import com.postqode.nexus.model.User;
import com.postqode.nexus.repository.ActivityLogRepository;
import com.postqode.nexus.repository.ProductRepository;
import com.postqode.nexus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ProductRepository productRepository;
    private final ActivityLogRepository activityLogRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public DashboardMetrics getDashboardMetrics() {
        return DashboardMetrics.builder()
                .totalProducts((int) productRepository.count())
                .activeProducts((int) productRepository.countByStatus(ProductStatus.ACTIVE))
                .lowStockProducts((int) productRepository.countByStatus(ProductStatus.LOW_STOCK))
                .outOfStockProducts((int) productRepository.countByStatus(ProductStatus.OUT_OF_STOCK))
                .productsAddedToday((int) productRepository.countProductsAddedToday())
                .actionsToday((int) activityLogRepository.countActionsToday())
                .build();
    }

    @Transactional(readOnly = true)
    public int getProductsAddedToday() {
        return (int) productRepository.countProductsAddedToday();
    }

    @Transactional(readOnly = true)
    public List<StatusCount> getProductsByStatus() {
        List<StatusCount> statusCounts = new ArrayList<>();
        for (ProductStatus status : ProductStatus.values()) {
            statusCounts.add(StatusCount.builder()
                    .status(status)
                    .count((int) productRepository.countByStatus(status))
                    .build());
        }
        return statusCounts;
    }

    @Transactional(readOnly = true)
    public List<UserActivity> getActivityByUser(int days) {
        LocalDateTime since = LocalDateTime.now().minusDays(days);
        List<Object[]> stats = activityLogRepository.getUserActivityStats(since);

        return stats.stream().map(row -> {
            UUID userId = (UUID) row[0];
            Long count = (Long) row[1];
            LocalDateTime lastAction = (LocalDateTime) row[2];

            User user = userRepository.findById(userId).orElse(null);
            String username = user != null ? user.getUsername() : "Unknown";

            return UserActivity.builder()
                    .username(username)
                    .actionCount(count.intValue())
                    .lastAction(lastAction.toString())
                    .build();
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ActivityLogResponse> getRecentActivity(int limit) {
        List<ActivityLog> logs = activityLogRepository.findRecentActivity(PageRequest.of(0, limit));
        return logs.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    private ActivityLogResponse mapToResponse(ActivityLog log) {
        String oldValueStr = null;
        String newValueStr = null;

        try {
            if (log.getOldValue() != null) {
                oldValueStr = objectMapper.writeValueAsString(log.getOldValue());
            }
            if (log.getNewValue() != null) {
                newValueStr = objectMapper.writeValueAsString(log.getNewValue());
            }
        } catch (Exception e) {
            // Ignore serialization errors for now
        }

        return ActivityLogResponse.builder()
                .id(log.getId())
                .username(log.getUser().getUsername())
                .productName(log.getProduct() != null ? log.getProduct().getName() : null)
                .actionType(log.getActionType())
                .oldValue(oldValueStr)
                .newValue(newValueStr)
                .createdAt(log.getCreatedAt().toString())
                .build();
    }
}
