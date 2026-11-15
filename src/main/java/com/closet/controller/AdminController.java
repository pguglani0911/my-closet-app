package com.closet.controller;

import com.closet.dto.AdminDecisionRequest;
import com.closet.entity.User;
import com.closet.repository.UserRepository;
import com.closet.service.SignupService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
public class AdminController {

    private final UserRepository userRepo;
    private final SignupService signupService;

    public AdminController(UserRepository userRepo, SignupService signupService) {
        this.userRepo = userRepo;
        this.signupService = signupService;
    }

    @GetMapping
    public List<User> list(@RequestParam(defaultValue = "PENDING") String status) {
        return userRepo.findByAccountStatus(status);
    }

    @PutMapping("/{username}/approve")
    public User approve(@PathVariable String username) {
        return signupService.decide(username, true, null);
    }

    @PutMapping("/{username}/deny")
    public User deny(@PathVariable String username, @RequestBody(required = false) AdminDecisionRequest req) {
        return signupService.decide(username, false, req != null ? req.reason() : null);
    }
}