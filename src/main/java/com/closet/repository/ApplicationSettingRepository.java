package com.closet.repository;

import com.closet.entity.ApplicationSetting;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ApplicationSettingRepository extends JpaRepository<ApplicationSetting, String> {}