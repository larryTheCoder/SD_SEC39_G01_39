package org.mudahmail.server.database;

import com.google.common.base.MoreObjects;
import lombok.extern.log4j.Log4j2;
import org.hibernate.SessionFactory;
import org.hibernate.cfg.Configuration;

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

    public static SessionFactory getSessionFactory() {
        return sessionFactory;
    }

    public DatabaseManager() {

    }
}
