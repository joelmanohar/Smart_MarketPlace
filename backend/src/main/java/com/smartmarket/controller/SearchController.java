package com.smartmarket.controller;

import com.smartmarket.dto.SearchResponse;
import com.smartmarket.model.Category;
import com.smartmarket.model.EventLog;
import com.smartmarket.repository.EventLogRepository;
import com.smartmarket.service.BaselineSearchService;
import com.smartmarket.service.ProductService;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/search")
public class SearchController {

    private final ProductService productService;
    private final BaselineSearchService searchService;
    private final EventLogRepository eventRepository;

    public SearchController(ProductService productService,
                            BaselineSearchService searchService,
                            EventLogRepository eventRepository) {
        this.productService = productService;
        this.searchService = searchService;
        this.eventRepository = eventRepository;
    }

    @GetMapping
    public SearchResponse search(@RequestParam(required = false) String q,
                                 @RequestParam(required = false) Category category,
                                 @RequestParam(required = false) BigDecimal maxPrice,
                                 @RequestParam(required = false, defaultValue = "false") Boolean inStockOnly,
                                 @RequestHeader(value = "X-Anonymous-User", required = false) String anonymousUser) {
        SearchResponse response = searchService.search(
                productService.listAll(), q, category, maxPrice, inStockOnly);

        EventLog log = new EventLog();
        log.setType(EventLog.EventType.SEARCH);
        log.setQuery(q);
        log.setAnonymousUserId(anonymousUser);
        log.setResponseTimeMs(response.getElapsedMs());
        eventRepository.save(log);

        return response;
    }

    @GetMapping("/cost-model")
    public SearchResponse.CostModel costModel(@RequestParam(defaultValue = "20") int n) {
        return searchService.costModel(n);
    }

    @GetMapping("/oracle-check")
    public boolean oracleCheck() {
        SearchResponse r = searchService.search(
                productService.listAll(), "", Category.LAPTOP, new BigDecimal("60000"), true);
        return searchService.verifyOracle(r.getMatchedIds());
    }
}
