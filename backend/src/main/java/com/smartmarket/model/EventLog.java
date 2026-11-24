package com.smartmarket.model;

import javax.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "event_logs")
public class EventLog {

    @Id
    private String id = UUID.randomUUID().toString();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EventType type;

    private String query;

    private String productId;

    private String anonymousUserId;

    private Long responseTimeMs;

    @Column(nullable = false)
    private Instant timestamp = Instant.now();

    public enum EventType {
        SEARCH, VIEW, PURCHASE
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public EventType getType() { return type; }
    public void setType(EventType type) { this.type = type; }
    public String getQuery() { return query; }
    public void setQuery(String query) { this.query = query; }
    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }
    public String getAnonymousUserId() { return anonymousUserId; }
    public void setAnonymousUserId(String anonymousUserId) { this.anonymousUserId = anonymousUserId; }
    public Long getResponseTimeMs() { return responseTimeMs; }
    public void setResponseTimeMs(Long responseTimeMs) { this.responseTimeMs = responseTimeMs; }
    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
}
