package com.postqode.nexus.service;

import com.postqode.nexus.model.Order;
import com.postqode.nexus.model.Product;
import com.postqode.nexus.model.ProductStatus;
import com.postqode.nexus.model.User;
import com.postqode.nexus.model.UserRole;
import com.postqode.nexus.repository.OrderRepository;
import com.postqode.nexus.repository.ProductRepository;
import com.postqode.nexus.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for OrderService.
 * Focus on critical business logic: order creation, approval with stock
 * reduction,
 * rejection, and cancellation.
 */
@ExtendWith(MockitoExtension.class)
public class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserInventoryService userInventoryService;

    @InjectMocks
    private OrderService orderService;

    private User testUser;
    private Product testProduct;
    private Order pendingOrder;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(UUID.randomUUID())
                .username("testuser")
                .role(UserRole.USER)
                .build();

        testProduct = Product.builder()
                .id(UUID.randomUUID())
                .sku("PRD-001")
                .name("Test Product")
                .price(BigDecimal.valueOf(29.99))
                .quantity(10)
                .status(ProductStatus.ACTIVE)
                .build();

        pendingOrder = new Order(testUser, testProduct, 2, Order.OrderStatus.PENDING);
        pendingOrder.setId(UUID.randomUUID());
    }

    @Nested
    @DisplayName("Order Creation Tests")
    class CreateOrderTests {

        @Test
        @DisplayName("Should create order in PENDING status")
        void shouldCreateOrderInPendingStatus() {
            when(userRepository.findById(testUser.getId())).thenReturn(Optional.of(testUser));
            when(productRepository.findById(testProduct.getId())).thenReturn(Optional.of(testProduct));
            when(orderRepository.save(any(Order.class))).thenAnswer(inv -> {
                Order o = inv.getArgument(0);
                o.setId(UUID.randomUUID());
                return o;
            });

            Order result = orderService.createOrder(testUser.getId(), testProduct.getId(), 2);

            assertNotNull(result);
            assertEquals(Order.OrderStatus.PENDING, result.getStatus());
            assertEquals(2, result.getQuantity());
            verify(orderRepository).save(any(Order.class));
        }

        @Test
        @DisplayName("Should reject order with zero or negative quantity")
        void shouldRejectInvalidQuantity() {
            when(userRepository.findById(testUser.getId())).thenReturn(Optional.of(testUser));
            when(productRepository.findById(testProduct.getId())).thenReturn(Optional.of(testProduct));

            assertThrows(IllegalArgumentException.class,
                    () -> orderService.createOrder(testUser.getId(), testProduct.getId(), 0));

            assertThrows(IllegalArgumentException.class,
                    () -> orderService.createOrder(testUser.getId(), testProduct.getId(), -1));

            verify(orderRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("Order Approval Tests")
    class ApproveOrderTests {

        @Test
        @DisplayName("Should approve order, reduce stock, and add to user inventory")
        void shouldApproveAndReduceStock() {
            int initialStock = testProduct.getQuantity();
            when(orderRepository.findById(pendingOrder.getId())).thenReturn(Optional.of(pendingOrder));
            when(productRepository.save(any(Product.class))).thenReturn(testProduct);
            when(orderRepository.save(any(Order.class))).thenReturn(pendingOrder);

            Order result = orderService.approveOrder(pendingOrder.getId());

            // Verify status changed to APPROVED
            assertEquals(Order.OrderStatus.APPROVED, result.getStatus());

            // Verify stock was reduced
            ArgumentCaptor<Product> productCaptor = ArgumentCaptor.forClass(Product.class);
            verify(productRepository).save(productCaptor.capture());
            assertEquals(initialStock - pendingOrder.getQuantity(), productCaptor.getValue().getQuantity());

            // Verify item added to user inventory
            verify(userInventoryService).addPurchasedItem(
                    eq(testUser.getId()),
                    eq(testProduct.getId()),
                    eq(testProduct.getName()),
                    eq(pendingOrder.getQuantity()));
        }

        @Test
        @DisplayName("Should reject approval when insufficient stock")
        void shouldRejectApprovalWithInsufficientStock() {
            testProduct.setQuantity(1); // Less than order quantity of 2
            when(orderRepository.findById(pendingOrder.getId())).thenReturn(Optional.of(pendingOrder));

            IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                    () -> orderService.approveOrder(pendingOrder.getId()));

            assertTrue(ex.getMessage().contains("Insufficient stock"));
            verify(productRepository, never()).save(any());
            verify(userInventoryService, never()).addPurchasedItem(any(), any(), any(), anyInt());
        }

        @Test
        @DisplayName("Should reject approval of non-PENDING orders")
        void shouldRejectApprovalOfNonPendingOrders() {
            pendingOrder.setStatus(Order.OrderStatus.APPROVED);
            when(orderRepository.findById(pendingOrder.getId())).thenReturn(Optional.of(pendingOrder));

            assertThrows(IllegalArgumentException.class, () -> orderService.approveOrder(pendingOrder.getId()));

            verify(productRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("Order Rejection Tests")
    class RejectOrderTests {

        @Test
        @DisplayName("Should reject order without affecting stock")
        void shouldRejectWithoutAffectingStock() {
            when(orderRepository.findById(pendingOrder.getId())).thenReturn(Optional.of(pendingOrder));
            when(orderRepository.save(any(Order.class))).thenReturn(pendingOrder);

            Order result = orderService.rejectOrder(pendingOrder.getId());

            assertEquals(Order.OrderStatus.REJECTED, result.getStatus());
            // Stock should NOT be modified
            verify(productRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("Order Cancellation Tests")
    class CancelOrderTests {

        @Test
        @DisplayName("Should allow user to cancel their own PENDING order")
        void shouldAllowUserToCancelOwnOrder() {
            when(orderRepository.findById(pendingOrder.getId())).thenReturn(Optional.of(pendingOrder));
            when(orderRepository.save(any(Order.class))).thenReturn(pendingOrder);

            Order result = orderService.cancelOrder(pendingOrder.getId(), testUser.getId());

            assertEquals(Order.OrderStatus.CANCELLED, result.getStatus());
        }

        @Test
        @DisplayName("Should prevent user from cancelling another user's order")
        void shouldPreventCancellingOthersOrders() {
            UUID otherUserId = UUID.randomUUID();
            when(orderRepository.findById(pendingOrder.getId())).thenReturn(Optional.of(pendingOrder));

            assertThrows(IllegalArgumentException.class,
                    () -> orderService.cancelOrder(pendingOrder.getId(), otherUserId));

            verify(orderRepository, never()).save(any());
        }

        @Test
        @DisplayName("Should prevent cancellation of non-PENDING orders")
        void shouldPreventCancellingNonPendingOrders() {
            pendingOrder.setStatus(Order.OrderStatus.APPROVED);
            when(orderRepository.findById(pendingOrder.getId())).thenReturn(Optional.of(pendingOrder));

            assertThrows(IllegalArgumentException.class,
                    () -> orderService.cancelOrder(pendingOrder.getId(), testUser.getId()));

            verify(orderRepository, never()).save(any());
        }
    }
}
