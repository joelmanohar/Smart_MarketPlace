package com.smartmarket.service;

import com.smartmarket.dto.SearchResponse;
import com.smartmarket.model.Category;
import com.smartmarket.model.Product;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * Exact linear-search baseline.
 *
 * Every search scans the catalogue once, applies the filters in order
 * (category -> stock -> price -> text), and records:
 *   - iterations scanned
 *   - comparisons performed (3 per record in the full filter chain)
 *   - block reads simulated for sequential layout (block size B)
 *   - elapsed wall time
 *
 * Cost models reported alongside results:
 *   RAM model            : 3N comparisons
 *   External-memory model: ceil(N / B) blocks sequential, N blocks scattered
 *   PRAM model           : ceil(N / p) steps on p processors
 *   Work-span model      : Work = N, Span = ceil(N / p)
 */
@Service
public class BaselineSearchService {

    @Value("${app.search.block-size:4}")
    private int blockSize;

    @Value("${app.search.processors:8}")
    private int processors;

    public SearchResponse search(List<Product> catalogue,
                                 String query,
                                 Category category,
                                 BigDecimal maxPrice,
                                 Boolean inStockOnly) {
        long start = System.nanoTime();
        List<Product> results = new ArrayList<>();
        List<String> matchedIds = new ArrayList<>();
        long comparisons = 0;
        int scanned = 0;
        String q = query == null ? "" : query.trim().toLowerCase();

        for (Product p : catalogue) {
            scanned++;
            // Filter chain — each check is one comparison.
            comparisons++; // category check
            if (category != null && p.getCategory() != category) {
                continue;
            }
            comparisons++; // stock check
            if (Boolean.TRUE.equals(inStockOnly) && p.getStock() <= 0) {
                continue;
            }
            comparisons++; // price check
            if (maxPrice != null && p.getPrice().compareTo(maxPrice) > 0) {
                continue;
            }
            if (!q.isEmpty()) {
                String haystack = (p.getTitle() + " " + (p.getDescription() == null ? "" : p.getDescription())
                        + " " + p.getCategory().name()).toLowerCase();
                if (!haystack.contains(q)) {
                    continue;
                }
            }
            results.add(p);
            matchedIds.add(p.getId());
        }

        long elapsedMs = (System.nanoTime() - start) / 1_000_000;

        SearchResponse response = new SearchResponse();
        response.setResults(results);
        response.setScanned(scanned);
        response.setComparisons(comparisons);
        response.setBlocksRead((long) Math.ceil((double) scanned / blockSize));
        response.setElapsedMs(elapsedMs);
        response.setMatchedIds(matchedIds);
        response.setCostModel(costModel(scanned));
        return response;
    }

    public SearchResponse.CostModel costModel(int n) {
        SearchResponse.CostModel cm = new SearchResponse.CostModel();
        cm.ramOps = 3L * n;
        cm.blockTransfers = (long) Math.ceil((double) n / blockSize);
        cm.pramSteps = (long) Math.ceil((double) n / processors);
        cm.work = n;
        cm.span = (long) Math.ceil((double) n / processors);
        cm.blockSize = blockSize;
        cm.processors = processors;
        return cm;
    }

    /**
     * Correctness oracle for the hand-checked fixture:
     * in-stock laptops at or below Rs.60,000 must return exactly these IDs.
     */
    public boolean verifyOracle(List<String> observed) {
        List<String> expected = List.of("P01", "P04", "P09", "P12", "P14", "P18", "P20");
        return expected.equals(observed);
    }
}
