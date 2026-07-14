package com.closet.repository;

import com.closet.entity.WardrobeTag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WardrobeTagRepository extends JpaRepository<WardrobeTag, Long> {
    // Spring will handle basic CRUD operations automatically
}