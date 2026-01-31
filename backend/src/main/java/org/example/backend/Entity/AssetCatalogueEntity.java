package org.example.backend.Entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "asset_catalogue")
public class AssetCatalogueEntity {

    @Id
    @Column(name = "symbol", nullable = false, unique = true)
    private String symbol;

    private String name;
    private String type;
    private double open;
    private double high;
    private double low;
    private double close;
    private double price;
    private long volume;
    private String currency;
    private String exchange;

    @Column(name = "last_updated")
    private LocalDateTime lastUpdated;

    public AssetCatalogueEntity() {}

    // getters & setters

    public String getSymbol() { return symbol; }
    public void setSymbol(String symbol) { this.symbol = symbol; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public double getOpen() { return open; }
    public void setOpen(double open) { this.open = open; }
    public double getHigh() { return high; }
    public void setHigh(double high) { this.high = high; }
    public double getLow() { return low; }
    public void setLow(double low) { this.low = low; }
    public double getClose() { return close; }
    public void setClose(double close) { this.close = close; }
    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }
    public long getVolume() { return volume; }
    public void setVolume(long volume) { this.volume = volume; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public String getExchange() { return exchange; }
    public void setExchange(String exchange) { this.exchange = exchange; }
    public LocalDateTime getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; }
}

