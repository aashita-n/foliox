package org.example.backend.Repository;

import org.example.backend.Entity.AssetCatalogueEntity;
import org.example.backend.Entity.AssetCatalogueEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AssetCatalogueRepository extends JpaRepository<AssetCatalogueEntity, String> {
    Optional<AssetCatalogueEntity> findBySymbol(String symbol);

    List<AssetCatalogueEntity>
    findByNameStartingWithIgnoreCaseOrSymbolStartingWithIgnoreCase(
            String name,
            String symbol
    );
}

