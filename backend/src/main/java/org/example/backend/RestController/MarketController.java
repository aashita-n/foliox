package org.example.backend.RestController;

import org.example.backend.Model.Asset;
import org.example.backend.Model.AssetHistory;
import org.example.backend.service.MarketApiService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/market")
public class MarketController {

    private final MarketApiService marketApiService;

    public MarketController(MarketApiService marketApiService) {
        this.marketApiService = marketApiService;
    }

    @GetMapping("/quote/{ticker}")
    public Asset getQuote(@PathVariable String ticker) {
        return marketApiService.getQuote(ticker);
    }

    @GetMapping("/history/{ticker}")
    public List<AssetHistory> getHistory(@PathVariable String ticker) {
        return marketApiService.getHistory(ticker);
    }
}

