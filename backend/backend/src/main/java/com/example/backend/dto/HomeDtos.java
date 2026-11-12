package com.example.backend.dto;

import java.util.List;

public final class HomeDtos {

    private HomeDtos() {
    }

    public record HomePageResponse(
            HeroDto hero,
            List<ServiceDto> services,
            List<CoachDto> coaches,
            List<TestimonialDto> testimonials,
            List<PricingPlanDto> plans,
            SiteStatsDto stats) {
    }

    public record HeroDto(
            String badge,
            String title,
            String highlight,
            String description,
            String imageUrl) {
    }

    public record ServiceDto(
            String id,
            String icon,
            String title,
            String description) {
    }

    public record CoachDto(
            long id,
            String name,
            String specialty,
            List<String> diplomas,
            String photoUrl,
            String description,
            double rating) {
    }

    public record TestimonialDto(
            long id,
            String name,
            String quote,
            String result,
            String photoUrl,
            int age) {
    }

    public record PricingPlanDto(
            String id,
            String name,
            int priceMonthly,
            String description,
            List<String> features,
            boolean highlighted) {
    }

    public record SiteStatsDto(
            int members,
            double averageRating,
            int satisfaction) {
    }

    public record BilanRequest(
            @jakarta.validation.constraints.NotBlank
            @jakarta.validation.constraints.Size(max = 100)
            String name,
            @jakarta.validation.constraints.NotBlank
            @jakarta.validation.constraints.Email
            @jakarta.validation.constraints.Size(max = 254)
            String email,
            @jakarta.validation.constraints.Size(max = 30)
            String phone,
            @jakarta.validation.constraints.NotBlank
            @jakarta.validation.constraints.Size(max = 1000)
            String goal,
            @jakarta.validation.constraints.Size(max = 80)
            String plan) {
    }

    public record NewsletterRequest(
            @jakarta.validation.constraints.NotBlank
            @jakarta.validation.constraints.Email
            @jakarta.validation.constraints.Size(max = 254)
            String email) {
    }

    public record MessageResponse(String message) {
    }
}
