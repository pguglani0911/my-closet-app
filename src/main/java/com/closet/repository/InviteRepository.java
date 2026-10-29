package com.closet.repository;

import com.closet.entity.Invite;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface InviteRepository extends JpaRepository<Invite, String> {
    Optional<Invite> findByInviteCode(String inviteCode);
}