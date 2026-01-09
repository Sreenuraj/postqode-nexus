package com.postqode.nexus.controller;

import com.postqode.nexus.model.User;
import com.postqode.nexus.model.UserInventory;
import com.postqode.nexus.repository.UserRepository;
import com.postqode.nexus.service.UserInventoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/user-inventory")
@Tag(name = "User Inventory Management", description = "APIs for managing user inventory")
@SecurityRequirement(name = "bearerAuth")
public class UserInventoryController {

    @Autowired
    private UserInventoryService userInventoryService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    @Operation(summary = "Get current user's inventory", description = "Retrieve inventory items for the authenticated user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved inventory")
    })
    public ResponseEntity<List<UserInventory>> getMyInventory(Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        List<UserInventory> inventory = userInventoryService.getUserInventory(user.getId());
        return ResponseEntity.ok(inventory);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get inventory item by ID", description = "Retrieve a specific inventory item by its ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved inventory item"),
            @ApiResponse(responseCode = "404", description = "Inventory item not found")
    })
    public ResponseEntity<UserInventory> getInventoryItemById(
            @Parameter(description = "Inventory item ID") @PathVariable UUID id) {
        UserInventory item = userInventoryService.getInventoryItemById(id);
        return ResponseEntity.ok(item);
    }

    @PostMapping
    @Operation(summary = "Add a manual inventory item", description = "Add a manually created inventory item")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Inventory item created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid inventory data")
    })
    public ResponseEntity<?> addManualItem(
            @RequestBody Map<String, Object> inventoryRequest,
            Authentication authentication) {
        try {
            User user = userRepository.findByUsername(authentication.getName())
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
            String name = (String) inventoryRequest.get("name");
            Integer quantity = Integer.parseInt(inventoryRequest.get("quantity").toString());
            String notes = (String) inventoryRequest.getOrDefault("notes", "");

            UserInventory item = userInventoryService.addManualItem(user.getId(), name, quantity, notes);
            return ResponseEntity.status(HttpStatus.CREATED).body(item);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an inventory item", description = "Update an existing inventory item")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Inventory item updated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid inventory data or cannot update"),
            @ApiResponse(responseCode = "404", description = "Inventory item not found")
    })
    public ResponseEntity<?> updateInventoryItem(
            @Parameter(description = "Inventory item ID") @PathVariable UUID id,
            @RequestBody Map<String, Object> inventoryRequest,
            Authentication authentication) {
        try {
            User user = userRepository.findByUsername(authentication.getName())
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
            String name = (String) inventoryRequest.get("name");
            Integer quantity = Integer.parseInt(inventoryRequest.get("quantity").toString());
            String notes = (String) inventoryRequest.getOrDefault("notes", "");

            UserInventory item = userInventoryService.updateInventoryItem(id, user.getId(), name, quantity, notes);
            return ResponseEntity.ok(item);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an inventory item", description = "Delete an inventory item")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Inventory item deleted successfully"),
            @ApiResponse(responseCode = "400", description = "Cannot delete item"),
            @ApiResponse(responseCode = "404", description = "Inventory item not found")
    })
    public ResponseEntity<Void> deleteInventoryItem(
            @Parameter(description = "Inventory item ID") @PathVariable UUID id,
            Authentication authentication) {
        try {
            User user = userRepository.findByUsername(authentication.getName())
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
            userInventoryService.deleteInventoryItem(id, user.getId());
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{id}/consume")
    @Operation(summary = "Consume inventory item", description = "Decrease quantity of an inventory item. Item is removed if quantity reaches 0.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Item consumed successfully (updated or removed)"),
            @ApiResponse(responseCode = "400", description = "Invalid quantity or insufficient stock"),
            @ApiResponse(responseCode = "404", description = "Inventory item not found")
    })
    public ResponseEntity<?> consumeInventoryItem(
            @Parameter(description = "Inventory item ID") @PathVariable UUID id,
            @RequestBody Map<String, Integer> request,
            Authentication authentication) {
        try {
            User user = userRepository.findByUsername(authentication.getName())
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));

            Integer quantity = request.get("quantity");
            if (quantity == null) {
                return ResponseEntity.badRequest().body("Quantity is required");
            }

            UserInventory updatedItem = userInventoryService.consumeInventoryItem(id, user.getId(), quantity);

            if (updatedItem == null) {
                return ResponseEntity.ok(Map.of("message", "Item fully consumed and removed from inventory"));
            } else {
                return ResponseEntity.ok(updatedItem);
            }
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
