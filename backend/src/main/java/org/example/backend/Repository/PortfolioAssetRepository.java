package org.example.backend.Repository;


import org.example.backend.Entity.PortfolioAssetEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;


//public interface PortfolioAssetRepository extends JpaRepository<PortfolioAssetEntity, Long> {
//
//}

public interface PortfolioAssetRepository
        extends JpaRepository<PortfolioAssetEntity, Long> {

    Optional<PortfolioAssetEntity> findBySymbol(String symbol);
}


