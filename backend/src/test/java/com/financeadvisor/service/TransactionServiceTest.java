package com.financeadvisor.service;

import com.financeadvisor.dto.TransactionDto;
import com.financeadvisor.entity.Transaction;
import com.financeadvisor.repository.TransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @InjectMocks
    private TransactionService transactionService;

    private Transaction sampleTransaction;

    @BeforeEach
    void setUp() {
        sampleTransaction = Transaction.builder()
                .id("tx1")
                .userId("user1")
                .type(Transaction.TransactionType.EXPENSE)
                .amount(new BigDecimal("500.00"))
                .category(Transaction.Category.FOOD)
                .date(LocalDate.now())
                .description("Groceries")
                .build();
    }

    @Test
    void createTransaction_Success() {
        TransactionDto.Request request = TransactionDto.Request.builder()
                .type(Transaction.TransactionType.EXPENSE)
                .amount(new BigDecimal("500.00"))
                .category(Transaction.Category.FOOD)
                .date(LocalDate.now())
                .description("Groceries")
                .build();

        when(transactionRepository.save(any(Transaction.class))).thenReturn(sampleTransaction);

        TransactionDto.Response response = transactionService.createTransaction("user1", request);

        assertNotNull(response);
        assertEquals("tx1", response.getId());
        assertEquals(new BigDecimal("500.00"), response.getAmount());
        verify(transactionRepository, times(1)).save(any(Transaction.class));
    }

    @Test
    void getAllTransactions_ReturnsListForUser() {
        when(transactionRepository.findByUserIdOrderByDateDesc("user1"))
                .thenReturn(Arrays.asList(sampleTransaction));

        List<TransactionDto.Response> result = transactionService.getAllTransactions("user1");

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("tx1", result.get(0).getId());
    }

    @Test
    void getTransactionById_Success() {
        when(transactionRepository.findById("tx1")).thenReturn(Optional.of(sampleTransaction));

        TransactionDto.Response response = transactionService.getTransactionById("user1", "tx1");

        assertNotNull(response);
        assertEquals("tx1", response.getId());
    }

    @Test
    void getTransactionById_AccessDenied() {
        sampleTransaction.setUserId("user2");
        when(transactionRepository.findById("tx1")).thenReturn(Optional.of(sampleTransaction));

        assertThrows(RuntimeException.class,
                () -> transactionService.getTransactionById("user1", "tx1"));
    }

    @Test
    void getTransactionById_NotFound() {
        when(transactionRepository.findById("notExist")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,
                () -> transactionService.getTransactionById("user1", "notExist"));
    }

    @Test
    void deleteTransaction_Success() {
        when(transactionRepository.findById("tx1")).thenReturn(Optional.of(sampleTransaction));
        doNothing().when(transactionRepository).delete(sampleTransaction);

        assertDoesNotThrow(() -> transactionService.deleteTransaction("user1", "tx1"));
        verify(transactionRepository, times(1)).delete(sampleTransaction);
    }

    @Test
    void updateTransaction_Success() {
        TransactionDto.Request request = TransactionDto.Request.builder()
                .type(Transaction.TransactionType.EXPENSE)
                .amount(new BigDecimal("750.00"))
                .category(Transaction.Category.SHOPPING)
                .date(LocalDate.now())
                .description("Updated")
                .build();

        when(transactionRepository.findById("tx1")).thenReturn(Optional.of(sampleTransaction));
        when(transactionRepository.save(any(Transaction.class))).thenReturn(sampleTransaction);

        TransactionDto.Response response = transactionService.updateTransaction("user1", "tx1", request);
        assertNotNull(response);
        verify(transactionRepository, times(1)).save(any(Transaction.class));
    }
}
