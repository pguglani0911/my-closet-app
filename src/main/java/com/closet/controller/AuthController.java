package com.closet.controller;

import com.closet.repository.ApplicationSettingRepository;
import com.closet.dto.SignupRequest;
import com.closet.entity.User;
import com.closet.exception.ResourceNotFoundException;
import com.closet.repository.InviteRepository;
import com.closet.repository.UserRepository;
import com.closet.service.SignupService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.Map;

import jakarta.validation.Valid; 

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final SignupService signupService;
    private final UserRepository userRepo;
    private final InviteRepository inviteRepo;
    private final PasswordEncoder passwordEncoder;

    public AuthController(SignupService signupService, UserRepository userRepo,
                           InviteRepository inviteRepo, PasswordEncoder passwordEncoder) {
        this.signupService = signupService;
        this.userRepo = userRepo;
        this.inviteRepo = inviteRepo;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/invites/{code}/validate")
    public Map<String, Boolean> validate(@PathVariable String code) {
        return Map.of("valid", signupService.isInviteUsable(code));
    }


    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        User user = userRepo.findById(body.get("username"))
            .orElseThrow(() -> new ResourceNotFoundException("Invalid credentials"));

        if (!passwordEncoder.matches(body.get("password"), user.getPassword())) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
        }
        if (!"ACTIVE".equals(user.getAccountStatus())) {
            return ResponseEntity.status(403).body(Map.of(
                "error", "Account not active",
                "status", user.getAccountStatus()
            ));
        }
        return ResponseEntity.ok(Map.of("username", user.getUsername(), "role", user.getRole()));
    }

    @PostMapping("/signup")
    public User signup(@Valid @RequestBody SignupRequest req) {
        return signupService.signup(req);
    }



  
}