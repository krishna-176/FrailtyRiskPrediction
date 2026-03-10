package com.frailty;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableReactiveMongoAuditing;

@SpringBootApplication
@EnableReactiveMongoAuditing
public class FrailtyApplication {

    public static void main(String[] args) {
        SpringApplication.run(FrailtyApplication.class, args);
    }
}
