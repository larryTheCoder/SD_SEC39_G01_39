package org.mudahmail.server.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.Arrays;
import java.util.Objects;

@Getter
@Setter
@Entity
@Table(name = "biometric_auth")
public class BiometricAuthEntity {
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Id
    @Column(name = "biometric_id", nullable = false)
    private long biometricId;
    @Basic
    @Column(name = "image")
    private byte[] image;
    @Basic
    @Column(name = "device_auth_token")
    private String deviceAuthToken;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        BiometricAuthEntity that = (BiometricAuthEntity) o;
        return biometricId == that.biometricId && Arrays.equals(image, that.image) && Objects.equals(deviceAuthToken, that.deviceAuthToken);
    }

    @Override
    public int hashCode() {
        int result = Objects.hash(biometricId, deviceAuthToken);
        result = 31 * result + Arrays.hashCode(image);
        return result;
    }
}
