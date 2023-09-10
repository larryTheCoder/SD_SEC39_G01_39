package org.mudahmail.client.adapters;

import lombok.extern.log4j.Log4j2;
import org.mudahmail.client.components.Camera;

@Log4j2(topic = "CameraAdapter")
public class CameraAdapter implements Runnable {

    private final Camera camera;

    public CameraAdapter() {
        camera = new Camera();
    }

    @Override
    public void run() {

    }
}
