package com.financeadvisor.repository;

import com.financeadvisor.entity.Budget;
import com.financeadvisor.entity.Transaction.Category;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BudgetRepository extends MongoRepository<Budget, String> {
    List<Budget> findByUserId(String userId);
    List<Budget> findByUserIdAndMonthAndYear(String userId, int month, int year);
    Optional<Budget> findByUserIdAndCategoryAndMonthAndYear(String userId, Category category, int month, int year);
    void deleteByUserIdAndId(String userId, String id);
}
