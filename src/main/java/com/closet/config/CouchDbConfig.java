package com.closet.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

import java.util.Base64;

@Configuration
public class CouchDbConfig {

    @Value("${couchdb.url:http://127.0.0.1:5984}")
    private String couchUrl;

    @Value("${couchdb.username:admin}")
    private String username;

    @Value("${couchdb.password:password0531}")
    private String password;

    @Bean
    public RestClient couchRestClient() {
        String authHeader = "Basic " + Base64.getEncoder()
                .encodeToString((username + ":" + password).getBytes());

        return RestClient.builder()
                .baseUrl(couchUrl)
                .defaultHeader("Authorization", authHeader)
                .build();
    }
}