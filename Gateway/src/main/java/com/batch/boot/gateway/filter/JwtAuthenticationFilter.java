package com.batch.boot.gateway.filter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

@Configuration
public class JwtAuthenticationFilter implements GlobalFilter, Ordered {

    // Secret from Auth Service
    // ("5367566B59703373367639792F423F4528482B4D6251655468576D5A71347437")
    // Note: If the Auth Service generates a sign key from this specific hex string,
    // we must duplicate that logic.
    // Assuming StandardCharsets.UTF_8 for simplicity or using the Hex string
    // directly if key generation fails.
    // For now, let's use the constant provided.
    private static final String SECRET = "5367566B59703373367639792F423F4528482B4D6251655468576D5A71347437";

    private SecretKey getSignKey() {
        byte[] keyBytes = hexStringToByteArray(SECRET);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    // Helper to decode Hex String to Byte Array
    public static byte[] hexStringToByteArray(String s) {
        int len = s.length();
        byte[] data = new byte[len / 2];
        for (int i = 0; i < len; i += 2) {
            data[i / 2] = (byte) ((Character.digit(s.charAt(i), 16) << 4)
                    + Character.digit(s.charAt(i + 1), 16));
        }
        return data;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getURI().getPath();

        // 1. Whiteliest Auth endpoints (Login/Signup)
        // Allow specific auth endpoints, but SECURE /api/auth/users
        if (path.equals("/api/auth/login") ||
                path.equals("/api/auth/register") ||
                path.equals("/api/auth/newUser")) {
            return chain.filter(exchange);
        }

        // 2. Allow OPTIONS (CORS Pre-flight) requests
        if (exchange.getRequest().getMethod().equals(org.springframework.http.HttpMethod.OPTIONS)) {
            return chain.filter(exchange);
        }

        // 2. Check for Authorization Header
        if (!exchange.getRequest().getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
            return onError(exchange, "Missing Authorization Header", HttpStatus.UNAUTHORIZED);
        }

        String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return onError(exchange, "Invalid Authorization Header", HttpStatus.UNAUTHORIZED);
        }

        String token = authHeader.substring(7);

        try {
            // 3. Validate Token & Extract Claims
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(getSignKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            String role = claims.get("role", String.class);
            String username = claims.getSubject();

            // 4. Mutate Request with Headers for Downstream Services
            ServerHttpRequest request = exchange.getRequest().mutate()
                    .header("X-User-Role", role)
                    .header("X-User-Id", username) // sending username as ID for now
                    .build();

            return chain.filter(exchange.mutate().request(request).build());

        } catch (Exception e) {
            System.err.println("JWT Verification Failed: " + e.getMessage());
            return onError(exchange, "Invalid Token", HttpStatus.UNAUTHORIZED);
        }
    }

    private Mono<Void> onError(ServerWebExchange exchange, String err, HttpStatus httpStatus) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(httpStatus);
        return response.setComplete();
    }

    @Override
    public int getOrder() {
        return -1; // High priority filter
    }
}
