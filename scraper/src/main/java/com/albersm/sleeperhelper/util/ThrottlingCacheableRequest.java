package com.albersm.sleeperhelper.util;

import com.fasterxml.jackson.core.type.TypeReference;
import com.google.common.util.concurrent.RateLimiter;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.nio.file.Path;
import java.time.temporal.TemporalAmount;

public class ThrottlingCacheableRequest<T> extends CacheableRequest<T> {

    @SuppressWarnings("UnstableApiUsage")
    private final RateLimiter rateLimiter = RateLimiter.create(75);

    public ThrottlingCacheableRequest(HttpClient client, URI requestUri, String cacheFileName, String description,
                                      TypeReference<T> typeReference, TemporalAmount period)
            throws IOException, InterruptedException {
        super(client, requestUri, cacheFileName, description, typeReference, period);
    }

    @Override
    @SuppressWarnings("UnstableApiUsage")
    protected T executeRequest(Path fullCachePath) throws IOException, InterruptedException {
        rateLimiter.acquire();
        return super.executeRequest(fullCachePath);
    }
}
