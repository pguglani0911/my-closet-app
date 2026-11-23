package com.closet.entity;

import jakarta.persistence.*;

import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.time.LocalDateTime;

@Entity
@Table(name = "session_table")
public class Session {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "session_id")
    private Long id;

    @Column(name = "username")
    private String username;

    @Column(name = "token_hash")
    private String tokenHash;

    @Column(name = "start_time" )
    private String startTime;

    @Column(name = "last_active_at")
    private String lastActiveAt;

    @Column(name = "end_time")
    private String endTime;

    @Column(name = "revoked_at")
    private String revokedAt;

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "user_agent")
    private String userAgent;

    @Column(name = "csrf_token")
    private String csrfToken;

    @Column(name = "activity_status")
    private String activityStatus;

    // Required by JPA
    protected Session() {
    }

    public Session(String username, String tokenHash, String csrfToken,
                   String ipAddress, String userAgent, String activityStatus) {
        this.username = username;
        this.tokenHash = tokenHash;
        this.csrfToken = csrfToken;
        this.ipAddress = ipAddress;
        this.userAgent = userAgent;
        this.activityStatus = activityStatus;
    }


    

  

    
    
    public Long getId() { return id; }
    public String getUsername() { return username; }
    public String getTokenHash() { return tokenHash; }
    public String getStartTime() { return startTime; }
    public String getLastActiveAt() { return lastActiveAt; }
    public String getEndTime() { return endTime; }
    public String getRevokedAt() { return revokedAt; }
    public String getIpAddress() { return ipAddress; }
    public String getUserAgent() { return userAgent; }
    public String getCsrfToken() { return csrfToken; }
    public String getActivityStatus() { return activityStatus; }


    public void setLastActiveAt(String lastActiveAt) { this.lastActiveAt = lastActiveAt; }
    public void setEndTime(String endTime) { this.endTime = endTime; }
    public void setRevokedAt(String revokedAt) { this.revokedAt = revokedAt; }
    public void setActivityStatus(String activityStatus) { this.activityStatus = activityStatus; }
}