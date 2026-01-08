package com.postqode.nexus.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * Utility class to generate BCrypt password hashes for demo data
 * Run this to get the correct hashes for V2__demo_data.sql
 */
public class PasswordHashGenerator {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        
        String adminPassword = "Admin@123";
        String userPassword = "User@123";
        
        String adminHash = encoder.encode(adminPassword);
        String userHash = encoder.encode(userPassword);
        
        System.out.println("=== BCrypt Password Hashes ===");
        System.out.println("Admin password: " + adminPassword);
        System.out.println("Admin hash: " + adminHash);
        System.out.println();
        System.out.println("User password: " + userPassword);
        System.out.println("User hash: " + userHash);
        System.out.println();
        System.out.println("=== SQL Update Statements ===");
        System.out.println("UPDATE users SET password_hash = '" + adminHash + "' WHERE username = 'admin';");
        System.out.println("UPDATE users SET password_hash = '" + userHash + "' WHERE username = 'user';");
    }
}
