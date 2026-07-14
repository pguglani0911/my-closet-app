package com.closet.exception;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Converter(autoApply = true)
public class LocalDateStringConverter implements AttributeConverter<LocalDate, String> {

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    @Override
    public String convertToDatabaseColumn(LocalDate attribute) {
        // Java LocalDate -> Database String ("2026-06-28")
        return (attribute != null) ? attribute.format(FORMATTER) : null;
    }

    @Override
    public LocalDate convertToEntityAttribute(String dbData) {
        // Database String ("2026-06-28") -> Java LocalDate
        return (dbData != null && !dbData.isEmpty()) ? LocalDate.parse(dbData, FORMATTER) : null;
    }
}