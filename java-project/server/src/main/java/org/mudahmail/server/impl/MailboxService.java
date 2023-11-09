package org.mudahmail.server.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.grpc.Server;
import io.grpc.ServerBuilder;
import io.grpc.netty.NettyServerBuilder;
import lombok.Getter;
import lombok.extern.log4j.Log4j2;
import org.mudahmail.rpc.NotificationRequest;
import org.mudahmail.rpc.NotificationType;
import org.mudahmail.server.Service;
import org.mudahmail.server.scheduler.ServerTaskExecutor;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Log4j2(topic = "GRPC Service")
public class MailboxService {

    @Getter
    private final Server server;
    @Getter
    private final MailboxServiceImpl mailboxService;
    @Getter
    private final ServerServiceImpl serverService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public MailboxService(Service service, int port) {
        var serverBuilder = ServerBuilder.forPort(port);
        server = ((NettyServerBuilder) serverBuilder)
                .directExecutor()
                .intercept(new MailboxAuthInterceptor(service))
                .addService(mailboxService = new MailboxServiceImpl(service)) // Mailbox service executor
                .addService(serverService = new ServerServiceImpl(this)) // The server service executor
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

        ServerTaskExecutor.scheduleRepeating(() -> getMailboxService().getActiveNotifications().forEach((key, value) -> sendNotificationEmpty(key, NotificationType.RPC_LAZY_STARTUP)), 5, 15, TimeUnit.MINUTES);

        log.info("GRPC Service started on port {}", port);
    }

    public synchronized void sendNotificationEmpty(String id, NotificationType event) {
        try {
            var notification = getMailboxService().getActiveNotifications().get(id);
            if (notification == null) {
                return;
            }

            notification.onNext(NotificationRequest.newBuilder()
                    .setTimestamp(System.currentTimeMillis())
                    .setType(event)
                    .build()
            );
        } catch (Throwable t) {
            log.throwing(t);
        }
    }

    public synchronized void sendNotificationWithData(String id, NotificationType event, Map<String, String> data) {
        try {
            var notification = getMailboxService().getActiveNotifications().get(id);
            if (notification == null) {
                return;
            }

            notification.onNext(NotificationRequest.newBuilder()
                    .setTimestamp(System.currentTimeMillis())
                    .setDataString(objectMapper.writeValueAsString(data))
                    .setType(event)
                    .build()
            );
        } catch (Throwable t) {
            log.throwing(t);
        }
    }

    public void shutdown() throws InterruptedException {
        getServer().shutdownNow().awaitTermination();
    }
}
