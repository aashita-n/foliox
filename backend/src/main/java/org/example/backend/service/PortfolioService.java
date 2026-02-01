//package org.example.backend.service;
//
//
//import org.example.backend.Entity.PortfolioAssetEntity;
//import org.example.backend.Entity.PortfolioAssetEntity;
//import org.example.backend.Repository.PortfolioAssetRepository;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Service;
//
//import java.util.List;
//
//@Service
//public class PortfolioAssetService {
//
//    @Autowired
//    private PortfolioAssetRepository portfolioAssetRepository;
//
//    // Add a new asset to portfolio
//    public PortfolioAssetEntity addAsset(PortfolioAssetEntity asset) {
//        return portfolioAssetRepository.save(asset);
//    }
//
//    // Get all assets in portfolio
//    public List<PortfolioAssetEntity> getPortfolio() {
//        return portfolioAssetRepository.findAll();
//    }
//
//    // Update current price and profit/loss for an asset
//    public PortfolioAssetEntity updateAssetPrice(String symbol, double currentPrice) {
//        PortfolioAssetEntity asset = portfolioAssetRepository.findBySymbol(symbol)
//                .orElseThrow(() -> new RuntimeException("Asset not found: " + symbol));
//
//        asset.setCurrentPrice(currentPrice);
//        // Update profit/loss: (currentPrice - buyPrice) * qty
//        asset.setProfitLoss((currentPrice - asset.getBuyPrice()) * asset.getQuantity());
//
//        return portfolioAssetRepository.save(asset);
//    }
//}
//


package org.example.backend.service;

import org.example.backend.DTO.PortfolioAssetDTO;
import org.example.backend.Entity.PortfolioAssetEntity;
import org.example.backend.Entity.AssetCatalogueEntity;
import org.example.backend.Repository.PortfolioAssetRepository;
import org.example.backend.Repository.AssetCatalogueRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PortfolioService {

    private final PortfolioAssetRepository portfolioRepo;
    private final AssetCatalogueRepository assetCatalogueRepo;

    public PortfolioService(PortfolioAssetRepository portfolioRepo,
                            AssetCatalogueRepository assetCatalogueRepo) {
        this.portfolioRepo = portfolioRepo;
        this.assetCatalogueRepo = assetCatalogueRepo;
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
}

