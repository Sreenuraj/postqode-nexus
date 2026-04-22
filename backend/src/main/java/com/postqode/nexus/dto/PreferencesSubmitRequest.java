package com.postqode.nexus.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PreferencesSubmitRequest {
    private String profile;
    private String formId;
    private Map<String, Object> values;
}
