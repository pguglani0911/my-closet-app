package com.closet.exception;

public class InvalidTypeException extends RuntimeException {
    public InvalidTypeException(String message) {
        super(message);
    }
}