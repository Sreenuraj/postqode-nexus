package com.postqode.nexus.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.postqode.nexus.dto.AuthResponse;
import com.postqode.nexus.dto.LoginRequest;
import com.postqode.nexus.model.User;
import com.postqode.nexus.model.UserRole;
import com.postqode.nexus.repository.UserRepository;
import com.postqode.nexus.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import com.postqode.nexus.security.CustomUserDetailsService;
import com.postqode.nexus.security.JwtTokenProvider;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@Import(com.postqode.nexus.config.SecurityConfig.class)
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

    @Test
    public void shouldLoginSuccessfully() throws Exception {
        LoginRequest loginRequest = new LoginRequest("admin", "password");
        AuthResponse authResponse = new AuthResponse("token", "admin", "ADMIN");

        when(authService.login(any(LoginRequest.class))).thenReturn(authResponse);

        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("token"))
                .andExpect(jsonPath("$.username").value("admin"))
                .andExpect(jsonPath("$.role").value("ADMIN"));
    }
}
