package org.example.backend.service;

import org.example.backend.Entity.AssetHistoryEntity;
import org.example.backend.Model.AssetHistory;
import org.example.backend.Repository.AssetHistoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AssetHistoryServiceTest {

    @Mock
    private AssetHistoryRepository historyRepo;

    @Mock
    private MarketApiService marketApiService;

    @InjectMocks
    private AssetHistoryService assetHistoryService;

    private AssetHistory history;
    private AssetHistoryEntity entity;

    @BeforeEach
    void setUp() {
        history = new AssetHistory();
        history.setType("EQUITY");
        history.setDate(LocalDate.now());
        history.setOpen(100.0);
        history.setHigh(110.0);
        history.setLow(95.0);
        history.setClose(105.0);
        history.setVolume(10000L);

        entity = new AssetHistoryEntity();
        entity.setSymbol("AAPL");
        entity.setType("EQUITY");
        entity.setDate(LocalDate.now());
        entity.setOpen(100.0);
        entity.setHigh(110.0);
        entity.setLow(95.0);
        entity.setClose(105.0);
        entity.setVolume(10000L);
    }

    @Test
    void getAllHistory_shouldReturnAllRows() {
        when(historyRepo.findAll()).thenReturn(List.of(entity));

        List<AssetHistoryEntity> result = assetHistoryService.getAllHistory();

        assertEquals(1, result.size());
        verify(historyRepo).findAll();
    }

    @Test
    void fetchAndSave_shouldFetchFromApiAndSaveToDb() {
        when(marketApiService.getHistory("AAPL"))
                .thenReturn(List.of(history));
        when(historyRepo.saveAll(anyList()))
                .thenAnswer(invocation -> invocation.getArgument(0));

        List<AssetHistoryEntity> result =
                assetHistoryService.fetchAndSave("AAPL");

        assertEquals(1, result.size());
        assertEquals("AAPL", result.get(0).getSymbol());
        verify(historyRepo).saveAll(anyList());
    }

    @Test
    void getHistoryBySymbol_shouldReturnOrderedHistory() {
        when(historyRepo.findBySymbolOrderByDateAsc("AAPL"))
                .thenReturn(List.of(entity));

        List<AssetHistoryEntity> result =
                assetHistoryService.getHistoryBySymbol("AAPL");

        assertEquals(1, result.size());
        verify(historyRepo).findBySymbolOrderByDateAsc("AAPL");
    }

    @Test
    void ensureHistoryExists_shouldFetchWhenHistoryDoesNotExist() {
        when(historyRepo.existsBySymbol("AAPL")).thenReturn(false);
        when(marketApiService.getHistory("AAPL"))
                .thenReturn(List.of(history));
        when(historyRepo.saveAll(anyList()))
                .thenReturn(List.of(entity));

        assetHistoryService.ensureHistoryExists("AAPL");

        verify(marketApiService).getHistory("AAPL");
        verify(historyRepo).saveAll(anyList());
    }

    @Test
    void ensureHistoryExists_shouldDoNothingWhenHistoryExists() {
        when(historyRepo.existsBySymbol("AAPL")).thenReturn(true);

        assetHistoryService.ensureHistoryExists("AAPL");

        verify(marketApiService, never()).getHistory(anyString());
        verify(historyRepo, never()).saveAll(anyList());
    }
}

