package com.postqode.nexus;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main application class for PostQode Nexus.
 * 
 * This is the entry point for the Spring Boot application that provides
 * the backend API for the Inventory & Product Management system.
 */
@SpringBootApplication
public class NexusApplication {

    public static void main(String[] args) {
        SpringApplication.run(NexusApplication.class, args);
    }
}
