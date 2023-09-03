package org.mudahmail.server.models;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity(name = "mailbox")
public class Mailbox {

    @Id
    private String authToken;
    private String emailAddress;
    private String lastRegistered;

    @OneToMany(mappedBy = "biometricId")
    private List<BiometricInfo> biometricInfo = new ArrayList<>();

}
