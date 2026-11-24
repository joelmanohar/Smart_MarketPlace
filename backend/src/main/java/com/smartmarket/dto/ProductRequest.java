package com.smartmarket.dto;

import com.smartmarket.model.Category;
import com.smartmarket.model.Product;

import javax.validation.constraints.*;
import java.math.BigDecimal;

public class ProductRequest {

    @NotBlank
    @Size(max = 200)
    private String title;

    @Size(max = 2000)
    private String description;

    @NotNull
    private Category category;

    @NotNull
    @DecimalMin("0.00")
    private BigDecimal price;

    @DecimalMin("0.00")
    private BigDecimal mrp;

    @Min(0)
    private int stock = 1;

    private String imageUrl;

    private String location;

    @NotNull
    private Product.Condition condition = Product.Condition.NEW;

    private String sellerName = "Verified Seller";

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public BigDecimal getMrp() { return mrp; }
    public void setMrp(BigDecimal mrp) { this.mrp = mrp; }
    public int getStock() { return stock; }
    public void setStock(int stock) { this.stock = stock; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public Product.Condition getCondition() { return condition; }
    public void setCondition(Product.Condition condition) { this.condition = condition; }
    public String getSellerName() { return sellerName; }
    public void setSellerName(String sellerName) { this.sellerName = sellerName; }
}
