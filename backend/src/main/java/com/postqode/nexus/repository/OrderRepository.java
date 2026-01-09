package com.postqode.nexus.repository;

import com.postqode.nexus.model.Order;
import com.postqode.nexus.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
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
}
