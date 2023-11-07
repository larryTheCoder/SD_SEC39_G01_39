package org.mudahmail.client.adapters;

import lombok.SneakyThrows;
import lombok.extern.log4j.Log4j2;
import org.mudahmail.client.MailboxClient;
import org.mudahmail.client.scheduler.ServerTaskExecutor;
import sk.mimac.fingerprint.FingerprintException;
import sk.mimac.fingerprint.adafruit.AdafruitSensor;

import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;

@Log4j2
public class FingerprintAdapter implements Runnable {
    private final AdafruitSensor sensor;
    private final AtomicBoolean registration = new AtomicBoolean(false);
    private final MailboxClient client;

    private int currentSize;

    @SneakyThrows
    public FingerprintAdapter(MailboxClient client) {
        this.client = client;

        this.sensor = new AdafruitSensor("/dev/ttyAMA3");
        this.sensor.connect();

        currentSize = sensor.getTemplateCount();

        ServerTaskExecutor.scheduleRepeating(this, 1, 1, TimeUnit.SECONDS);
    }

    public void registerFingerprint() {
        client.getBuzzerAdapter().addBuzzerQueue(List.of(150L, 350L, 350L, 150L));

        log.info("Starting registration process.");

        registration.compareAndSet(false, true);
    }

    @Override
    public void run() {
        try {
            onRun();
        } catch (Exception exception) {
            log.throwing(exception);
        }
    }

    private void onRun() throws FingerprintException, InterruptedException {
        if (client.getRelayAdapter().isLocked()) {
            if (sensor.hasFingerprint()) {
                // Finger is on sensor
                Integer fingerId = sensor.searchFingerprint();
                if (fingerId != null) { // Already known fingerprint
                    log.info("Scanned fingerprint with ID " + fingerId);

                    client.getRelayAdapter().unlockDevice();
                } else {
                    log.info("No Match");

                    client.getBuzzerAdapter().addBuzzerQueue(List.of(350L, 350L, 350L, 350L, 350L));

                    Thread.sleep(TimeUnit.SECONDS.toMillis(5));
                }
            }
        } else if (sensor.hasFingerprint() && registration.compareAndExchange(true, false)) { // New fingerprint
            client.getBuzzerAdapter().addBuzzerQueue(List.of(350L, 150L));

            while (sensor.hasFingerprint()) {
                Thread.sleep(50);
            }

            client.getBuzzerAdapter().addBuzzerQueue(List.of(150L, 350L));

            // ... and put it back on (model has to be calculated from two images)
            byte[] model = null;
            while ((model = sensor.createModel()) == null) {
                Thread.sleep(50);
            }

            if (++currentSize > 127) {
                currentSize = 1;
            }

            sensor.saveStoredModel(currentSize);

            client.getBuzzerAdapter().addBuzzerQueue(List.of(350L, 150L, 150L, 350L));
        }
    }
}
