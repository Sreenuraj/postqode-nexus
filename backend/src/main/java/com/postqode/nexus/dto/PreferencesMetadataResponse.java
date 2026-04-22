package com.postqode.nexus.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PreferencesMetadataResponse {
    private String formId;
    private String title;
    private String subtitle;
    private String submitLabel;
    private List<PreferencesFieldMetadata> fields;
    private Instant generatedAt;
    private Long latencyHintMs;
}
