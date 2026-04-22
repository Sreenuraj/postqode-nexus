package com.postqode.nexus.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PreferencesSubmitResponse {
    private Boolean ok;
    private Instant savedAt;
    private String message;
}
