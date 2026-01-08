package com.postqode.nexus.controller;

import com.postqode.nexus.dto.AuthResponse;
import com.postqode.nexus.dto.LoginRequest;
import com.postqode.nexus.dto.UserResponse;
import com.postqode.nexus.model.User;
import com.postqode.nexus.repository.UserRepository;
import com.postqode.nexus.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest loginRequest) {
        return ResponseEntity.ok(authService.login(loginRequest));
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout() {
        // For stateless JWT, we just return success
        // The client should discard the token
        // In a more complex setup, you could blacklist the token
        return ResponseEntity.ok(Map.of(
            "message", "Logged out successfully",
            "status", "success"
        ));
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return ResponseEntity.ok(UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build());
    }
}
