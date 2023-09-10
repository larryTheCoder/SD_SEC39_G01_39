package org.mudahmail.client.utils;

public class Constants {
    public static final String CLIENT_AUTH_ID = System.getenv("SERVER_AUTH_ID");
    public static final String SERVER_ADDRESS = System.getenv("SERVER_ADDRESS");
    public static final String SERVER_PORT = System.getenv("SERVER_PORT");

    // The relay input pin
    public static final int GPIO_PORT_RELAY = 17;

    // HX711 dual-channel weight sensor.
    public static final int GPIO_PORT_HX711_SCK = 15;
    public static final int GPIO_PORT_HX711_DAT = 16;

    public static final int GPIO_PORT_MAGNET_SENSOR = 24;
}
