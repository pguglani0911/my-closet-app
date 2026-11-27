package com.closet.controller;

import com.closet.dto.SignupRequest;
import com.closet.entity.User;
import com.closet.exception.ResourceNotFoundException;
import com.closet.repository.InviteRepository;
import com.closet.repository.UserRepository;

import com.closet.service.SignupService;
import com.closet.service.SessionService;

import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;

import java.util.Enumeration;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;    

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final SignupService signupService;
    private final UserRepository userRepo;
    private final InviteRepository inviteRepo;
    private final PasswordEncoder passwordEncoder;
    private static final Logger log = LoggerFactory.getLogger(AuthController.class);
    private final SessionService sessionService;

    public AuthController(SignupService signupService, UserRepository userRepo,
                           InviteRepository inviteRepo, PasswordEncoder passwordEncoder, SessionService sessionService) {
        this.signupService = signupService;
        this.userRepo = userRepo;
        this.inviteRepo = inviteRepo;
        this.passwordEncoder = passwordEncoder;
        this.sessionService = sessionService;
    }

    @GetMapping("/invites/{code}/validate")
    public Map<String, Boolean> validate(@PathVariable String code) {
        return Map.of("valid", signupService.isInviteUsable(code));
    }


    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body, HttpServletRequest request) {
        String username = body.get("username");
        String password = body.get("password");

        if (username == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username and password are required"));
        }

        Optional<User> userOpt = userRepo.findById(username);
        if (userOpt.isEmpty() || !passwordEncoder.matches(password, userOpt.get().getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid credentials"));
        }

        User user = userOpt.get();
        log.info("Login attempt for user: {}", user.getUsername());

        if (!"ACTIVE".equals(user.getAccountStatus())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                    "error", "Account not active",
                    "status", user.getAccountStatus()
            ));
        }

        HttpSession oldSession = request.getSession(false);
        if (oldSession != null) {
            oldSession.invalidate();
        }
        HttpSession session = request.getSession(true);

        // Mark this session as authenticated
        session.setAttribute("username", user.getUsername());
        session.setAttribute("role", user.getRole());

        String sessionId = session.getId();
        log.info("New session created for user: {}", user.getUsername());

        String ipAddress = request.getRemoteAddr();
        String userAgent = request.getHeader("User-Agent");
        sessionService.createSession(user.getUsername(), sessionId, sessionId, ipAddress, userAgent);

        return ResponseEntity.ok(Map.of(
                "username", user.getUsername(),
                "role", user.getRole()
        ));
    }

    @GetMapping("/logout")
    public ResponseEntity<?> logout( HttpServletRequest request) {

        HttpSession session = request.getSession(false);

        if (session == null) {
            log.warn("Logout attempted with no active session");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "No active session"));
        }
        String sessionId = session.getId();
        log.info("Processing logout for session {}", sessionId);

        Object username = session.getAttribute("username");
        log.info("Username found for session {}: {}", sessionId, username);

        
        try {
            
            log.info("Username found: {}", username);
            if (username != null) {
                sessionService.setSessionToInactive((String) username);
            }

            try {
                session.invalidate();
            } catch (IllegalStateException e) {
                log.warn("Session {} was already invalidated during logout", session.getId(), e);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Invalid session state"));
            }
  
            log.info("User {} logged out successfully", username);
            
        } catch (DataAccessException e) {
            log.error("Database error while marking session inactive for user {}", username, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Unable to complete logout due to a server error"));
        } catch (ClassCastException e) {
            log.error("Invalid username attribute type in session", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Invalid session state"));
        } catch (Exception e) {
            log.error("Unexpected error during logout", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Logout failed"));
        }
        
        return ResponseEntity.ok(Map.of("message", "Logout successful"));
    }




}