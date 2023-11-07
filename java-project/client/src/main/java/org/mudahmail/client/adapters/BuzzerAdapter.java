package org.mudahmail.client.adapters;

import com.pi4j.context.Context;
import com.pi4j.io.gpio.digital.DigitalOutput;
import com.pi4j.io.gpio.digital.DigitalState;
import lombok.SneakyThrows;
import org.mudahmail.client.MailboxClient;
import org.mudahmail.client.scheduler.ServerTaskExecutor;
import org.mudahmail.client.utils.Constants;

import java.util.ArrayList;
import java.util.List;
import java.util.Queue;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.TimeUnit;

public class BuzzerAdapter implements Runnable {
    private final DigitalOutput buzzer;
    private final Queue<List<Long>> buzzerConfiguration = new ArrayBlockingQueue<>(4);

    public BuzzerAdapter(MailboxClient client, Context pi4j) {
        var clockPin = DigitalOutput.newConfigBuilder(pi4j)
                .id("BUZZER_IC")
                .name("Buzzer")
                .address(Constants.GPIO_PORT_BUZZER)
                .shutdown(DigitalState.LOW)
                .initial(DigitalState.LOW)
                .provider("pigpio-digital-output");

        this.buzzer = pi4j.create(clockPin);

        ServerTaskExecutor.scheduleRepeating(this, 1, 1, TimeUnit.SECONDS);
    }

    public void addBuzzerQueue(List<Long> config) {
        buzzerConfiguration.add(config);
    }

    @Override
    public void run() {
        List<Long> config;
        while ((config = buzzerConfiguration.poll()) != null) {
            config.forEach(o -> {
                buzzer.high();
                sleep(o);

                buzzer.low();
                sleep(o);
            });
        }
    }

    @SneakyThrows
    private void sleep(long millis){
        Thread.sleep(millis);
    }
}
