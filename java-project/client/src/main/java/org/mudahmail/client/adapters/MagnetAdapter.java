package org.mudahmail.client.adapters;

import com.pi4j.context.Context;
import com.pi4j.io.gpio.digital.DigitalInput;
import com.pi4j.io.gpio.digital.DigitalState;
import com.pi4j.io.gpio.digital.PullResistance;
import lombok.extern.log4j.Log4j2;
import org.mudahmail.client.MailboxClient;
import org.mudahmail.client.module.EventHandler;
import org.mudahmail.client.utils.Constants;

@Log4j2(topic = "Magnet")
public class MagnetAdapter {
    public MagnetAdapter(MailboxClient client, Context pi4j) {
        var buttonConfig = DigitalInput.newConfigBuilder(pi4j)
                .id("Magnetic Sensor")
                .name("Magnet Detection Thingy")
                .address(Constants.GPIO_PORT_MAGNET_SENSOR)
                .pull(PullResistance.PULL_DOWN)
                .debounce(3000L)
                .provider("pigpio-digital-input");

        var button = pi4j.create(buttonConfig);

        button.addListener(event -> {
            if (event.state() == DigitalState.LOW) {
                client.getEventHandler().sendEventDoor(EventHandler.DoorEventState.OPEN);
            } else {
                client.getEventHandler().sendEventDoor(EventHandler.DoorEventState.CLOSE);
            }
        });
    }
}
