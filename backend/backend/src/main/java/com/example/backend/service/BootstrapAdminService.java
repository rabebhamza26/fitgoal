package com.example.backend.service;

import com.example.backend.model.AccountStatus;
import com.example.backend.model.UserAccount;
import com.example.backend.model.UserRole;
import com.example.backend.repository.UserAccountRepository;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class BootstrapAdminService implements ApplicationRunner {

    private static final Logger logger = LoggerFactory.getLogger(BootstrapAdminService.class);

    private final UserAccountRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final String email;
    private final String password;
    private final boolean resetPassword;

    public BootstrapAdminService(
            UserAccountRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.bootstrap-admin.email:}") String email,
            @Value("${app.bootstrap-admin.password:}") String password,
            @Value("${app.bootstrap-admin.reset-password:false}") boolean resetPassword) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.email = email;
        this.password = password;
        this.resetPassword = resetPassword;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (email.isBlank() && password.isBlank()) {
            return;
        }
        if (email.isBlank() || password.isBlank()) {
            throw new IllegalStateException("Set both BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD.");
        }
        if (password.length() < 8 || password.getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new IllegalStateException(
                    "BOOTSTRAP_ADMIN_PASSWORD must contain at least 8 characters and no more than 72 UTF-8 bytes.");
        }

        String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);
        userRepository.findByEmail(normalizedEmail).ifPresentOrElse(
                account -> {
                    if (account.getRole() != UserRole.ADMIN) {
                        throw new IllegalStateException("The bootstrap admin email belongs to a non-admin account.");
                    }
                    if (resetPassword) {
                        account.setPasswordHash(passwordEncoder.encode(password));
                        logger.info("Bootstrap admin password reset for configured account.");
                    }
                },
                () -> userRepository.save(new UserAccount(
                        "FitGoal Admin",
                        normalizedEmail,
                        passwordEncoder.encode(password),
                        UserRole.ADMIN,
                        AccountStatus.ACTIVE)));
    }
}
