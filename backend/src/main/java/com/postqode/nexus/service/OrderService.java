package com.postqode.nexus.service;

import com.postqode.nexus.model.Order;
import com.postqode.nexus.model.Product;
import com.postqode.nexus.model.User;
import com.postqode.nexus.repository.OrderRepository;
import com.postqode.nexus.repository.ProductRepository;
import com.postqode.nexus.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class OrderService {
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private UserInventoryService userInventoryService;
    
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }
    
    public List<Order> getOrdersByUserId(UUID userId) {
        return orderRepository.findByUserId(userId);
    }
    
    public List<Order> getOrdersByStatus(Order.OrderStatus status) {
        return orderRepository.findByStatus(status);
    }
    
    public Order getOrderById(UUID id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Order not found with id: " + id));
    }
    
    /**
     * Create a new order (User action)
     * Order starts in PENDING status
     */
    public Order createOrder(UUID userId, UUID productId, Integer quantity) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));
        
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + productId));
        
        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than 0");
        }
        
        // Create order in PENDING status
        Order order = new Order(user, product, quantity, Order.OrderStatus.PENDING);
        return orderRepository.save(order);
    }
    
    /**
     * Approve an order (Admin action)
     * Reduces product stock and adds to user inventory
     */
    public Order approveOrder(UUID orderId) {
        Order order = getOrderById(orderId);
        
        if (order.getStatus() != Order.OrderStatus.PENDING) {
            throw new IllegalArgumentException("Only PENDING orders can be approved");
        }
        
        Product product = order.getProduct();
        
        // Check if sufficient stock is available
        if (product.getQuantity() < order.getQuantity()) {
            throw new IllegalArgumentException("Insufficient stock. Available: " + product.getQuantity() + ", Requested: " + order.getQuantity());
        }
        
        // Reduce product stock
        product.setQuantity(product.getQuantity() - order.getQuantity());
        productRepository.save(product);
        
        // Update order status
        order.setStatus(Order.OrderStatus.APPROVED);
        Order approvedOrder = orderRepository.save(order);
        
        // Add to user inventory
        userInventoryService.addPurchasedItem(
            order.getUser().getId(),
            product.getId(),
            product.getName(),
            order.getQuantity()
        );
        
        return approvedOrder;
    }
    
    /**
     * Reject an order (Admin action)
     * Does not change stock
     */
    public Order rejectOrder(UUID orderId) {
        Order order = getOrderById(orderId);
        
        if (order.getStatus() != Order.OrderStatus.PENDING) {
            throw new IllegalArgumentException("Only PENDING orders can be rejected");
        }
        
        order.setStatus(Order.OrderStatus.REJECTED);
        return orderRepository.save(order);
    }
    
    /**
     * Cancel an order (User action)
     * Only PENDING orders can be cancelled
     */
    public Order cancelOrder(UUID orderId, UUID userId) {
        Order order = getOrderById(orderId);
        
        if (!order.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("You can only cancel your own orders");
        }
        
        if (order.getStatus() != Order.OrderStatus.PENDING) {
            throw new IllegalArgumentException("Only PENDING orders can be cancelled");
        }
        
        order.setStatus(Order.OrderStatus.CANCELLED);
        return orderRepository.save(order);
    }
}
