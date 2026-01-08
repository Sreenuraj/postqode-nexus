package com.postqode.nexus.dto.graphql;

import com.postqode.nexus.model.ProductStatus;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class StatusCount {
    private ProductStatus status;
    private int count;
}
