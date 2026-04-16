package com.financeadvisor.service;

import com.financeadvisor.dto.BudgetDto;
import com.financeadvisor.entity.Budget;
import com.financeadvisor.entity.Transaction;
import com.financeadvisor.repository.BudgetRepository;
import com.financeadvisor.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BudgetService {

    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    public BudgetDto.Response createOrUpdateBudget(String userId, BudgetDto.Request request) {
        Budget budget = budgetRepository
                .findByUserIdAndCategoryAndMonthAndYear(userId, request.getCategory(), request.getMonth(), request.getYear())
                .orElse(Budget.builder().userId(userId).build());

        budget.setCategory(request.getCategory());
        budget.setMonthlyLimit(request.getMonthlyLimit());
        budget.setMonth(request.getMonth());
        budget.setYear(request.getYear());
        budget.setUpdatedAt(LocalDateTime.now());

        Budget saved = budgetRepository.save(budget);
        return enrichBudgetResponse(saved);
    }

    public List<BudgetDto.Response> getBudgets(String userId, int month, int year) {
        return budgetRepository.findByUserIdAndMonthAndYear(userId, month, year)
                .stream().map(this::enrichBudgetResponse).collect(Collectors.toList());
    }

    public List<BudgetDto.Response> getAllBudgets(String userId) {
        return budgetRepository.findByUserId(userId)
                .stream().map(this::enrichBudgetResponse).collect(Collectors.toList());
    }

    public void deleteBudget(String userId, String id) {
        Budget b = budgetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Budget not found"));
        if (!b.getUserId().equals(userId)) throw new RuntimeException("Access denied");
        budgetRepository.delete(b);
    }

    private BudgetDto.Response enrichBudgetResponse(Budget budget) {
        LocalDate start = LocalDate.of(budget.getYear(), budget.getMonth(), 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());

        BigDecimal spent = transactionRepository
                .findByUserIdAndTypeAndDateBetween(budget.getUserId(), Transaction.TransactionType.EXPENSE, start, end)
                .stream()
                .filter(t -> t.getCategory() == budget.getCategory())
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal remaining = budget.getMonthlyLimit().subtract(spent);
        double pct = budget.getMonthlyLimit().compareTo(BigDecimal.ZERO) > 0
                ? spent.divide(budget.getMonthlyLimit(), 4, RoundingMode.HALF_UP).doubleValue() * 100
                : 0;

        return BudgetDto.Response.builder()
                .id(budget.getId())
                .userId(budget.getUserId())
                .category(budget.getCategory())
                .monthlyLimit(budget.getMonthlyLimit())
                .spent(spent)
                .remaining(remaining)
                .percentageUsed(Math.round(pct * 100.0) / 100.0)
                .exceeded(spent.compareTo(budget.getMonthlyLimit()) > 0)
                .month(budget.getMonth())
                .year(budget.getYear())
                .createdAt(budget.getCreatedAt())
                .build();
    }
}
