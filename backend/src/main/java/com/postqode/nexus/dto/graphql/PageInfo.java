package com.postqode.nexus.dto.graphql;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PageInfo {
    private int currentPage;
    private int pageSize;
    private int totalPages;
    private boolean hasNextPage;
    private boolean hasPreviousPage;
}
