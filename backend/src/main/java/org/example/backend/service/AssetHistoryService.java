package org.example.backend.service;

import org.example.backend.Entity.AssetHistoryEntity;
import org.example.backend.Model.AssetHistory;
import org.example.backend.Repository.AssetHistoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AssetHistoryService {

    private final AssetHistoryRepository historyRepo;
    private final MarketApiService marketApiService;

    public AssetHistoryService(AssetHistoryRepository historyRepo, MarketApiService marketApiService) {
        this.historyRepo = historyRepo;
        this.marketApiService = marketApiService;
    }

    // Get all rows from asset_history table
    public List<AssetHistoryEntity> getAllHistory() {
        return historyRepo.findAll();
    }

    // Fetch history from Flask API and persist in DB
    public List<AssetHistoryEntity> fetchAndSave(String symbol) {

        List<AssetHistory> fetched = marketApiService.getHistory(symbol);

        // Convert AssetHistory (from Flask) → AssetHistoryEntity (DB)
        List<AssetHistoryEntity> entities = fetched.stream().map(h -> {
            AssetHistoryEntity e = new AssetHistoryEntity();
            e.setSymbol(symbol);
            e.setType(h.getType());
            e.setDate(h.getDate());
            e.setOpen(h.getOpen());
            e.setHigh(h.getHigh());
            e.setLow(h.getLow());
            e.setClose(h.getClose());
            e.setVolume(h.getVolume());
            return e;
        }).collect(Collectors.toList());

        // Save all in DB
        historyRepo.saveAll(entities);

        return entities;
    }
}

