package com.postqode.nexus.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.postqode.nexus.dto.ProductRequest;
import com.postqode.nexus.dto.ProductResponse;
import com.postqode.nexus.model.ProductStatus;
import com.postqode.nexus.security.CustomUserDetailsService;
import com.postqode.nexus.security.JwtTokenProvider;
import com.postqode.nexus.service.ProductService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ProductController.class)
@Import(com.postqode.nexus.config.SecurityConfig.class)
@SuppressWarnings({ "null", "unchecked" })
public class ProductControllerIT {

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private ObjectMapper objectMapper;

        @MockBean
        private ProductService productService;

        @MockBean
        private CustomUserDetailsService customUserDetailsService;

        @MockBean
        private JwtTokenProvider jwtTokenProvider;

        @Test
        @WithMockUser(roles = "ADMIN")
        public void shouldCreateProduct() throws Exception {
                ProductRequest request = ProductRequest.builder()
                                .sku("SKU-001")
                                .name("Test Product")
                                .price(BigDecimal.valueOf(100.0))
                                .quantity(10)
                                .build();

                ProductResponse response = ProductResponse.builder()
                                .id(UUID.randomUUID())
                                .sku("SKU-001")
                                .name("Test Product")
                                .price(BigDecimal.valueOf(100.0))
                                .quantity(10)
                                .status(ProductStatus.ACTIVE)
                                .build();

                when(productService.createProduct(any(ProductRequest.class))).thenReturn(response);

                mockMvc.perform(post("/api/v1/products")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.sku").value("SKU-001"));
        }

        @Test
        @WithMockUser(roles = "USER")
        public void shouldForbidCreateProductForUser() throws Exception {
                ProductRequest request = ProductRequest.builder()
                                .sku("SKU-001")
                                .name("Test Product")
                                .price(BigDecimal.valueOf(100.0))
                                .quantity(10)
                                .build();

                mockMvc.perform(post("/api/v1/products")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isForbidden());
        }

        @Test
        @WithMockUser
        public void shouldGetProducts() throws Exception {
                ProductResponse response = ProductResponse.builder()
                                .id(UUID.randomUUID())
                                .sku("SKU-001")
                                .name("Test Product")
                                .build();

                Page<ProductResponse> page = new PageImpl<>(Collections.singletonList(response), PageRequest.of(0, 10),
                                1);

                when(productService.getProducts(any(), any(), any(Pageable.class))).thenReturn(page);

                mockMvc.perform(get("/api/v1/products"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.content[0].sku").value("SKU-001"));
        }
}
