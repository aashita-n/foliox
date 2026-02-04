package org.example.backend.service;

import org.example.backend.Entity.BalanceEntity;
import org.example.backend.Repository.BalanceRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class BalanceService {

    private final BalanceRepository balanceRepo;

    public BalanceService(BalanceRepository balanceRepo) {
        this.balanceRepo = balanceRepo;
    }

    /**
     * Get the current balance.
     * If no balance exists, create a new one with initial amount 100000.
     */
    public BalanceEntity getBalance() {
        return balanceRepo.findAll()
                .stream()
                .findFirst()
                .orElseGet(() -> {
                    BalanceEntity initialBalance = new BalanceEntity();
                    initialBalance.setAmount(100000); // starting balance
                    initialBalance.setLastUpdated(LocalDateTime.now());
                    return balanceRepo.save(initialBalance);
                });
    }

    /**
     * Set the balance to a specific new amount
     */
    public BalanceEntity updateBalance(double newAmount) {
        BalanceEntity balance = getBalance();
        balance.setAmount(newAmount);
        balance.setLastUpdated(LocalDateTime.now());
        return balanceRepo.save(balance);
    }

    /**
     * Add a specific amount to the balance
     */
    public BalanceEntity add(double amount) {
        BalanceEntity balance = getBalance();
        balance.setAmount(balance.getAmount() + amount);
        balance.setLastUpdated(LocalDateTime.now());
        return balanceRepo.save(balance);
    }

    /**
     * Subtract a specific amount from the balance
     */
    public BalanceEntity subtract(double amount) {
        BalanceEntity balance = getBalance();
        if (balance.getAmount() < amount) {
            throw new RuntimeException("Insufficient balance");
        }
        balance.setAmount(balance.getAmount() - amount);
        balance.setLastUpdated(LocalDateTime.now());
        return balanceRepo.save(balance);
    }
}




