package com.postqode.nexus.repository;

import com.postqode.nexus.model.Order;
import com.postqode.nexus.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {

    List<Order> findByUser(User user);

    List<Order> findByUserId(UUID userId);

    List<Order> findByStatus(Order.OrderStatus status);

    List<Order> findByUserAndStatus(User user, Order.OrderStatus status);

    List<Order> findByUserIdAndStatus(UUID userId, Order.OrderStatus status);

    @Query("SELECT o FROM Order o JOIN FETCH o.user JOIN FETCH o.product ORDER BY o.createdAt DESC")
    List<Order> findAllWithDetails();

    @Query("SELECT o FROM Order o JOIN FETCH o.user JOIN FETCH o.product WHERE o.user.id = :userId ORDER BY o.createdAt DESC")
    List<Order> findByUserIdWithDetails(@Param("userId") UUID userId);
}
