package org.mudahmail.server.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.protobuf.Empty;
import io.grpc.Status;
import io.grpc.stub.StreamObserver;
import lombok.extern.log4j.Log4j2;
import org.mudahmail.rpc.MailboxGrpc;
import org.mudahmail.rpc.NotificationRequest;
import org.mudahmail.rpc.NotificationType;
import org.mudahmail.server.Service;
import org.mudahmail.server.models.EventsEntity;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import static org.mudahmail.rpc.NotificationType.*;

@Log4j2(topic = "MailboxService")
public class MailboxServiceImpl extends MailboxGrpc.MailboxImplBase {

    // Example ID: 152fe6a0-9c84-47fa-a19d-142589d991ff

    private final Service service;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final ConcurrentHashMap<String, StreamObserver<NotificationRequest>> activeNotifications = new ConcurrentHashMap<>();

    public MailboxServiceImpl(Service service) {
        this.service = service;
    }

    public void sendNotification(String id, EventsEntity.EventTypeEntity event, Map<String, String> data) {
        try {
            var notification = activeNotifications.get(id);
            if (notification == null) {
                return;
            }

            NotificationType type = null;
            switch (event) {
                case DOOR_STATE -> type = DOOR_STATE;
                case DOOR_STATUS -> type = DOOR_STATUS;
                case WEIGHT_STATE -> type = WEIGHT_STATE;
            }

            if (type == null) {
                throw new RuntimeException("Type should have been defined");
            }

            notification.onNext(NotificationRequest.newBuilder()
                    .setTimestamp(System.currentTimeMillis())
                    .setData(objectMapper.writeValueAsString(data))
                    .setType(type)
                    .build()
            );
        } catch (Throwable t) {
            log.throwing(t);
        }
    }

    @Override
    public void testEventListener(NotificationRequest request, StreamObserver<Empty> responseObserver) {
        String clientId = MailboxAuthInterceptor.USER_IDENTITY.get();

        var listener = activeNotifications.get(clientId);

        if (listener == null) {
            responseObserver.onError(Status.NOT_FOUND.withDescription("A stream listener with that id is not found.").asRuntimeException());
        } else {
            listener.onNext(request);

            responseObserver.onNext(Empty.newBuilder().build());
            responseObserver.onCompleted();
        }
    }

    @Override
    public StreamObserver<NotificationRequest> startEventListener(StreamObserver<NotificationRequest> listener) {
        String clientId = MailboxAuthInterceptor.USER_IDENTITY.get();
        log.info("Client with uuid: {} is connected", clientId);

        NotificationRequest request = NotificationRequest.newBuilder()
                .setType(RPC_LAZY_STARTUP)
                .setTimestamp(System.currentTimeMillis())
                .build();

        listener.onNext(request);

        return new StreamObserver<>() {
            @Override
            public void onNext(NotificationRequest request) {
                if (!activeNotifications.containsKey(clientId)) {
                    activeNotifications.put(clientId, listener);
                }

                if (request.getType() != RPC_LAZY_STARTUP) {
                    service.getDatabaseManager().updateNotification(clientId, request);
                }
            }

            @Override
            public void onError(Throwable t) {
                if (Status.fromThrowable(t).getCode() != Status.Code.CANCELLED) {
                    log.error("Received an error", t);
                }

                unregisterListener();
            }

            @Override
            public void onCompleted() {
                unregisterListener();
            }

            private void unregisterListener() {
                if (clientId != null) {
                    activeNotifications.remove(clientId);
                }

                listener.onCompleted();
            }
        };
    }
}
