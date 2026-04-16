package com.financeadvisor.service;

import com.financeadvisor.dto.AnalyticsDto;
import com.financeadvisor.entity.Transaction;
import com.financeadvisor.repository.TransactionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AnalyticsServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @InjectMocks
    private AnalyticsService analyticsService;

    @Test
    void getFullAnalytics_ExpenseExceedsIncome_HasWarning() {
        Transaction income = Transaction.builder()
                .userId("u1").type(Transaction.TransactionType.INCOME)
                .amount(new BigDecimal("1000")).category(Transaction.Category.SALARY)
                .date(LocalDate.now()).build();
        Transaction expense = Transaction.builder()
                .userId("u1").type(Transaction.TransactionType.EXPENSE)
                .amount(new BigDecimal("1500")).category(Transaction.Category.SHOPPING)
                .date(LocalDate.now()).build();

        when(transactionRepository.findByUserId("u1")).thenReturn(Arrays.asList(income, expense));

        AnalyticsDto result = analyticsService.getFullAnalytics("u1");

        assertNotNull(result);
        assertEquals(new BigDecimal("1000"), result.getTotalIncome());
        assertEquals(new BigDecimal("1500"), result.getTotalExpense());
        assertTrue(result.getWarnings().stream().anyMatch(w -> w.contains("expenses exceed")));
    }

    @Test
    void getFullAnalytics_LowSavingsRate_HasSuggestion() {
        Transaction income = Transaction.builder()
                .userId("u1").type(Transaction.TransactionType.INCOME)
                .amount(new BigDecimal("5000")).category(Transaction.Category.SALARY)
                .date(LocalDate.now()).build();
        Transaction expense = Transaction.builder()
                .userId("u1").type(Transaction.TransactionType.EXPENSE)
                .amount(new BigDecimal("4500")).category(Transaction.Category.FOOD)
                .date(LocalDate.now()).build();

        when(transactionRepository.findByUserId("u1")).thenReturn(Arrays.asList(income, expense));

        AnalyticsDto result = analyticsService.getFullAnalytics("u1");

        assertTrue(result.getSavingsRate() < 20);
        assertTrue(result.getWarnings().stream().anyMatch(w -> w.contains("savings rate")));
    }

    @Test
    void getFullAnalytics_CategoryExceeds30Percent_HasCategoryWarning() {
        Transaction income = Transaction.builder()
                .userId("u1").type(Transaction.TransactionType.INCOME)
                .amount(new BigDecimal("10000")).category(Transaction.Category.SALARY)
                .date(LocalDate.now()).build();
        Transaction expense = Transaction.builder()
                .userId("u1").type(Transaction.TransactionType.EXPENSE)
                .amount(new BigDecimal("4000")).category(Transaction.Category.FOOD)
                .date(LocalDate.now()).build();

        when(transactionRepository.findByUserId("u1")).thenReturn(Arrays.asList(income, expense));

        AnalyticsDto result = analyticsService.getFullAnalytics("u1");

        assertTrue(result.getWarnings().stream().anyMatch(w -> w.contains("FOOD")));
    }

    @Test
    void getFullAnalytics_GoodFinancials_HasPositiveInsight() {
        Transaction income = Transaction.builder()
                .userId("u1").type(Transaction.TransactionType.INCOME)
                .amount(new BigDecimal("10000")).category(Transaction.Category.SALARY)
                .date(LocalDate.now()).build();
        Transaction expense = Transaction.builder()
                .userId("u1").type(Transaction.TransactionType.EXPENSE)
                .amount(new BigDecimal("7000")).category(Transaction.Category.FOOD)
                .date(LocalDate.now()).build();

        when(transactionRepository.findByUserId("u1")).thenReturn(Arrays.asList(income, expense));

        AnalyticsDto result = analyticsService.getFullAnalytics("u1");

        assertTrue(result.getSavingsRate() >= 20);
        assertTrue(result.getInsights().stream().anyMatch(i -> i.contains("Great job")));
    }
}
