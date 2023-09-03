package org.mudahmail.server.models;

import jakarta.persistence.*;

// Events class responsible in storing "what had happened to our mailbox" in a
// simple representable object.
@Entity(name = "events")
public class Events {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long eventId;

    @Enumerated(EnumType.STRING)
    private MailEvent eventType;

    private String jsonData;

    public enum MailEvent {
        DOOR_STATE,
        WEIGHT_STATE,
        MOVEMENT_DETECTION;
    }
}
