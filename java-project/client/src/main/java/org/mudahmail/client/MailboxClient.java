package org.mudahmail.client;

import io.grpc.ManagedChannel;
import io.grpc.netty.NettyChannelBuilder;
import io.grpc.stub.StreamObserver;
import lombok.Getter;
import lombok.extern.log4j.Log4j2;
import org.mudahmail.client.scheduler.ServerTaskExecutor;
import org.mudahmail.client.utils.Constants;
import org.mudahmail.rpc.MailboxGrpc;
import org.mudahmail.rpc.RegistrationRequest;

import java.net.InetSocketAddress;
import java.util.Queue;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.function.Consumer;

@Getter
@Log4j2(topic = "MailboxClient")
public class MailboxClient {
    @Getter
    private static MailboxClient instance;

    private final ManagedChannel channel;
    private final MailboxGrpc.MailboxStub asyncStub;
    private final MailboxGrpc.MailboxBlockingStub stub;
    private final MailboxGrpc.MailboxFutureStub futureStub;

    private final AtomicBoolean isRunning = new AtomicBoolean(true);
    private final AtomicBoolean isShutdown = new AtomicBoolean(false);

    private final ServerTaskExecutor taskManager;

    private final Queue<Runnable> notifications = new ConcurrentLinkedQueue<>();

    public MailboxClient() {
        log.info("Starting Backend Client (Mailbox Business Logic)");

        instance = this;

        var mainThread = Thread.currentThread();
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            isRunning.compareAndSet(true, false);

            try {
                mainThread.join();
            } catch (Throwable e) {
                log.error("An exception was thrown while handling shutdown signal.", e);
            }
        }));

        channel = NettyChannelBuilder.forAddress(new InetSocketAddress(Constants.SERVER_ADDRESS, Constants.SERVER_PORT)).enableRetry().usePlaintext().build();
        asyncStub = MailboxGrpc.newStub(this.channel);
        stub = MailboxGrpc.newBlockingStub(this.channel);
        futureStub = MailboxGrpc.newFutureStub(this.channel);

        taskManager = new ServerTaskExecutor();

        // TODO: Start tasks and init stuff (to read sensors... etc).

        startConnection();
    }

    private void startConnection() {
        RegistrationRequest request = RegistrationRequest.newBuilder()
                .setRegistrationId(Constants.CLIENT_AUTH_ID)
                .setUnregistered(false)
                .build();

        asyncStub.doAuthentication(request, new StreamObserver<>() {
            @Override
            public void onNext(RegistrationRequest value) {
                if (!value.getRegistered()) {
                    restartRegistration();
                } else {
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

            }

            private void restartRegistration() {
                ServerTaskExecutor.schedule(MailboxClient.this::startConnection, 5, TimeUnit.SECONDS);
            }
        });
    }

    private void startEventListeners() {

    }

    public void start(Consumer<MailboxClient> startHook) {
        startHook.accept(this);

        while (isRunning.get()) {
            var lastTick = System.currentTimeMillis();

            taskManager.tick();

            var diffInTicks = System.currentTimeMillis() - lastTick;

            if (diffInTicks < 50) {
                sleepThread(lastTick, 50 - diffInTicks);
            }
        }

        shutdown();
    }


    public void shutdown() {
        if (isRunning.compareAndSet(true, false)) {
            return;
        }

        if (!isShutdown.compareAndSet(false, true)) {
            throw new IllegalCallerException("Trying to call shutdown twice.");
        }

        try {
            log.warn("Stopping Server gracefully.");

            taskManager.shutdown();

            log.warn("Server service has been gracefully stopped, program exited.");
        } catch (Throwable error) {
            log.error("Unable to shutdown Server service gracefully", error);
        }
    }

    /**
     * Multithreading functionality, wait for notifications from another thread. This will help
     * to reduce the time needed for a task to execute in the main thread.
     *
     * @param startSleeper The time of the sleep being executed.
     * @param millis       The time required for the thread to sleep.
     */
    private synchronized void sleepThread(long startSleeper, long millis) {
        try {
            long sleepTime;
            while ((sleepTime = (System.currentTimeMillis() - startSleeper)) < millis) {
                wait(millis - sleepTime);

                Runnable runnable;
                while ((runnable = notifications.poll()) != null) {
                    runnable.run();
                }
            }
        } catch (InterruptedException e) {
            log.error("Error occurred while trying to sleep", e);
        }
    }

    /**
     * Perform a callback action to the main thread, everything in this closure will
     * be executed within the main thread.
     */
    public synchronized void wakeupThread(Runnable executor) {
        notifications.add(executor);

        notify();
    }
}
