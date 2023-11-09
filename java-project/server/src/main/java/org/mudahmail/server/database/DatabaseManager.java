package org.mudahmail.server.database;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import lombok.Getter;
import lombok.extern.log4j.Log4j2;
import org.hibernate.SessionFactory;
import org.hibernate.cfg.Configuration;
import org.mudahmail.rpc.NotificationRequest;
import org.mudahmail.server.models.EventsEntity;
import org.mudahmail.server.models.MailboxEntity;
import org.mudahmail.server.storage.MailboxStorage;

import java.util.EnumSet;
import java.util.Map;

import static org.mudahmail.rpc.NotificationType.*;

@Log4j2(topic = "DatabaseManager")
public class DatabaseManager {
    private static final SessionFactory sessionFactory;

    private final ObjectMapper objectMapper = new ObjectMapper();

    static {
        try {
            Configuration configuration = new Configuration().configure("hibernate.cfg.xml");

            System.setProperty("db.connectionUrl", System.getenv("POSTGRES_URL"));
            System.setProperty("db.username", System.getenv("POSTGRES_USERNAME"));
            System.setProperty("db.password", System.getenv("POSTGRES_PASSWORD"));

            sessionFactory = configuration.buildSessionFactory();
        } catch (Throwable ex) {
            throw new ExceptionInInitializerError(ex);
        }
    }

    @Getter
    private final EntityManager entityManager;

    public static SessionFactory getSessionFactory() {
        return sessionFactory;
    }

    public DatabaseManager() {
        this.entityManager = getSessionFactory().createEntityManager();
    }

    public MailboxEntity getDeviceById(String id) {
        return getEntityManager().find(MailboxEntity.class, id);
    }

    public void updateNotification(String clientId, NotificationRequest request) {
        var device = getDeviceById(clientId);

        try (var session = getSessionFactory().getCurrentSession()) {
            var storage = MailboxStorage.getMailboxByUuid(clientId);
            var wasLocked = storage.isLocked();

            switch (request.getType()) {
                case DOOR_STATE_OPEN -> storage.setDoorOpen(true);
                case DOOR_STATE_CLOSED -> storage.setDoorOpen(false);
                case DOOR_LOCKED -> {
                    storage.setLocked(true);
                    storage.setLockedWeight(storage.getCurrentWeight());
                }
                case DOOR_UNLOCKED -> {
                    storage.setLocked(false);
                    storage.setLockedWeight(0.0);
                }
                case WEIGHT_STATE_UPDATE -> storage.setCurrentWeight(request.getDataDouble());
                // TODO: BIOMETRICS_DELETE, BIOMETRICS_ADD
            }

            storage.setLastReceived(System.currentTimeMillis());

            // Save these events into the database.
            if (EnumSet.of(DOOR_STATE_OPEN, DOOR_STATE_CLOSED, DOOR_LOCKED, DOOR_UNLOCKED).contains(request.getType())) {
                session.beginTransaction();

                if (request.getType().equals(DOOR_LOCKED)) {
                    var weightEntity = new EventsEntity();
                    weightEntity.setDeviceAuthToken(device.getAuthToken());
                    weightEntity.setEventType(EventsEntity.EventTypeEntity.WEIGHT_STATE_UPDATE);
                    weightEntity.setJsonData(objectMapper.writeValueAsString(Map.of("weight", storage.getCurrentWeight())));
                    weightEntity.setTimestamp(request.getTimestamp());

                    session.persist(weightEntity);
                }

                var event = new EventsEntity();
                event.setDeviceAuthToken(device.getAuthToken());
                switch (request.getType()) {
                    case DOOR_STATE_OPEN -> event.setEventType(EventsEntity.EventTypeEntity.DOOR_STATE_OPEN);
                    case DOOR_STATE_CLOSED -> event.setEventType(EventsEntity.EventTypeEntity.DOOR_STATE_CLOSED);
                    case DOOR_LOCKED -> event.setEventType(EventsEntity.EventTypeEntity.DOOR_LOCKED);
                    case DOOR_UNLOCKED -> event.setEventType(EventsEntity.EventTypeEntity.DOOR_UNLOCKED);
                }
                event.setTimestamp(request.getTimestamp());

                session.persist(event);
                session.getTransaction().commit();
            }
        } catch (JsonProcessingException e) {
            log.error("Unhandled exception: ", e);
        }
    }
}
