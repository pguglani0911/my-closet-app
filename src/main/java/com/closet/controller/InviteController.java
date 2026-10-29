package com.closet.controller;

import com.closet.dto.CreateInviteRequest;
import com.closet.entity.Invite;
import com.closet.service.SignupService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/invites")
@CrossOrigin(origins = "http://localhost:5173")
public class InviteController {

    private final SignupService signupService;
    
    public InviteController(SignupService signupService) { 
        this.signupService = signupService; 
    }

    @PostMapping
    public Invite create(@Valid @RequestBody CreateInviteRequest req) {
        return signupService.generateInvite(req.invitedEmail(), req.expiresInDays());
    }

    // Add the validation endpoint here under /api/invites/{code}/validate
    @GetMapping("/{code}/validate")
    public Map<String, Boolean> validateInvite(@PathVariable("code") String code) {
        boolean isValid = signupService.isInviteUsable(code);
        return Map.of("valid", isValid);
    }
}