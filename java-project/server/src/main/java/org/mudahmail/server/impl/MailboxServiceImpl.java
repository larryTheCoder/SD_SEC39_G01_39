package org.mudahmail.server.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.protobuf.Empty;
import io.grpc.Status;
import io.grpc.stub.StreamObserver;
import lombok.Getter;
import lombok.extern.log4j.Log4j2;
import org.mudahmail.rpc.MailboxGrpc;
import org.mudahmail.rpc.NotificationRequest;
import org.mudahmail.server.Service;
import org.mudahmail.server.storage.MailboxStorage;

import java.util.concurrent.ConcurrentHashMap;

import static org.mudahmail.rpc.NotificationType.RPC_LAZY_STARTUP;

@Log4j2(topic = "MailboxService")
public class MailboxServiceImpl extends MailboxGrpc.MailboxImplBase {

    // Example ID: 152fe6a0-9c84-47fa-a19d-142589d991ff

    private final Service service;

    @Getter
    private final ConcurrentHashMap<String, StreamObserver<NotificationRequest>> activeNotifications = new ConcurrentHashMap<>();

    public MailboxServiceImpl(Service service) {
        this.service = service;
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

                    var storage = MailboxStorage.getMailboxByUuid(clientId);

                    storage.setDeviceUUID(clientId);
                    storage.setLockedWeight(0.0);
                    storage.setCurrentWeight(0.0);
                    storage.setDoorOpen(false);
                    storage.setLocked(false);
                    storage.setLastReceived(System.currentTimeMillis());
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
