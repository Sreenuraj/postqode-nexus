package com.postqode.nexus.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.postqode.nexus.dto.*;
import com.postqode.nexus.model.User;
import com.postqode.nexus.model.UserPreferences;
import com.postqode.nexus.repository.UserPreferencesRepository;
import com.postqode.nexus.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class PreferencesService {

    @Autowired
    private UserPreferencesRepository userPreferencesRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ObjectMapper objectMapper;

    private static final Map<String, List<String>> LABEL_POOLS = new HashMap<>();
    
    static {
        // Display name labels by profile
        LABEL_POOLS.put("personal:displayName", Arrays.asList("Display Name", "Your Name", "What should we call you?"));
        LABEL_POOLS.put("work:displayName", Arrays.asList("Full Name", "Professional Name"));
        LABEL_POOLS.put("notifications:displayName", Arrays.asList("Recipient Name", "Contact Name"));
        LABEL_POOLS.put("localization:displayName", Arrays.asList("Preferred Name", "Display Name"));
        
        // Submit button labels
        LABEL_POOLS.put("submitLabel", Arrays.asList("Save Changes", "Save Preferences", "Update Profile"));
        
        // Region labels by country
        LABEL_POOLS.put("region:US", Arrays.asList("State", "State / Territory"));
        LABEL_POOLS.put("region:IN", Arrays.asList("State", "State (India)"));
        LABEL_POOLS.put("region:GB", Arrays.asList("Region", "Country of the UK"));
        LABEL_POOLS.put("region:DE", Arrays.asList("Bundesland", "State"));
    }

    public PreferencesMetadataResponse getMetadata(String profile) {
        // Simulate variable latency
        long latency = ThreadLocalRandom.current().nextLong(400, 1201);
        try {
            Thread.sleep(latency);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        String formId = generateFormId(profile);
        String title = getTitleForProfile(profile);
        String subtitle = getSubtitleForProfile(profile);
        String submitLabel = pickRandom(LABEL_POOLS.get("submitLabel"));
        
        List<PreferencesFieldMetadata> fields = buildFieldsForProfile(profile);
        
        // Load saved preferences and populate default values
        User currentUser = getCurrentUser();
        if (currentUser != null) {
            Optional<UserPreferences> savedPrefs = userPreferencesRepository.findByUserAndProfile(currentUser, profile);
            if (savedPrefs.isPresent()) {
                try {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> savedValues = objectMapper.readValue(savedPrefs.get().getPreferencesJson(), Map.class);
                    // Update field default values with saved data
                    for (PreferencesFieldMetadata field : fields) {
                        if (savedValues.containsKey(field.getLogicalKey())) {
                            field.setDefaultValue(String.valueOf(savedValues.get(field.getLogicalKey())));
                        }
                    }
                } catch (JsonProcessingException e) {
                    // Ignore parse errors, use defaults
                }
            }
        }
        
        return new PreferencesMetadataResponse(
            formId,
            title,
            subtitle,
            submitLabel,
            fields,
            Instant.now(),
            latency
        );
    }

    @Transactional
    public PreferencesSubmitResponse submitPreferences(PreferencesSubmitRequest request) {
        // Validate profile
        if (!Arrays.asList("personal", "work", "notifications", "localization").contains(request.getProfile())) {
            throw new IllegalArgumentException("Invalid profile: " + request.getProfile());
        }
        
        // Simulate variable latency
        long latency = ThreadLocalRandom.current().nextLong(800, 1801);
        try {
            Thread.sleep(latency);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        // Persist preferences
        User currentUser = getCurrentUser();
        if (currentUser != null) {
            try {
                String preferencesJson = objectMapper.writeValueAsString(request.getValues());
                
                Optional<UserPreferences> existing = userPreferencesRepository.findByUserAndProfile(currentUser, request.getProfile());
                UserPreferences prefs;
                
                if (existing.isPresent()) {
                    prefs = existing.get();
                    prefs.setPreferencesJson(preferencesJson);
                } else {
                    prefs = new UserPreferences();
                    prefs.setUser(currentUser);
                    prefs.setProfile(request.getProfile());
                    prefs.setPreferencesJson(preferencesJson);
                }
                
                userPreferencesRepository.save(prefs);
            } catch (JsonProcessingException e) {
                throw new RuntimeException("Failed to serialize preferences", e);
            }
        }
        
        return new PreferencesSubmitResponse(true, Instant.now(), "Preferences saved.");
    }

    private String generateFormId(String profile) {
        long epochMs = System.currentTimeMillis();
        String random = generateRandomString(6);
        return String.format("pref-%s-%d-%s", profile, epochMs, random);
    }

    private String generateFieldId(String logicalKey) {
        String random = generateRandomString(6);
        return String.format("fld_%s_%s", logicalKey, random);
    }

    private String generateRandomString(int length) {
        String chars = "abcdefghijklmnopqrstuvwxyz0123456789";
        StringBuilder sb = new StringBuilder();
        Random random = new Random();
        for (int i = 0; i < length; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }

    private String pickRandom(List<String> options) {
        return options.get(ThreadLocalRandom.current().nextInt(options.size()));
    }

    private String getTitleForProfile(String profile) {
        Map<String, List<String>> titles = new HashMap<>();
        titles.put("personal", Arrays.asList("My Profile", "Personal Settings"));
        titles.put("work", Arrays.asList("Work Profile", "Professional Information"));
        titles.put("notifications", Arrays.asList("Notification Preferences", "Communication Settings"));
        titles.put("localization", Arrays.asList("Regional Settings", "Localization Preferences"));
        
        return pickRandom(titles.getOrDefault(profile, Arrays.asList("Profile Preferences")));
    }

    private String getSubtitleForProfile(String profile) {
        switch (profile) {
            case "personal":
                return "Update how you appear across the platform.";
            case "work":
                return "Manage your professional information and work details.";
            case "notifications":
                return "Control how and when you receive notifications.";
            case "localization":
                return "Set your regional preferences and display formats.";
            default:
                return "Update your preferences.";
        }
    }

    private List<PreferencesFieldMetadata> buildFieldsForProfile(String profile) {
        List<PreferencesFieldMetadata> fields = new ArrayList<>();
        
        switch (profile) {
            case "personal":
                fields.add(createField("displayName", pickRandom(LABEL_POOLS.get("personal:displayName")), 
                    "text", true, "How should we address you?", 80, "", null, null));
                fields.add(createField("bio", "Bio", "textarea", false, "Tell us about yourself", 500, "", null, null));
                fields.add(createField("avatarColor", "Avatar Color", "select", false, null, null, "#3b82f6",
                    Arrays.asList(
                        new PreferencesFieldOption("#3b82f6", "Blue"),
                        new PreferencesFieldOption("#10b981", "Green"),
                        new PreferencesFieldOption("#f59e0b", "Orange"),
                        new PreferencesFieldOption("#ef4444", "Red"),
                        new PreferencesFieldOption("#8b5cf6", "Purple")
                    ), null));
                break;
                
            case "work":
                fields.add(createField("displayName", pickRandom(LABEL_POOLS.get("work:displayName")), 
                    "text", true, "Your full professional name", 80, "", null, null));
                fields.add(createField("jobTitle", "Job Title", "text", false, "e.g., Senior Engineer", 100, "", null, null));
                fields.add(createField("department", "Department", "select", false, null, null, "",
                    Arrays.asList(
                        new PreferencesFieldOption("engineering", "Engineering"),
                        new PreferencesFieldOption("product", "Product"),
                        new PreferencesFieldOption("design", "Design"),
                        new PreferencesFieldOption("sales", "Sales"),
                        new PreferencesFieldOption("support", "Support")
                    ), null));
                fields.add(createField("workPhone", "Work Phone", "text", false, "+1 (555) 000-0000", 20, "", null, null));
                break;
                
            case "notifications":
                fields.add(createField("displayName", pickRandom(LABEL_POOLS.get("notifications:displayName")), 
                    "text", true, "Name for notifications", 80, "", null, null));
                fields.add(createField("notificationMethod", "Notification Method", "select", true, null, null, "email",
                    Arrays.asList(
                        new PreferencesFieldOption("email", "Email"),
                        new PreferencesFieldOption("sms", "SMS"),
                        new PreferencesFieldOption("none", "None")
                    ), null));
                fields.add(createField("emailAddress", "Email Address", "email", true, "your@email.com", 100, "",
                    null, new PreferencesFieldDependency("notificationMethod", Arrays.asList("email"))));
                fields.add(createField("phoneNumber", "Phone Number", "text", true, "+1 (555) 000-0000", 20, "",
                    null, new PreferencesFieldDependency("notificationMethod", Arrays.asList("sms"))));
                break;
                
            case "localization":
                fields.add(createField("displayName", pickRandom(LABEL_POOLS.get("localization:displayName")), 
                    "text", true, "Your preferred name", 80, "", null, null));
                fields.add(createField("country", "Country", "select", true, null, null, "US",
                    Arrays.asList(
                        new PreferencesFieldOption("US", "United States"),
                        new PreferencesFieldOption("IN", "India"),
                        new PreferencesFieldOption("GB", "United Kingdom"),
                        new PreferencesFieldOption("DE", "Germany")
                    ), null));
                fields.add(createField("region", pickRandom(LABEL_POOLS.getOrDefault("region:US", Arrays.asList("State"))), 
                    "select", false, null, null, "",
                    Arrays.asList(
                        new PreferencesFieldOption("CA", "California"),
                        new PreferencesFieldOption("NY", "New York"),
                        new PreferencesFieldOption("TX", "Texas")
                    ), new PreferencesFieldDependency("country", Arrays.asList("US", "IN", "GB", "DE"))));
                fields.add(createField("timezone", "Timezone", "select", true, null, null, "America/Los_Angeles",
                    Arrays.asList(
                        new PreferencesFieldOption("America/Los_Angeles", "Pacific Time"),
                        new PreferencesFieldOption("America/New_York", "Eastern Time"),
                        new PreferencesFieldOption("Asia/Kolkata", "India Standard Time"),
                        new PreferencesFieldOption("Europe/London", "GMT"),
                        new PreferencesFieldOption("Europe/Berlin", "Central European Time")
                    ), null));
                fields.add(createField("dateFormat", "Date Format", "select", false, null, null, "MM/DD/YYYY",
                    Arrays.asList(
                        new PreferencesFieldOption("MM/DD/YYYY", "MM/DD/YYYY (US)"),
                        new PreferencesFieldOption("DD/MM/YYYY", "DD/MM/YYYY (UK)"),
                        new PreferencesFieldOption("YYYY-MM-DD", "YYYY-MM-DD (ISO)")
                    ), null));
                break;
        }
        
        return fields;
    }

    private PreferencesFieldMetadata createField(String logicalKey, String label, String type, 
                                                  Boolean required, String placeholder, Integer maxLength,
                                                  String defaultValue, List<PreferencesFieldOption> options,
                                                  PreferencesFieldDependency dependsOn) {
        return new PreferencesFieldMetadata(
            generateFieldId(logicalKey),
            logicalKey,
            label,
            type,
            required,
            placeholder,
            maxLength,
            defaultValue,
            options,
            dependsOn
        );
    }
    
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        String username = authentication.getName();
        return userRepository.findByUsername(username).orElse(null);
    }
}
