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
