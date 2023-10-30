package org.mudahmail.server.impl;

import io.grpc.Server;
import io.grpc.ServerBuilder;
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
                // Mailbox service executor
                .addService(mailboxService = new MailboxServiceImpl(service))
                //Allow client pings even if no ongoing calls are happening (default is false)
                .permitKeepAliveWithoutCalls(true)
                //Least keep alive time allowed for clients to configure
                .permitKeepAliveTime(10, TimeUnit.SECONDS)
                //How long a channel can stay idle (idle means no pings & messages received)
                .maxConnectionIdle(5, TimeUnit.SECONDS)
                //Grace period after the channel ends
                .maxConnectionAgeGrace(10, TimeUnit.SECONDS)
                //Max payload size
                .maxInboundMessageSize(Integer.MAX_VALUE)
                //Max headers size
                .maxInboundMetadataSize(Integer.MAX_VALUE)
                // Build the server.
                .build();

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
