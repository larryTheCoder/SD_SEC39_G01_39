package org.mudahmail.client;

import lombok.extern.log4j.Log4j2;

@Log4j2(topic = "Bootstrap")
public class Bootstrap {
    public static void main(String[] args) {
        try {
            new MailboxClient();
        } catch (Exception throwing) {
            log.throwing(throwing);
        }
    }
}