package org.example.backend.DTO;

import java.time.LocalDateTime;

public class PortfolioAssetDTO {

    private String symbol;
    private String name;
    private String type;

    private double buyPrice;
    private int quantity;

    private double currentPrice;   // from asset_catalogue
    private double profitLoss;     // calculated

    private double high;
    private double low;
    private long volume;

    private LocalDateTime buyTimestamp;

    public PortfolioAssetDTO() {
    }

    // getters & setters

    public String getSymbol() { return symbol; }
    public void setSymbol(String symbol) { this.symbol = symbol; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public double getBuyPrice() { return buyPrice; }
    public void setBuyPrice(double buyPrice) { this.buyPrice = buyPrice; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public double getCurrentPrice() { return currentPrice; }
    public void setCurrentPrice(double currentPrice) { this.currentPrice = currentPrice; }

    public double getProfitLoss() { return profitLoss; }
    public void setProfitLoss(double profitLoss) { this.profitLoss = profitLoss; }

    public double getHigh() { return high; }
    public void setHigh(double high) { this.high = high; }

    public double getLow() { return low; }
    public void setLow(double low) { this.low = low; }

    public long getVolume() { return volume; }
    public void setVolume(long volume) { this.volume = volume; }

    public LocalDateTime getBuyTimestamp() { return buyTimestamp; }
    public void setBuyTimestamp(LocalDateTime buyTimestamp) { this.buyTimestamp = buyTimestamp; }
}

