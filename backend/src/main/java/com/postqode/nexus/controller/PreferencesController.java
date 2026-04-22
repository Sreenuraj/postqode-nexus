package com.postqode.nexus.controller;

import com.postqode.nexus.dto.PreferencesMetadataResponse;
import com.postqode.nexus.dto.PreferencesSubmitRequest;
import com.postqode.nexus.dto.PreferencesSubmitResponse;
import com.postqode.nexus.service.PreferencesService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/preferences")
@RequiredArgsConstructor
@Tag(name = "Preferences", description = "User preference management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class PreferencesController {

    private final PreferencesService preferencesService;

    @GetMapping("/metadata")
    @Operation(summary = "Get preference form metadata", description = "Returns dynamic form metadata for the specified preference profile")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Metadata retrieved successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid profile parameter"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<PreferencesMetadataResponse> getMetadata(
            @RequestParam(required = true) String profile) {
        try {
            PreferencesMetadataResponse metadata = preferencesService.getMetadata(profile);
            return ResponseEntity.ok(metadata);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping
    @Operation(summary = "Submit preferences", description = "Save user preferences for the specified profile")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Preferences saved successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request data"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<PreferencesSubmitResponse> submitPreferences(
            @RequestBody PreferencesSubmitRequest request) {
        try {
            PreferencesSubmitResponse response = preferencesService.submitPreferences(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
