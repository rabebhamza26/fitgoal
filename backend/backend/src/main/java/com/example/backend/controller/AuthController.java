package com.example.backend.controller;

import com.example.backend.dto.AuthDtos.AccountResponse;
import com.example.backend.dto.AuthDtos.AuthResponse;
import com.example.backend.dto.AuthDtos.ForgotPasswordRequest;
import com.example.backend.dto.AuthDtos.LoginRequest;
import com.example.backend.dto.AuthDtos.MessageResponse;
import com.example.backend.dto.AuthDtos.RegisterRequest;
import com.example.backend.dto.AuthDtos.ResetPasswordRequest;
import com.example.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        try {
            return authService.login(request);
        } catch (AuthenticationException exception) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Adresse e-mail ou mot de passe invalide.");
        }
    }

    @GetMapping("/me")
    public AccountResponse currentAccount(Authentication authentication) {
        return authService.currentAccount(authentication.getName());
    }

    @PostMapping("/forgot-password")
    public MessageResponse forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.requestPasswordReset(request);
        return new MessageResponse(
                "Si un compte correspond à cette adresse, un lien de réinitialisation va être envoyé.");
    }

    @PostMapping("/reset-password")
    public MessageResponse resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return new MessageResponse("Votre mot de passe a été modifié. Vous pouvez vous connecter.");
    }
}
