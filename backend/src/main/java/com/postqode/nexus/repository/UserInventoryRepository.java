package com.postqode.nexus.repository;

import com.postqode.nexus.model.UserInventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface UserInventoryRepository extends JpaRepository<UserInventory, UUID> {
    
    List<UserInventory> findByUserId(UUID userId);
    
    List<UserInventory> findByUserIdAndSource(UUID userId, UserInventory.InventorySource source);
}
