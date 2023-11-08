package org.mudahmail.server.impl;

import io.grpc.*;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.JwtParser;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.mudahmail.server.Service;

import javax.crypto.SecretKey;

import static io.grpc.Metadata.ASCII_STRING_MARSHALLER;

public class MailboxAuthInterceptor implements ServerInterceptor {

    public static final String ADMIN_PRIVATE_TOKEN = System.getenv("ADMIN_PRIVATE_TOKEN");
    public static final String JWT_SIGNING_KEY = System.getenv("JWT_SECRET_KEY");
    public static final String BEARER_TYPE = "Bearer";

    public static final Metadata.Key<String> AUTHORIZATION_METADATA_KEY = Metadata.Key.of("Authorization", ASCII_STRING_MARSHALLER);
    public static final Metadata.Key<String> TARGET_CLIENT_AUTHORITY = Metadata.Key.of("Authority", ASCII_STRING_MARSHALLER);

    public static final Context.Key<String> USER_IDENTITY = Context.key("identity");
    public static final Context.Key<String> USER_AUTHORITY = Context.key("authority");

    private final SecretKey key = Keys.hmacShaKeyFor(JWT_SIGNING_KEY.getBytes());
    private final JwtParser parser = Jwts.parser().verifyWith(key).build();
    private final Service service;

    public MailboxAuthInterceptor(Service service) {
        this.service = service;
    }

    @Override
    public <ReqT, RespT> ServerCall.Listener<ReqT> interceptCall(ServerCall<ReqT, RespT> serverCall, Metadata metadata, ServerCallHandler<ReqT, RespT> serverCallHandler) {
        String value = metadata.get(AUTHORIZATION_METADATA_KEY);

        Status status = Status.UNAUTHENTICATED.withDescription("Authorization failed");
        if (value == null) {
            status = Status.UNAUTHENTICATED.withDescription("Authorization token is missing");
        } else if (!value.startsWith(BEARER_TYPE)) {
            status = Status.UNAUTHENTICATED.withDescription("Unknown authorization type");
        } else {
            try {
                String token = value.substring(BEARER_TYPE.length()).trim();
                Jws<Claims> claims = parser.parseSignedClaims(token);

                var payload = claims.getPayload();
                var issuer = payload.getIssuer();
                var tokenUse = payload.get("tre", String.class);

                var isAuthority = tokenUse.equalsIgnoreCase("0") && issuer.equalsIgnoreCase(ADMIN_PRIVATE_TOKEN);
                if (isAuthority) {
                    String authority = metadata.get(TARGET_CLIENT_AUTHORITY);
                    if (authority == null) {
                        status = Status.UNAUTHENTICATED.withDescription("Authority client is missing");
                    } else {
                        Context ctx = Context.current().withValue(USER_IDENTITY, issuer).withValue(USER_AUTHORITY, authority);
                        return Contexts.interceptCall(ctx, serverCall, metadata, serverCallHandler);
                    }
                } else if (service.getDatabaseManager().getDeviceById(issuer) != null) {
                    Context ctx = Context.current().withValue(USER_IDENTITY, issuer);
                    return Contexts.interceptCall(ctx, serverCall, metadata, serverCallHandler);
                }
            } catch (Exception e) {
                status = Status.UNAUTHENTICATED.withDescription(e.getMessage()).withCause(e);
            }
        }

        serverCall.close(status, metadata);
        return new ServerCall.Listener<>() {
            // noop
        };
    }
}
