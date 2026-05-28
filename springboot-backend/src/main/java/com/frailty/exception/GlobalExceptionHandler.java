package com.frailty.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.bind.support.WebExchangeBindException;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.server.ServerWebExchange;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * GlobalExceptionHandler — centralized error handling for all REST endpoints.
 *
 * Every exception, whether it's a 404, a validation failure, or an
 * unexpected server error, returns a consistent JSON schema:
 *
 * {
 *   "timestamp": "2025-04-07T10:00:00Z",
 *   "status":    404,
 *   "error":     "Not Found",
 *   "message":   "Patient not found",
 *   "path":      "/api/patients/xyz"
 * }
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    // ── Handles ResponseStatusException (e.g. 404, 403, 409) ────────────
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>> handleResponseStatus(
            ResponseStatusException ex, ServerWebExchange exchange) {

        return buildResponse(
                ex.getStatusCode().value(),
                HttpStatus.resolve(ex.getStatusCode().value()),
                ex.getReason() != null ? ex.getReason() : ex.getMessage(),
                exchange.getRequest().getPath().value()
        );
    }

    // ── Handles @Valid / @Validated bean validation failures ─────────────
    @ExceptionHandler(WebExchangeBindException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(
            WebExchangeBindException ex, ServerWebExchange exchange) {

        String details = ex.getBindingResult().getFieldErrors()
                .stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining("; "));

        return buildResponse(400, HttpStatus.BAD_REQUEST,
                "Validation failed: " + details,
                exchange.getRequest().getPath().value());
    }

    // ── Catch-all for any unexpected server error ─────────────────────────
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneric(
            Exception ex, ServerWebExchange exchange) {

        // Log the full stack—don't leak it to the client
        ex.printStackTrace();

        return buildResponse(500, HttpStatus.INTERNAL_SERVER_ERROR,
                "An unexpected error occurred. Please try again later.",
                exchange.getRequest().getPath().value());
    }

    // ── Helper ─────────────────────────────────────────────────────────────
    private ResponseEntity<Map<String, Object>> buildResponse(
            int statusCode, HttpStatus status, String message, String path) {

        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", Instant.now().toString());
        body.put("status",    statusCode);
        body.put("error",     status != null ? status.getReasonPhrase() : "Error");
        body.put("message",   message);
        body.put("path",      path);

        return ResponseEntity.status(statusCode).body(body);
    }
}
