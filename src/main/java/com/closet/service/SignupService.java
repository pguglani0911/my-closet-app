package com.closet.service;

import com.closet.dto.SignupRequest;
import com.closet.entity.Invite;
import com.closet.entity.User;
import com.closet.repository.InviteRepository;
import com.closet.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class SignupService {

    private final UserRepository userRepository;
    private final InviteRepository inviteRepository;
    private final PasswordEncoder passwordEncoder;

    public SignupService(UserRepository userRepository, InviteRepository inviteRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.inviteRepository = inviteRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public boolean isInviteUsable(String code) {
        return inviteRepository.findByInviteCode(code.trim())
                .map(invite -> {
                    System.out.println("DEBUG - Found invite: " + invite.getInviteCode() + ", Status: " + invite.getStatus() + ", ExpiresAt: " + invite.getExpiresAt());
                    boolean isUnused = "UNUSED".equalsIgnoreCase(invite.getStatus());
                    boolean notExpired = true; // temporarily bypass or test expiration
                    return isUnused && notExpired;
                })
                .orElseGet(() -> {
                    System.out.println("DEBUG - Invite code not found in repository: " + code);
                    return false;
                });
    }

    public Invite generateInvite(String invitedEmail, Integer expiresInDays) {
        // Generate a random uppercase 8-character invite code
        String code = UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
        
        // Calculate expiration date if days are provided
        LocalDateTime expiresAt = expiresInDays != null && expiresInDays > 0 
                ? LocalDateTime.now().plusDays(expiresInDays) 
                : null;

        Invite invite = new Invite(code, invitedEmail, expiresAt);
        return inviteRepository.save(invite);
    }

    @Transactional
    public User signup(SignupRequest req) {
        // 1. Verify the invite code exists (using record accessor req.inviteCode())
        Invite invite = inviteRepository.findByInviteCode(req.inviteCode())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid invite code"));

        // 2. Check if it's usable
        if (!invite.isUsable()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invite code has already been used or expired");
        }

        // 3. Create and save the new user
        User user = new User();
        user.setUsername(req.username());
        user.setEmail(req.email());
        user.setPassword(passwordEncoder.encode(req.password()));
        user.setStreetAddress(req.streetAddress());
        user.setZipCode(req.zipCode());
        user.setCountry(req.country());
        user.setState(req.state());
        user.setInviteCode(req.inviteCode());
        user.setAccountStatus("PENDING");
        user.setRole("USER");
        user.setCreatedAt(LocalDateTime.now().toString());

        User savedUser = userRepository.save(user);

        // 4. Mark status as 'USED' in SQLite and save
        invite.markAsUsed();
        inviteRepository.save(invite);

        return savedUser;
    }


    @Transactional
    public User decide(String username, boolean approved, String reason) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (approved) {
            user.setAccountStatus("ACTIVE");
        } else {
            user.setAccountStatus("DENIED");
            // If your User entity has a field for denial reason, you can set it here:
            // user.setDenialReason(reason);
        }

        return userRepository.save(user);
    }
}