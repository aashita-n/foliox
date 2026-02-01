package org.example.backend.RestController;

import org.example.backend.Entity.BalanceEntity;
import org.example.backend.service.BalanceService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/balance")
public class BalanceController {

    private final BalanceService balanceService;

    public BalanceController(BalanceService balanceService) {
        this.balanceService = balanceService;
    }

    // Get current balance
    @GetMapping
    public BalanceEntity getBalance() {
        return balanceService.getBalance();
    }

    // Add to balance
    @PostMapping("/add/{amount}")
    public BalanceEntity add(@PathVariable double amount) {
        return balanceService.add(amount);
    }

    // Subtract from balance
    @PostMapping("/subtract/{amount}")
    public BalanceEntity subtract(@PathVariable double amount) {
        return balanceService.subtract(amount);
    }

    // Update balance to a specific amount
    @PutMapping("/update/{amount}")
    public BalanceEntity update(@PathVariable double amount) {
        return balanceService.updateBalance(amount);
    }
}

