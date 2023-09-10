package org.mudahmail.client.adapters;

import sk.mimac.fingerprint.FingerprintSensor;
import sk.mimac.fingerprint.adafruit.AdafruitSensor;

public class FingerprintAdapter {
    public FingerprintAdapter() {
        // Connect (sensor is connected through UART to USB converter)
        //FingerprintSensor sensor = new AdafruitSensor("/dev/tty0");
        //sensor.connect();
    }
}
