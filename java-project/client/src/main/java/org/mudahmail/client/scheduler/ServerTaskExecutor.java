package org.mudahmail.client.scheduler;

import lombok.NonNull;
import lombok.SneakyThrows;
import lombok.extern.log4j.Log4j2;

import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ThreadFactory;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Responsible for scheduling tasks
 */
@Log4j2(topic = "Task Scheduler")
public class ServerTaskExecutor {
    private static final ScheduledExecutorService executorService = Executors.newScheduledThreadPool(4, new ServerThreadExecutor());

    @SneakyThrows
    public void shutdown() {
        log.info("Shutting down task manager.");

        executorService.shutdownNow();
        if (!executorService.awaitTermination(2, TimeUnit.SECONDS)) {
            log.warn("Unable to shutdown executor service gracefully.");
        }
    }

    public static void schedule(Runnable task, long delay, TimeUnit unit) {
        executorService.schedule(task, delay, unit);
    }

    public static void scheduleRepeating(Runnable task, long delay, long period, TimeUnit unit) {
        executorService.scheduleAtFixedRate(task, delay, period, unit);
    }

    private static class ServerThreadExecutor implements ThreadFactory {
        private final AtomicInteger threadNumber = new AtomicInteger(1);

        public Thread newThread(@NonNull Runnable r) {
            Thread t = new Thread(r, "Asynchronous Thread Executor #" + threadNumber.getAndIncrement());
            t.setDaemon(true);
            return t;
        }
    }
}
