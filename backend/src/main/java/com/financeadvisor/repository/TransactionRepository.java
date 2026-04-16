package com.financeadvisor.repository;

import com.financeadvisor.entity.Transaction;
import com.financeadvisor.entity.Transaction.TransactionType;
import com.financeadvisor.entity.Transaction.Category;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TransactionRepository extends MongoRepository<Transaction, String> {

    List<Transaction> findByUserIdOrderByDateDesc(String userId);

    List<Transaction> findByUserIdAndType(String userId, TransactionType type);

    List<Transaction> findByUserIdAndCategory(String userId, Category category);

    @Query("{ 'userId': ?0, 'date': { $gte: ?1, $lte: ?2 } }")
    List<Transaction> findByUserIdAndDateBetween(String userId, LocalDate startDate, LocalDate endDate);

    @Query("{ 'userId': ?0, 'type': ?1, 'date': { $gte: ?2, $lte: ?3 } }")
    List<Transaction> findByUserIdAndTypeAndDateBetween(String userId, TransactionType type, LocalDate startDate, LocalDate endDate);

    List<Transaction> findByUserId(String userId);

    void deleteByUserIdAndId(String userId, String id);
}
