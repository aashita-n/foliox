package org.example.backend.RestController;


import org.example.backend.Entity.AssetCatalogueEntity;
import org.example.backend.service.AssetCatalogueService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/catalogue")
public class AssetCatalogueController {

    private final AssetCatalogueService assetCatalogueService;

    public AssetCatalogueController(AssetCatalogueService assetCatalogueService) {
        this.assetCatalogueService = assetCatalogueService;
    }

    // GET /api/catalogue -> get all assets
    @GetMapping
    public List<AssetCatalogueEntity> getAllAssets() {
        return assetCatalogueService.getAllAssets();
    }

    // POST /api/catalogue/{symbol} -> add new asset
    @PostMapping("/{symbol}")
    public AssetCatalogueEntity addAsset(@PathVariable String symbol) {
        return assetCatalogueService.addAsset(symbol);
    }

    // PUT /api/catalogue/{symbol} -> update existing asset
    @PutMapping("/{symbol}")
    public AssetCatalogueEntity updateAsset(@PathVariable String symbol) {
        return assetCatalogueService.updateAsset(symbol);
    }

    @GetMapping("/search")
    public List<AssetCatalogueEntity> searchAssets(
            @RequestParam String q
    ) {
        return assetCatalogueService.searchAssets(q);
    }
}

