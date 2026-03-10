package com.frailty.dto;

import com.frailty.model.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String tokenType;
    private String id;
    private String username;
    private String email;
    private String name;
    private Role role;
    private long expiresIn;
}
