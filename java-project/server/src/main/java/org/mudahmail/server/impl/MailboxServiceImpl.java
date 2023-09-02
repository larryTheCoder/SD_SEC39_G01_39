package org.mudahmail.server.impl;

import io.grpc.stub.StreamObserver;
import org.mudahmail.rpc.MailboxGrpc;
import org.mudahmail.rpc.NotificationRequest;
import org.mudahmail.rpc.RegistrationRequest;
import org.mudahmail.server.Service;

public class MailboxServiceImpl extends MailboxGrpc.MailboxImplBase {

    private final Service service;

    public MailboxServiceImpl(Service service) {
        this.service = service;
    }

    @Override
    public void doAuthentication(RegistrationRequest request, StreamObserver<RegistrationRequest> responseObserver) {
        super.doAuthentication(request, responseObserver);
    }

    @Override
    public StreamObserver<NotificationRequest> doNotification(StreamObserver<NotificationRequest> responseObserver) {
        return super.doNotification(responseObserver);
    }
}
