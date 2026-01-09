package com.postqode.nexus.service;

import com.postqode.nexus.dto.AuthResponse;
import com.postqode.nexus.dto.LoginRequest;
import com.postqode.nexus.dto.RegisterRequest;
import com.postqode.nexus.model.User;
import com.postqode.nexus.model.UserRole;
import com.postqode.nexus.repository.UserRepository;
import com.postqode.nexus.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

        private final AuthenticationManager authenticationManager;
        private final JwtTokenProvider jwtTokenProvider;
        private final UserRepository userRepository;
        private final PasswordEncoder passwordEncoder;

        public AuthResponse register(RegisterRequest request) {
                if (userRepository.existsByUsername(request.getUsername())) {
                        throw new IllegalArgumentException("Username is already taken");
                }

                User user = new User();
                user.setUsername(request.getUsername());
                user.setPassword(passwordEncoder.encode(request.getPassword()));
                user.setEmail(request.getEmail());
                user.setRole(UserRole.valueOf(request.getRole().toUpperCase()));
                user.setIsEnabled(true);

                userRepository.save(user);

                // Auto-login after registration
                Authentication authentication = authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(
                                                request.getUsername(),
                                                request.getPassword()));

                SecurityContextHolder.getContext().setAuthentication(authentication);
                String token = jwtTokenProvider.generateToken(authentication);

                return AuthResponse.builder()
                                .token(token)
                                .username(user.getUsername())
                                .role(user.getRole().name())
                                .build();
        }

        public AuthResponse login(LoginRequest loginRequest) {
                Authentication authentication = authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(
                                                loginRequest.getUsername(),
                                                loginRequest.getPassword()));

                SecurityContextHolder.getContext().setAuthentication(authentication);
                String token = jwtTokenProvider.generateToken(authentication);

                User user = userRepository.findByUsername(loginRequest.getUsername())
                                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

                return AuthResponse.builder()
                                .token(token)
                                .username(user.getUsername())
                                .role(user.getRole().name())
                                .build();
        }
}
