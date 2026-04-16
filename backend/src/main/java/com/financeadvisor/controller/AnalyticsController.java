package com.financeadvisor.controller;

import com.financeadvisor.dto.AnalyticsDto;
import com.financeadvisor.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "*")
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    @GetMapping
    public ResponseEntity<AnalyticsDto> getFullAnalytics(Authentication auth) {
        return ResponseEntity.ok(analyticsService.getFullAnalytics(auth.getName()));
    }

    @GetMapping("/monthly")
    public ResponseEntity<AnalyticsDto> getMonthlyAnalytics(
            Authentication auth,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {
        LocalDate now = LocalDate.now();
        int y = year != null ? year : now.getYear();
        int m = month != null ? month : now.getMonthValue();
        return ResponseEntity.ok(analyticsService.getAnalyticsByMonth(auth.getName(), y, m));
    }

    @GetMapping("/range")
    public ResponseEntity<AnalyticsDto> getRangeAnalytics(
            Authentication auth,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(analyticsService.getAnalyticsByRange(auth.getName(), from, to));
    }
}
