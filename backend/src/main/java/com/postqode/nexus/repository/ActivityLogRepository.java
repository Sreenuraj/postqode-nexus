package com.postqode.nexus.repository;

import com.postqode.nexus.model.ActivityLog;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, UUID> {
    
    List<ActivityLog> findByUserIdOrderByCreatedAtDesc(UUID userId);
    
    List<ActivityLog> findByProductIdOrderByCreatedAtDesc(UUID productId);
    
    @Query("SELECT a FROM ActivityLog a ORDER BY a.createdAt DESC")
    List<ActivityLog> findRecentActivity(Pageable pageable);
    
    @Query("SELECT COUNT(a) FROM ActivityLog a WHERE a.createdAt >= CURRENT_DATE")
    long countActionsToday();
    
    @Query("SELECT a.user.id as userId, COUNT(a) as count, MAX(a.createdAt) as lastAction " +
           "FROM ActivityLog a " +
           "WHERE a.createdAt >= :since " +
           "GROUP BY a.user.id")
    List<Object[]> getUserActivityStats(@Param("since") LocalDateTime since);
}
