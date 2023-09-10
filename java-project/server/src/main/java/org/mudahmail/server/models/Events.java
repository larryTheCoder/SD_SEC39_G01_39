package org.mudahmail.server.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

// Events class responsible in storing "what had happened to our mailbox" in a
// simple representable object.
@Getter
@Setter
@Entity(name = "events")
public class Events {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "event_id")
    private Long eventId;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false)
    private MailEvent eventType;

    @Column(name = "timestamp", nullable = false)
    private Long timestamp;

    @Column(name = "json_data")
    private String jsonData;

    @ManyToOne
    private MailboxEntity device;

    public enum MailEvent {
        DOOR_STATE,
        WEIGHT_STATE,
        MOVEMENT_DETECTION;
    }
}
