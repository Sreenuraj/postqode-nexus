package com.postqode.nexus.dto.graphql;

import com.postqode.nexus.model.ActionType;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class ActivityLogResponse {
    private UUID id;
    private String username;
    private String productName;
    private ActionType actionType;
    private String oldValue;
    private String newValue;
    private String createdAt;
}
