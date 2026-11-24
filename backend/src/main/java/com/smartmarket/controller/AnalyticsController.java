package com.smartmarket.controller;

import com.smartmarket.model.EventLog;
import com.smartmarket.repository.EventLogRepository;
import com.smartmarket.repository.ProductRepository;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final EventLogRepository events;
    private final ProductRepository products;

    public AnalyticsController(EventLogRepository events, ProductRepository products) {
        this.events = events;
        this.products = products;
    }

    @GetMapping("/summary")
    public Map<String, Object> summary() {
        List<EventLog> recent = events.findTop100ByOrderByTimestampDesc();
        List<Long> times = recent.stream()
                .map(EventLog::getResponseTimeMs)
                .filter(Objects::nonNull)
                .sorted()
                .collect(Collectors.toList());

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("totalProducts", products.count());
        out.put("totalSearches", events.countByType(EventLog.EventType.SEARCH));
        out.put("totalViews", events.countByType(EventLog.EventType.VIEW));
        out.put("totalPurchases", events.countByType(EventLog.EventType.PURCHASE));
        out.put("p50ResponseMs", percentile(times, 50));
        out.put("p95ResponseMs", percentile(times, 95));
        out.put("p99ResponseMs", percentile(times, 99));
        out.put("recentEvents", recent.stream().limit(20).map(e -> Map.of(
                "type", e.getType().name(),
                "query", e.getQuery() == null ? "" : e.getQuery(),
                "timestamp", e.getTimestamp().toString()
        )).collect(Collectors.toList()));
        return out;
    }

    private long percentile(List<Long> sorted, int p) {
        if (sorted.isEmpty()) return 0;
        int idx = (int) Math.ceil(p / 100.0 * sorted.size()) - 1;
        return sorted.get(Math.max(0, Math.min(idx, sorted.size() - 1)));
    }
}
