package com.postqode.nexus.service;

import com.postqode.nexus.model.Category;
import com.postqode.nexus.repository.CategoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for CategoryService.
 * Focus on unique name validation and CRUD operations.
 */
@ExtendWith(MockitoExtension.class)
public class CategoryServiceTest {

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private CategoryService categoryService;

    private Category existingCategory;

    @BeforeEach
    void setUp() {
        existingCategory = new Category("Electronics", "Electronic devices");
        existingCategory.setId(UUID.randomUUID());
    }

    @Test
    @DisplayName("Should create category with unique name")
    void shouldCreateCategoryWithUniqueName() {
        Category newCategory = new Category("Office Supplies", "Office items");
        when(categoryRepository.existsByName("Office Supplies")).thenReturn(false);
        when(categoryRepository.save(any(Category.class))).thenAnswer(inv -> {
            Category c = inv.getArgument(0);
            c.setId(UUID.randomUUID());
            return c;
        });

        Category result = categoryService.createCategory(newCategory);

        assertNotNull(result);
        assertEquals("Office Supplies", result.getName());
        verify(categoryRepository).save(any(Category.class));
    }

    @Test
    @DisplayName("Should reject duplicate category name")
    void shouldRejectDuplicateCategoryName() {
        Category duplicate = new Category("Electronics", "Another description");
        when(categoryRepository.existsByName("Electronics")).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> categoryService.createCategory(duplicate));

        verify(categoryRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should update category")
    void shouldUpdateCategory() {
        when(categoryRepository.findById(existingCategory.getId())).thenReturn(Optional.of(existingCategory));
        when(categoryRepository.save(any(Category.class))).thenReturn(existingCategory);

        Category updates = new Category("Updated Name", "Updated Description");
        Category result = categoryService.updateCategory(existingCategory.getId(), updates);

        assertEquals("Updated Name", result.getName());
        assertEquals("Updated Description", result.getDescription());
    }

    @Test
    @DisplayName("Should delete category")
    void shouldDeleteCategory() {
        when(categoryRepository.findById(existingCategory.getId())).thenReturn(Optional.of(existingCategory));

        assertDoesNotThrow(() -> categoryService.deleteCategory(existingCategory.getId()));

        verify(categoryRepository).delete(existingCategory);
    }
}
