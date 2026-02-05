package org.example.backend.controller;

import org.example.backend.Entity.AssetCatalogueEntity;
import org.example.backend.RestController.AssetCatalogueController;
import org.example.backend.service.AssetCatalogueService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class AssetCatalogueControllerTest {

    private MockMvc mockMvc;

    @Mock
    private AssetCatalogueService assetCatalogueService;

    @InjectMocks
    private AssetCatalogueController assetCatalogueController;

    private AssetCatalogueEntity createEntity() {
        AssetCatalogueEntity entity = new AssetCatalogueEntity();
        entity.setSymbol("AAPL");
        entity.setName("Apple Inc");
        entity.setType("EQUITY");
        entity.setPrice(180.0);
        return entity;
    }

    private void setup() {
        mockMvc = MockMvcBuilders
                .standaloneSetup(assetCatalogueController)
                .build();
    }

    @Test
    void getAllAssets_shouldReturnAssets() throws Exception {
        setup();
        when(assetCatalogueService.getAllAssets())
                .thenReturn(List.of(createEntity()));

        mockMvc.perform(get("/api/catalogue"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].symbol").value("AAPL"));
    }

    @Test
    void addAsset_shouldReturnSavedAsset() throws Exception {
        setup();
        when(assetCatalogueService.addAsset("AAPL"))
                .thenReturn(createEntity());

        mockMvc.perform(post("/api/catalogue/AAPL"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Apple Inc"));
    }

    @Test
    void updateAsset_shouldReturnUpdatedAsset() throws Exception {
        setup();
        when(assetCatalogueService.updateAsset("AAPL"))
                .thenReturn(createEntity());

        mockMvc.perform(put("/api/catalogue/AAPL"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.symbol").value("AAPL"));
    }

    @Test
    void searchAssets_shouldReturnMatchingAssets() throws Exception {
        setup();
        when(assetCatalogueService.searchAssets("Ap"))
                .thenReturn(List.of(createEntity()));

        mockMvc.perform(get("/api/catalogue/search")
                        .param("q", "Ap"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].symbol").value("AAPL"));
    }
}
