package org.mudahmail.server.models;

import jakarta.persistence.*;
import org.hibernate.annotations.LazyGroup;

import java.sql.Blob;

@Entity(name = "biometric_auth")
public class BiometricInfo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "biometric_id")
    private Long biometricId;

    @Lob
    @LazyGroup("lobs")
    @Basic(fetch = FetchType.LAZY)
    private Blob image;

    @ManyToOne
    private MailboxEntity device;
}
