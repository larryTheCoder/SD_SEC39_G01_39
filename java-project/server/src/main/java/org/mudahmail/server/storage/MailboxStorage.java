package org.mudahmail.server.storage;

import net.jodah.expiringmap.ExpirationPolicy;
import net.jodah.expiringmap.ExpiringMap;

import java.util.concurrent.TimeUnit;

public class MailboxStorage {
    private static final ExpiringMap<String, MailboxState> mailboxes = ExpiringMap.builder()
            .expiration(2, TimeUnit.HOURS)
            .expirationPolicy(ExpirationPolicy.ACCESSED)
            .build();

    public static boolean isMailboxExists(String uuid) {
        return mailboxes.containsKey(uuid);
    }

    public static MailboxState getMailboxByUuid(String uuid) {
        if (mailboxes.containsKey(uuid)) {
            return mailboxes.get(uuid);
        }

        MailboxState service = new MailboxState();
        mailboxes.put(uuid, service);

        return service;
    }
}
