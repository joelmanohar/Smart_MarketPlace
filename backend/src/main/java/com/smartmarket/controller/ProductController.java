package com.smartmarket.controller;

import com.smartmarket.dto.ProductRequest;
import com.smartmarket.model.Product;
import com.smartmarket.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService service;

    public ProductController(ProductService service) {
        this.service = service;
    }

    @GetMapping
    public List<Product> list() {
        return service.listAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> get(@PathVariable String id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Product> create(@Valid @RequestBody ProductRequest req) {
        return ResponseEntity.ok(service.create(req));
    }

    @PatchMapping("/{id}/stock")
    public ResponseEntity<Product> updateStock(@PathVariable String id,
                                               @RequestBody Map<String, Integer> body) {
        int stock = body.getOrDefault("stock", 0);
        return service.updateStock(id, stock)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/purchase")
    public ResponseEntity<Void> purchase(@PathVariable String id,
                                         @RequestBody Map<String, Integer> body) {
        int qty = body.getOrDefault("qty", 1);
        boolean ok = service.purchase(id, qty);
        return ok ? ResponseEntity.ok().build() : ResponseEntity.badRequest().build();
    }
}
