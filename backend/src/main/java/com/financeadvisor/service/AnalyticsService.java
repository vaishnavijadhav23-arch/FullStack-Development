package com.financeadvisor.service;

import com.financeadvisor.dto.AnalyticsDto;
import com.financeadvisor.entity.Transaction;
import com.financeadvisor.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    @Autowired
    private TransactionRepository transactionRepository;

    public AnalyticsDto getFullAnalytics(String userId) {
        List<Transaction> all = transactionRepository.findByUserId(userId);
        return buildAnalytics(all);
    }

    public AnalyticsDto getAnalyticsByMonth(String userId, int year, int month) {
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
        List<Transaction> transactions = transactionRepository.findByUserIdAndDateBetween(userId, start, end);
        return buildAnalytics(transactions);
    }

    public AnalyticsDto getAnalyticsByRange(String userId, LocalDate from, LocalDate to) {
        List<Transaction> transactions = transactionRepository.findByUserIdAndDateBetween(userId, from, to);
        return buildAnalytics(transactions);
    }

    private AnalyticsDto buildAnalytics(List<Transaction> transactions) {
        BigDecimal totalIncome = transactions.stream()
                .filter(t -> t.getType() == Transaction.TransactionType.INCOME)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalExpense = transactions.stream()
                .filter(t -> t.getType() == Transaction.TransactionType.EXPENSE)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal netSavings = totalIncome.subtract(totalExpense);

        double savingsRate = totalIncome.compareTo(BigDecimal.ZERO) > 0
                ? netSavings.divide(totalIncome, 4, RoundingMode.HALF_UP).doubleValue() * 100
                : 0;

        Map<String, BigDecimal> categoryBreakdown = transactions.stream()
                .filter(t -> t.getType() == Transaction.TransactionType.EXPENSE)
                .collect(Collectors.groupingBy(
                        t -> t.getCategory().name(),
                        Collectors.reducing(BigDecimal.ZERO, Transaction::getAmount, BigDecimal::add)
                ));

        List<AnalyticsDto.MonthlyTrend> trends = buildMonthlyTrends(transactions);
        List<String> insights = new ArrayList<>();
        List<String> warnings = new ArrayList<>();
        List<String> suggestions = new ArrayList<>();

        generateInsights(totalIncome, totalExpense, netSavings, savingsRate, categoryBreakdown, insights, warnings, suggestions);

        return AnalyticsDto.builder()
                .totalIncome(totalIncome)
                .totalExpense(totalExpense)
                .netSavings(netSavings)
                .savingsRate(Math.round(savingsRate * 100.0) / 100.0)
                .categoryBreakdown(categoryBreakdown)
                .monthlyTrends(trends)
                .insights(insights)
                .warnings(warnings)
                .suggestions(suggestions)
                .build();
    }

    private void generateInsights(BigDecimal income, BigDecimal expense, BigDecimal savings,
                                   double savingsRate, Map<String, BigDecimal> categoryBreakdown,
                                   List<String> insights, List<String> warnings, List<String> suggestions) {
        // AI Rule 1: Expense > Income → Warning
        if (expense.compareTo(income) > 0) {
            warnings.add("⚠️ Your expenses exceed your income by ₹" + expense.subtract(income).setScale(2, RoundingMode.HALF_UP) + ". Immediate budget review recommended.");
        }

        // AI Rule 2: Category > 30% of spending
        if (expense.compareTo(BigDecimal.ZERO) > 0) {
            categoryBreakdown.forEach((cat, amt) -> {
                double pct = amt.divide(expense, 4, RoundingMode.HALF_UP).doubleValue() * 100;
                if (pct > 30) {
                    warnings.add("📊 " + cat + " accounts for " + String.format("%.1f", pct) + "% of your spending. Consider reducing " + cat.toLowerCase() + " expenses.");
                    suggestions.add("💡 Try to limit " + cat + " spending to under 30% of total expenses. Current: ₹" + amt.setScale(2, RoundingMode.HALF_UP));
                }
            });
        }

        // AI Rule 3: Savings < 20%
        if (income.compareTo(BigDecimal.ZERO) > 0 && savingsRate < 20) {
            warnings.add("💰 Your savings rate is " + String.format("%.1f", savingsRate) + "%, below the recommended 20%.");
            BigDecimal targetSavings = income.multiply(new BigDecimal("0.20"));
            suggestions.add("🎯 To reach 20% savings rate, aim to save ₹" + targetSavings.setScale(2, RoundingMode.HALF_UP) + " per month.");
            suggestions.add("📱 Consider the 50/30/20 rule: 50% needs, 30% wants, 20% savings.");
        }

        // Positive insights
        if (savingsRate >= 20) {
            insights.add("✅ Great job! Your savings rate of " + String.format("%.1f", savingsRate) + "% meets the recommended 20% target.");
        }
        if (expense.compareTo(income) < 0) {
            insights.add("✅ Your income exceeds expenses. You're on the right financial track!");
        }
        if (insights.isEmpty() && warnings.isEmpty()) {
            insights.add("📈 Add more transactions to get personalized AI-powered insights.");
        }

        // General suggestions
        suggestions.add("📅 Review your monthly budget regularly to stay on track.");
        suggestions.add("🏦 Consider setting up automatic transfers to your savings account.");
    }

    private List<AnalyticsDto.MonthlyTrend> buildMonthlyTrends(List<Transaction> transactions) {
        Map<String, AnalyticsDto.MonthlyTrend> trendMap = new TreeMap<>();

        for (Transaction t : transactions) {
            String key = t.getDate().getYear() + "-" + String.format("%02d", t.getDate().getMonthValue());
            trendMap.computeIfAbsent(key, k -> AnalyticsDto.MonthlyTrend.builder()
                    .year(t.getDate().getYear())
                    .month(t.getDate().getMonthValue())
                    .monthName(Month.of(t.getDate().getMonthValue()).getDisplayName(TextStyle.SHORT, Locale.ENGLISH)
                            + " " + t.getDate().getYear())
                    .income(BigDecimal.ZERO)
                    .expense(BigDecimal.ZERO)
                    .savings(BigDecimal.ZERO)
                    .build());

            AnalyticsDto.MonthlyTrend trend = trendMap.get(key);
            if (t.getType() == Transaction.TransactionType.INCOME) {
                trend.setIncome(trend.getIncome().add(t.getAmount()));
            } else {
                trend.setExpense(trend.getExpense().add(t.getAmount()));
            }
            trend.setSavings(trend.getIncome().subtract(trend.getExpense()));
        }

        return new ArrayList<>(trendMap.values());
    }
}
