package org.mudahmail.client.utils;

import io.grpc.Context;
import io.grpc.Metadata;

import static io.grpc.Metadata.ASCII_STRING_MARSHALLER;

public class Constants {
    public static final String BEARER_TYPE = "Bearer";
    public static final Metadata.Key<String> AUTHORIZATION_METADATA_KEY = Metadata.Key.of("Authorization", ASCII_STRING_MARSHALLER);

    public static final String SERVER_AUTH_JWT = System.getenv("SERVER_AUTH_JWT");
    public static final String SERVER_ADDRESS = System.getenv("SERVER_ADDRESS");
    public static final String SERVER_PORT = System.getenv("SERVER_PORT");

    public static final int GPIO_PORT_BUZZER = 16; // Buzzer
    public static final int GPIO_PORT_RELAY = 17;  // The relay input pin
    public static final int GPIO_PORT_REGISTRATION = 19; // The button for fingerprint registration.

    // HX711 dual-channel weight sensor.
    public static final int GPIO_PORT_HX711_SCK = 20;
    public static final int GPIO_PORT_HX711_DAT = 21;

    public static final int GPIO_PORT_RESET_PACKAGE = 23;
    public static final int GPIO_PORT_MAGNET_SENSOR = 24;
    public static final int GPIO_PORT_STATUS_NETWORK = 26;
}
