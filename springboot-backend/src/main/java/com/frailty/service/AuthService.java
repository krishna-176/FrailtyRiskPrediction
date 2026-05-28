package com.frailty.service;

import com.frailty.dto.AuthResponse;
import com.frailty.dto.LoginRequest;
import com.frailty.dto.RegisterRequest;
import com.frailty.model.Role;
import com.frailty.model.User;
import com.frailty.repository.PatientRepository;
import com.frailty.repository.UserRepository;
import com.frailty.security.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository,
                       PatientRepository patientRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.patientRepository = patientRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public Mono<AuthResponse> register(RegisterRequest request) {
        // 1. Verify the patient ID exists
        return patientRepository.findById(request.getPatientId())
                .switchIfEmpty(Mono.error(new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Patient ID not found. Please check the ID given by your doctor.")))
                .flatMap(patient -> {
                    // 2. Check patient not already linked to another account
                    if (patient.getUserId() != null && !patient.getUserId().isBlank()) {
                        return Mono.error(new ResponseStatusException(
                                HttpStatus.CONFLICT,
                                "This Patient ID is already linked to an account."));
                    }
                    return userRepository.existsByUsername(request.getUsername());
                })
                .flatMap(usernameExists -> {
                    if (usernameExists) {
                        return Mono.error(new ResponseStatusException(
                                HttpStatus.CONFLICT, "Username already taken"));
                    }
                    return userRepository.existsByEmail(request.getEmail());
                })
                .flatMap(emailExists -> {
                    if (emailExists) {
                        return Mono.error(new ResponseStatusException(
                                HttpStatus.CONFLICT, "Email already registered"));
                    }
                    User user = User.builder()
                            .username(request.getUsername())
                            .email(request.getEmail())
                            .password(passwordEncoder.encode(request.getPassword()))
                            .name(request.getName())
                            .role(Role.PATIENT)
                            .build();
                    return userRepository.save(user);
                })
                .flatMap(savedUser ->
                    // 3. Link the patient record to this new user account
                    patientRepository.findById(request.getPatientId())
                            .flatMap(patient -> {
                                patient.setUserId(savedUser.getId());
                                return patientRepository.save(patient);
                            })
                            .thenReturn(savedUser)
                )
                .map(this::buildAuthResponse);
    }

    public Mono<AuthResponse> login(LoginRequest request) {
        return userRepository.findByUsername(request.getUsername())
                .switchIfEmpty(Mono.error(new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Invalid username or password")))
                .flatMap(user -> {
                    if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                        return Mono.error(new ResponseStatusException(
                                HttpStatus.UNAUTHORIZED, "Invalid username or password"));
                    }
                    return Mono.just(buildAuthResponse(user));
                });
    }

    public Mono<AuthResponse> getCurrentUser(String username) {
        return userRepository.findByUsername(username)
                .switchIfEmpty(Mono.error(new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found")))
                .map(this::buildAuthResponse);
    }

    private AuthResponse buildAuthResponse(User user) {
        String token = jwtUtil.generateToken(user);
        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole())
                .expiresIn(jwtUtil.getExpirationMs())
                .build();
    }
}
