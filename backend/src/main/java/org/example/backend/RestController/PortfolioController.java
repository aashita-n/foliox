package org.example.backend.RestController;


import org.example.backend.DTO.PortfolioAssetDTO;
import org.example.backend.service.PortfolioService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/portfolio")
public class PortfolioController {

    private final PortfolioService portfolioService;

    public PortfolioController(PortfolioService portfolioService) {
        this.portfolioService = portfolioService;
    }

    @GetMapping("/assets")
    public List<PortfolioAssetDTO> getPortfolioAssets() {
        return portfolioService.getPortfolio();
    }

    @PutMapping("/{symbol}/buy/{quantity}")
    public String buyAsset(
            @PathVariable String symbol,
            @PathVariable int quantity
    ) {
        portfolioService.buyAsset(symbol, quantity);
        return "Asset bought successfully";
    }


}

