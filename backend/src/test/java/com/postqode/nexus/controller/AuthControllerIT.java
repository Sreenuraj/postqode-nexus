package com.postqode.nexus.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.postqode.nexus.dto.AuthResponse;
import com.postqode.nexus.dto.LoginRequest;
import com.postqode.nexus.model.User;
import com.postqode.nexus.model.UserRole;
import com.postqode.nexus.repository.UserRepository;
import com.postqode.nexus.security.CustomUserDetailsService;
import com.postqode.nexus.security.JwtTokenProvider;
import com.postqode.nexus.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@Import(com.postqode.nexus.config.SecurityConfig.class)
@SuppressWarnings("null")
public class AuthControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private UserRepository userRepository;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(UUID.randomUUID());
        testUser.setUsername("admin");
        testUser.setEmail("admin@demo.com");
        testUser.setRole(UserRole.ADMIN);
    }

    // ==================== LOGIN TESTS ====================

    @Test
    public void shouldLoginSuccessfully() throws Exception {
        LoginRequest loginRequest = new LoginRequest("admin", "Admin@123");
        AuthResponse authResponse = new AuthResponse("jwt-token", "admin", "ADMIN");

        when(authService.login(any(LoginRequest.class))).thenReturn(authResponse);

        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt-token"))
                .andExpect(jsonPath("$.username").value("admin"))
                .andExpect(jsonPath("$.role").value("ADMIN"));
    }

    @Test
    public void shouldRejectInvalidCredentials() throws Exception {
        LoginRequest loginRequest = new LoginRequest("admin", "wrong-password");

        when(authService.login(any(LoginRequest.class)))
                .thenThrow(new BadCredentialsException("Invalid credentials"));

        // Spring Security returns 403 for BadCredentialsException in WebMvcTest
        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isForbidden());
    }

    // ==================== LOGOUT TESTS ====================

    @Test
    @WithMockUser(username = "admin", roles = { "ADMIN" })
    public void shouldLogoutSuccessfully() throws Exception {
        mockMvc.perform(post("/api/v1/auth/logout"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Logged out successfully"))
                .andExpect(jsonPath("$.status").value("success"));
    }

    @Test
    public void logoutShouldBeAccessibleWithoutAuth() throws Exception {
        // Logout endpoint is under /api/v1/auth/** which is permitAll
        mockMvc.perform(post("/api/v1/auth/logout"))
                .andExpect(status().isOk());
    }

    // ==================== GET CURRENT USER TESTS ====================

    @Test
    @WithMockUser(username = "admin", roles = { "ADMIN" })
    public void shouldGetCurrentUser() throws Exception {
        when(userRepository.findByUsername("admin")).thenReturn(Optional.of(testUser));

        mockMvc.perform(get("/api/v1/auth/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("admin"))
                .andExpect(jsonPath("$.email").value("admin@demo.com"))
                .andExpect(jsonPath("$.role").value("ADMIN"));
    }

    @Test
    @WithMockUser(username = "user", roles = { "USER" })
    public void shouldGetCurrentUserAsRegularUser() throws Exception {
        User regularUser = new User();
        regularUser.setId(UUID.randomUUID());
        regularUser.setUsername("user");
        regularUser.setEmail("user@demo.com");
        regularUser.setRole(UserRole.USER);

        when(userRepository.findByUsername("user")).thenReturn(Optional.of(regularUser));

        mockMvc.perform(get("/api/v1/auth/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("user"))
                .andExpect(jsonPath("$.role").value("USER"));
    }

    @Test
    public void shouldRejectUnauthenticatedGetMe() throws Exception {
        // /me endpoint requires authentication
        // Without authentication, Spring Security returns 403 (Forbidden)
        mockMvc.perform(get("/api/v1/auth/me"))
                .andExpect(status().isForbidden());
    }
}
