package org.mudahmail.client.adapters;

import com.pi4j.context.Context;
import com.pi4j.io.gpio.digital.DigitalInput;
import com.pi4j.io.gpio.digital.DigitalState;
import com.pi4j.io.gpio.digital.PullResistance;
import lombok.extern.log4j.Log4j2;
import org.mudahmail.client.MailboxClient;
import org.mudahmail.client.utils.Constants;

@Log4j2(topic = "Button Adapter")
public class ButtonAdapter {
    public ButtonAdapter(MailboxClient client, Context pi4j) {
        var resetConfig = DigitalInput.newConfigBuilder(pi4j)
                .id("Reset button")
                .name("Mudahmail reset button.")
                .address(Constants.GPIO_PORT_RESET_PACKAGE)
                .pull(PullResistance.PULL_DOWN)
                .debounce(3000L)
                .provider("pigpio-digital-input");

        var registerConfig = DigitalInput.newConfigBuilder(pi4j)
                .id("Registration button")
                .name("Fingerprint registration button")
                .address(Constants.GPIO_PORT_REGISTRATION)
                .pull(PullResistance.PULL_DOWN)
                .debounce(3000L)
                .provider("pigpio-digital-input");

        pi4j.create(resetConfig).addListener(event -> {
            if (event.state() == DigitalState.HIGH) {
                System.exit(0);
            }
        });

        pi4j.create(registerConfig).addListener(event -> {
            if (event.state() == DigitalState.HIGH) {
                client.getFingerprintAdapter().registerFingerprint();
            }
        });
    }
}
