package org.mudahmail.server.impl;

import io.grpc.*;
import io.grpc.netty.NettyServerBuilder;
import lombok.Getter;
import lombok.extern.log4j.Log4j2;
import org.mudahmail.server.Service;

import java.io.IOException;
import java.util.concurrent.TimeUnit;

@Log4j2(topic = "GRPC Service")
public class MailboxService {

    @Getter
    private final Server server;
    @Getter
    private final MailboxServiceImpl mailboxService;

    public MailboxService(Service service, int port) {
        var serverBuilder = ServerBuilder.forPort(port);
        server = ((NettyServerBuilder) serverBuilder)
                .directExecutor()
                .intercept(new MailboxAuthInterceptor(service))
                .addService(mailboxService = new MailboxServiceImpl(service)) // Mailbox service executor
                .permitKeepAliveWithoutCalls(true) // Allow client pings even if no ongoing calls are happening (default is false)
                .permitKeepAliveTime(10, TimeUnit.SECONDS) // Least keep alive time allowed for clients to configure
                .maxConnectionIdle(5, TimeUnit.SECONDS) // How long a channel can stay idle (idle means no pings & messages received)
                .maxConnectionAgeGrace(10, TimeUnit.SECONDS) // Grace period after the channel ends
                .maxInboundMessageSize(32 * 1024 * 1024) // Max payload size (32MB)
                .maxInboundMetadataSize(1024 * 1024) // Max headers size (1MB)
                .build(); // Build the server.

        try {
            getServer().start();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        log.info("GRPC Service started on port {}", port);
    }

    public void shutdown() throws InterruptedException {
        getServer().shutdownNow().awaitTermination();
    }
}
