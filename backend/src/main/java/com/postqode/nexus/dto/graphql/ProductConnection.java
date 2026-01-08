package com.postqode.nexus.dto.graphql;

import com.postqode.nexus.dto.ProductResponse;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ProductConnection {
    private List<ProductResponse> items;
    private int totalCount;
    private PageInfo pageInfo;
}
