package com.smartmarket.dto;

import com.smartmarket.model.Product;

import java.util.List;

public class SearchResponse {

    private List<Product> results;
    private int scanned;
    private long comparisons;
    private long blocksRead;
    private long elapsedMs;
    private List<String> matchedIds;
    private CostModel costModel;

    public static class CostModel {
        public long ramOps;
        public long blockTransfers;
        public long pramSteps;
        public long work;
        public long span;
        public int blockSize;
        public int processors;
    }

    public List<Product> getResults() { return results; }
    public void setResults(List<Product> results) { this.results = results; }
    public int getScanned() { return scanned; }
    public void setScanned(int scanned) { this.scanned = scanned; }
    public long getComparisons() { return comparisons; }
    public void setComparisons(long comparisons) { this.comparisons = comparisons; }
    public long getBlocksRead() { return blocksRead; }
    public void setBlocksRead(long blocksRead) { this.blocksRead = blocksRead; }
    public long getElapsedMs() { return elapsedMs; }
    public void setElapsedMs(long elapsedMs) { this.elapsedMs = elapsedMs; }
    public List<String> getMatchedIds() { return matchedIds; }
    public void setMatchedIds(List<String> matchedIds) { this.matchedIds = matchedIds; }
    public CostModel getCostModel() { return costModel; }
    public void setCostModel(CostModel costModel) { this.costModel = costModel; }
}
