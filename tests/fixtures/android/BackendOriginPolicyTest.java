package com.ajavadinezhad.nulldelve;
import java.util.HashMap;
import java.util.Map;

public final class BackendOriginPolicyTest {
    private static final String PROJECT = "https://abcdefghijklmnopqrst.supabase.co";
    private static final String KEY = "sb_publishable_test-only-not-a-real-key";
    private static int checks;
    private static void check(boolean condition, String message) { checks++; if (!condition) throw new AssertionError(message); }
    private static Map<String, String> headers() {
        Map<String, String> headers = new HashMap<>(); headers.put("apikey", KEY);
        headers.put("Origin", "https://appassets.androidplatform.net"); headers.put("Sec-Fetch-Dest", "empty"); return headers;
    }
    public static void main(String[] args) {
        BackendOriginPolicy policy = BackendOriginPolicy.fromConfig(PROJECT, KEY);
        for (String path : new String[]{"/auth/v1/otp", "/auth/v1/verify", "/rest/v1/cloud_saves?user_id=eq.test", "/functions/v1/delete-account"})
            check(policy.allows("POST", PROJECT + path, false, headers()), "configured REST path " + path);
        for (String method : new String[]{"GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"})
            check(policy.allows(method, PROJECT + "/rest/v1/cloud_saves", false, headers()), "REST method " + method);
        for (String url : new String[]{PROJECT + "/storage/v1/object", PROJECT + "/script.js", PROJECT + "/auth/v1/../../evil", PROJECT + "/auth/v1/%2e%2e/evil", PROJECT + "/auth/v1/%2fscript", PROJECT + "/auth/v1/otp#fragment", "http://abcdefghijklmnopqrst.supabase.co/auth/v1/otp", "https://otherproject.supabase.co/auth/v1/otp", PROJECT + ".evil.test/auth/v1/otp", "https://user@abcdefghijklmnopqrst.supabase.co/auth/v1/otp", "https://abcdefghijklmnopqrst.supabase.co:443/auth/v1/otp", "https://example.org/auth/v1/otp"})
            check(!policy.allows("POST", url, false, headers()), "reject " + url);
        for (String url : new String[]{"", "https://example.org", "http://abcdefghijklmnopqrst.supabase.co", PROJECT + "/auth/v1/", PROJECT + "?x=1", PROJECT + "#fragment", "https://x.y.supabase.co", "https://-x.supabase.co", "https://user@abcdefghijklmnopqrst.supabase.co"})
            check(!BackendOriginPolicy.fromConfig(url, KEY).allows("POST", PROJECT + "/auth/v1/otp", false, headers()), "invalid config must disable " + url);
        check(!BackendOriginPolicy.disabled().allows("POST", PROJECT + "/auth/v1/otp", false, headers()), "offline default");
        check(!BackendOriginPolicy.fromConfig(PROJECT, "").allows("POST", PROJECT + "/auth/v1/otp", false, headers()), "missing key");
        check(!policy.allows("GET", PROJECT + "/auth/v1/otp", true, headers()), "remote top-level document");
        check(!policy.allows("CONNECT", PROJECT + "/auth/v1/otp", false, headers()), "unsafe method");
        Map<String, String> h = headers(); h.remove("apikey"); check(!policy.allows("GET", PROJECT + "/auth/v1/otp", false, h), "script/link without API header");
        h = headers(); h.put("apikey", "wrong-project-key"); check(!policy.allows("POST", PROJECT + "/auth/v1/otp", false, h), "wrong key");
        h = headers(); h.put("Sec-Fetch-Dest", "script"); check(!policy.allows("GET", PROJECT + "/auth/v1/otp", false, h), "script destination");
        h = headers(); h.put("Origin", "https://evil.test"); check(!policy.allows("POST", PROJECT + "/auth/v1/otp", false, h), "foreign origin");
        h = headers(); h.remove("apikey"); h.put("Access-Control-Request-Method", "POST"); h.put("Access-Control-Request-Headers", "authorization, apikey, content-type");
        check(policy.allows("OPTIONS", PROJECT + "/auth/v1/otp", false, h), "CORS preflight"); h.put("Access-Control-Request-Headers", "content-type");
        check(!policy.allows("OPTIONS", PROJECT + "/auth/v1/otp", false, h), "unrelated preflight");
        System.out.println("Backend origin policy: " + checks + " checks passed");
    }
}
