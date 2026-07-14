package com.closet.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.http.converter.HttpMessageNotReadableException;

import com.closet.exception.ResourceNotFoundException;
import com.fasterxml.jackson.databind.exc.MismatchedInputException;
import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // Handles "This item does not exist" and "This tag has no items"
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex, HttpServletRequest request) {
        ErrorResponse errorBody = new ErrorResponse(
                LocalDateTime.now(),
                HttpStatus.NOT_FOUND.value(),
                "Not Found: Global",
                ex.getMessage(), 
                request.getRequestURI()
        );
        return new ResponseEntity<>(errorBody, HttpStatus.NOT_FOUND);
    }

    // Handles "This is not a valid type of clothing"
    @ExceptionHandler(InvalidTypeException.class)
    public ResponseEntity<ErrorResponse> handleInvalidType(InvalidTypeException ex, HttpServletRequest request) {
        ErrorResponse errorBody = new ErrorResponse(
                LocalDateTime.now(),
                HttpStatus.BAD_REQUEST.value(),
                "Bad Request; Global Invalid type",
                ex.getMessage(),
                request.getRequestURI()
        );
        return new ResponseEntity<>(errorBody, HttpStatus.BAD_REQUEST);
    }


    @ExceptionHandler(HttpMessageNotReadableException.class)
public ResponseEntity<ErrorResponse> handleTypeMismatch(HttpMessageNotReadableException ex, HttpServletRequest request) {
    String specificMessage = "Invalid data format provided.";
    
    // Dig into the root cause exception to see what field broke
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
}