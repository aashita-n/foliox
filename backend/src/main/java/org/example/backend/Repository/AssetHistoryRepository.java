package org.example.backend.Repository;

import org.example.backend.Entity.AssetHistoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AssetHistoryRepository extends JpaRepository<AssetHistoryEntity, Long> {
}

