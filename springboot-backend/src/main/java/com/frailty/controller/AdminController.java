package com.frailty.controller;

import com.frailty.dto.AuthResponse;
import com.frailty.dto.CreateDoctorRequest;
import com.frailty.model.Role;
import com.frailty.model.User;
import com.frailty.repository.UserRepository;
import com.frailty.security.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AdminController(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/doctors")
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<AuthResponse> createDoctor(@Valid @RequestBody CreateDoctorRequest request) {
        return userRepository.existsByUsername(request.getUsername())
                .flatMap(exists -> {
                    if (exists) return Mono.error(new ResponseStatusException(
                            HttpStatus.CONFLICT, "Username already taken"));
                    return userRepository.existsByEmail(request.getEmail());
                })
                .flatMap(emailExists -> {
                    if (emailExists) return Mono.error(new ResponseStatusException(
                            HttpStatus.CONFLICT, "Email already registered"));
                    User doctor = User.builder()
                            .username(request.getUsername())
                            .email(request.getEmail())
                            .password(passwordEncoder.encode(request.getPassword()))
                            .name(request.getName())
                            .role(Role.DOCTOR)
                            .build();
                    return userRepository.save(doctor);
                })
                .map(user -> AuthResponse.builder()
                        .id(user.getId())
                        .username(user.getUsername())
                        .email(user.getEmail())
                        .name(user.getName())
                        .role(user.getRole())
                        .build());
    }

    @GetMapping("/doctors")
    public Flux<AuthResponse> getDoctors() {
        return userRepository.findAll()
                .filter(u -> u.getRole() == Role.DOCTOR)
                .map(user -> AuthResponse.builder()
                        .id(user.getId())
                        .username(user.getUsername())
                        .email(user.getEmail())
                        .name(user.getName())
                        .role(user.getRole())
                        .build());
    }

    @GetMapping("/users")
    public Flux<AuthResponse> getAllUsers() {
        return userRepository.findAll()
                .map(user -> AuthResponse.builder()
                        .id(user.getId())
                        .username(user.getUsername())
                        .email(user.getEmail())
                        .name(user.getName())
                        .role(user.getRole())
                        .build());
    }

    @DeleteMapping("/users/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public Mono<Void> deleteUser(@PathVariable String id) {
        return userRepository.deleteById(id);
    }

    @GetMapping("/users/by-username/{username}")
    public Mono<AuthResponse> getUserByUsername(@PathVariable String username) {
        return userRepository.findByUsername(username)
                .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found")))
                .map(user -> AuthResponse.builder()
                        .id(user.getId())
                        .username(user.getUsername())
                        .email(user.getEmail())
                        .name(user.getName())
                        .role(user.getRole())
                        .build());
    }
}
