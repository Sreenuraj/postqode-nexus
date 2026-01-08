package com.postqode.nexus.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.function.Function;

@Component
public class JwtTokenProvider {

    @Value("${jwt.secret:demo-secret-key-must-be-at-least-256-bits-long-for-security-purposes}")
    private String jwtSecret;

    @Value("${jwt.expiration:86400000}")
    private long jwtExpiration;

    public String generateToken(Authentication authentication) {
        UserDetails userPrincipal = (UserDetails) authentication.getPrincipal();
        return generateToken(userPrincipal.getUsername());
    }

    public String generateToken(String username) {
        return Jwts.builder()
                .subject(username)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + jwtExpiration))
                .signWith(getSignInKey())
                .compact();
    }

    public String getUsernameFromToken(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public boolean validateToken(String token) {
        try {
            extractAllClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSignInKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
        // If the secret is plain text and not base64 encoded in properties, this might fail if not properly encoded.
        // For simplicity in this demo, we assume it's a strong string that we can use directly or base64 encode.
        // If the provided secret is just a string, we might need to encode it first or use Keys.hmacShaKeyFor(jwtSecret.getBytes())
        // Given the default value is long text, let's try to use it as bytes directly if decode fails or just use bytes.
        // Actually, standard practice with jjwt 0.12+ is to use a proper key.
        // Let's assume the secret in properties is a Base64 encoded string of a key.
        // If not, we should probably just use the bytes of the string.
        try {
             return Keys.hmacShaKeyFor(keyBytes);
        } catch (IllegalArgumentException e) {
             return Keys.hmacShaKeyFor(jwtSecret.getBytes());
        }
    }
}
