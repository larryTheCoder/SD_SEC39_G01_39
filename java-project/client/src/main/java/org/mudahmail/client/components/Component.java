package org.mudahmail.client.components;

import lombok.extern.log4j.Log4j2;

import java.util.logging.Logger;

@Log4j2(topic = "Component")
public abstract class Component {
    protected void logInfo(String msg) {
        log.info(() -> msg);
    }

    protected void logError(String msg) {
        log.error(() -> msg);
    }

    protected void logConfig(String msg) {
        log.debug(() -> msg);
    }

    protected void logDebug(String msg) {
        log.debug(() -> msg);
    }

    /**
     * Utility function to sleep for the specified amount of milliseconds.
     * An {@link InterruptedException} will be caught and ignored while setting the interrupt flag again.
     *
     * @param milliseconds Time in milliseconds to sleep
     */
    void delay(long milliseconds) {
        try {
            Thread.sleep(milliseconds);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}