package com.postqode.nexus.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.hibernate6.Hibernate6Module;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;

/**
 * Jackson configuration to handle Hibernate lazy loading proxies.
 * This prevents serialization errors when returning entities with
 * lazy-loaded relationships from REST endpoints.
 */
@Configuration
public class JacksonConfig {

    @Bean
    public ObjectMapper objectMapper(Jackson2ObjectMapperBuilder builder) {
        ObjectMapper objectMapper = builder.build();

        // Register Hibernate6Module to handle lazy loading
        Hibernate6Module hibernate6Module = new Hibernate6Module();

        // Configure to serialize lazy-loaded properties as null instead of throwing an
        // error
        hibernate6Module.configure(Hibernate6Module.Feature.FORCE_LAZY_LOADING, false);
        hibernate6Module.configure(Hibernate6Module.Feature.SERIALIZE_IDENTIFIER_FOR_LAZY_NOT_LOADED_OBJECTS, true);

        objectMapper.registerModule(hibernate6Module);

        return objectMapper;
    }
}
