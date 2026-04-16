package com.financeadvisor.controller;

import com.financeadvisor.dto.TransactionDto;
import com.financeadvisor.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "*")
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    @PostMapping
    public ResponseEntity<?> create(Authentication auth, @Valid @RequestBody TransactionDto.Request request) {
        try {
            return ResponseEntity.ok(transactionService.createTransaction(auth.getName(), request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<TransactionDto.Response>> getAll(Authentication auth) {
        return ResponseEntity.ok(transactionService.getAllTransactions(auth.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(Authentication auth, @PathVariable String id) {
        try {
            return ResponseEntity.ok(transactionService.getTransactionById(auth.getName(), id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(Authentication auth, @PathVariable String id,
                                    @Valid @RequestBody TransactionDto.Request request) {
        try {
            return ResponseEntity.ok(transactionService.updateTransaction(auth.getName(), id, request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(Authentication auth, @PathVariable String id) {
        try {
            transactionService.deleteTransaction(auth.getName(), id);
            return ResponseEntity.ok(Map.of("message", "Transaction deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/range")
    public ResponseEntity<List<TransactionDto.Response>> getByRange(
            Authentication auth,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(transactionService.getTransactionsByDateRange(auth.getName(), from, to));
    }
}
