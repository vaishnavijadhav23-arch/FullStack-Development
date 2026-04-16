package com.financeadvisor.controller;

import com.financeadvisor.dto.BudgetDto;
import com.financeadvisor.service.BudgetService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/budgets")
@CrossOrigin(origins = "*")
public class BudgetController {

    @Autowired
    private BudgetService budgetService;

    @PostMapping
    public ResponseEntity<?> createOrUpdate(Authentication auth, @Valid @RequestBody BudgetDto.Request request) {
        try {
            return ResponseEntity.ok(budgetService.createOrUpdateBudget(auth.getName(), request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<BudgetDto.Response>> getBudgets(
            Authentication auth,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {
        if (month != null && year != null) {
            return ResponseEntity.ok(budgetService.getBudgets(auth.getName(), month, year));
        }
        LocalDate now = LocalDate.now();
        return ResponseEntity.ok(budgetService.getBudgets(auth.getName(), now.getMonthValue(), now.getYear()));
    }

    @GetMapping("/all")
    public ResponseEntity<List<BudgetDto.Response>> getAllBudgets(Authentication auth) {
        return ResponseEntity.ok(budgetService.getAllBudgets(auth.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(Authentication auth, @PathVariable String id) {
        try {
            budgetService.deleteBudget(auth.getName(), id);
            return ResponseEntity.ok(Map.of("message", "Budget deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
