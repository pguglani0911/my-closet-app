package com.closet.controller;

import com.closet.dto.SignupRequest;
import com.closet.entity.User;
import com.closet.exception.ResourceNotFoundException;
import com.closet.repository.InviteRepository;
import com.closet.repository.UserRepository;
import com.closet.service.SignupService;
import com.closet.service.SessionService;

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
       Optional<User> user = null;

        try {
             user = userRepo.findById(body.get("username"));
             if (user.isEmpty()) {
                return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(" Invalid username or password");
             }
            log.info("User found: {}", user);

            if (!passwordEncoder.matches(body.get("password"), user.get().getPassword())) {
                return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
            }
            if (!"ACTIVE".equals(user.get().getAccountStatus())) {
                return ResponseEntity.status(403).body(Map.of(
                    "error", "Account not active",
                    "status", user.get().getAccountStatus()
                ));
            }

            HttpSession session = request.getSession(true);// create a new session
             /// Create a ClosetUserSession Object - Create a DTO
             ///// 
            
             
             String strSessionTrue = session.getId();
              log.info("Session ID: New  {}", strSessionTrue);
             String ip_address= request.getRemoteAddr();
                String user_agent = request.getHeader("User-Agent");
             sessionService.createSession(user.get().getUsername(),strSessionTrue, strSessionTrue, ip_address, user_agent);
        } catch (Exception e) {
            //ResourceNotFoundException rnfe;
            //rnfe = new ResourceNotFoundException("Invalid credentials");
            throw e;
        }
       

        
        return ResponseEntity.ok(Map.of("username", user.get().getUsername(), "role", user.get().getRole()));
    }

    @PostMapping("/signup")
    public User signup(@Valid @RequestBody SignupRequest req) {
        return signupService.signup(req);
    }



  
}