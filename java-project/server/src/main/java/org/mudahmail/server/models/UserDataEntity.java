package org.mudahmail.server.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.Objects;

@Getter
@Setter
@Entity
@Table(name = "user_data")
public class UserDataEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "email", nullable = false, length = 191)
    private String email;

    @Basic
    @Column(name = "user_snowflake", nullable = false, length = 191)
    private String userSnowflake;

    @Basic
    @Column(name = "password", nullable = false)
    private String password;

    @Basic
    @Column(name = "is_admin", nullable = false)
    private boolean isAdmin;

    @Basic
    @Column(name = "is_verified", nullable = false)
    private boolean isVerified;

    @Basic
    @Column(name = "device_auth_token")
    private String deviceAuthToken;

    @Basic
    @Column(name = "user_picture_path", length = 191)
    private String userPicturePath;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UserDataEntity that = (UserDataEntity) o;
        return isAdmin == that.isAdmin && isVerified == that.isVerified && Objects.equals(email, that.email) && Objects.equals(userSnowflake, that.userSnowflake) && Objects.equals(password, that.password) && Objects.equals(deviceAuthToken, that.deviceAuthToken) && Objects.equals(userPicturePath, that.userPicturePath);
    }

    @Override
    public int hashCode() {
        return Objects.hash(email, userSnowflake, password, isAdmin, isVerified, deviceAuthToken, userPicturePath);
    }
}
