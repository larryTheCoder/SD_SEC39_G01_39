package org.mudahmail.client.adapters;

import com.pi4j.context.Context;
import com.pi4j.io.gpio.digital.DigitalOutput;
import com.pi4j.io.gpio.digital.DigitalState;
import org.mudahmail.client.utils.Constants;

public class RelayAdapter {

    private final DigitalOutput output;

    public RelayAdapter(Context pi4j) {
        output = pi4j.dout().create(Constants.GPIO_PORT_RELAY);
        output.config().shutdownState(DigitalState.LOW);

        output.addListener(System.out::println);
    }

    public void unlockDevice() {
        output.high();
    }

    public void lockDevice() {
        output.low();
    }
}
