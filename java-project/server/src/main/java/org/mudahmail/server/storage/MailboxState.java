package org.mudahmail.server.storage;

import lombok.Getter;
import lombok.Setter;

/**
 * Mailbox storage states, contains all the information that is known by the mailbox itself.
 */
@Getter
@Setter
public class MailboxState {
    private String deviceUUID;
    private boolean locked;
    private boolean doorOpen;
    private double lockedWeight;
    private double currentWeight;
    private Long lastReceived;
}
