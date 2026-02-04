package org.example.backend.service;

import jakarta.transaction.Transactional;
import org.example.backend.DTO.PortfolioAssetDTO;
import org.example.backend.Entity.PortfolioAssetEntity;
import org.example.backend.Entity.AssetCatalogueEntity;
import org.example.backend.Repository.PortfolioAssetRepository;
import org.example.backend.Repository.AssetCatalogueRepository;
import org.example.backend.service.BalanceService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PortfolioService {

    private final PortfolioAssetRepository portfolioRepo;
    private final AssetCatalogueRepository assetCatalogueRepo;
    private final BalanceService balanceService;

    public PortfolioService(PortfolioAssetRepository portfolioRepo,
                            AssetCatalogueRepository assetCatalogueRepo,
                            BalanceService balanceService) {
        this.portfolioRepo = portfolioRepo;
        this.assetCatalogueRepo = assetCatalogueRepo;
        this.balanceService = balanceService;
    }

    public List<PortfolioAssetDTO> getPortfolio() {

        List<PortfolioAssetEntity> assets = portfolioRepo.findAll();

        return assets.stream().map(asset -> {

            PortfolioAssetDTO dto = new PortfolioAssetDTO();

            dto.setSymbol(asset.getSymbol());
            dto.setName(asset.getName());
            dto.setType(asset.getType());
            dto.setBuyPrice(asset.getBuyPrice());
            dto.setQuantity(asset.getQuantity());
            dto.setBuyTimestamp(asset.getBuyTimestamp());

            // fetch live data from catalogue
//            AssetCatalogueEntity catalogue =
//                    assetCatalogueRepo.findBySymbol(asset.getSymbol());

            AssetCatalogueEntity catalogue = assetCatalogueRepo
                    .findBySymbol(asset.getSymbol())
                    .orElseThrow(() ->
                            new RuntimeException("Asset not found in catalogue: " + asset.getSymbol())
                    );


            if (catalogue != null) {
                dto.setCurrentPrice(catalogue.getPrice());
                dto.setHigh(catalogue.getHigh());
                dto.setLow(catalogue.getLow());
                dto.setVolume(catalogue.getVolume());

                double profitLoss =
                        (catalogue.getPrice() - asset.getBuyPrice())
                                * asset.getQuantity();

                dto.setProfitLoss(profitLoss);
            }

            return dto;

        }).collect(Collectors.toList());
    }

    @Transactional
    public void buyAsset(String symbol, int quantity) {

        // 1. Get asset from catalogue
        AssetCatalogueEntity catalogue = assetCatalogueRepo
                .findBySymbol(symbol)
                .orElseThrow(() ->
                        new RuntimeException("Asset not found in catalogue: " + symbol)
                );

        double buyPrice = catalogue.getPrice();
        double totalCost = buyPrice * quantity;

        // 2. Subtract balance (will auto-check insufficient funds)
        balanceService.subtract(totalCost);

        // 3. Check if asset already exists in portfolio
        PortfolioAssetEntity asset = portfolioRepo
                .findBySymbol(symbol)
                .orElse(null);

        if (asset == null) {
            // 4A. New asset
            PortfolioAssetEntity newAsset = new PortfolioAssetEntity();
            newAsset.setSymbol(symbol);
            newAsset.setName(catalogue.getName());
            newAsset.setType(catalogue.getType());
            newAsset.setBuyPrice(buyPrice);
            newAsset.setQuantity(quantity);
            newAsset.setBuyTimestamp(LocalDateTime.now());

            portfolioRepo.save(newAsset);

        } else {
            // 4B. Existing asset → update avg buy price
            int oldQty = asset.getQuantity();
            double oldBuyPrice = asset.getBuyPrice();

            int newQty = oldQty + quantity;

            double newAvgBuyPrice =
                    ((oldBuyPrice * oldQty) + (buyPrice * quantity)) / newQty;

            asset.setQuantity(newQty);
            asset.setBuyPrice(newAvgBuyPrice);
            asset.setBuyTimestamp(LocalDateTime.now());

            portfolioRepo.save(asset);
        }
    }

    @Transactional
    public void sellAsset(String symbol, int quantity) {
        PortfolioAssetEntity asset = portfolioRepo.findBySymbol(symbol)
                .orElseThrow(() -> new RuntimeException("Asset not in portfolio: " + symbol));

        if (asset.getQuantity() < quantity) {
            throw new RuntimeException("Not enough quantity to sell");
        }

        AssetCatalogueEntity catalogue = assetCatalogueRepo.findBySymbol(symbol)
                .orElseThrow(() -> new RuntimeException("Asset not found in catalogue: " + symbol));

        double proceeds = catalogue.getPrice() * quantity;
        balanceService.add(proceeds);

        int remainingQty = asset.getQuantity() - quantity;

        if (remainingQty == 0) {
            portfolioRepo.delete(asset);
        } else {
            asset.setQuantity(remainingQty);
            portfolioRepo.save(asset);
        }
    }

    @Transactional
    public void sellAllAsset(String symbol) {
        PortfolioAssetEntity asset = portfolioRepo.findBySymbol(symbol)
                .orElseThrow(() -> new RuntimeException("Asset not in portfolio: " + symbol));

        AssetCatalogueEntity catalogue = assetCatalogueRepo.findBySymbol(symbol)
                .orElseThrow(() -> new RuntimeException("Asset not found in catalogue: " + symbol));

        double proceeds = catalogue.getPrice() * asset.getQuantity();
        balanceService.add(proceeds);

        portfolioRepo.delete(asset);
    }

}

