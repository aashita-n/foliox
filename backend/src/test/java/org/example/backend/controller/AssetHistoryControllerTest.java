package org.example.backend.controller;

import org.example.backend.Entity.AssetHistoryEntity;
import org.example.backend.RestController.AssetHistoryController;
import org.example.backend.service.AssetHistoryService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDate;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class AssetHistoryControllerTest {

    private MockMvc mockMvc;

    @Mock
    private AssetHistoryService historyService;

    @InjectMocks
    private AssetHistoryController assetHistoryController;

    private void setup() {
        mockMvc = MockMvcBuilders
                .standaloneSetup(assetHistoryController)
                .build();
    }

    private AssetHistoryEntity createEntity() {
        AssetHistoryEntity entity = new AssetHistoryEntity();
        entity.setSymbol("AAPL");
        entity.setType("EQUITY");
        entity.setDate(LocalDate.now());
        entity.setOpen(100.0);
        entity.setClose(105.0);
        entity.setVolume(10000L);
        return entity;
    }

    @Test
    void getAllHistory_shouldReturnAllHistory() throws Exception {
        setup();
        when(historyService.getAllHistory())
                .thenReturn(List.of(createEntity()));

        mockMvc.perform(get("/asset_history"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].symbol").value("AAPL"));
    }

    @Test
    void fetchAndSave_shouldReturnSavedHistory() throws Exception {
        setup();
        when(historyService.fetchAndSave("AAPL"))
                .thenReturn(List.of(createEntity()));

        mockMvc.perform(post("/asset_history/AAPL"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].type").value("EQUITY"));
    }

    @Test
    void getAssetHistory_shouldReturnHistoryForSymbol() throws Exception {
        setup();
        when(historyService.getHistoryBySymbol("AAPL"))
                .thenReturn(List.of(createEntity()));

        mockMvc.perform(get("/asset_history/AAPL"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].symbol").value("AAPL"));
    }
}

