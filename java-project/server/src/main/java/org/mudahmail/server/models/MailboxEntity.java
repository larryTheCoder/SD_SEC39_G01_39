package org.mudahmail.server.models;

import jakarta.persistence.*;
import lombok.Getter;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Getter
@Entity
@Table(name = "mailbox", schema = "mailbox_service")
public class MailboxEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "auth_token", nullable = false, length = 255)
    private String authToken;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        MailboxEntity that = (MailboxEntity) o;
        return Objects.equals(authToken, that.authToken);
    }

    @Override
    public int hashCode() {
        return Objects.hash(authToken);
    }
}