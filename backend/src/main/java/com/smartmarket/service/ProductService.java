package com.smartmarket.service;

import com.smartmarket.dto.ProductRequest;
import com.smartmarket.model.Product;
import com.smartmarket.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ProductService {

    private final ProductRepository repository;

    public ProductService(ProductRepository repository) {
        this.repository = repository;
    }

    public List<Product> listAll() {
        return repository.findAll();
    }

    public Optional<Product> findById(String id) {
        return repository.findById(id);
    }

    @Transactional
    public Product create(ProductRequest req) {
        Product p = new Product();
        p.setId("P" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        p.setTitle(req.getTitle());
        p.setDescription(req.getDescription());
        p.setCategory(req.getCategory());
        p.setPrice(req.getPrice());
        p.setMrp(req.getMrp());
        p.setStock(req.getStock());
        p.setImageUrl(req.getImageUrl());
        p.setLocation(req.getLocation());
        p.setCondition(req.getCondition());
        p.setSellerName(req.getSellerName());
        p.setRating(4.0);
        p.setRatingCount(0);
        p.setCreatedAt(Instant.now());
        p.setUpdatedAt(Instant.now());
        return repository.save(p);
    }

    @Transactional
    public Optional<Product> updateStock(String id, int newStock) {
        return repository.findById(id).map(p -> {
            p.setStock(Math.max(0, newStock));
            p.setUpdatedAt(Instant.now());
            return repository.save(p);
        });
    }

    @Transactional
    public boolean purchase(String id, int qty) {
        Optional<Product> opt = repository.findById(id);
        if (opt.isEmpty()) return false;
        Product p = opt.get();
        if (p.getStock() < qty) return false;
        p.setStock(p.getStock() - qty);
        p.setUpdatedAt(Instant.now());
        repository.save(p);
        return true;
    }
}
