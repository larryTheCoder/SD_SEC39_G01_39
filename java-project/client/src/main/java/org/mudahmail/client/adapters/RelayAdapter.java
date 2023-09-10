package org.mudahmail.client.adapters;

import com.pi4j.context.Context;
import com.pi4j.io.gpio.digital.DigitalOutput;
import com.pi4j.io.gpio.digital.DigitalState;
import lombok.extern.log4j.Log4j2;
import org.mudahmail.client.MailboxClient;
import org.mudahmail.client.module.EventHandler;
import org.mudahmail.client.utils.Constants;

@Log4j2(topic = "Relay Adapter")
public class RelayAdapter {

    private final DigitalOutput output;
    private final MailboxClient client;

    public RelayAdapter(MailboxClient client, Context pi4j) {
        var relayConfig = DigitalOutput.newConfigBuilder(pi4j)
                .id("DOOR_RELAY")
                .name("Relay switch for solenoid lock")
                .address(Constants.GPIO_PORT_RELAY)
                .shutdown(DigitalState.LOW)
                .initial(DigitalState.HIGH)
                .provider("pigpio-digital-output");

        output = pi4j.create(relayConfig);
        output.addListener(System.out::println);

        this.client = client;
    }

    public void unlockDevice() {
        if (output.state() != DigitalState.HIGH) {
            client.getEventHandler().sendEventDoor(EventHandler.DoorEventState.LOCK);

            output.high();
        }
    }

    public void lockDevice() {
        if (output.state() != DigitalState.LOW) {
            client.getEventHandler().sendEventDoor(EventHandler.DoorEventState.UNLOCKED);

            output.low();
        }
    }
}
