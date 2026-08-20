package com.smartseva;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class SmartSevaApplication {
    public static void main(String[] args) {
        SpringApplication.run(SmartSevaApplication.class, args);
    }
}