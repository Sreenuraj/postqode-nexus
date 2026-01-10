package com.postqode.nexus.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.FileCopyUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.nio.charset.StandardCharsets;

@RestController
@RequiredArgsConstructor
public class SchemaController {

    @GetMapping(value = "/graphql-schema", produces = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<String> getSchema() {
        try {
            Resource resource = new ClassPathResource("graphql/schema.graphqls");
            if (!resource.exists()) {
                return ResponseEntity.notFound().build();
            }

            try (Reader reader = new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8)) {
                String schema = FileCopyUtils.copyToString(reader);
                return ResponseEntity.ok(schema);
            }
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Error reading schema file: " + e.getMessage());
        }
    }
}
