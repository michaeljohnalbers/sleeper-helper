package com.albersm.sleeperhelper.util;

import com.fasterxml.jackson.core.type.TypeReference;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.time.Period;
import java.time.temporal.TemporalAmount;

import static com.albersm.sleeperhelper.Scraper.OBJECT_MAPPER;
import static com.albersm.sleeperhelper.util.HttpUtils.checkResponse;

public class CacheableRequest <T> {

    private static final Path CACHE_DIR = Path.of("responseCache");

    private T response = null;
    private final String cacheFileName;

    protected final HttpClient client;
    protected final URI requestUri;
    protected final String description;
    protected final TypeReference<T> typeReference;
    private final TemporalAmount ttl;

    public CacheableRequest(HttpClient client, URI requestUri, String cacheFileName, String description,
                            TypeReference<T> typeReference) {
        this(client, requestUri, cacheFileName, description, typeReference, Period.ofDays(1));
    }

    public CacheableRequest(HttpClient client, URI requestUri, String cacheFileName, String description,
                            TypeReference<T> typeReference, TemporalAmount ttl) {
        this.cacheFileName = cacheFileName;
        this.client = client;
        this.description = description;
        this.requestUri = requestUri;
        this.typeReference = typeReference;
        this.ttl = ttl;
    }

    protected T executeRequest(Path fullCachePath) throws IOException, InterruptedException {
        var request = HttpRequest.newBuilder(requestUri).build();
        var response = client.send(request, HttpResponse.BodyHandlers.ofString());
        checkResponse(response, description);
        var body = response.body();
        Files.writeString(fullCachePath, body);
        return OBJECT_MAPPER.readValue(body, typeReference);
    }

    public T getResponse() throws IOException, InterruptedException {
        if (this.response == null) {
            if (!CACHE_DIR.toFile().exists()) {
                Files.createDirectories(CACHE_DIR);
            }

            Path fullCachePath = Path.of(CACHE_DIR.toString(), cacheFileName);
            boolean executeRequest = true;
            var cacheFile = fullCachePath.toFile();
            if (cacheFile.exists()) {
                var lastUpdated = Instant.ofEpochMilli(cacheFile.lastModified());
                var maxAge = Instant.now().minus(ttl);
                executeRequest = lastUpdated.isBefore(maxAge);
            }

            if (executeRequest) {
                this.response = executeRequest(fullCachePath);
            } else {
                this.response = OBJECT_MAPPER.readValue(cacheFile, typeReference);
            }
        }

        return response;
    }
}
