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

    @PutMapping("/{symbol}/sell/{quantity}")
    public String sellAsset(@PathVariable String symbol, @PathVariable int quantity) {
        portfolioService.sellAsset(symbol, quantity);
        return "Asset sold successfully";
    }

    @DeleteMapping("/{symbol}")
    public String sellAll(@PathVariable String symbol) {
        portfolioService.sellAllAsset(symbol);
        return "All quantity sold successfully";
    }

    @PostMapping("/refresh")
    public List<PortfolioAssetDTO> refreshPortfolio() {
        return portfolioService.refreshPortfolioAssets();
    }



}

