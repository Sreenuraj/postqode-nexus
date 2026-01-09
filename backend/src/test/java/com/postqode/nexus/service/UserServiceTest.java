package com.postqode.nexus.service;

import com.postqode.nexus.dto.UserRequest;
import com.postqode.nexus.model.User;
import com.postqode.nexus.model.UserRole;
import com.postqode.nexus.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class UserServiceTest {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User testUser;

    @BeforeEach
    void setUp() {
        // Clean up any existing test data
        // Note: We need to delete products first due to foreign key constraints
        // But we'll just create a unique test user instead of deleting all data
        // to avoid foreign key constraint issues
        
        // Create a unique test user with random username to avoid conflicts
        String uniqueUsername = "testuser_" + System.currentTimeMillis();
        testUser = User.builder()
                .username(uniqueUsername)
                .email(uniqueUsername + "@example.com")
                .password("encodedPassword")
                .role(UserRole.USER)
                .isEnabled(true)
                .build();
        testUser = userRepository.save(testUser);
    }

    @Test
    @DisplayName("Should create user with encoded password")
    void shouldCreateUser() {
        // Arrange
        UserRequest request = UserRequest.builder()
                .username("newuser")
                .email("newuser@example.com")
                .password("plainPassword123")
                .role("USER")
                .build();

        // Act
        User user = userService.createUser(request);

        // Assert
        assertThat(user).isNotNull();
        assertThat(user.getUsername()).isEqualTo("newuser");
        assertThat(user.getEmail()).isEqualTo("newuser@example.com");
        assertThat(user.getRole()).isEqualTo(UserRole.USER);
        assertThat(user.getIsEnabled()).isTrue();

        // Verify password was encoded
        User savedUser = userRepository.findByUsername("newuser").orElseThrow();
        assertThat(passwordEncoder.matches("plainPassword123", savedUser.getPassword())).isTrue();
    }

    @Test
    @DisplayName("Should throw exception when creating user with duplicate username")
    void shouldThrowExceptionForDuplicateUsername() {
        // Arrange
        UserRequest request = UserRequest.builder()
                .username(testUser.getUsername()) // Already exists
                .email("different@example.com")
                .password("password123")
                .role("USER")
                .build();

        // Act & Assert
        assertThatThrownBy(() -> userService.createUser(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Username already exists");
    }

    @Test
    @DisplayName("Should update user details")
    void shouldUpdateUser() {
        // Arrange
        UserRequest request = UserRequest.builder()
                .username("testuser")
                .email("updated@example.com")
                .password("newPassword123")
                .role("ADMIN")
                .build();

        // Act
        User user = userService.updateUser(testUser.getId(), request);

        // Assert
        assertThat(user.getEmail()).isEqualTo("updated@example.com");
        assertThat(user.getRole()).isEqualTo(UserRole.ADMIN);

        // Verify password was updated and encoded
        User updatedUser = userRepository.findById(testUser.getId()).orElseThrow();
        assertThat(passwordEncoder.matches("newPassword123", updatedUser.getPassword())).isTrue();
    }

    @Test
    @DisplayName("Should throw exception when updating non-existent user")
    void shouldThrowExceptionWhenUpdatingNonExistentUser() {
        // Arrange
        UUID nonExistentId = UUID.randomUUID();
        UserRequest request = UserRequest.builder()
                .username("anyuser")
                .email("any@example.com")
                .password("password123")
                .role("USER")
                .build();

        // Act & Assert
        assertThatThrownBy(() -> userService.updateUser(nonExistentId, request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("User not found");
    }

    @Test
    @DisplayName("Should enable user")
    void shouldEnableUser() {
        // Arrange
        testUser.setIsEnabled(false);
        userRepository.save(testUser);

        // Act
        userService.enableUser(testUser.getId());

        // Assert
        User updatedUser = userRepository.findById(testUser.getId()).orElseThrow();
        assertThat(updatedUser.getIsEnabled()).isTrue();
    }

    @Test
    @DisplayName("Should disable user")
    void shouldDisableUser() {
        // Arrange
        testUser.setIsEnabled(true);
        userRepository.save(testUser);

        // Act
        userService.disableUser(testUser.getId());

        // Assert
        User updatedUser = userRepository.findById(testUser.getId()).orElseThrow();
        assertThat(updatedUser.getIsEnabled()).isFalse();
    }

    @Test
    @DisplayName("Should throw exception when enabling non-existent user")
    void shouldThrowExceptionWhenEnablingNonExistentUser() {
        // Act & Assert
        UUID nonExistentId = UUID.randomUUID();
        assertThatThrownBy(() -> userService.enableUser(nonExistentId))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("User not found");
    }

    @Test
    @DisplayName("Should throw exception when disabling non-existent user")
    void shouldThrowExceptionWhenDisablingNonExistentUser() {
        // Act & Assert
        UUID nonExistentId = UUID.randomUUID();
        assertThatThrownBy(() -> userService.disableUser(nonExistentId))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("User not found");
    }

    @Test
    @DisplayName("Should get user by ID")
    void shouldGetUserById() {
        // Act
        var user = userService.getUserById(testUser.getId());

        // Assert
        assertThat(user).isPresent();
        assertThat(user.get().getId()).isEqualTo(testUser.getId());
        assertThat(user.get().getUsername()).isEqualTo(testUser.getUsername());
        assertThat(user.get().getEmail()).isEqualTo(testUser.getEmail());
    }

    @Test
    @DisplayName("Should return empty when getting non-existent user by ID")
    void shouldReturnEmptyWhenGettingNonExistentUserById() {
        // Act
        var user = userService.getUserById(UUID.randomUUID());

        // Assert
        assertThat(user).isEmpty();
    }

    @Test
    @DisplayName("Should get all users")
    void shouldGetAllUsers() {
        // Arrange
        User user2 = User.builder()
                .username("user2")
                .email("user2@example.com")
                .password("password")
                .role(UserRole.USER)
                .isEnabled(true)
                .build();
        userRepository.save(user2);

        User user3 = User.builder()
                .username("user3")
                .email("user3@example.com")
                .password("password")
                .role(UserRole.ADMIN)
                .isEnabled(true)
                .build();
        userRepository.save(user3);

        // Act
        List<User> users = userService.getAllUsers();

        // Assert
        assertThat(users).hasSizeGreaterThanOrEqualTo(3);
        assertThat(users).extracting("username")
                .contains(testUser.getUsername(), "user2", "user3");
    }

    @Test
    @DisplayName("Should check if user is enabled")
    void shouldCheckIfUserIsEnabled() {
        // Act & Assert
        assertThat(userService.isUserEnabled(testUser.getUsername())).isTrue();
        assertThat(userService.isUserEnabled("nonexistent")).isFalse();
    }
}
