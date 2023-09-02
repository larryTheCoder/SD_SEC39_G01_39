package org.mudahmail.server.impl;

import io.grpc.Server;
import io.grpc.ServerBuilder;
import lombok.Getter;
import lombok.extern.log4j.Log4j2;
import org.mudahmail.server.Service;

import java.io.IOException;

@Log4j2(topic = "GRPC Service")
public class MailboxService {

    @Getter
    private final Server server;
    @Getter
    private final MailboxServiceImpl mailboxService;

    public MailboxService(Service service, int port) {
        server = ServerBuilder.forPort(port)
                .directExecutor()
                .addService(mailboxService = new MailboxServiceImpl(service))
                .build();

        try {
            getServer().start();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        log.info("GRPC Service started on port {}", port);
    }
}
