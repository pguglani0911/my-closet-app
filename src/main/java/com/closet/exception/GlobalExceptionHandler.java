package com.closet.exception;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import com.fasterxml.jackson.databind.exc.MismatchedInputException;
import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;

@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

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

    // Narrowed catch-all: only for genuinely unexpected application exceptions
    // (e.g. a NullPointerException in service code). Standard Spring MVC exceptions
    // (405, 404, 415, etc.) are now handled below via handleExceptionInternal, so
    // this no longer masks them as 500s.
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

    // Overrides ResponseEntityExceptionHandler's specific hook for malformed request
    // bodies, instead of declaring a competing @ExceptionHandler for the same exception
    // type (which caused the "Ambiguous @ExceptionHandler" startup failure). Keeps the
    // same field/type-mismatch message logic as before.
    @Override
    protected ResponseEntity<Object> handleHttpMessageNotReadable(
            HttpMessageNotReadableException ex, HttpHeaders headers, HttpStatusCode status, WebRequest request) {

        String specificMessage = "Invalid data format provided.";

        if (ex.getCause() instanceof MismatchedInputException mismatchedException) {
            String fieldName = mismatchedException.getPath().isEmpty() ? "unknown" : mismatchedException.getPath().get(0).getFieldName();
            String targetType = mismatchedException.getTargetType().getSimpleName();
            specificMessage = String.format("Data type mismatch on field '%s'. Expected a valid %s value.", fieldName, targetType);
        }

        String path = request.getDescription(false).replace("uri=", "");

        ErrorResponse errorBody = new ErrorResponse(
                LocalDateTime.now(),
                status.value(),
                "Bad Request",
                specificMessage,
                path
        );
        return new ResponseEntity<>(errorBody, headers, status);
    }

    // Overrides ResponseEntityExceptionHandler's specific hook for @Valid failures,
    // same reasoning as above.
    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex, HttpHeaders headers, HttpStatusCode status, WebRequest request) {

        String message = ex.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(fieldError -> fieldError.getField() + ": " + fieldError.getDefaultMessage())
                .orElse("Validation failed.");

        String path = request.getDescription(false).replace("uri=", "");

        ErrorResponse errorBody = new ErrorResponse(
                LocalDateTime.now(),
                status.value(),
                "Bad Request",
                message,
                path
        );
        return new ResponseEntity<>(errorBody, headers, status);
    }

    // Overrides ResponseEntityExceptionHandler's central hook, which every other built-in
    // MVC exception (HttpRequestMethodNotSupportedException, NoHandlerFoundException,
    // HttpMediaTypeNotSupportedException, etc.) routes through. This preserves the
    // correct status code Spring already determined, just reformats the body.
    @Override
    protected ResponseEntity<Object> handleExceptionInternal(
            Exception ex, Object body, HttpHeaders headers, HttpStatusCode statusCode, WebRequest request) {

        String path = request.getDescription(false).replace("uri=", "");

        ErrorResponse errorBody = new ErrorResponse(
                LocalDateTime.now(),
                statusCode.value(),
                statusCode.toString(),
                ex.getMessage(),
                path
        );
        return new ResponseEntity<>(errorBody, headers, statusCode);
    }
}