package org.mudahmail.client.module;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.grpc.ManagedChannel;
import io.grpc.Status;
import io.grpc.netty.NettyChannelBuilder;
import io.grpc.stub.StreamObserver;
import lombok.extern.log4j.Log4j2;
import org.mudahmail.client.MailboxClient;
import org.mudahmail.client.scheduler.ServerTaskExecutor;
import org.mudahmail.client.utils.Constants;
import org.mudahmail.rpc.MailboxGrpc;
import org.mudahmail.rpc.NotificationRequest;
import org.mudahmail.rpc.NotificationType;
import org.mudahmail.rpc.RegistrationRequest;

import java.net.InetSocketAddress;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.Map;
import java.util.Queue;
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

    private StreamObserver<NotificationRequest> eventListener = null;

    public EventHandler(MailboxClient service) {
        ManagedChannel channel = NettyChannelBuilder.forAddress(new InetSocketAddress(Constants.SERVER_ADDRESS, Constants.SERVER_PORT))
                .enableRetry()
                .usePlaintext()
                .build();

        asyncStub = MailboxGrpc.newStub(channel);
        client = service;

        startConnection();
    }

    /**
     * Send door state to the backend server
     */
    public void sendEventDoor(DoorEventState state) {
        try {
            NotificationRequest request = NotificationRequest.newBuilder()
                    .setRegistrationId(Constants.CLIENT_AUTH_ID)
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
    public void sendEventWeight(float weight) {
        try {
            NotificationRequest request = NotificationRequest.newBuilder()
                    .setRegistrationId(Constants.CLIENT_AUTH_ID)
                    .setType(NotificationType.WEIGHT_STATE)
                    .setData(objectMapper.writeValueAsString(Map.of("weight", weight)))
                    .setTimestamp(System.currentTimeMillis())
                    .build();

            sendMessage(request);
        } catch (Throwable error) {
            log.throwing(error);
        }
    }

    private void startConnection() {
        RegistrationRequest request = RegistrationRequest.newBuilder()
                .setRegistrationId(Constants.CLIENT_AUTH_ID)
                .setUnregistered(false)
                .build();

        asyncStub.startAuthHandler(request, new StreamObserver<>() {
            @Override
            public void onNext(RegistrationRequest value) {
                if (value.getRegistered()) {
                    startEventListeners();
                }
            }

            @Override
            public void onError(Throwable throwable) {
                log.throwing(throwable);

                restartRegistration();
            }

            @Override
            public void onCompleted() {
                restartRegistration();
            }

            private void restartRegistration() {
                ServerTaskExecutor.schedule(EventHandler.this::startConnection, 5, TimeUnit.SECONDS);
            }
        });
    }

    private void startEventListeners() {
        eventListener = asyncStub.startEventListener(new StreamObserver<>() {
            private boolean firstConnection = true;

            @Override
            public void onNext(NotificationRequest value) {
                if (firstConnection) {
                    NotificationRequest request = NotificationRequest.newBuilder()
                            .setRegistrationId(Constants.CLIENT_AUTH_ID)
                            .setType(NotificationType.REQUEST_HELLO)
                            .setTimestamp(System.currentTimeMillis())
                            .build();

                    eventListener.onNext(request);

                    NotificationRequest notification;
                    while ((notification = pendingNotifications.poll()) != null) {
                        eventListener.onNext(notification);
                    }

                    firstConnection = false;
                }

                try {
                    if (value.getType() == NotificationType.DOOR_STATE) {
                        Map<String, String> states = objectMapper.readValue(value.getData(), new TypeReference<HashMap<String, String>>() {});

                        var state = DoorEventState.valueOf(states.get("state"));
                        if (state == DoorEventState.OPEN) {
                            client.getRelayAdapter().unlockDevice();
                        } else {
                            client.getRelayAdapter().lockDevice();
                        }

                        log.info("Processed door state event requested by the server.");
                    }
                } catch (JsonProcessingException e) {
                    throw new RuntimeException(e);
                }
            }

            @Override
            public void onError(Throwable t) {
                if (Status.fromThrowable(t).getCode() != Status.Code.CANCELLED) {
                    log.error("Received an error: ", t);
                }

                restartConnection();
            }

            @Override
            public void onCompleted() {
                restartConnection();
            }

            private void restartConnection() {
                eventListener = null;

                ServerTaskExecutor.schedule(EventHandler.this::startEventListeners, 5, TimeUnit.SECONDS);
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

    enum DoorEventState {
        OPEN,
        CLOSE,
    }
}