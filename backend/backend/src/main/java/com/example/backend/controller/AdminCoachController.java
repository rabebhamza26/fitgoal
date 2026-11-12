package com.example.backend.controller;

import com.example.backend.dto.AuthDtos.AdminCoachResponse;
import com.example.backend.dto.AuthDtos.MessageResponse;
import com.example.backend.model.AccountStatus;
import com.example.backend.model.UserRole;
import com.example.backend.repository.UserAccountRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/admin/coaches")
@PreAuthorize("hasAuthority('PERM_COACHES_APPROVE')")
public class AdminCoachController {

    private final UserAccountRepository userRepository;

    public AdminCoachController(UserAccountRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/pending")
    public List<AdminCoachResponse> pendingCoaches() {
        return userRepository.findByRoleAndStatus(UserRole.COACH, AccountStatus.PENDING_APPROVAL)
                .stream()
                .map(account -> new AdminCoachResponse(
                        account.getId(), account.getName(), account.getEmail()))
                .toList();
    }

    @PatchMapping("/{id}/approve")
    @Transactional
    public MessageResponse approveCoach(@PathVariable Long id) {
        var coach = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Compte coach introuvable."));
        if (coach.getRole() != UserRole.COACH || coach.getStatus() != AccountStatus.PENDING_APPROVAL) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ce compte n'est pas en attente d'approbation.");
        }
        coach.approveCoach();
        return new MessageResponse("Le compte coach a été approuvé.");
    }
}
