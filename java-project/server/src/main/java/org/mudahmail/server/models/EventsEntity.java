package org.mudahmail.server.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.Objects;

@Getter
@Setter
@Entity
@Table(name = "events")
public class EventsEntity {
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Id
    @Column(name = "event_id", nullable = false)
    private long eventId;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false)
    private EventTypeEntity eventType;

    @Basic
    @Column(name = "json_data")
    private String jsonData;

    @Basic
    @Column(name = "timestamp", nullable = false)
    private long timestamp;

    @Basic
    @Column(name = "device_auth_token")
    private String deviceAuthToken;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        EventsEntity that = (EventsEntity) o;
        return eventId == that.eventId && timestamp == that.timestamp && Objects.equals(eventType, that.eventType) && Objects.equals(jsonData, that.jsonData) && Objects.equals(deviceAuthToken, that.deviceAuthToken);
    }

    @Override
    public int hashCode() {
        return Objects.hash(eventId, eventType, jsonData, timestamp, deviceAuthToken);
    }

    public enum EventTypeEntity {
        DOOR_STATE,
        WEIGHT_STATE,
        MOVEMENT_DETECTION;
    }
}
