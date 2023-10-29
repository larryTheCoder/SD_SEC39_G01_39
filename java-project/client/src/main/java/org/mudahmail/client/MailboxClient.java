package org.mudahmail.client;

import com.pi4j.Pi4J;
import com.pi4j.context.Context;
import com.pi4j.util.Console;
import lombok.Getter;
import lombok.extern.log4j.Log4j2;
import org.mudahmail.client.adapters.*;
import org.mudahmail.client.module.EventHandler;
import org.mudahmail.client.scheduler.ServerTaskExecutor;
import org.mudahmail.client.utils.PrintInfo;

import java.util.Queue;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.function.Consumer;

@Getter
@Log4j2(topic = "MailboxClient")
public class MailboxClient {
    @Getter
    private static MailboxClient instance;

    private final AtomicBoolean isRunning = new AtomicBoolean(true);
    private final AtomicBoolean isShutdown = new AtomicBoolean(false);

    private final ServerTaskExecutor taskManager;
    private final EventHandler eventHandler;

    private final Queue<Runnable> notifications = new ConcurrentLinkedQueue<>();

    private final Context pi4j;
    private final RelayAdapter relayAdapter;
    private final WeightAdapter weightAdapter;
    private final FingerprintAdapter fingerprintAdapter;
    private final StatusAdapter statusAdapter;

    public MailboxClient() throws ClassNotFoundException {
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

        taskManager = new ServerTaskExecutor();

        pi4j = Pi4J.newAutoContext();

        final var console = new Console();

        PrintInfo.printProviders(console, pi4j);

        relayAdapter = new RelayAdapter(this, pi4j);
        weightAdapter = new WeightAdapter(this, pi4j);
        fingerprintAdapter = new FingerprintAdapter(this);
        statusAdapter = new StatusAdapter(pi4j);

        new ResetAdapter(pi4j);
        new MagnetAdapter(this, pi4j);

        eventHandler = new EventHandler(this);

        // OPTIONAL: print the registry
        PrintInfo.printRegistry(console, pi4j);
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
