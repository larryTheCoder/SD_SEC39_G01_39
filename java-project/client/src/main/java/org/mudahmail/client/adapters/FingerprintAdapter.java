package org.mudahmail.client.adapters;

import lombok.SneakyThrows;
import lombok.extern.log4j.Log4j2;
import org.mudahmail.client.MailboxClient;
import org.mudahmail.client.scheduler.ServerTaskExecutor;
import sk.mimac.fingerprint.adafruit.AdafruitSensor;

import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;

@Log4j2
public class FingerprintAdapter implements Runnable {
    private final AdafruitSensor sensor;
    private final AtomicBoolean registration = new AtomicBoolean(false);
    private final MailboxClient client;

    @SneakyThrows
    public FingerprintAdapter(MailboxClient client) {
        this.client = client;

        this.sensor = new AdafruitSensor("/dev/ttyUSB0");
        this.sensor.connect();

        ServerTaskExecutor.scheduleRepeating(this, 1, 1, TimeUnit.SECONDS, true);
    }

    public void registerFingerprint() {
        log.info("Starting registration process.");

        registration.compareAndSet(false, true);
    }

    @SneakyThrows
    @Override
    public void run() {
        log.info("Status: {}", sensor.isConnected());

        if (sensor.hasFingerprint()) {
            // Finger is on sensor
            Integer fingerId = sensor.searchFingerprint();
            if (fingerId != null) { // Already known fingerprint
                log.info("Scanned fingerprint with ID " + fingerId);

                client.getRelayAdapter().unlockDevice();
            } else if (registration.compareAndExchange(true, false)) { // New fingerprint
                // Release finger from sensor ...
                while (sensor.hasFingerprint()) {
                    Thread.sleep(50);
                }
                // ... and put it back on (model has to be calculated from two images)
                byte[] model = null;
                while ((model = sensor.createModel()) == null) {
                    Thread.sleep(50);
                }
                sensor.saveStoredModel(1);
                // Optional: store model also eslewhere
            } else {
                log.info("No Match");
            }
        }
    }
}
