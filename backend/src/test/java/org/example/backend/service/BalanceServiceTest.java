package org.example.backend.service;

import org.example.backend.Entity.BalanceEntity;
import org.example.backend.Repository.BalanceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BalanceServiceTest {

    @Mock
    private BalanceRepository balanceRepo;

    @InjectMocks
    private BalanceService balanceService;

    private BalanceEntity balance;

    @BeforeEach
    void setUp() {
        balance = new BalanceEntity();
        balance.setAmount(100000);
    }

    @Test
    void getBalance_shouldReturnExistingBalance() {
        when(balanceRepo.findAll()).thenReturn(List.of(balance));

        BalanceEntity result = balanceService.getBalance();

        assertEquals(100000, result.getAmount());
        verify(balanceRepo, never()).save(any());
    }

    @Test
    void getBalance_shouldCreateInitialBalanceIfNoneExists() {
        when(balanceRepo.findAll()).thenReturn(List.of());
        when(balanceRepo.save(any(BalanceEntity.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        BalanceEntity result = balanceService.getBalance();

        assertEquals(100000, result.getAmount());
        verify(balanceRepo).save(any(BalanceEntity.class));
    }

    @Test
    void updateBalance_shouldSetNewAmount() {
        when(balanceRepo.findAll()).thenReturn(List.of(balance));
        when(balanceRepo.save(any(BalanceEntity.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        BalanceEntity result = balanceService.updateBalance(50000);

        assertEquals(50000, result.getAmount());
        verify(balanceRepo).save(balance);
    }

    @Test
    void add_shouldIncreaseBalance() {
        when(balanceRepo.findAll()).thenReturn(List.of(balance));
        when(balanceRepo.save(any(BalanceEntity.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        BalanceEntity result = balanceService.add(10000);

        assertEquals(110000, result.getAmount());
        verify(balanceRepo).save(balance);
    }

    @Test
    void subtract_shouldDecreaseBalance() {
        when(balanceRepo.findAll()).thenReturn(List.of(balance));
        when(balanceRepo.save(any(BalanceEntity.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        BalanceEntity result = balanceService.subtract(20000);

        assertEquals(80000, result.getAmount());
        verify(balanceRepo).save(balance);
    }

    @Test
    void subtract_shouldThrowExceptionIfInsufficientBalance() {
        when(balanceRepo.findAll()).thenReturn(List.of(balance));

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> balanceService.subtract(200000)
        );

        assertTrue(exception.getMessage().contains("Insufficient balance"));
        verify(balanceRepo, never()).save(any());
    }
}

