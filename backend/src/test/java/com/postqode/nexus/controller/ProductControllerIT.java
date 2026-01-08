package com.postqode.nexus.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.postqode.nexus.dto.ProductRequest;
import com.postqode.nexus.model.Product;
import com.postqode.nexus.model.ProductStatus;
import com.postqode.nexus.model.User;
import com.postqode.nexus.model.UserRole;
import com.postqode.nexus.repository.ProductRepository;
import com.postqode.nexus.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class ProductControllerIT {

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private ObjectMapper objectMapper;

        @Autowired
        private ProductRepository productRepository;

        @Autowired
        private UserRepository userRepository;

        @BeforeEach
        void setUp() {
                // Ensure Users exist for @WithMockUser to resolve in ProductService
                if (userRepository.findByUsername("admin").isEmpty()) {
                        User admin = User.builder()
                                        .username("admin")
                                        .email("admin@test.com")
                                        .password("hash")
                                        .role(UserRole.ADMIN)
                                        .build();
                        userRepository.save(admin);
                }

                if (userRepository.findByUsername("user").isEmpty()) {
                        User user = User.builder()
                                        .username("user")
                                        .email("user@test.com")
                                        .password("hash")
                                        .role(UserRole.USER)
                                        .build();
                        userRepository.save(user);
                }
        }

        @Test
        @WithMockUser(username = "admin", roles = "ADMIN")
        public void shouldCreateProduct_AndPersistToDb() throws Exception {
                ProductRequest request = ProductRequest.builder()
                                .sku("IT-SKU-001")
                                .name("Integration Test Product")
                                .price(BigDecimal.valueOf(100.50))
                                .quantity(10)
                                .status(ProductStatus.ACTIVE)
                                .build();

                mockMvc.perform(post("/api/v1/products")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.sku").value("IT-SKU-001"))
                                .andExpect(jsonPath("$.id").exists());

                // Verify side effect: It is actually in the DB
                assertThat(productRepository.existsBySku("IT-SKU-001")).isTrue();
        }

        @Test
        @WithMockUser(username = "admin", roles = "ADMIN")
        public void shouldUpdateProduct_AndReflectInDb() throws Exception {
                // Setup: Create product directly in DB
                User admin = userRepository.findByUsername("admin").get();
                Product product = Product.builder()
                                .sku("IT-SKU-UPDATE")
                                .name("Original Name")
                                .price(BigDecimal.TEN)
                                .quantity(5)
                                .status(ProductStatus.ACTIVE)
                                .createdBy(admin)
                                .updatedBy(admin)
                                .build();
                product = productRepository.save(product);

                // Action: Update via API
                ProductRequest updateRequest = ProductRequest.builder()
                                .sku("IT-SKU-UPDATE")
                                .name("Updated Name") // Changed
                                .price(BigDecimal.valueOf(200.00)) // Changed
                                .quantity(50) // Changed
                                .status(ProductStatus.ACTIVE)
                                .build();

                mockMvc.perform(put("/api/v1/products/" + product.getId())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(updateRequest)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.name").value("Updated Name"));

                // Verify DB state
                Product updatedProduct = productRepository.findById(product.getId()).orElseThrow();
                assertThat(updatedProduct.getName()).isEqualTo("Updated Name");
                assertThat(updatedProduct.getPrice()).isEqualByComparingTo(BigDecimal.valueOf(200.00));
                assertThat(updatedProduct.getQuantity()).isEqualTo(50);
        }

        @Test
        @WithMockUser(username = "admin", roles = "ADMIN")
        public void shouldDeleteProduct_AndRemoveFromDb() throws Exception {
                // Setup: Create product
                User admin = userRepository.findByUsername("admin").get();
                Product product = Product.builder()
                                .sku("IT-SKU-DELETE")
                                .name("To Delete")
                                .price(BigDecimal.TEN)
                                .quantity(1)
                                .status(ProductStatus.ACTIVE)
                                .createdBy(admin)
                                .build();
                product = productRepository.save(product);

                // Action: Delete via API
                mockMvc.perform(delete("/api/v1/products/" + product.getId()))
                                .andExpect(status().isNoContent());

                // Verify DB state
                assertThat(productRepository.findById(product.getId())).isEmpty();
        }

        @Test
        @WithMockUser(username = "admin", roles = "ADMIN")
        public void shouldFailToCreateDuplicateSku() throws Exception {
                // Setup: Existing Product
                User admin = userRepository.findByUsername("admin").get();
                Product product = Product.builder()
                                .sku("DUPLICATE-SKU")
                                .name("Original")
                                .price(BigDecimal.TEN)
                                .quantity(1)
                                .status(ProductStatus.ACTIVE)
                                .createdBy(admin)
                                .build();
                productRepository.save(product);

                // Action: Try to create another with same SKU
                ProductRequest request = ProductRequest.builder()
                                .sku("DUPLICATE-SKU") // Same SKU
                                .name("Copycat")
                                .price(BigDecimal.ONE)
                                .quantity(1)
                                .build();

                // Expect 500 or 400 depending on global exception handler.
                // Based on Service code: throw new RuntimeException(...), likely 500 unless
                // handled.
                // Assuming default Spring Boot behavior for RuntimeException -> 500.
                // Or if validation catches it via UNIQUE constraint -> DataIntegrityViolation
                // -> 500.
                // Ideally checking that it FAILS is enough for now.
                mockMvc.perform(post("/api/v1/products")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isInternalServerError());
        }

        @Test
        @WithMockUser(roles = "USER")
        public void shouldForbidNonAdminActions() throws Exception {
                ProductRequest request = ProductRequest.builder()
                                .sku("USER-SKU")
                                .name("User Product")
                                .price(BigDecimal.TEN)
                                .quantity(1)
                                .build();

                mockMvc.perform(post("/api/v1/products")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isForbidden());
        }
}
