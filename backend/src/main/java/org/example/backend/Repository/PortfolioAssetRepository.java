package org.example.backend.Repository;


import org.example.backend.Entity.PortfolioAssetEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PortfolioAssetRepository extends JpaRepository<PortfolioAssetEntity, Long> {
}

