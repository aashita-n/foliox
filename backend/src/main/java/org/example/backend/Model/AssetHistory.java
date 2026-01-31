package org.example.backend.Model;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDate;

public class AssetHistory {
    private String symbol;
    private String type;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate date;

    private double open;
    private double high;
    private double low;
    private double close;
    private long volume;

    public AssetHistory() {
    }

    public AssetHistory(String symbol, String type, LocalDate date, double open, double high,
                        double low, double close, long volume) {
        this.symbol = symbol;
        this.type = type;
        this.date = date;
        this.open = open;
        this.high = high;
        this.low = low;
        this.close = close;
        this.volume = volume;
    }

    // Getters and setters

    public String getSymbol() { return symbol; }
    public void setSymbol(String symbol) { this.symbol = symbol; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public double getOpen() { return open; }
    public void setOpen(double open) { this.open = open; }

    public double getHigh() { return high; }
    public void setHigh(double high) { this.high = high; }

    public double getLow() { return low; }
    public void setLow(double low) { this.low = low; }

    public double getClose() { return close; }
    public void setClose(double close) { this.close = close; }

    public long getVolume() { return volume; }
    public void setVolume(long volume) { this.volume = volume; }
}
