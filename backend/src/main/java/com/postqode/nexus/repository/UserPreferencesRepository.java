package com.postqode.nexus.repository;

import com.postqode.nexus.model.User;
import com.postqode.nexus.model.UserPreferences;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserPreferencesRepository extends JpaRepository<UserPreferences, Long> {
    
    Optional<UserPreferences> findByUserAndProfile(User user, String profile);
    
    void deleteByUserAndProfile(User user, String profile);
}
