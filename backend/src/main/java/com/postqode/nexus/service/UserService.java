package com.postqode.nexus.service;

import com.postqode.nexus.dto.UserRequest;
import com.postqode.nexus.model.User;
import com.postqode.nexus.model.UserRole;
import com.postqode.nexus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(UUID id) {
        return userRepository.findById(id);
    }

    @Transactional
    public User createUser(UserRequest userRequest) {
        // Check if username already exists
        if (userRepository.findByUsername(userRequest.getUsername()).isPresent()) {
            throw new IllegalArgumentException("Username already exists: " + userRequest.getUsername());
        }

        User user = User.builder()
                .username(userRequest.getUsername())
                .password(passwordEncoder.encode(userRequest.getPassword()))
                .email(userRequest.getEmail())
                .role(UserRole.valueOf(userRequest.getRole().toUpperCase()))
                .isEnabled(true)
                .build();

        return userRepository.save(user);
    }

    @Transactional
    public User updateUser(UUID id, UserRequest userRequest) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));

        // Check if username is being changed and if it already exists
        if (!user.getUsername().equals(userRequest.getUsername()) &&
            userRepository.findByUsername(userRequest.getUsername()).isPresent()) {
            throw new IllegalArgumentException("Username already exists: " + userRequest.getUsername());
        }

        user.setUsername(userRequest.getUsername());
        user.setEmail(userRequest.getEmail());
        
        // Only update password if provided
        if (userRequest.getPassword() != null && !userRequest.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(userRequest.getPassword()));
        }

        // Only update role if provided
        if (userRequest.getRole() != null && !userRequest.getRole().isEmpty()) {
            user.setRole(UserRole.valueOf(userRequest.getRole().toUpperCase()));
        }

        return userRepository.save(user);
    }

    @Transactional
    public void enableUser(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));
        user.setIsEnabled(true);
        userRepository.save(user);
    }

    @Transactional
    public void disableUser(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));
        user.setIsEnabled(false);
        userRepository.save(user);
    }

    public boolean isUserEnabled(String username) {
        return userRepository.findByUsername(username)
                .map(User::getIsEnabled)
                .orElse(false);
    }
}
