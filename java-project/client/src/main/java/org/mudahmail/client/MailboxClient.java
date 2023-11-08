package org.mudahmail.client;

import com.pi4j.Pi4J;
import com.pi4j.context.Context;
import lombok.Getter;
import lombok.extern.log4j.Log4j2;
import org.mudahmail.client.adapters.*;
import org.mudahmail.client.module.EventHandler;
import org.mudahmail.client.scheduler.ServerTaskExecutor;

import java.util.List;
import java.util.Queue;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.atomic.AtomicBoolean;

@Getter
@Log4j2(topic = "MailboxClient")
public class MailboxClient {
    @Getter
    private static MailboxClient instance;

    private final AtomicBoolean isShutdown = new AtomicBoolean(false);

    private final ServerTaskExecutor taskManager;
    private final EventHandler eventHandler;

    private final Queue<Runnable> notifications = new ConcurrentLinkedQueue<>();

    private final Context pi4j;
    private final RelayAdapter relayAdapter;
    private final WeightAdapter weightAdapter;
    private final FingerprintAdapter fingerprintAdapter;
    private final StatusAdapter statusAdapter;
    private final BuzzerAdapter buzzerAdapter;

    public MailboxClient() {
        log.info("Starting Backend Client (Mailbox Business Logic)");

        instance = this;

        taskManager = new ServerTaskExecutor();

        pi4j = Pi4J.newAutoContext();

        relayAdapter = new RelayAdapter(this, pi4j);
        weightAdapter = new WeightAdapter(this, pi4j);
        fingerprintAdapter = new FingerprintAdapter(this);
        statusAdapter = new StatusAdapter(this, pi4j);
        buzzerAdapter = new BuzzerAdapter(this, pi4j);
        buzzerAdapter.addBuzzerQueue(List.of(1000L));

        new ButtonAdapter(this, pi4j);
        new MagnetAdapter(this, pi4j);

        eventHandler = new EventHandler(this);

        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            log.info("Received shutdown state");

            try {
                log.info("Shutting down RaspberryPI library.");

                pi4j.shutdown();
                taskManager.shutdown();
                eventHandler.shutdown();

                log.info("Server service has been gracefully stopped, program exited.");
            } catch (Throwable e) {
                log.error("An exception was thrown while handling shutdown signal.", e);
            }
        }));
    }
}
