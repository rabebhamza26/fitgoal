package com.example.backend.controller;

import com.example.backend.dto.HomeDtos.HomePageResponse;
import com.example.backend.service.HomeContentService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/home")
public class HomeController {

    private final HomeContentService homeContentService;

    public HomeController(HomeContentService homeContentService) {
        this.homeContentService = homeContentService;
    }

    @GetMapping
    public HomePageResponse getHomePage() {
        return homeContentService.getHomePage();
    }
}
