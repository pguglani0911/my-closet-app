package com.closet.controller;

import com.closet.dto.SignupRequest;
import com.closet.entity.User;

import com.closet.repository.InviteRepository;
import com.closet.repository.UserRepository;
import com.closet.service.SignupService;
import com.closet.service.SessionService;


import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;


import jakarta.validation.Valid;



import org.slf4j.Logger;
import org.slf4j.LoggerFactory;    
    
@RestController
@RequestMapping("/api")
public class SignupController {
     private final SignupService signupService;
    private final UserRepository userRepo;
    private final InviteRepository inviteRepo;
    private final PasswordEncoder passwordEncoder;
    private static final Logger log = LoggerFactory.getLogger(AuthController.class);
    private final SessionService sessionService;


    public SignupController(SignupService signupService, UserRepository userRepo,
                           InviteRepository inviteRepo, PasswordEncoder passwordEncoder, SessionService sessionService) {
        this.signupService = signupService;
        this.userRepo = userRepo;
        this.inviteRepo = inviteRepo;
        this.passwordEncoder = passwordEncoder;
        this.sessionService = sessionService;
    }

    @PostMapping("/signup")
    public User signup(@Valid @RequestBody SignupRequest req) {
        return signupService.signup(req);
    }
}
