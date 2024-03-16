package com.albersm.sleeperhelper.util;

import java.net.http.HttpResponse;

public class HttpUtils {
    public static <T> HttpResponse<T> checkResponse(HttpResponse<T> response, String description) {
        if (response.statusCode() >= 400) {
            throw new RuntimeException(description + " Status code: " + response.statusCode()
                    + ".\n==== Start Body ===\n" + response.body() + "\n=== End Body ===");
        }
        return response;
    }
}
