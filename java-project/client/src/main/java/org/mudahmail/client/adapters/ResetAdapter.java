package org.mudahmail.client.adapters;

import com.pi4j.context.Context;
import com.pi4j.io.gpio.digital.DigitalInput;
import com.pi4j.io.gpio.digital.DigitalState;
import com.pi4j.io.gpio.digital.PullResistance;
import lombok.extern.log4j.Log4j2;
import org.mudahmail.client.utils.Constants;

@Log4j2(topic = "Reset Adapter")
public class ResetAdapter {
    public ResetAdapter(Context pi4j) {
        var buttonConfig = DigitalInput.newConfigBuilder(pi4j)
                .id("Reset button")
                .name("Reset this raspberry pi")
                .address(Constants.GPIO_PORT_RESET_PACKAGE)
                .pull(PullResistance.PULL_DOWN)
                .debounce(3000L)
                .provider("pigpio-digital-input");

        var button = pi4j.create(buttonConfig);

        button.addListener(event -> {
            if (event.state() == DigitalState.HIGH) {
                System.exit(0);
            }
        });
    }
}
