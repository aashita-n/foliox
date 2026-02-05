package org.example.backend.RestController;

import org.example.backend.DTO.PortfolioAssetDTO;
import org.example.backend.service.ImmunityAnalysisService;
import org.example.backend.service.PortfolioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
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
    public ResponseEntity<?> analyzePortfolioGet() {
        return analyzePortfolio();
    }

    @PostMapping("/analyze")
    public ResponseEntity<?> analyzePortfolioPost() {
        return analyzePortfolio();
    }

    private ResponseEntity<?> analyzePortfolio() {
        // Step 1: Get the portfolio data (already in DTO format)
        List<PortfolioAssetDTO> portfolio = portfolioService.getPortfolio();

        // Step 2: Prepare the asset data to be sent to Flask
        List<Map<String, Object>> assets = new ArrayList<>();
        List<Double> weights = new ArrayList<>();

        // Calculate the raw weights (without normalization) and store them in a list
        for (PortfolioAssetDTO asset : portfolio) {
            double weight = asset.getQuantity() * asset.getCurrentPrice();
            weights.add(weight); // Storing raw weight for later normalization
        }

        // Step 3: Find the min and max weight
        double minWeight = weights.stream().min(Double::compare).orElse(0.0);
        double maxWeight = weights.stream().max(Double::compare).orElse(1.0);

        // Step 4: Normalize the weight for each asset
        for (int i = 0; i < portfolio.size(); i++) {
            PortfolioAssetDTO asset = portfolio.get(i);
            double rawWeight = weights.get(i);

            // Normalize the weight (ensure we don't divide by zero)
            double normalizedWeight = (maxWeight > minWeight)
                    ? (rawWeight - minWeight) / (maxWeight - minWeight)
                    : 0.0; // If all weights are the same, set it to 0

            // Prepare the asset data
            Map<String, Object> assetData = new HashMap<>();
            assetData.put("ticker", asset.getSymbol());
            assetData.put("weight", normalizedWeight); // Use normalized weight
            assets.add(assetData);
        }

        // Step 5: Send the data to Flask API for immune system analysis
        ResponseEntity<?> response = immunityAnalysisService.analyzeImmunity(assets);

        // Step 6: Return the Flask API response to the client
        return response;
    }

}

