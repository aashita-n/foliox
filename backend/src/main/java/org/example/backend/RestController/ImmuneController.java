package org.example.backend.RestController;

import org.example.backend.DTO.PortfolioAssetDTO;
import org.example.backend.service.ImmunityAnalysisService;
import org.example.backend.service.PortfolioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/immune")
public class ImmuneController {

    private final PortfolioService portfolioService;
    private final ImmunityAnalysisService immunityAnalysisService;

    public ImmuneController(PortfolioService portfolioService, ImmunityAnalysisService immunityAnalysisService) {
        this.portfolioService = portfolioService;
        this.immunityAnalysisService = immunityAnalysisService;
    }

    @GetMapping("/analyze")
    public ResponseEntity<?> analyzePortfolio() {
        // Step 1: Get the portfolio data (already in DTO format)
        List<PortfolioAssetDTO> portfolio = portfolioService.getPortfolio();

        // Step 2: Prepare the asset data to be sent to Flask
        List<Map<String, Object>> assets = new ArrayList<>();
        for (PortfolioAssetDTO asset : portfolio) {
            Map<String, Object> assetData = new HashMap<>();
            assetData.put("ticker", asset.getSymbol());
            assetData.put("weight", asset.getQuantity() * asset.getCurrentPrice()); // Calculating weight
            assets.add(assetData);
        }

        // Step 3: Send the data to Flask API for immune system analysis
        ResponseEntity<?> response = immunityAnalysisService.analyzeImmunity(assets);

        // Step 4: Return the Flask API response to the client
        return response;
    }
}

