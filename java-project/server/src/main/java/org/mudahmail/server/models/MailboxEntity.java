package org.mudahmail.server.models;

import jakarta.persistence.*;
import lombok.Getter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Entity(name = "mailbox")
public class MailboxEntity {

    @Id
    @Column(name = "auth_token")
    private String authToken;

    @OneToMany(mappedBy = "biometricId", fetch = FetchType.EAGER)
    private List<BiometricInfo> biometricInfo = new ArrayList<>();

    @OneToMany(mappedBy = "eventId", fetch = FetchType.EAGER)
    private List<Events> eventsInfo = new ArrayList<>();
}