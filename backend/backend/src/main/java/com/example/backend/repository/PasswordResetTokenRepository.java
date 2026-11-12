package com.example.backend.repository;

import com.example.backend.model.PasswordResetToken;
import com.example.backend.model.UserAccount;
import jakarta.persistence.LockModeType;
import java.time.Instant;
import java.util.Optional;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<PasswordResetToken> findByTokenHashAndExpiresAtAfter(String tokenHash, Instant now);

    Optional<PasswordResetToken> findByUser(UserAccount user);

    void deleteByUser(UserAccount user);
}
