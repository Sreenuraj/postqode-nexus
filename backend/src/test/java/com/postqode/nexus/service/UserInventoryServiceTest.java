package com.postqode.nexus.service;

import com.postqode.nexus.model.Product;
import com.postqode.nexus.model.ProductStatus;
import com.postqode.nexus.model.User;
import com.postqode.nexus.model.UserInventory;
import com.postqode.nexus.model.UserRole;
import com.postqode.nexus.repository.ProductRepository;
import com.postqode.nexus.repository.UserInventoryRepository;
import com.postqode.nexus.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
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
 * Unit tests for UserInventoryService.
 * Focus on business rules: MANUAL vs PURCHASED items, ownership validation.
 */
@ExtendWith(MockitoExtension.class)
public class UserInventoryServiceTest {

    @Mock
    private UserInventoryRepository userInventoryRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private UserInventoryService userInventoryService;

    private User testUser;
    private User otherUser;
    private Product testProduct;
    private UserInventory manualItem;
    private UserInventory purchasedItem;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(UUID.randomUUID())
                .username("testuser")
                .role(UserRole.USER)
                .build();

        otherUser = User.builder()
                .id(UUID.randomUUID())
                .username("otheruser")
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

        manualItem = new UserInventory(testUser, null, "Personal Laptop", 1,
                UserInventory.InventorySource.MANUAL, "My dev laptop");
        manualItem.setId(UUID.randomUUID());

        purchasedItem = new UserInventory(testUser, testProduct, "Test Product", 2,
                UserInventory.InventorySource.PURCHASED, "Purchased via order");
        purchasedItem.setId(UUID.randomUUID());
    }

    @Nested
    @DisplayName("Manual Item Tests")
    class ManualItemTests {

        @Test
        @DisplayName("Should add manual inventory item")
        void shouldAddManualItem() {
            when(userRepository.findById(testUser.getId())).thenReturn(Optional.of(testUser));
            when(userInventoryRepository.save(any(UserInventory.class))).thenAnswer(inv -> {
                UserInventory item = inv.getArgument(0);
                item.setId(UUID.randomUUID());
                return item;
            });

            UserInventory result = userInventoryService.addManualItem(
                    testUser.getId(), "New Item", 3, "Some notes");

            assertNotNull(result);
            assertEquals("New Item", result.getName());
            assertEquals(UserInventory.InventorySource.MANUAL, result.getSource());
            verify(userInventoryRepository).save(any(UserInventory.class));
        }

        @Test
        @DisplayName("Should update manual item when owned by user")
        void shouldUpdateOwnManualItem() {
            when(userInventoryRepository.findById(manualItem.getId())).thenReturn(Optional.of(manualItem));
            when(userInventoryRepository.save(any(UserInventory.class))).thenReturn(manualItem);

            UserInventory result = userInventoryService.updateInventoryItem(
                    manualItem.getId(), testUser.getId(), "Updated Name", 5, "Updated notes");

            assertEquals("Updated Name", result.getName());
            assertEquals(5, result.getQuantity());
            verify(userInventoryRepository).save(any(UserInventory.class));
        }

        @Test
        @DisplayName("Should delete manual item when owned by user")
        void shouldDeleteOwnManualItem() {
            when(userInventoryRepository.findById(manualItem.getId())).thenReturn(Optional.of(manualItem));

            assertDoesNotThrow(() -> userInventoryService.deleteInventoryItem(manualItem.getId(), testUser.getId()));

            verify(userInventoryRepository).delete(manualItem);
        }
    }

    @Nested
    @DisplayName("Purchased Item Tests")
    class PurchasedItemTests {

        @Test
        @DisplayName("Should add purchased item from approved order")
        void shouldAddPurchasedItem() {
            when(userRepository.findById(testUser.getId())).thenReturn(Optional.of(testUser));
            when(productRepository.findById(testProduct.getId())).thenReturn(Optional.of(testProduct));
            when(userInventoryRepository.save(any(UserInventory.class))).thenAnswer(inv -> {
                UserInventory item = inv.getArgument(0);
                item.setId(UUID.randomUUID());
                return item;
            });

            UserInventory result = userInventoryService.addPurchasedItem(
                    testUser.getId(), testProduct.getId(), testProduct.getName(), 2);

            assertNotNull(result);
            assertEquals(UserInventory.InventorySource.PURCHASED, result.getSource());
            assertEquals(testProduct.getName(), result.getName());
        }

        @Test
        @DisplayName("Should NOT allow updating purchased items")
        void shouldNotAllowUpdatingPurchasedItems() {
            when(userInventoryRepository.findById(purchasedItem.getId())).thenReturn(Optional.of(purchasedItem));

            assertThrows(IllegalArgumentException.class, () -> userInventoryService.updateInventoryItem(
                    purchasedItem.getId(), testUser.getId(), "Hacked Name", 100, ""));

            verify(userInventoryRepository, never()).save(any());
        }

        @Test
        @DisplayName("Should NOT allow deleting purchased items")
        void shouldNotAllowDeletingPurchasedItems() {
            when(userInventoryRepository.findById(purchasedItem.getId())).thenReturn(Optional.of(purchasedItem));

            assertThrows(IllegalArgumentException.class,
                    () -> userInventoryService.deleteInventoryItem(purchasedItem.getId(), testUser.getId()));

            verify(userInventoryRepository, never()).delete(any(UserInventory.class));
        }
    }

    @Nested
    @DisplayName("Ownership Validation Tests")
    class OwnershipTests {

        @Test
        @DisplayName("Should NOT allow updating another user's item")
        void shouldNotAllowUpdatingOthersItems() {
            when(userInventoryRepository.findById(manualItem.getId())).thenReturn(Optional.of(manualItem));

            assertThrows(IllegalArgumentException.class, () -> userInventoryService.updateInventoryItem(
                    manualItem.getId(), otherUser.getId(), "Stolen Name", 1, ""));

            verify(userInventoryRepository, never()).save(any());
        }

        @Test
        @DisplayName("Should NOT allow deleting another user's item")
        void shouldNotAllowDeletingOthersItems() {
            when(userInventoryRepository.findById(manualItem.getId())).thenReturn(Optional.of(manualItem));

            assertThrows(IllegalArgumentException.class,
                    () -> userInventoryService.deleteInventoryItem(manualItem.getId(), otherUser.getId()));

            verify(userInventoryRepository, never()).delete(any(UserInventory.class));
        }
    }

    @Nested
    @DisplayName("Validation Tests")
    class ValidationTests {

        @Test
        @DisplayName("Should reject invalid quantity")
        void shouldRejectInvalidQuantity() {
            when(userRepository.findById(testUser.getId())).thenReturn(Optional.of(testUser));

            assertThrows(IllegalArgumentException.class,
                    () -> userInventoryService.addManualItem(testUser.getId(), "Item", 0, ""));

            assertThrows(IllegalArgumentException.class,
                    () -> userInventoryService.addManualItem(testUser.getId(), "Item", -1, ""));
        }
    }
}
