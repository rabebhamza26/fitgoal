package com.example.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "leads")
public class Lead {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 100)
    private String name;

    @Column(nullable = false, length = 254)
    private String email;

    @Column(length = 30)
    private String phone;

    @Column(length = 1000)
    private String goal;

    @Column(length = 80)
    private String plan;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private LeadType type;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    protected Lead() {
    }

    public Lead(String name, String email, String phone, String goal, String plan, LeadType type) {
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.goal = goal;
        this.plan = plan;
        this.type = type;
    }

    @PrePersist
    void setCreatedAt() {
        createdAt = Instant.now();
    }

    public enum LeadType {
        BILAN,
        NEWSLETTER
    }
}
