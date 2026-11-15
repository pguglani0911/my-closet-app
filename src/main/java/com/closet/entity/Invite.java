package com.closet.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "invites")
public class Invite {

    @Id
    @Column(name = "invite_code")
    private String inviteCode;

    @Column(name = "invited_email")
    private String invitedEmail;

    @Column(name = "status")
    private String status = "UNUSED";

    // Change from LocalDateTime to String to safely handle raw SQLite text dates
    @Column(name = "expires_at")
    private String expiresAt;

    public Invite() {}

    // Option 1: Update your existing constructor to accept a String
    public Invite(String inviteCode, String invitedEmail, String expiresAt) {
        this.inviteCode = inviteCode;
        this.invitedEmail = invitedEmail;
        this.expiresAt = expiresAt;
        this.status = "UNUSED";
    }

    // Option 2: Add an overloaded constructor if you still pass LocalDateTime elsewhere
    public Invite(String inviteCode, String invitedEmail, java.time.LocalDateTime expiresAt) {
        this.inviteCode = inviteCode;
        this.invitedEmail = invitedEmail;
        this.expiresAt = expiresAt != null ? expiresAt.toString() : null;
        this.status = "UNUSED";
    }

    public boolean isUsable() {
        boolean notUsed = "UNUSED".equalsIgnoreCase(this.status);
        boolean notExpired = true;

        if (this.expiresAt != null && !this.expiresAt.isEmpty() && !this.expiresAt.equalsIgnoreCase("NULL")) {
            try {
                // Try parsing standard ISO format
                LocalDateTime expTime = LocalDateTime.parse(this.expiresAt.replace(" ", "T"));
                notExpired = expTime.isAfter(LocalDateTime.now());
            } catch (Exception e) {
                // If parsing fails, default to allowing it or handle legacy strings
                notExpired = true; 
            }
        }
        return notUsed && notExpired;
    }

    public void markAsUsed() {
        this.status = "USED";
    }

    // Getters and Setters
    public String getInviteCode() { return inviteCode; }
    public void setInviteCode(String inviteCode) { this.inviteCode = inviteCode; }

    public String getInvitedEmail() { return invitedEmail; }
    public void setInvitedEmail(String invitedEmail) { this.invitedEmail = invitedEmail; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getExpiresAt() { return expiresAt; }
    public void setExpiresAt(String expiresAt) { this.expiresAt = expiresAt; }
}