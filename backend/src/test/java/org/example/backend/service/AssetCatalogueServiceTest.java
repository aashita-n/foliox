package org.example.backend.service;

import org.example.backend.Entity.AssetCatalogueEntity;
import org.example.backend.Model.Asset;
import org.example.backend.Repository.AssetCatalogueRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AssetCatalogueServiceTest {

    @Mock
    private AssetCatalogueRepository assetCatalogueRepo;

    @Mock
    private MarketApiService marketApiService;

    @InjectMocks
    private AssetCatalogueService assetCatalogueService;

    private Asset asset;
    private AssetCatalogueEntity entity;

    @BeforeEach
    void setUp() {
        asset = new Asset();
        asset.setSymbol("AAPL");
        asset.setName("Apple Inc");
        asset.setType("EQUITY");
        asset.setPrice(180.0);

        entity = new AssetCatalogueEntity();
        entity.setSymbol("AAPL");
        entity.setName("Apple Inc");
        entity.setType("EQUITY");
        entity.setPrice(180.0);
    }

    @Test
    void getAllAssets_shouldReturnAllAssets() {
        when(assetCatalogueRepo.findAll()).thenReturn(List.of(entity));

        List<AssetCatalogueEntity> result = assetCatalogueService.getAllAssets();

        assertEquals(1, result.size());
        verify(assetCatalogueRepo).findAll();
    }

    @Test
    void addAsset_shouldSaveNewAsset() {
        when(assetCatalogueRepo.findBySymbol("AAPL")).thenReturn(Optional.empty());
        when(marketApiService.getQuote("AAPL")).thenReturn(asset);
        when(assetCatalogueRepo.save(any(AssetCatalogueEntity.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        AssetCatalogueEntity result = assetCatalogueService.addAsset("AAPL");

        assertEquals("AAPL", result.getSymbol());
        assertEquals("Apple Inc", result.getName());
        verify(assetCatalogueRepo).save(any(AssetCatalogueEntity.class));
    }

    @Test
    void addAsset_shouldThrowExceptionIfAlreadyExists() {
        when(assetCatalogueRepo.findBySymbol("AAPL"))
                .thenReturn(Optional.of(entity));

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> assetCatalogueService.addAsset("AAPL")
        );

        assertTrue(exception.getMessage().contains("Asset already exists"));
        verify(marketApiService, never()).getQuote(anyString());
    }

    @Test
    void updateAsset_shouldUpdateExistingAsset() {
        when(assetCatalogueRepo.findBySymbol("AAPL"))
                .thenReturn(Optional.of(entity));
        when(marketApiService.getQuote("AAPL")).thenReturn(asset);
        when(assetCatalogueRepo.save(any(AssetCatalogueEntity.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        AssetCatalogueEntity result = assetCatalogueService.updateAsset("AAPL");

        assertEquals("Apple Inc", result.getName());
        verify(assetCatalogueRepo).save(entity);
    }

    @Test
    void searchAssets_shouldReturnMatchingAssets() {
        when(assetCatalogueRepo
                .findByNameStartingWithIgnoreCaseOrSymbolStartingWithIgnoreCase("Ap", "Ap"))
                .thenReturn(List.of(entity));

        List<AssetCatalogueEntity> result =
                assetCatalogueService.searchAssets("Ap");

        assertEquals(1, result.size());
        verify(assetCatalogueRepo)
                .findByNameStartingWithIgnoreCaseOrSymbolStartingWithIgnoreCase("Ap", "Ap");
    }
}

