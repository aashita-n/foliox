//package org.example.backend.Repository;
//
//import org.example.backend.Entity.BalanceEntity;
//import org.springframework.data.jpa.repository.JpaRepository;
//
//public interface BalanceRepository extends JpaRepository<BalanceEntity, Long> {
//}


package org.example.backend.Repository;

import org.example.backend.Entity.BalanceEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BalanceRepository extends JpaRepository<BalanceEntity, Long> {
    // No extra methods needed for now
}

