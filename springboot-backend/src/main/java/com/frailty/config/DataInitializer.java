package com.frailty.config;

import com.frailty.model.Role;
import com.frailty.model.User;
import com.frailty.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void seedDefaultUsers() {
        seedUser("admin", "admin@frailtyai.com", "Admin@123", "System Administrator", Role.ADMIN);
        seedUser("doctor", "doctor@frailtyai.com", "Doctor@123", "Default Doctor", Role.DOCTOR);
    }

    private void seedUser(String username, String email, String password, String name, Role role) {
        userRepository.existsByUsername(username)
                .filter(exists -> !exists)
                .flatMap(unused -> {
                    User user = User.builder()
                            .username(username)
                            .email(email)
                            .password(passwordEncoder.encode(password))
                            .name(name)
                            .role(role)
                            .build();
                    return userRepository.save(user);
                })
                .doOnSuccess(u -> {
                    if (u != null) log.info("Seeded default {} user: {}", role, username);
                })
                .subscribe();
    }
}
