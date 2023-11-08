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
    public void setDoorLockStatus(DoorLockStatusRequest request, StreamObserver<DoorRequestResponse> responseObserver) {
        String targetId = MailboxAuthInterceptor.USER_AUTHORITY.get();

        if (targetId == null) {
            responseObserver.onError(Status.INVALID_ARGUMENT.withDescription("User authority is not found.").asRuntimeException());
        } else if (!MailboxStorage.isMailboxExists(targetId)) {
            responseObserver.onError(Status.NOT_FOUND.withDescription("Device is not registered or is offline").asRuntimeException());
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
