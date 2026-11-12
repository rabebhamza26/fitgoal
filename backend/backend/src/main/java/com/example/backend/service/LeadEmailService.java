package com.example.backend.service;

import com.example.backend.dto.HomeDtos.BilanRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailSendException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class LeadEmailService {

    private final JavaMailSender mailSender;
    private final String senderAddress;
    private final String teamAddress;

    public LeadEmailService(
            JavaMailSender mailSender,
            @Value("${spring.mail.username}") String senderAddress,
            @Value("${app.mail.to}") String teamAddress) {
        this.mailSender = mailSender;
        this.senderAddress = senderAddress;
        this.teamAddress = teamAddress;
    }

    public void sendBilanToTeam(BilanRequest request) {
        validateMailConfiguration();

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(senderAddress);
        message.setTo(teamAddress);
        message.setReplyTo(request.email().trim());
        message.setSubject("Nouvelle demande de bilan FitGoal");
        message.setText("""
                Une nouvelle demande de bilan a été reçue.

                Nom : %s
                E-mail : %s
                Téléphone : %s
                Formule : %s

                Objectif :
                %s
                """.formatted(
                request.name().trim(),
                request.email().trim(),
                valueOrDefault(request.phone(), "Non renseigné"),
                valueOrDefault(request.plan(), "Aucune formule sélectionnée"),
                request.goal().trim()));
        mailSender.send(message);
    }

    public void sendBilanConfirmation(BilanRequest request) {
        validateMailConfiguration();

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(senderAddress);
        message.setTo(request.email().trim());
        message.setSubject("Nous avons reçu votre demande FitGoal");
        message.setText("""
                Bonjour %s,

                Nous avons bien reçu votre demande de bilan personnalisé.
                Un coach FitGoal vous recontactera prochainement.

                À bientôt,
                L’équipe FitGoal
                """.formatted(request.name().trim()));
        mailSender.send(message);
    }

    private void validateMailConfiguration() {
        if (senderAddress.isBlank() || teamAddress.isBlank()) {
            throw new MailSendException(
                    "Configurez SMTP_USERNAME et APP_MAIL_TO avec des adresses e-mail valides.");
        }
    }

    private String valueOrDefault(String value, String defaultValue) {
        return value == null || value.isBlank() ? defaultValue : value.trim();
    }
}
