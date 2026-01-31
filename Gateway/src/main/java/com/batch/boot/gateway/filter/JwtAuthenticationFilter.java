package com.batch.boot.gateway.filter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

@Component
public class JwtAuthenticationFilter implements GlobalFilter, Ordered {

    @Autowired
    private RouteValidator validator;

    // Secret from Auth Service
    private static final String SECRET = "5367566B59703373367639792F423F4528482B4D6251655468576D5A71347437";

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        try {
            ServerHttpRequest request = exchange.getRequest();
            String path = request.getURI().getPath();
            System.out.println("Processing Request: " + path);

            // Critical Null Check
            if (validator == null) {
                System.err.println("CRITICAL IN JWT FILTER: RouteValidator is NULL. Autowiring failed.");
                throw new RuntimeException("RouteValidator is null - Bean injection failed");
            }

            // 1. Check if the route is secured using RouteValidator
            if (!validator.isSecured.test(request)) {
                System.out.println("Route is OPEN, passing through: " + path);
                return chain.filter(exchange);
            }

            // 2. Allow OPTIONS (CORS Pre-flight) requests
            if (exchange.getRequest().getMethod().equals(org.springframework.http.HttpMethod.OPTIONS)) {
                return chain.filter(exchange);
            }

            // 3. Check for Authorization Header
            if (!exchange.getRequest().getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                System.out.println("Missing Auth Header for secured route: " + path);
                return onError(exchange, "Missing Authorization Header", HttpStatus.UNAUTHORIZED);
            }

            String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                System.out.println("Invalid Auth Header format: " + authHeader);
                return onError(exchange, "Invalid Authorization Header", HttpStatus.UNAUTHORIZED);
            }

            String token = authHeader.substring(7);

            // 4. Validate Token & Extract Claims
            try {
                Claims claims = Jwts.parserBuilder()
                        .setSigningKey(getSignKey())
                        .build()
                        .parseClaimsJws(token)
                        .getBody();

                String role = claims.get("role", String.class);
                String username = claims.getSubject();

                // 5. Mutate Request with Headers for Downstream Services
                ServerHttpRequest mutatedRequest = exchange.getRequest().mutate()
                        .header("X-User-Role", role)
                        .header("X-User-Id", username)
                        .build();

                return chain.filter(exchange.mutate().request(mutatedRequest).build());

            } catch (Exception e) {
                System.err.println("JWT Token Verification Failed: " + e.getMessage());
                return onError(exchange, "Invalid Token", HttpStatus.UNAUTHORIZED);
            }

        } catch (Exception e) {
            System.err.println("CRITICAL EXCEPTION IN JWT FILTER OUTER BLOCK");
            e.printStackTrace();
            return onError(exchange, "Internal Gateway Error: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private Mono<Void> onError(ServerWebExchange exchange, String err, HttpStatus httpStatus) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(httpStatus);
        // We could write the error message to the body here if we wanted, but status
        // code is enough for now
        return response.setComplete();
    }

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
    public int getOrder() {
        return -1; // High priority filter
    }
}
