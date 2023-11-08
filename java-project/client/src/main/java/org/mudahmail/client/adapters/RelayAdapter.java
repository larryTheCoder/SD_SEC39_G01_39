package org.mudahmail.client.adapters;

import com.pi4j.context.Context;
import com.pi4j.io.gpio.digital.DigitalOutput;
import com.pi4j.io.gpio.digital.DigitalState;
import lombok.extern.log4j.Log4j2;
import org.mudahmail.client.MailboxClient;
import org.mudahmail.client.module.EventHandler;
import org.mudahmail.client.utils.Constants;
import org.mudahmail.rpc.NotificationType;

import java.util.List;
import java.util.concurrent.TimeUnit;

@Log4j2(topic = "Relay Adapter")
public class RelayAdapter {

    private final DigitalOutput output;
    private final MailboxClient client;

    private Long lastUnlocked;

    public RelayAdapter(MailboxClient client, Context pi4j) {
        var relayConfig = DigitalOutput.newConfigBuilder(pi4j)
                .id("DOOR_RELAY")
                .name("Relay switch for solenoid lock")
                .address(Constants.GPIO_PORT_RELAY)
                .shutdown(DigitalState.LOW)
                .initial(DigitalState.HIGH)
                .provider("pigpio-digital-output");

        output = pi4j.create(relayConfig);

        this.lastUnlocked = System.currentTimeMillis();
        this.client = client;
    }

    public void unlockDevice() {
        if (!isLocked()) return;

        output.high();

        client.getBuzzerAdapter().addBuzzerQueue(List.of(350L));
        client.getEventHandler().sendEventNotification(NotificationType.DOOR_UNLOCKED);

        lastUnlocked = System.currentTimeMillis();
    }

    public void lockDevice() {
        if (isLocked()) return;

        output.low();

        client.getBuzzerAdapter().addBuzzerQueue(List.of(150L, 150L, 150L));
        client.getEventHandler().sendEventNotification(NotificationType.DOOR_LOCKED);
    }

    /**
     * @return Elapsed seconds in which the device was last unlocked.
     */
    public long getLastUnlocked() {
        return TimeUnit.MILLISECONDS.toSeconds(System.currentTimeMillis() - lastUnlocked);
    }

    /**
     * @return The state of the device either being locked or unlocked.
     */
    public boolean isLocked() {
        return output.state() != DigitalState.HIGH;
    }
}
