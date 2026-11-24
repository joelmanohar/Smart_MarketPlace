package com.smartmarket.repository;

import com.smartmarket.model.Category;
import com.smartmarket.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, String> {
    List<Product> findByCategory(Category category);
    List<Product> findByStockGreaterThan(int stock);
    long countByCategory(Category category);
}
