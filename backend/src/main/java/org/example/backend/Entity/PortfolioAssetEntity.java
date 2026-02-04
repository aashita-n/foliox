package org.example.backend.Entity;


import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "portfolio_asset")
public class PortfolioAssetEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String symbol;
    private String name; // optional, can store for quick display
    private String type; // STOCK, BOND, CURRENCY, etc.

    private double buyPrice;
    private int quantity;

    private LocalDateTime buyTimestamp;

    public PortfolioAssetEntity() {}

    public PortfolioAssetEntity(String symbol, String name, String type, double buyPrice, int quantity, LocalDateTime buyTimestamp) {
        this.symbol = symbol;
        this.name = name;
        this.type = type;
        this.buyPrice = buyPrice;
        this.quantity = quantity;
        this.buyTimestamp = buyTimestamp;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

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

    public LocalDateTime getBuyTimestamp() { return buyTimestamp; }
    public void setBuyTimestamp(LocalDateTime buyTimestamp) { this.buyTimestamp = buyTimestamp; }
}
