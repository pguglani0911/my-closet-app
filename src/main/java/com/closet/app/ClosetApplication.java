package com.closet.app;



import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;


@SpringBootApplication
@ComponentScan(basePackages = {"com.closet.app", 
                            "com.closet.controller", 
                            "com.closet.service",
                            "com.closet.exception"})
@EnableJpaRepositories(basePackages = "com.closet.repository")
@EntityScan(basePackages = "com.closet.entity")
public class ClosetApplication {
    public static void main(String[] args) {
        SpringApplication.run(ClosetApplication.class, args);
    }


    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**") // Applies to all routes starting with /api
                        .allowedOrigins("http://localhost:5173") // Your Vite dev port
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*");
            }
        };
    }
}

