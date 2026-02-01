package org.example.backend.RestController;


import org.example.backend.DTO.PortfolioAssetDTO;
import org.example.backend.service.PortfolioService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class PortfolioController {

    private final PortfolioService portfolioService;

    public PortfolioController(PortfolioService portfolioService) {
        this.portfolioService = portfolioService;
    }

    @GetMapping("/portfolio/assets")
    public List<PortfolioAssetDTO> getPortfolioAssets() {
        return portfolioService.getPortfolio();
    }
}

