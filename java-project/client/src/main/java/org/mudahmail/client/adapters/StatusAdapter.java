package org.mudahmail.client.adapters;

import com.pi4j.context.Context;
import com.pi4j.io.gpio.digital.DigitalOutput;
import com.pi4j.io.gpio.digital.DigitalState;
import org.mudahmail.client.utils.Constants;

public class StatusAdapter {
    private final DigitalOutput digitalOutput;

    public StatusAdapter(Context pi4j) {
        this.digitalOutput = pi4j.create(DigitalOutput.newConfigBuilder(pi4j)
                .id("LED Status")
                .name("LED")
                .address(Constants.GPIO_PORT_STATUS_NETWORK)
                .shutdown(DigitalState.LOW)
                .initial(DigitalState.LOW)
                .provider("pigpio-digital-output")
                .build());

    }

    public void setConnected(boolean connected) {
        if (connected) {
            digitalOutput.high();
        } else {
            digitalOutput.low();
        }
    }
}
