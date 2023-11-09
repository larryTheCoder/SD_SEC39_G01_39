package org.mudahmail.server.impl;

import com.google.protobuf.Empty;
import io.grpc.Status;
import io.grpc.stub.StreamObserver;
import lombok.Getter;
import lombok.extern.log4j.Log4j2;
import org.mudahmail.rpc.*;
import org.mudahmail.server.storage.MailboxStorage;

@Log4j2(topic = "ServerService")
public class ServerServiceImpl extends ServerGrpc.ServerImplBase {
    @Getter
    private final MailboxService service;

    public ServerServiceImpl(MailboxService service) {
        this.service = service;
    }

    @Override
    public void getMailboxStates(MailboxStatesRequest request, StreamObserver<MailboxStatesResponse> responseObserver) {
        MailboxStatesResponse.Builder states = MailboxStatesResponse.newBuilder();

        request.getClientUuidList().forEach(client -> {
            var builder = MailboxState.newBuilder()
                    .setDeviceUUID(client)
                    .setOnline(false);

            if (MailboxStorage.isMailboxExists(client)) {
                var mailbox = MailboxStorage.getMailboxByUuid(client);

                builder.setLockedWeight(mailbox.getLockedWeight());
                builder.setCurrentWeight(mailbox.getCurrentWeight());
                builder.setDoorOpen(mailbox.isDoorOpen());
                builder.setLocked(mailbox.isLocked());
                builder.setLastReceived(mailbox.getLastReceived());
                builder.setOnline(mailbox.isOnline());
            }

            states.addStates(builder.build());
        });

        responseObserver.onNext(states.build());
        responseObserver.onCompleted();
    }

    @Override
    public void setDoorLockStatus(DoorLockStatusRequest request, StreamObserver<DoorRequestResponse> responseObserver) {
        String targetId = MailboxAuthInterceptor.USER_AUTHORITY.get();

        if (targetId == null) {
            responseObserver.onError(Status.INVALID_ARGUMENT.withDescription("User authority is not found.").asRuntimeException());
        } else if (!MailboxStorage.isMailboxExists(targetId)) {
            responseObserver.onError(Status.NOT_FOUND.withDescription("Device is not registered").asRuntimeException());
        } else if (!MailboxStorage.getMailboxByUuid(targetId).isOnline()) {
            responseObserver.onError(Status.NOT_FOUND.withDescription("Device is currently offline").asRuntimeException());
        } else {
            service.sendNotificationEmpty(targetId, request.getToggleLock() ? NotificationType.DOOR_LOCKED : NotificationType.DOOR_UNLOCKED);

            var doorResponse = DoorRequestResponse.newBuilder()
                    .setTimestamp(System.currentTimeMillis())
                    .setSuccess(true)
                    .build();

            responseObserver.onNext(doorResponse);
            responseObserver.onCompleted();
        }
    }

    @Override
    public void getBiometricList(Empty request, StreamObserver<BiometricsInfoResponse> responseObserver) {
        // TODO: biometrics list logic
    }

    @Override
    public void deleteBiometricId(Empty request, StreamObserver<BiometricsDeletionResponse> responseObserver) {
        // TODO: biometric delete logic
    }
}
