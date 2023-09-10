package org.mudahmail.client.adapters;

import com.pi4j.context.Context;
import com.pi4j.io.gpio.digital.DigitalInput;
import com.pi4j.io.gpio.digital.DigitalOutput;
import com.pi4j.io.gpio.digital.DigitalState;
import org.mudahmail.client.utils.Constants;

public class WeightAdapter {

    private final DigitalOutput pinCLK;
    private final DigitalInput pinDAT;
    private int gain;

    public long emptyValue = 0;
    public double emptyWeight = 0.0d;
    public long calibrationValue = 0;
    public double calibrationWeight = 0.0d;

    public double weight = 0.0d;
    public long value = 0;

    public WeightAdapter(Context pi4j) {
        pinCLK = pi4j.dout().create(Constants.GPIO_PORT_HX711_SCK);
        pinDAT = pi4j.din().create(Constants.GPIO_PORT_HX711_DAT);
        setGain(gain);
    }

    public void read() {
        pinCLK.state(DigitalState.LOW);
        while (!isReady()) {
            sleep();
        }

        long count = 0;
        for (int i = 0; i < this.gain; i++) {
            pinCLK.state(DigitalState.HIGH);
            count = count << 1;
            pinCLK.state(DigitalState.LOW);
            if (pinDAT.isHigh()) {
                count++;
            }
        }

        pinCLK.state(DigitalState.HIGH);
        count = count ^ 0x800000;
        pinCLK.state(DigitalState.LOW);
        value = count;

        weight = (value - emptyValue) * ((calibrationWeight - emptyWeight) / (calibrationValue - emptyValue));
    }

    public void setGain(int gain) {
        switch (gain) {
            case 128 -> this.gain = 24; // channel A, gain factor 128
            case 64 -> this.gain = 26;  // channel A, gain factor 64
            case 32 -> this.gain = 25;  // channel B, gain factor 32
        }

        pinCLK.state(DigitalState.LOW);
        read();
    }

    public boolean isReady() {
        return (pinDAT.isLow());
    }

    private void sleep() {
        try {
            Thread.sleep(1);
        } catch (Exception ignored) {
        }
    }
}
