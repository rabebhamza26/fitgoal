package com.example.backend.service;

import com.example.backend.dto.HomeDtos.BilanRequest;
import com.example.backend.dto.HomeDtos.NewsletterRequest;
import com.example.backend.model.Lead;
import com.example.backend.model.Lead.LeadType;
import com.example.backend.repository.LeadRepository;
import java.util.Locale;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.MailException;
import org.springframework.stereotype.Service;

@Service
public class LeadService {

    private static final Logger logger = LoggerFactory.getLogger(LeadService.class);

    private final LeadRepository leadRepository;
    private final LeadEmailService leadEmailService;

    public LeadService(LeadRepository leadRepository, LeadEmailService leadEmailService) {
        this.leadRepository = leadRepository;
        this.leadEmailService = leadEmailService;
    }

    public boolean createBilanRequest(BilanRequest request) {
        Lead lead = new Lead(
                request.name().trim(),
                normalizeEmail(request.email()),
                blankToNull(request.phone()),
                request.goal().trim(),
                blankToNull(request.plan()),
                LeadType.BILAN);
        leadRepository.saveAndFlush(lead);

        leadEmailService.sendBilanToTeam(request);

        try {
            leadEmailService.sendBilanConfirmation(request);
            return true;
        } catch (MailException exception) {
            logger.warn("Bilan enregistré et transmis à l'équipe, mais l'accusé client n'a pas pu être envoyé.");
            return false;
        }
    }

    public void subscribeToNewsletter(NewsletterRequest request) {
        Lead lead = new Lead(
                null,
                normalizeEmail(request.email()),
                null,
                null,
                null,
                LeadType.NEWSLETTER);
        leadRepository.saveAndFlush(lead);
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
