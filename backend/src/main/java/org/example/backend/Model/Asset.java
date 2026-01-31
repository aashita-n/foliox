package org.example.backend.Model;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;

public class Asset {
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

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS")
    private LocalDateTime timestamp;

    public Asset() {
    }

    public Asset(String symbol, String name, String type, double open, double high, double low,
                 double close, double price, long volume, String currency, String exchange, LocalDateTime timestamp) {
        this.symbol = symbol;
        this.name = name;
        this.type = type;
        this.open = open;
        this.high = high;
        this.low = low;
        this.close = close;
        this.price = price;
        this.volume = volume;
        this.currency = currency;
        this.exchange = exchange;
        this.timestamp = timestamp;
    }

    // Getters and setters

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

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
