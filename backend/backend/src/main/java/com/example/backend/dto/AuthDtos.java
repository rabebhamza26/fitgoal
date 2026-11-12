package com.example.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.List;

public final class AuthDtos {

    private AuthDtos() {
    }

    public record RegisterRequest(
            @NotBlank @Size(max = 100) String name,
            @NotBlank @Email @Size(max = 254) String email,
            @NotBlank @Size(min = 8, max = 72) String password,
            @NotBlank @Size(max = 10) String role) {
    }

    public record LoginRequest(
            @NotBlank @Email @Size(max = 254) String email,
            @NotBlank @Size(max = 72) String password) {
    }

    public record ForgotPasswordRequest(
            @NotBlank @Email @Size(max = 254) String email) {
    }

    public record ResetPasswordRequest(
            @NotBlank @Size(max = 128) String token,
            @NotBlank @Size(min = 8, max = 72) String password) {
    }

    public record AuthResponse(
            String accessToken,
            String tokenType,
            Instant expiresAt,
            String role,
            String status,
            List<String> permissions,
            String name,
            String email,
            String message) {
    }

    public record AccountResponse(
            String role,
            String status,
            List<String> permissions,
            String name,
            String email) {
    }

    public record AdminCoachResponse(Long id, String name, String email) {
    }

    public record MessageResponse(String message) {
    }
}
