package org.example.backend.RestController;

import org.example.backend.Entity.AssetHistoryEntity;
import org.example.backend.service.AssetHistoryService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/asset_history")
public class AssetHistoryController {

    private final AssetHistoryService historyService;

    public AssetHistoryController(AssetHistoryService historyService) {
        this.historyService = historyService;
    }

    // GET all asset history from DB
    @GetMapping
    public List<AssetHistoryEntity> getAllHistory() {
        return historyService.getAllHistory();
    }

    // POST to fetch from Flask API and save
    @PostMapping("/{symbol}")
    public List<AssetHistoryEntity> fetchAndSave(@PathVariable String symbol) {
        return historyService.fetchAndSave(symbol);
    }
}

