package org.example.backend.Repository;

import org.example.backend.Entity.AssetHistoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AssetHistoryRepository extends JpaRepository<AssetHistoryEntity, Long> {
    List<AssetHistoryEntity> findBySymbolOrderByDateAsc(String symbol);

}


