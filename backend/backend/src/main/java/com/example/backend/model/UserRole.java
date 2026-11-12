package com.example.backend.model;

import java.util.List;

public enum UserRole {
    CLIENT(List.of("PROFILE_READ", "PROFILE_UPDATE", "BOOKINGS_MANAGE", "PROGRESS_READ")),
    COACH(List.of("PROFILE_READ", "PROFILE_UPDATE", "CLIENTS_READ", "AVAILABILITY_MANAGE", "PROGRESS_MANAGE")),
    ADMIN(List.of("USERS_MANAGE", "COACHES_APPROVE", "LEADS_READ", "PLANS_MANAGE"));

    private final List<String> permissions;

    UserRole(List<String> permissions) {
        this.permissions = permissions;
    }

    public List<String> permissions() {
        return permissions;
    }
}
