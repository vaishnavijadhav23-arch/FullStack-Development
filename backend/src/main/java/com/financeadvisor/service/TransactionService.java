package com.financeadvisor.service;

import com.financeadvisor.dto.TransactionDto;
import com.financeadvisor.entity.Transaction;
import com.financeadvisor.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    public TransactionDto.Response createTransaction(String userId, TransactionDto.Request request) {
        Transaction transaction = Transaction.builder()
                .userId(userId)
                .type(request.getType())
                .amount(request.getAmount())
                .category(request.getCategory())
                .date(request.getDate())
                .description(request.getDescription())
                .build();

        Transaction saved = transactionRepository.save(transaction);
        return TransactionDto.Response.from(saved);
    }

    public List<TransactionDto.Response> getAllTransactions(String userId) {
        return transactionRepository.findByUserIdOrderByDateDesc(userId)
                .stream().map(TransactionDto.Response::from).collect(Collectors.toList());
    }

    public TransactionDto.Response getTransactionById(String userId, String id) {
        Transaction t = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));
        if (!t.getUserId().equals(userId)) throw new RuntimeException("Access denied");
        return TransactionDto.Response.from(t);
    }

    public TransactionDto.Response updateTransaction(String userId, String id, TransactionDto.Request request) {
        Transaction t = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));
        if (!t.getUserId().equals(userId)) throw new RuntimeException("Access denied");

        t.setType(request.getType());
        t.setAmount(request.getAmount());
        t.setCategory(request.getCategory());
        t.setDate(request.getDate());
        t.setDescription(request.getDescription());
        t.setUpdatedAt(LocalDateTime.now());

        return TransactionDto.Response.from(transactionRepository.save(t));
    }

    public void deleteTransaction(String userId, String id) {
        Transaction t = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));
        if (!t.getUserId().equals(userId)) throw new RuntimeException("Access denied");
        transactionRepository.delete(t);
    }

    public List<TransactionDto.Response> getTransactionsByDateRange(String userId, LocalDate from, LocalDate to) {
        return transactionRepository.findByUserIdAndDateBetween(userId, from, to)
                .stream().map(TransactionDto.Response::from).collect(Collectors.toList());
    }

    public List<Transaction> getRawTransactions(String userId) {
        return transactionRepository.findByUserId(userId);
    }

    public List<Transaction> getRawTransactionsByDateRange(String userId, LocalDate from, LocalDate to) {
        return transactionRepository.findByUserIdAndDateBetween(userId, from, to);
    }
}
