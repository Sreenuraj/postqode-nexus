package com.postqode.nexus.service;

import com.postqode.nexus.model.Product;
import com.postqode.nexus.model.User;
import com.postqode.nexus.model.UserInventory;
import com.postqode.nexus.repository.ProductRepository;
import com.postqode.nexus.repository.UserInventoryRepository;
import com.postqode.nexus.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class UserInventoryService {

    @Autowired
    private UserInventoryRepository userInventoryRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    public List<UserInventory> getUserInventory(UUID userId) {
        return userInventoryRepository.findByUserId(userId);
    }

    public UserInventory getInventoryItemById(UUID id) {
        return userInventoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Inventory item not found with id: " + id));
    }

    /**
     * Add a manually created inventory item
     */
    public UserInventory addManualItem(UUID userId, String name, Integer quantity, String notes) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));

        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than 0");
        }

        UserInventory item = new UserInventory(
                user,
                null, // No product reference for manual items
                name,
                quantity,
                UserInventory.InventorySource.MANUAL,
                notes);

        return userInventoryRepository.save(item);
    }

    /**
     * Add a purchased item (called when order is approved).
     * Merges with existing item if present.
     */
    public UserInventory addPurchasedItem(UUID userId, UUID productId, String productName, Integer quantity) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + productId));

        // Check if item already exists
        return userInventoryRepository
                .findByUserIdAndProductAndSource(userId, product, UserInventory.InventorySource.PURCHASED)
                .map(existingItem -> {
                    existingItem.setQuantity(existingItem.getQuantity() + quantity);
                    return userInventoryRepository.save(existingItem);
                })
                .orElseGet(() -> {
                    UserInventory item = new UserInventory(
                            user,
                            product,
                            productName,
                            quantity,
                            UserInventory.InventorySource.PURCHASED,
                            "Purchased via order");
                    return userInventoryRepository.save(item);
                });
    }

    /**
     * Update an inventory item
     */
    public UserInventory updateInventoryItem(UUID id, UUID userId, String name, Integer quantity, String notes) {
        UserInventory item = getInventoryItemById(id);

        // Verify ownership
        if (!item.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("You can only update your own inventory items");
        }

        // Only allow updates for MANUAL items
        if (item.getSource() != UserInventory.InventorySource.MANUAL) {
            throw new IllegalArgumentException("Only manually added items can be updated");
        }

        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than 0");
        }

        item.setName(name);
        item.setQuantity(quantity);
        item.setNotes(notes);

        return userInventoryRepository.save(item);
    }

    /**
     * Delete an inventory item
     */
    public void deleteInventoryItem(UUID id, UUID userId) {
        UserInventory item = getInventoryItemById(id);

        // Verify ownership
        if (!item.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("You can only delete your own inventory items");
        }

        // Only allow deletion for MANUAL items
        if (item.getSource() != UserInventory.InventorySource.MANUAL) {
            throw new IllegalArgumentException("Only manually added items can be deleted");
        }

        userInventoryRepository.delete(item);
    }

    /**
     * Consume (decrease quantity of) an inventory item.
     * Removes item if quantity reaches 0.
     */
    public UserInventory consumeInventoryItem(UUID id, UUID userId, Integer quantity) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantity to consume must be greater than 0");
        }

        UserInventory item = getInventoryItemById(id);

        // Verify ownership
        if (!item.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("You can only consume your own inventory items");
        }

        int currentQuantity = item.getQuantity();
        if (quantity > currentQuantity) {
            throw new IllegalArgumentException("Cannot consume more than available quantity (" + currentQuantity + ")");
        }

        int newQuantity = currentQuantity - quantity;

        if (newQuantity == 0) {
            userInventoryRepository.delete(item);
            return null; // Item removed
        } else {
            item.setQuantity(newQuantity);
            return userInventoryRepository.save(item);
        }
    }
}
