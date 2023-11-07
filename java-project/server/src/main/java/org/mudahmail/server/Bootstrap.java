package org.mudahmail.server;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.log4j.Log4j2;

import javax.crypto.SecretKey;

import java.util.Map;

@Log4j2(topic = "Bootstrap")
public class Bootstrap {
    public static void main(String[] args) {
        String signingKey = "1NZGzii+LqRdn0oyaT9WuFDxmz5qwJi7j5T49+ryPzAIgYL+a+1pRLPTRETqfw4TDGbuVU+mOV0YbzTqEYCdTw==";
        SecretKey key = Keys.hmacShaKeyFor(signingKey.getBytes());

        String dataOb = Jwts.builder()
                .subject("152fe6a0-9c84-47fa-a19d-142589d991ff") // client's identifier
                .signWith(key)
                .compact();

        SecretKey encodedKeys = Keys.hmacShaKeyFor(signingKey.getBytes());
        JwtParser parser = Jwts.parser().verifyWith(encodedKeys).build();

        Jws<Claims> claims = parser.parseSignedClaims(dataOb);

        log.info(claims);
        log.info(dataOb);

        try {
            (new Service()).start(data -> {});
        } catch (Exception throwing) {
            log.throwing(throwing);
        }
    }
}