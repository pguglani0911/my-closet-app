package com.closet.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;

import com.fasterxml.jackson.databind.exc.MismatchedInputException;
import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex, HttpServletRequest request) {
        ErrorResponse errorBody = new ErrorResponse(
                LocalDateTime.now(),
                HttpStatus.NOT_FOUND.value(),
                "Not Found",
                ex.getMessage(),
                request.getRequestURI()
        );
        return new ResponseEntity<>(errorBody, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(InvalidTypeException.class)
    public ResponseEntity<ErrorResponse> handleInvalidType(InvalidTypeException ex, HttpServletRequest request) {
        ErrorResponse errorBody = new ErrorResponse(
                LocalDateTime.now(),
                HttpStatus.BAD_REQUEST.value(),
                "Bad Request",
                ex.getMessage(),
                request.getRequestURI()
        );
        return new ResponseEntity<>(errorBody, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleTypeMismatch(HttpMessageNotReadableException ex, HttpServletRequest request) {
        String specificMessage = "Invalid data format provided.";

        if (ex.getCause() instanceof MismatchedInputException mismatchedException) {
            String fieldName = mismatchedException.getPath().isEmpty() ? "unknown" : mismatchedException.getPath().get(0).getFieldName();
            String targetType = mismatchedException.getTargetType().getSimpleName();
            specificMessage = String.format("Data type mismatch on field '%s'. Expected a valid %s value.", fieldName, targetType);
        }

        ErrorResponse errorBody = new ErrorResponse(
                LocalDateTime.now(),
                HttpStatus.BAD_REQUEST.value(),
                "Bad Request",
                specificMessage,
                request.getRequestURI()
        );
        return new ResponseEntity<>(errorBody, HttpStatus.BAD_REQUEST);
    }

    // NEW: Catches @Valid failures on @RequestBody (e.g. negative cost, blank required fields)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationErrors(MethodArgumentNotValidException ex, HttpServletRequest request) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(fieldError -> fieldError.getField() + ": " + fieldError.getDefaultMessage())
                .orElse("Validation failed.");

        ErrorResponse errorBody = new ErrorResponse(
                LocalDateTime.now(),
                HttpStatus.BAD_REQUEST.value(),
                "Bad Request",
                message,
                request.getRequestURI()
        );
        return new ResponseEntity<>(errorBody, HttpStatus.BAD_REQUEST);
    }

    // NEW: Catch-all so any exception you didn't anticipate still returns your ErrorResponse
    // format instead of Spring's default whitelabel error page.
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(Exception ex, HttpServletRequest request) {
        ErrorResponse errorBody = new ErrorResponse(
                LocalDateTime.now(),
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Internal Server Error",
                "Something went wrong. Please try again later.",
                request.getRequestURI()
        );
        return new ResponseEntity<>(errorBody, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}