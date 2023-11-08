package org.mudahmail.client.adapters;

import com.pi4j.context.Context;
import com.pi4j.io.gpio.digital.DigitalOutput;
import com.pi4j.io.gpio.digital.DigitalState;
import org.mudahmail.client.MailboxClient;
import org.mudahmail.client.utils.Constants;

import java.util.List;

public class StatusAdapter {
    private final DigitalOutput digitalOutput;
    private final MailboxClient client;

    public StatusAdapter(MailboxClient client, Context pi4j) {
        this.digitalOutput = pi4j.create(DigitalOutput.newConfigBuilder(pi4j)
                .id("LED Status")
                .name("LED")
                .address(Constants.GPIO_PORT_STATUS_NETWORK)
                .shutdown(DigitalState.LOW)
                .initial(DigitalState.LOW)
                .provider("pigpio-digital-output")
                .build());

        this.client = client;
    }

    public void setConnected(boolean connected) {
        if (connected) {
            if (digitalOutput.isLow()) {
                client.getBuzzerAdapter().addBuzzerQueue(List.of(150L, 150L, 150L, 150L));
            }

            digitalOutput.high();
        } else {
            if (digitalOutput.isHigh()) {
                client.getBuzzerAdapter().addBuzzerQueue(List.of(500L, 500L));
            }

            digitalOutput.low();
        }
    }
}
