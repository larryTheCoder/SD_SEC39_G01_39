package org.mudahmail.client.adapters;

import com.pi4j.context.Context;
import com.pi4j.io.gpio.digital.DigitalInput;
import com.pi4j.io.gpio.digital.DigitalOutput;
import com.pi4j.io.gpio.digital.DigitalState;
import lombok.extern.log4j.Log4j2;
import org.mudahmail.client.MailboxClient;
import org.mudahmail.client.scheduler.ServerTaskExecutor;
import org.mudahmail.client.utils.Constants;

import java.math.RoundingMode;
import java.text.DecimalFormat;
import java.util.concurrent.TimeUnit;

@Log4j2(topic = "WeightAdapter")
public class WeightAdapter implements Runnable {

    private static final double MINIMUM_WEIGHT = 0.050d;

    private final DigitalOutput pinCLK;
    private final DigitalInput pinDAT;
    private final MailboxClient client;

    private int gain = 64;

    public long emptyValue = 8565611;
    public double emptyWeight = 0.0d;
    public long calibrationValue = 9145891;
    public double calibrationWeight = 0.240d;

    public double weight = 0.0d;
    public long value = 0;

    private int delayWait = 6; // Wait for 6 seconds

    public WeightAdapter(MailboxClient client, Context pi4j) {
        var clockPin = DigitalOutput.newConfigBuilder(pi4j)
                .id("HX711_SCK")
                .name("Clock for HX711")
                .address(Constants.GPIO_PORT_HX711_SCK)
                .shutdown(DigitalState.LOW)
                .initial(DigitalState.LOW)
                .provider("pigpio-digital-output");

        this.pinCLK = pi4j.create(clockPin);

        var dataConfig = DigitalInput.newConfigBuilder(pi4j)
                .id("HX711_DAT")
                .name("Data output for HX711")
                .address(Constants.GPIO_PORT_HX711_DAT)
                .provider("pigpio-digital-input");

        this.pinDAT = pi4j.create(dataConfig);
        this.client = client;

        setGain(gain);

        ServerTaskExecutor.scheduleRepeating(this, 1, 1, TimeUnit.SECONDS, true);
    }

    public void read() {
        pinCLK.state(DigitalState.LOW);
        while (!isReady()) {
            sleep();
        }

        long count = 0;
        for (int i = 0; i < this.gain; i++) {
            pinCLK.state(DigitalState.HIGH);
            count = count << 1;
            pinCLK.state(DigitalState.LOW);
            if (pinDAT.isHigh()) {
                count++;
            }
        }

        pinCLK.state(DigitalState.HIGH);
        count = count ^ 0x800000;
        pinCLK.state(DigitalState.LOW);
        value = count;

        weight = (value - emptyValue) * ((calibrationWeight - emptyWeight) / (calibrationValue - emptyValue));
    }

    public void setGain(int gain) {
        switch (gain) {
            case 128 -> this.gain = 24; // channel A, gain factor 128
            case 64 -> this.gain = 26;  // channel A, gain factor 64
            case 32 -> this.gain = 25;  // channel B, gain factor 32
        }

        pinCLK.state(DigitalState.LOW);
        read();
    }

    public boolean isReady() {
        return (pinDAT.isLow());
    }

    private void sleep() {
        try {
            Thread.sleep(1);
        } catch (Exception ignored) {
        }
    }

    @Override
    public void run() {
        double totalRuns = 0.0;

        int averageTest = 10;
        for (int i = 0; i < averageTest; i++) {
            read();

            totalRuns += weight;
        }

        double averageWeight = Math.max(totalRuns / averageTest, 0.0);

        DecimalFormat df = new DecimalFormat("#.####");
        df.setRoundingMode(RoundingMode.CEILING);

        log.info("Weight: {}kg", df.format(averageWeight));

        // Do locking mechanism.
        if (averageWeight > MINIMUM_WEIGHT) {
            log.info("Above minimum, {}", delayWait);
            if ((--delayWait) <= 0) {
                client.getRelayAdapter().lockDevice();
                client.getEventHandler().sendEventWeight(averageWeight);
            }
        } else {
            delayWait = 10;
        }
    }
}
