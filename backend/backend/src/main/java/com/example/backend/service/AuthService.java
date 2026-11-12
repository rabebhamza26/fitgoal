package com.example.backend.service;

import com.example.backend.dto.AuthDtos.AccountResponse;
import com.example.backend.dto.AuthDtos.AuthResponse;
import com.example.backend.dto.AuthDtos.ForgotPasswordRequest;
import com.example.backend.dto.AuthDtos.LoginRequest;
import com.example.backend.dto.AuthDtos.RegisterRequest;
import com.example.backend.dto.AuthDtos.ResetPasswordRequest;
import com.example.backend.model.AccountStatus;
import com.example.backend.model.PasswordResetToken;
import com.example.backend.model.UserAccount;
import com.example.backend.model.UserRole;
import com.example.backend.repository.PasswordResetTokenRepository;
import com.example.backend.repository.UserAccountRepository;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.HexFormat;
import java.util.List;
import java.util.Locale;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final int PASSWORD_RESET_MINUTES = 30;

    private final UserAccountRepository userRepository;
    private final PasswordResetTokenRepository resetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtEncoder jwtEncoder;
    private final JavaMailSender mailSender;
    private final String senderAddress;
    private final String frontendUrl;
    private final long tokenLifetimeMillis;

    public AuthService(
            UserAccountRepository userRepository,
            PasswordResetTokenRepository resetTokenRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtEncoder jwtEncoder,
            JavaMailSender mailSender,
            @Value("${spring.mail.username}") String senderAddress,
            @Value("${app.frontend-url}") String frontendUrl,
            @Value("${application.security.jwt.expiration}") long tokenLifetimeMillis) {
        this.userRepository = userRepository;
        this.resetTokenRepository = resetTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtEncoder = jwtEncoder;
        this.mailSender = mailSender;
        this.senderAddress = senderAddress;
        this.frontendUrl = frontendUrl.replaceAll("/+$", "");
        this.tokenLifetimeMillis = tokenLifetimeMillis;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = normalizeEmail(request.email());
        if (userRepository.findByEmail(email).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cette adresse e-mail est déjà utilisée.");
        }

        UserRole role = parseRegistrationRole(request.role());
        validatePasswordBytes(request.password());
        AccountStatus status = role == UserRole.COACH
                ? AccountStatus.PENDING_APPROVAL
                : AccountStatus.ACTIVE;
        UserAccount account = userRepository.saveAndFlush(new UserAccount(
                request.name().trim(),
                email,
                passwordEncoder.encode(request.password()),
                role,
                status));

        if (status == AccountStatus.PENDING_APPROVAL) {
            return response(account, null, null,
                    "Votre demande de compte coach est en attente de validation par un administrateur.");
        }
        return issueToken(account, "Compte créé avec succès.");
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(normalizeEmail(request.email()), request.password()));
        UserAccount account = (UserAccount) authentication.getPrincipal();
        return issueToken(account, "Connexion réussie.");
    }

    public AccountResponse currentAccount(String email) {
        UserAccount account = userRepository.findByEmail(normalizeEmail(email))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        return new AccountResponse(
                account.getRole().name(),
                account.getStatus().name(),
                account.getRole().permissions(),
                account.getName(),
                account.getEmail());
    }

    @Transactional
    public void requestPasswordReset(ForgotPasswordRequest request) {
        userRepository.findByEmail(normalizeEmail(request.email())).ifPresent(account -> {
            String rawToken = createRandomToken();
            resetTokenRepository.findByUser(account).ifPresent(resetTokenRepository::delete);
            resetTokenRepository.save(new PasswordResetToken(
                    account,
                    hashToken(rawToken),
                    Instant.now().plus(PASSWORD_RESET_MINUTES, ChronoUnit.MINUTES)));

            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(senderAddress);
                message.setTo(account.getEmail());
                message.setSubject("Réinitialisation de votre mot de passe FitGoal");
                message.setText("""
                        Une demande de réinitialisation du mot de passe a été reçue.

                        Utilisez ce lien dans les 30 prochaines minutes :
                        %s/reset-password?token=%s

                        Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.
                        """.formatted(frontendUrl, rawToken));
                mailSender.send(message);
            } catch (MailException exception) {
                logger.error("Impossible d'envoyer un e-mail de réinitialisation de mot de passe.", exception);
            }
        });
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        validatePasswordBytes(request.password());
        PasswordResetToken token = resetTokenRepository
                .findByTokenHashAndExpiresAtAfter(hashToken(request.token()), Instant.now())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "Le lien est invalide ou a expiré."));
        UserAccount account = token.getUser();
        account.setPasswordHash(passwordEncoder.encode(request.password()));
        userRepository.save(account);
        resetTokenRepository.delete(token);
    }

    private AuthResponse issueToken(UserAccount account, String message) {
        Instant issuedAt = Instant.now();
        Instant expiresAt = issuedAt.plusMillis(tokenLifetimeMillis);
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("fitgoal-api")
                .subject(account.getEmail())
                .audience(List.of("fitgoal-api"))
                .issuedAt(issuedAt)
                .expiresAt(expiresAt)
                .claim("role", account.getRole().name())
                .claim("status", account.getStatus().name())
                .claim("permissions", account.getRole().permissions())
                .claim("name", account.getName())
                .build();
        String accessToken = jwtEncoder.encode(JwtEncoderParameters.from(
                JwsHeader.with(MacAlgorithm.HS256).build(), claims)).getTokenValue();
        return response(account, accessToken, expiresAt, message);
    }

    private AuthResponse response(UserAccount account, String token, Instant expiresAt, String message) {
        return new AuthResponse(
                token,
                token == null ? null : "Bearer",
                expiresAt,
                account.getRole().name(),
                account.getStatus().name(),
                account.getRole().permissions(),
                account.getName(),
                account.getEmail(),
                message);
    }

    private UserRole parseRegistrationRole(String requestedRole) {
        try {
            UserRole role = UserRole.valueOf(requestedRole.trim().toUpperCase(Locale.ROOT));
            if (role == UserRole.ADMIN) {
                throw new IllegalArgumentException();
            }
            return role;
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le rôle doit être CLIENT ou COACH.");
        }
    }

    private void validatePasswordBytes(String password) {
        if (password.getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Le mot de passe ne doit pas dépasser 72 octets UTF-8.");
        }
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private String createRandomToken() {
        byte[] tokenBytes = new byte[32];
        SECURE_RANDOM.nextBytes(tokenBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);
    }

    private String hashToken(String token) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is unavailable.", exception);
        }
    }
}
