package com.ajavadinezhad.nulldelve;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.SystemClock;
import android.view.View;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;
import android.widget.FrameLayout;
import androidx.webkit.WebViewAssetLoader;
import org.json.JSONObject;
import java.io.ByteArrayInputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.Collections;

/** Offline game shell. Web content has no native access except a bounded JSON export. */
public final class MainActivity extends Activity {
    private static final String HOST = "appassets.androidplatform.net";
    private static final String START = "https://" + HOST + "/assets/game/index.html";
    private static final int IMPORT = 11, EXPORT = 12;
    private WebView game;
    private ValueCallback<Uri[]> fileResult;
    private byte[] pendingBackup;
    private long lastBack;

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        game = new WebView(this);
        game.setBackgroundColor(Color.rgb(16, 22, 32));
        FrameLayout frame = new FrameLayout(this);
        frame.setBackgroundColor(Color.rgb(16, 22, 32));
        frame.addView(game, new FrameLayout.LayoutParams(-1, -1));
        setContentView(frame);
        if (Build.VERSION.SDK_INT >= 28) frame.setOnApplyWindowInsetsListener((view, insets) -> {
            android.view.DisplayCutout cutout = insets.getDisplayCutout();
            view.setPadding(cutout == null ? 0 : cutout.getSafeInsetLeft(),
                    cutout == null ? 0 : cutout.getSafeInsetTop(),
                    cutout == null ? 0 : cutout.getSafeInsetRight(),
                    cutout == null ? 0 : cutout.getSafeInsetBottom());
            return insets;
        });
        WebSettings settings = game.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setMediaPlaybackRequiresUserGesture(true);
        settings.setSupportMultipleWindows(true);
        WebView.setWebContentsDebuggingEnabled(BuildConfig.DEBUG);
        final WebViewAssetLoader loader = new WebViewAssetLoader.Builder()
                .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this)).build();
        game.setWebViewClient(new WebViewClient() {
            @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                WebResourceResponse local = loader.shouldInterceptRequest(request.getUrl());
                if (local != null) return local;
                // Never fetch missing assets or remote subresources into the trusted game origin.
                return new WebResourceResponse("text/plain", "UTF-8", 404, "Not Found",
                        Collections.emptyMap(), new ByteArrayInputStream(new byte[0]));
            }
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                if (isLocal(request.getUrl())) return false;
                if (request.isForMainFrame()) openExternal(request.getUrl());
                return true;
            }
        });
        game.setWebChromeClient(new WebChromeClient() {
            @Override public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (fileResult != null) fileResult.onReceiveValue(null);
                fileResult = callback;
                Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT).addCategory(Intent.CATEGORY_OPENABLE)
                        .setType("application/json");
                try { startActivityForResult(intent, IMPORT); }
                catch (ActivityNotFoundException error) { fileResult.onReceiveValue(null); fileResult = null; }
                return true;
            }
            @Override public boolean onCreateWindow(WebView view, boolean dialog, boolean userGesture, android.os.Message message) {
                if (!userGesture) return false;
                WebView popup = new WebView(MainActivity.this);
                popup.setWebViewClient(new WebViewClient() {
                    @Override public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest request) {
                        openExternal(request.getUrl()); v.destroy(); return true;
                    }
                });
                ((WebView.WebViewTransport) message.obj).setWebView(popup);
                message.sendToTarget(); return true;
            }
        });
        game.addJavascriptInterface(new BackupExport(), "NulldelveFiles");
        game.setDownloadListener((url, agent, disposition, mime, length) -> {
            if (!url.startsWith("blob:https://" + HOST + "/")) return;
            game.evaluateJavascript("fetch(" + JSONObject.quote(url) + ").then(r=>r.text()).then(text=>NulldelveFiles.save(text))", null);
        });
        // Always use the same HTTPS origin so checkpoints survive app updates.
        game.loadUrl(START);
        if (Build.VERSION.SDK_INT >= 33) {
            getOnBackInvokedDispatcher().registerOnBackInvokedCallback(
                    android.window.OnBackInvokedDispatcher.PRIORITY_DEFAULT, this::handleBack);
        }
        immersive();
    }

    private static boolean isLocal(Uri uri) {
        return "https".equals(uri.getScheme()) && HOST.equals(uri.getHost())
                && uri.getPort() == -1 && uri.getPath() != null && uri.getPath().startsWith("/assets/game/");
    }
    private void openExternal(Uri uri) {
        if (!"https".equals(uri.getScheme())) return;
        try { startActivity(new Intent(Intent.ACTION_VIEW, uri).addCategory(Intent.CATEGORY_BROWSABLE)); }
        catch (ActivityNotFoundException error) { Toast.makeText(this, "No browser available", Toast.LENGTH_SHORT).show(); }
    }
    private final class BackupExport {
        @JavascriptInterface public void save(String json) {
            if (json == null || json.length() > 10 * 1024 * 1024) return;
            try { new JSONObject(json); } catch (Exception error) { return; }
            byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
            if (bytes.length > 10 * 1024 * 1024) return;
            runOnUiThread(() -> {
                if (pendingBackup != null || !isLocal(Uri.parse(game.getUrl()))) return;
                pendingBackup = bytes;
                Intent save = new Intent(Intent.ACTION_CREATE_DOCUMENT).addCategory(Intent.CATEGORY_OPENABLE)
                        .setType("application/json").putExtra(Intent.EXTRA_TITLE, "nulldelve-backup.json");
                try { startActivityForResult(save, EXPORT); }
                catch (ActivityNotFoundException error) { pendingBackup = null; }
            });
        }
    }
    @Override protected void onActivityResult(int request, int result, Intent data) {
        super.onActivityResult(request, result, data);
        Uri uri = result == RESULT_OK && data != null ? data.getData() : null;
        if (request == IMPORT && fileResult != null) {
            fileResult.onReceiveValue(uri == null ? null : new Uri[]{uri}); fileResult = null;
        }
        if (request == EXPORT) {
            byte[] bytes = pendingBackup; pendingBackup = null;
            if (uri != null && bytes != null) {
                try (OutputStream stream = getContentResolver().openOutputStream(uri)) {
                    if (stream == null) throw new java.io.IOException("No output stream");
                    stream.write(bytes);
                    Toast.makeText(this, "Backup saved", Toast.LENGTH_SHORT).show();
                } catch (Exception error) { Toast.makeText(this, "Could not save backup", Toast.LENGTH_LONG).show(); }
            }
        }
    }
    // API 33+ uses the native predictive-back callback registered in onCreate.
    // This override serves older Android releases only.
    @android.annotation.SuppressLint("GestureBackNavigation")
    @Override public void onBackPressed() {
        handleBack();
    }
    private void handleBack() {
        // Let the game navigate submenus before considering an app-level exit.
        game.evaluateJavascript("window.dispatchEvent(new Event('nulldelve-back',{cancelable:true}))", unhandled -> {
            if (isFinishing() || isDestroyed()) return;
            if ("false".equals(unhandled)) { lastBack = 0; return; }
            long now = SystemClock.elapsedRealtime();
            if (now - lastBack < 1400) {
                lastBack = 0;
                new AlertDialog.Builder(this).setTitle("Exit Nulldelve?")
                        .setMessage("You can continue from your latest checkpoint.")
                        .setNegativeButton("Cancel", null).setPositiveButton("Exit", (d, w) -> finish()).show();
            } else {
                lastBack = now;
                Toast.makeText(this, "Press Back again to exit", Toast.LENGTH_SHORT).show();
            }
        });
    }
    private void immersive() {
        if (Build.VERSION.SDK_INT >= 30) {
            WindowInsetsController controls = getWindow().getInsetsController();
            if (controls != null) {
                controls.hide(WindowInsets.Type.systemBars());
                controls.setSystemBarsBehavior(WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
            }
        } else getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_FULLSCREEN
                | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY);
    }
    @Override public void onWindowFocusChanged(boolean focus) { super.onWindowFocusChanged(focus); if (focus) immersive(); }
    @Override protected void onPause() {
        game.evaluateJavascript("window.dispatchEvent(new Event('blur'))", null);
        game.onPause(); super.onPause();
    }
    @Override protected void onResume() { super.onResume(); if (game != null) game.onResume(); }
    @Override protected void onDestroy() {
        if (fileResult != null) fileResult.onReceiveValue(null);
        game.removeJavascriptInterface("NulldelveFiles"); game.destroy(); super.onDestroy();
    }
}
