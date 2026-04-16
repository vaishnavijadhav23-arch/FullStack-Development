package com.financeadvisor.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "transactions")
public class Transaction {

    @Id
    private String id;

    @Indexed
    private String userId;

    private TransactionType type; // INCOME or EXPENSE

    private BigDecimal amount;

    private Category category;

    private LocalDate date;

    private String description;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt;

    public enum TransactionType {
        INCOME, EXPENSE
    }

    public enum Category {
        FOOD, TRAVEL, BILLS, SHOPPING, ENTERTAINMENT, HEALTH,
        EDUCATION, SALARY, FREELANCE, INVESTMENT, SAVINGS, OTHER
    }
}
