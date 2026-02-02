package org.example.backend.service;

import org.example.backend.Entity.AssetCatalogueEntity;
import org.example.backend.Model.Asset;
import org.example.backend.Repository.AssetCatalogueRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AssetCatalogueService {

    private final AssetCatalogueRepository assetCatalogueRepo;
    private final MarketApiService marketApiService;

    public AssetCatalogueService(AssetCatalogueRepository assetCatalogueRepo, MarketApiService marketApiService) {
        this.assetCatalogueRepo = assetCatalogueRepo;
        this.marketApiService = marketApiService;
    }

    // Get all assets in catalogue
    public List<AssetCatalogueEntity> getAllAssets() {
        return assetCatalogueRepo.findAll();
    }

    // Add a new asset by symbol
    public AssetCatalogueEntity addAsset(String symbol) {
        if (assetCatalogueRepo.findBySymbol(symbol).isPresent()) {
            throw new RuntimeException("Asset already exists: " + symbol);
        }
        Asset asset = marketApiService.getQuote(symbol);
        return saveOrUpdate(asset);
    }

    // Update existing asset by symbol
    public AssetCatalogueEntity updateAsset(String symbol) {
        AssetCatalogueEntity existing = assetCatalogueRepo.findBySymbol(symbol)
                .orElseThrow(() -> new RuntimeException("Asset not found: " + symbol));

        Asset asset = marketApiService.getQuote(symbol);

        existing.setName(asset.getName());
        existing.setType(asset.getType());
        existing.setOpen(asset.getOpen());
        existing.setHigh(asset.getHigh());
        existing.setLow(asset.getLow());
        existing.setClose(asset.getClose());
        existing.setPrice(asset.getPrice());
        existing.setVolume(asset.getVolume());
        existing.setCurrency(asset.getCurrency());
        existing.setExchange(asset.getExchange());
        existing.setLastUpdated(LocalDateTime.now());

        return assetCatalogueRepo.save(existing);
    }

    // Helper: convert Asset -> Entity
    private AssetCatalogueEntity saveOrUpdate(Asset asset) {
        AssetCatalogueEntity entity = new AssetCatalogueEntity();
        entity.setSymbol(asset.getSymbol());
        entity.setName(asset.getName());
        entity.setType(asset.getType());
        entity.setOpen(asset.getOpen());
        entity.setHigh(asset.getHigh());
        entity.setLow(asset.getLow());
        entity.setClose(asset.getClose());
        entity.setPrice(asset.getPrice());
        entity.setVolume(asset.getVolume());
        entity.setCurrency(asset.getCurrency());
        entity.setExchange(asset.getExchange());
        entity.setLastUpdated(LocalDateTime.now());

        return assetCatalogueRepo.save(entity);
    }

    public List<AssetCatalogueEntity> searchAssets(String query) {
        return assetCatalogueRepo
                .findByNameStartingWithIgnoreCaseOrSymbolStartingWithIgnoreCase(
                        query,
                        query
                );
    }
}

