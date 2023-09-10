package org.mudahmail.client.utils;

public class Constants {
    public static final String CLIENT_AUTH_ID = System.getenv("SERVER_AUTH_ID");
    public static final String SERVER_ADDRESS = System.getenv("SERVER_ADDRESS");
    public static final int SERVER_PORT = Integer.parseInt(System.getenv("SERVER_PORT"));

    // The relay input pin
    public static final int GPIO_PORT_RELAY = 40;

    // HX711 dual-channel weight sensor.
    public static final int GPIO_PORT_HX711_SCK = 41;
    public static final int GPIO_PORT_HX711_DAT = 42;

    // TODO: Pins for the thumbprint scanner.
}
