package com.example.backend.service;

import com.example.backend.dto.HomeDtos.CoachDto;
import com.example.backend.dto.HomeDtos.HeroDto;
import com.example.backend.dto.HomeDtos.HomePageResponse;
import com.example.backend.dto.HomeDtos.PricingPlanDto;
import com.example.backend.dto.HomeDtos.ServiceDto;
import com.example.backend.dto.HomeDtos.SiteStatsDto;
import com.example.backend.dto.HomeDtos.TestimonialDto;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class HomeContentService {

    public HomePageResponse getHomePage() {
        // Le contenu éditorial est centralisé ici pour garder une seule source côté front.
        return new HomePageResponse(
                new HeroDto(
                        "Coaching premium & suivi sur-mesure 7j/7",
                        "Atteignez vos",
                        "objectifs physiques",
                        "Programme personnalisé, suivi nutritionnel adaptatif et coaching direct assuré par des professionnels certifiés.",
                        "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=85"),
                List.of(
                        new ServiceDto("programmes", "dumbbell", "Programmes sur-mesure",
                                "Plans d’entraînement uniques adaptés à vos besoins."),
                        new ServiceDto("nutrition", "nutrition", "Suivi nutritionnel",
                                "Conseils diététiques et plans repas personnalisés."),
                        new ServiceDto("application", "application", "Application 7j/7",
                                "Accès illimité à votre suivi et communauté."),
                        new ServiceDto("progression", "progress", "Analyse de progression",
                                "Suivi régulier et ajustements basés sur vos résultats.")),
                List.of(
                        new CoachDto(1, "Alexandre Moreau", "Musculation & prise de masse",
                                List.of("Master STAPS Training & Performance", "BPJEPS AF"),
                                "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=700&q=80",
                                "Ex-athlète de haut niveau, il accompagne ses membres vers des transformations physiques intenses.",
                                4.9),
                        new CoachDto(2, "Élodie Bertrand", "Coaching nutrition & remise en forme",
                                List.of("BTS Diététique", "Certification Nutrition Sportive"),
                                "https://images.unsplash.com/photo-1579758629938-03607ccdbaba?auto=format&fit=crop&w=700&q=80",
                                "Spécialiste de la nutrition comportementale pour des résultats durables sans frustration.",
                                4.9),
                        new CoachDto(3, "Marc Vasseur", "Réhabilitation & posture",
                                List.of("Diplôme de kinésithérapie du sport", "BPJEPS HMDA"),
                                "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=700&q=80",
                                "Expert en prévention des blessures et renforcement ciblé pour sportifs et seniors.",
                                5.0),
                        new CoachDto(4, "Sarah Benali", "Cross training & mobilité",
                                List.of("Certification Yoga Alliance 500h", "BPJEPS AGFF"),
                                "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=700&q=80",
                                "Allie préparation physique intense et maîtrise du souffle pour un équilibre corps-esprit.",
                                5.0),
                        new CoachDto(5, "Thomas Lefèvre", "Préparation physique & cardio",
                                List.of("Licence STAPS", "BPJEPS Activités de la forme"),
                                "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=700&q=80",
                                "Spécialiste de la préparation physique, il vous aide à gagner en endurance et à progresser à votre rythme.",
                                4.8)),
                List.of(
                        new TestimonialDto(1, "Thomas D.",
                                "Le bilan initial et le suivi hebdomadaire m’ont débloqué. J’ai atteint une forme que je n’aurais jamais cru possible seul.",
                                "−12 kg de masse grasse · +4 kg de muscle",
                                "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=900&q=80",
                                32),
                        new TestimonialDto(2, "Camille M.",
                                "L’application FitGoal permet de suivre mes repas et exercices partout. Les alertes de mon coach Élodie m’ont appris une vraie méthode.",
                                "−8 kg · Retour à une routine régulière",
                                "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80",
                                28),
                        new TestimonialDto(3, "Julien R.",
                                "Après des années d’inactivité, Marc m’a réappris à bouger sans me blesser. Un accompagnement d’une précision médicale.",
                                "Disparition des douleurs · Posture améliorée",
                                "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=80",
                                41)),
                List.of(
                        new PricingPlanDto("autonomie", "Formule Autonomie", 49,
                                "Pour les personnes autonomes souhaitant une structure de travail solide et éprouvée.",
                                List.of("Programme d’entraînement personnalisé", "Plan nutritionnel de base",
                                        "Accès complet à l’application FitGoal", "Mise à jour du programme chaque mois",
                                        "Suivi des statistiques automatiques", "Support par ticket (48h)"),
                                false),
                        new PricingPlanDto("integral", "Suivi Intégral Pro", 99,
                                "L’équilibre parfait entre un suivi avancé, des ajustements continus et la motivation.",
                                List.of("Tout ce qui est inclus dans Autonomie", "Plan nutritionnel dynamique",
                                        "Bilan hebdomadaire vidéo personnalisé", "Messagerie directe avec votre coach",
                                        "Correction technique sur vos vidéos d’exercices", "Ajustements du programme illimités"),
                                true),
                        new PricingPlanDto("elite", "Coaching Elite VIP", 199,
                                "L’accompagnement haut de gamme individuel pour des résultats exceptionnels et rapides.",
                                List.of("Tout ce qui est inclus dans Suivi Intégral Pro", "2 séances vidéo individuelles de 45 min / mois",
                                        "Analyse biologique & compléments personnalisés", "Coach joignable 7j/7 en direct",
                                        "Programme de récupération & mobilité dédié", "Garantie résultats 90 jours"),
                                false)),
                new SiteStatsDto(500, 4.9, 98));
    }
}
