package com.postqode.nexus.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PreferencesFieldMetadata {
    private String fieldId;
    private String logicalKey;
    private String label;
    private String type;
    private Boolean required;
    private String placeholder;
    private Integer maxLength;
    private String defaultValue;
    private List<PreferencesFieldOption> options;
    private PreferencesFieldDependency dependsOn;
}
