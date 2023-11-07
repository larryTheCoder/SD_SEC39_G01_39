package org.mudahmail.client.module;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.grpc.ManagedChannel;
import io.grpc.netty.NettyChannelBuilder;
import io.grpc.stub.StreamObserver;
import lombok.SneakyThrows;
import lombok.extern.log4j.Log4j2;
import org.mudahmail.client.MailboxClient;
import org.mudahmail.client.scheduler.ServerTaskExecutor;
import org.mudahmail.client.utils.BearerToken;
import org.mudahmail.client.utils.Constants;
import org.mudahmail.rpc.MailboxGrpc;
import org.mudahmail.rpc.NotificationRequest;
import org.mudahmail.rpc.NotificationType;

import java.util.*;
import java.util.concurrent.TimeUnit;

/**
 * Handle events awaiting to be sent to the grpc server. Does handle reconnection and other
 * stuff. This is to reduce the boilerplate in the mailbox client class.
 */
@Log4j2(topic = "EventHandler")
public class EventHandler {

    private final MailboxGrpc.MailboxStub asyncStub;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Queue<NotificationRequest> pendingNotifications = new LinkedList<>();
    private final MailboxClient client;
    private final ManagedChannel channel;

    private StreamObserver<NotificationRequest> eventListener = null;

    public EventHandler(MailboxClient service) {
        log.info("Connecting to gRPC server: {}", Constants.SERVER_ADDRESS);

        channel = NettyChannelBuilder
                .forTarget(Constants.SERVER_ADDRESS)
                .intercept()
                .enableRetry()
                .useTransportSecurity()
                .keepAliveTime(30, TimeUnit.SECONDS)
                .keepAliveTimeout(5, TimeUnit.SECONDS)
                .keepAliveWithoutCalls(true)
                .build();

        asyncStub = MailboxGrpc.newStub(channel)
                .withCallCredentials(new BearerToken(Constants.SERVER_AUTH_JWT));

        client = service;

        startEventListeners();
    }

    @SneakyThrows
    public void shutdown() {
        log.info("Shutting down event handler.");

        channel.shutdownNow().awaitTermination(15, TimeUnit.SECONDS);
    }

    /**
     * Send door state to the backend server
     */
    public void sendEventDoorStatus(DoorEventState state) {
        try {
            NotificationRequest request = NotificationRequest.newBuilder()
                    .setType(NotificationType.DOOR_STATUS)
                    .setData(objectMapper.writeValueAsString(Map.of("state", state.name())))
                    .setTimestamp(System.currentTimeMillis())
                    .build();

            sendMessage(request);
        } catch (Throwable error) {
            log.throwing(error);
        }
    }

    public void sendEventDoorState(DoorEventState state) {
        try {
            NotificationRequest request = NotificationRequest.newBuilder()
                    .setType(NotificationType.DOOR_STATE)
                    .setData(objectMapper.writeValueAsString(Map.of("state", state.name())))
                    .setTimestamp(System.currentTimeMillis())
                    .build();

            sendMessage(request);
        } catch (Throwable error) {
            log.throwing(error);
        }
    }

    /**
     * Send weight to the backend server
     */
    public void sendEventWeight(double weight) {
        try {
            NotificationRequest request = NotificationRequest.newBuilder()
                    .setType(NotificationType.WEIGHT_STATE)
                    .setData(objectMapper.writeValueAsString(Map.of("weight", weight)))
                    .setTimestamp(System.currentTimeMillis())
                    .build();

            sendMessage(request);
        } catch (Throwable error) {
            log.throwing(error);
        }
    }

    private void startEventListeners() {
        eventListener = asyncStub.startEventListener(new StreamObserver<>() {
            private boolean firstConnection = true;

            @Override
            public void onNext(NotificationRequest value) {
                if (firstConnection) {
                    NotificationRequest request = NotificationRequest.newBuilder()
                            .setType(NotificationType.RPC_LAZY_STARTUP)
                            .setTimestamp(System.currentTimeMillis())
                            .build();

                    eventListener.onNext(request);

                    NotificationRequest notification;
                    while ((notification = pendingNotifications.poll()) != null) {
                        eventListener.onNext(notification);
                    }

                    log.info("Connection to the server has been established.");

                    client.getStatusAdapter().setConnected(true);

                    firstConnection = false;
                }

                try {
                    if (value.getType() == NotificationType.DOOR_STATE) {
                        Map<String, String> states = objectMapper.readValue(value.getData(), new TypeReference<HashMap<String, String>>() {});

                        if (states.containsKey("state")) {
                            var state = DoorEventState.valueOf(states.get("state"));
                            if (state == DoorEventState.OPEN) {
                                client.getRelayAdapter().unlockDevice();
                            } else {
                                client.getRelayAdapter().lockDevice();
                            }
                        } else if (states.containsKey("registration")) {
                            client.getFingerprintAdapter().registerFingerprint();
                        }

                        log.info("Processed door state event requested by the server.");
                    }
                } catch (JsonProcessingException e) {
                    log.throwing(e);
                }
            }

            @Override
            public void onError(Throwable t) {
                log.error("Received an error: ", t);

                restartConnection();
            }

            @Override
            public void onCompleted() {
                log.info("Completed...");

                restartConnection();
            }

            private void restartConnection() {
                log.info("Restarting connection...");

                eventListener = null;

                client.getStatusAdapter().setConnected(false);

                ServerTaskExecutor.schedule(EventHandler.this::startEventListeners, 1, TimeUnit.SECONDS);
            }
        });
    }

    private synchronized void sendMessage(NotificationRequest request) {
        if (eventListener == null) {
            pendingNotifications.add(request);
        } else {
            eventListener.onNext(request);
        }
    }

    public enum DoorEventState {
        OPEN,
        CLOSE,
        LOCK,
        UNLOCKED,
    }
}
