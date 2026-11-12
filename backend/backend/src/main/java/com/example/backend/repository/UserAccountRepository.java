package com.example.backend.repository;

import com.example.backend.model.AccountStatus;
import com.example.backend.model.UserAccount;
import com.example.backend.model.UserRole;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserAccountRepository extends JpaRepository<UserAccount, Long> {
    Optional<UserAccount> findByEmail(String email);

    List<UserAccount> findByRoleAndStatus(UserRole role, AccountStatus status);
}
