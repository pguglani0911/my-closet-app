package com.closet.controller;

import com.closet.entity.ApplicationSetting;
import com.closet.exception.ResourceNotFoundException;
import com.closet.repository.ApplicationSettingRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/config")
public class ConfigController {

    private final ApplicationSettingRepository settingRepo;

    public ConfigController(ApplicationSettingRepository settingRepo) {
        this.settingRepo = settingRepo;
    }

    @GetMapping("/settings/{key}")
    public ApplicationSetting getSetting(@PathVariable String key) {
        return settingRepo.findById(key)
            .orElseThrow(() -> new ResourceNotFoundException("No setting found for key: " + key));
    }
}