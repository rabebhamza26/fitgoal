package com.example.backend.controller;

import com.example.backend.dto.HomeDtos.BilanRequest;
import com.example.backend.dto.HomeDtos.MessageResponse;
import com.example.backend.dto.HomeDtos.NewsletterRequest;
import com.example.backend.service.LeadService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.mail.MailException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/leads")
public class LeadController {

    private static final Logger logger = LoggerFactory.getLogger(LeadController.class);

    private final LeadService leadService;

    public LeadController(LeadService leadService) {
        this.leadService = leadService;
    }

    @PostMapping("/bilan")
    public MessageResponse createBilanRequest(@Valid @RequestBody BilanRequest request) {
        try {
            boolean confirmationSent = leadService.createBilanRequest(request);
            if (confirmationSent) {
                return new MessageResponse(
                        "Votre demande a été envoyée à l'équipe FitGoal. Un e-mail de confirmation vous a également été envoyé.");
            }
            return new MessageResponse(
                    "Votre demande a bien été envoyée à l'équipe FitGoal. L'e-mail de confirmation n'a pas pu être envoyé.");
        } catch (MailException exception) {
            logger.error("Échec de l'envoi du bilan par SMTP. La demande reste enregistrée en base.", exception);
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Demande enregistrée, mais e-mail non envoyé. Vérifiez SMTP_USERNAME, SMTP_PASSWORD, APP_MAIL_TO et les logs du backend.",
                    exception);
        }
    }

    @PostMapping("/newsletter")
    public MessageResponse subscribeToNewsletter(@Valid @RequestBody NewsletterRequest request) {
        leadService.subscribeToNewsletter(request);
        return new MessageResponse("Merci, votre inscription à la newsletter est confirmée.");
    }
}
