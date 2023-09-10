package org.mudahmail.server.database;

import jakarta.persistence.EntityManager;
import lombok.Getter;
import lombok.extern.log4j.Log4j2;
import org.hibernate.SessionFactory;
import org.hibernate.cfg.Configuration;
import org.mudahmail.rpc.NotificationRequest;
import org.mudahmail.server.models.Events;
import org.mudahmail.server.models.MailboxEntity;

@Log4j2(topic = "DatabaseManager")
public class DatabaseManager {
    private static final SessionFactory sessionFactory;

    static {
        try {
            System.out.println(System.getenv("POSTGRES_URL"));

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

    public void updateNotification(NotificationRequest request) {
        var device = getDeviceById(request.getRegistrationId());

        Events event = new Events();
        event.setDevice(device);
        switch (request.getType()) {
            case DOOR_STATE -> event.setEventType(Events.MailEvent.DOOR_STATE);
            case WEIGHT_STATE -> event.setEventType(Events.MailEvent.WEIGHT_STATE);
            case MOVEMENT_DETECTION -> event.setEventType(Events.MailEvent.MOVEMENT_DETECTION);
        }
        event.setJsonData(request.getData());
        event.setTimestamp(request.getTimestamp());

        getEntityManager().getTransaction().begin();
        getEntityManager().persist(event);
        getEntityManager().getTransaction().commit();
    }
}
