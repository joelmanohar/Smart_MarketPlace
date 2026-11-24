package com.smartmarket.repository;

import com.smartmarket.model.EventLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventLogRepository extends JpaRepository<EventLog, String> {
    List<EventLog> findTop100ByOrderByTimestampDesc();
    long countByType(EventLog.EventType type);
}
