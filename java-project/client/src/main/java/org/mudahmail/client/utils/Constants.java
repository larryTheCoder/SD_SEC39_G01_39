package org.mudahmail.client.utils;

public class Constants {
    public static final String CLIENT_AUTH_ID = System.getenv("SERVER_AUTH_ID");
    public static final String SERVER_ADDRESS = System.getenv("SERVER_ADDRESS");
    public static final int SERVER_PORT = Integer.parseInt(System.getenv("SERVER_PORT"));


}
