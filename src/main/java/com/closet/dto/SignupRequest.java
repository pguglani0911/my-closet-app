package com.closet.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record SignupRequest(
    @NotBlank(message = "Invite code is required")
    String inviteCode,

    @NotBlank(message = "Username is required")
    String username,

    @NotBlank(message = "Email is required")
    @Pattern(regexp = "^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$", message = "Email must be a valid format")
    String email,

    @NotBlank(message = "Password is required")
    String password,

    @NotBlank(message = "Please verify your password")
    String verifyPassword,

    String streetAddress,

    @Pattern(regexp = "^\\d{5}(-\\d{4})?$", message = "Zip code must be numeric (e.g. 12345 or 12345-6789)")
    String zipCode,

    String country,
    String state
) {}