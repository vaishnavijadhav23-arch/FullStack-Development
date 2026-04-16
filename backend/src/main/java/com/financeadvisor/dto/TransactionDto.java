package com.financeadvisor.dto;

import com.financeadvisor.entity.Transaction;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class TransactionDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Request {
        @NotNull(message = "Transaction type is required")
        private Transaction.TransactionType type;

        @NotNull(message = "Amount is required")
        @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
        private BigDecimal amount;

        @NotNull(message = "Category is required")
        private Transaction.Category category;

        @NotNull(message = "Date is required")
        private LocalDate date;

        private String description;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private String id;
        private String userId;
        private Transaction.TransactionType type;
        private BigDecimal amount;
        private Transaction.Category category;
        private LocalDate date;
        private String description;
        private LocalDateTime createdAt;

        public static Response from(Transaction t) {
            return Response.builder()
                    .id(t.getId())
                    .userId(t.getUserId())
                    .type(t.getType())
                    .amount(t.getAmount())
                    .category(t.getCategory())
                    .date(t.getDate())
                    .description(t.getDescription())
                    .createdAt(t.getCreatedAt())
                    .build();
        }
    }
}
