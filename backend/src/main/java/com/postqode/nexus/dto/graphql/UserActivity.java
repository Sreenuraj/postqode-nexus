package com.postqode.nexus.dto.graphql;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserActivity {
    private String username;
    private int actionCount;
    private String lastAction;
}
