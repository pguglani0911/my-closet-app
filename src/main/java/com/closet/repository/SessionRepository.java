package com.closet.repository;

import com.closet.entity.ClothingItem;
import com.closet.entity.Session;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface SessionRepository extends JpaRepository<Session, Long> {

    boolean existsByTokenHashAndUsernameAndActivityStatus(String tokenHash, String username, String activityStatus) ;


    @Modifying
    @Transactional
    @Query(value = "UPDATE session_table" +
            " SET activity_status = 'INACTIVE'," +
            " end_time = COALESCE(end_time, datetime('now'))" +
            " WHERE username = :username ;",
           nativeQuery = true)
    void setSessionToInactive(@Param("username") String username);
}