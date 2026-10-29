package com.closet.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromAddress;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendInviteEmail(String toEmail, String inviteCode, String expiresAt) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(toEmail);
        message.setSubject("You're invited to Wardrobe Manager");
        message.setText(
            "You've been invited to join Wardrobe Manager.\n\n" +
            "Your invite code: " + inviteCode + "\n" +
            "This code expires on: " + expiresAt + "\n\n" +
            "Enter this code at the sign-up page to create your account. " +
            "Make sure to sign up using this email address (" + toEmail + "), " +
            "since the invite is tied to it."
        );
        mailSender.send(message);
    }

    public void sendApprovalEmail(String toEmail) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(toEmail);
        message.setSubject("Your Wardrobe Manager account has been approved");
        message.setText(
            "Good news — your account has been approved!\n\n" +
            "You can now log in at the Wardrobe Manager login page using the credentials you created."
        );
        mailSender.send(message);
    }

    public void sendDenialEmail(String toEmail, String reason) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(toEmail);
        message.setSubject("Update on your Wardrobe Manager account request");

        String body = "Thank you for your interest in Wardrobe Manager.\n\n" +
            "Unfortunately, your account could not be approved at this time.";

        if (reason != null && !reason.isBlank()) {
            body += "\n\nReason: " + reason;
        }

        message.setText(body);
        mailSender.send(message);
    }
}