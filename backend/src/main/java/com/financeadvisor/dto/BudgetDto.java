package com.financeadvisor.dto;

import com.financeadvisor.entity.Budget;
import com.financeadvisor.entity.Transaction;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class BudgetDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Request {
        @NotNull(message = "Category is required")
        private Transaction.Category category;

        @NotNull(message = "Monthly limit is required")
        @DecimalMin(value = "0.01", message = "Monthly limit must be greater than 0")
        private BigDecimal monthlyLimit;

        @NotNull
        @Min(1) @Max(12)
        private int month;

        @NotNull
        @Min(2020)
        private int year;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private String id;
        private String userId;
        private Transaction.Category category;
        private BigDecimal monthlyLimit;
        private BigDecimal spent;
        private BigDecimal remaining;
        private double percentageUsed;
        private int month;
        private int year;
        private LocalDateTime createdAt;
        private boolean exceeded;

        public static Response from(Budget b) {
            return Response.builder()
                    .id(b.getId())
                    .userId(b.getUserId())
                    .category(b.getCategory())
                    .monthlyLimit(b.getMonthlyLimit())
                    .month(b.getMonth())
                    .year(b.getYear())
                    .createdAt(b.getCreatedAt())
                    .build();
        }
    }
}
