package com.postqode.nexus.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.postqode.nexus.dto.LoginRequest;
import com.postqode.nexus.model.User;
import com.postqode.nexus.model.UserRole;
import com.postqode.nexus.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class AuthControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        // Create a unique test user in the DB for login tests to avoid conflict with
        // existing local data
        if (userRepository.findByUsername("it-admin").isEmpty()) {
            User admin = User.builder()
                    .username("it-admin")
                    .email("it-admin@demo.com")
                    .password(passwordEncoder.encode("Admin@123")) // Real encoding
                    .role(UserRole.ADMIN)
                    .build();
            userRepository.save(admin);
        }
    }

    @Test
    public void shouldLoginSuccessfully_WithRealCredentials() throws Exception {
        LoginRequest loginRequest = new LoginRequest("it-admin", "Admin@123");

        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.username").value("it-admin"))
                .andExpect(jsonPath("$.role").value("ADMIN"));
    }

    @Test
    public void shouldRejectInvalidCredentials_WithRealAuth() throws Exception {
        LoginRequest loginRequest = new LoginRequest("it-admin", "WRONG-PASSWORD");

        // Spring Security throws BadCredentialsException which is handled by Default
        // handling or returns 401/403
        // MockMvc with generic config might return 401 or 403.
        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isForbidden()); // Or status().isUnauthorized() depending on entry point
    }

    @Test
    public void shouldGetCurrentUser_WithRealToken() throws Exception {
        // 1. Login to get token
        LoginRequest loginRequest = new LoginRequest("it-admin", "Admin@123");
        String response = mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andReturn().getResponse().getContentAsString();

        String token = objectMapper.readTree(response).get("token").asText();

        // 2. Use token to get /me
        mockMvc.perform(get("/api/v1/auth/me")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("it-admin"))
                .andExpect(jsonPath("$.email").value("it-admin@demo.com"));
    }

    @Test
    public void shouldFailToGetMe_WithoutToken() throws Exception {
        mockMvc.perform(get("/api/v1/auth/me"))
                .andExpect(status().isForbidden());
    }
}
