package com.closet.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record CreateInviteRequest(
    @NotBlank(message = "An email is required to send an invite")
    @Pattern(regexp = "^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$", message = "Email must be a valid format")
    String invitedEmail,

    Integer expiresInDays
) {}