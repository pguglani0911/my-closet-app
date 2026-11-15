package com.closet.controller;

import com.closet.entity.PasswordResetToken;
import com.closet.entity.User;
import com.closet.repository.PasswordResetTokenRepository;
import com.closet.repository.UserRepository;
import com.closet.util.TokenUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;

    public UserController(UserRepository userRepository, PasswordResetTokenRepository tokenRepository) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
    }

    @GetMapping("/{username}")
    public ResponseEntity<?> getUserProfile(@PathVariable("username") String username) {
        return userRepository.findById(username)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{username}/settings")
    public ResponseEntity<?> updateSettings(
            @PathVariable("username") String username,
            @RequestBody Map<String, String> updates) {
        return userRepository.findById(username).map(user -> {
            if (updates.containsKey("country")) user.setCountry(updates.get("country"));
            if (updates.containsKey("state")) user.setState(updates.get("state"));
            if (updates.containsKey("zipCode")) user.setZipCode(updates.get("zipCode"));
            if (updates.containsKey("streetAddress")) user.setStreetAddress(updates.get("streetAddress"));
            userRepository.save(user);
            return ResponseEntity.ok(user);
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Step 1: Request Password Reset -> Generates Token, Hashes it for DB, Sends Raw to Email
    @PostMapping("/{username}/request-password-reset")
    public ResponseEntity<?> requestPasswordReset(@PathVariable("username") String username) {
        return userRepository.findById(username).map(user -> {
            String rawToken = UUID.randomUUID().toString();
            String hashedToken = TokenUtils.hashToken(rawToken);

            PasswordResetToken resetToken = new PasswordResetToken(hashedToken, user, 15);
            tokenRepository.save(resetToken);

            // TODO: Hook up your email service here using rawToken
            // emailService.sendPasswordResetEmail(user.getEmail(), rawToken);

            return ResponseEntity.ok(Map.of("message", "Verification token sent to " + user.getEmail()));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Step 2: Confirm Reset -> Hashes Incoming Token, Verifies, Updates Password, and Deletes Token
    @PostMapping("/confirm-password-reset")
    public ResponseEntity<?> confirmPasswordReset(@RequestBody Map<String, String> request) {
        String rawToken = request.get("token");
        String newPassword = request.get("newPassword");

        if (rawToken == null || newPassword == null || newPassword.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Token and new password are required"));
        }

        String hashedIncomingToken = TokenUtils.hashToken(rawToken);

        return tokenRepository.findByToken(hashedIncomingToken).map(resetToken -> {
            if (resetToken.isExpired()) {
                tokenRepository.delete(resetToken);
                return ResponseEntity.badRequest().body(Map.of("message", "Verification token has expired"));
            }

            User user = resetToken.getUser();
            user.setPassword(newPassword);
            userRepository.save(user);

            tokenRepository.delete(resetToken);

            return ResponseEntity.ok(Map.of("message", "Password successfully reset!"));
        }).orElseGet(() -> ResponseEntity.badRequest().body(Map.of("message", "Invalid verification token")));
    }

    @GetMapping("/{username}/invite-code")
    public ResponseEntity<?> getInviteCode(@PathVariable("username") String username) {
        return userRepository.findById(username).map(user -> {
            Map<String, String> res = new HashMap<>();
            res.put("inviteCode", user.getInviteCode() != null ? user.getInviteCode() : "N/A");
            return ResponseEntity.ok(res);
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }
}