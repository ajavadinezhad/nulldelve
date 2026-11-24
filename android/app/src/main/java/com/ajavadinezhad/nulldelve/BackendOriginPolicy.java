package com.ajavadinezhad.nulldelve;

import java.net.URI;
import java.util.Locale;
import java.util.Map;

/** Optional HTTPS REST access; never permit remote documents or executable assets. */
final class BackendOriginPolicy {
    private static final String LOCAL_ORIGIN = "https://appassets.androidplatform.net";
    private final String host, publishableKey;
    private BackendOriginPolicy(String host, String key) { this.host = host; this.publishableKey = key; }
    static BackendOriginPolicy disabled() { return new BackendOriginPolicy(null, ""); }
    static BackendOriginPolicy fromConfig(String url, String key) {
        if (url == null || key == null || key.isEmpty() || key.length() > 4096) return disabled();
        try {
            URI uri = new URI(url);
            String host = uri.getHost();
            if (!"https".equals(uri.getScheme()) || host == null || uri.getPort() != -1
                    || uri.getRawUserInfo() != null || uri.getRawQuery() != null || uri.getRawFragment() != null
                    || !(uri.getRawPath().isEmpty() || "/".equals(uri.getRawPath()))
                    || !host.matches("[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\\.supabase\\.co")) return disabled();
            return new BackendOriginPolicy(host, key);
        } catch (Exception ignored) { return disabled(); }
    }
    private static String header(Map<String, String> headers, String name) {
        if (headers != null) for (Map.Entry<String, String> entry : headers.entrySet())
            if (name.equalsIgnoreCase(entry.getKey())) return entry.getValue();
        return null;
    }
    boolean allows(String method, String url, boolean mainFrame, Map<String, String> headers) {
        if (host == null || mainFrame || url == null || method == null) return false;
        try {
            URI uri = new URI(url);
            if (!"https".equals(uri.getScheme()) || !host.equals(uri.getHost()) || uri.getPort() != -1
                    || uri.getRawUserInfo() != null || uri.getRawFragment() != null) return false;
            String path = uri.getRawPath();
            if (path == null || !path.equals(uri.getPath()) || !path.equals(uri.normalize().getRawPath())
                    || !(path.startsWith("/auth/v1/") || path.startsWith("/rest/v1/") || path.startsWith("/functions/v1/"))) return false;
            String destination = header(headers, "Sec-Fetch-Dest"), origin = header(headers, "Origin");
            if (destination != null && !"empty".equals(destination)) return false;
            if (origin != null && !LOCAL_ORIGIN.equals(origin)) return false;
            if ("OPTIONS".equals(method)) {
                String requestedMethod = header(headers, "Access-Control-Request-Method");
                String requestedHeaders = header(headers, "Access-Control-Request-Headers");
                return LOCAL_ORIGIN.equals(origin) && requestedMethod != null
                        && requestedMethod.matches("GET|POST|PUT|PATCH|DELETE|HEAD")
                        && requestedHeaders != null && ("," + requestedHeaders.toLowerCase(Locale.ROOT).replace(" ", "") + ",").contains(",apikey,");
            }
            return method.matches("GET|POST|PUT|PATCH|DELETE|HEAD") && publishableKey.equals(header(headers, "apikey"));
        } catch (Exception ignored) { return false; }
    }
}
