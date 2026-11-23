package com.closet.service;

import com.closet.entity.Session;
import com.closet.repository.SessionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class SessionService {

    private final SessionRepository sessionRepository;

    public SessionService(SessionRepository sessionRepository) {
        this.sessionRepository = sessionRepository;
    }

    @Transactional
    public Session createSession(String username, String tokenHash, String csrfToken,
                                 String ipAddress, String userAgent) {
        Session session = new Session(username, tokenHash, csrfToken, ipAddress, userAgent,"active");
        
        return sessionRepository.save(session);
    }

    @Transactional(readOnly = true)
    public Optional<Session> getSession(Long id) {
        return sessionRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public List<Session> getAllSessions() {
        return sessionRepository.findAll();
    }

    @Transactional
    public void deleteSession(Long id) {
        sessionRepository.deleteById(id);
    }
}