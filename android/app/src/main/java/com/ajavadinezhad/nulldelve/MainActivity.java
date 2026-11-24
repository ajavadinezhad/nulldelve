package com.ajavadinezhad.nulldelve;

import android.app.Activity;
import android.app.AlertDialog;
import android.app.Dialog;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.SystemClock;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.webkit.JavascriptInterface;
import android.webkit.RenderProcessGoneDetail;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.Button;
import androidx.webkit.WebViewAssetLoader;
import org.json.JSONObject;
import java.io.ByteArrayInputStream;
import java.io.OutputStream;
import java.io.InputStream;
import java.io.ByteArrayOutputStream;
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
    private AlertDialog rendererRecovery;
    private boolean foreground;
    private Dialog documentDialog;
    private WebView documentView;
    private BackendOriginPolicy backendPolicy = BackendOriginPolicy.disabled();

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        backendPolicy = loadBackendPolicy();
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
                // Optional account traffic is limited to configured REST requests;
                // remote documents, scripts, and missing local assets remain blocked.
                if (backendPolicy.allows(request.getMethod(), request.getUrl().toString(),
                        request.isForMainFrame(), request.getRequestHeaders())) return null;
                return new WebResourceResponse("text/plain", "UTF-8", 404, "Not Found",
                        Collections.emptyMap(), new ByteArrayInputStream(new byte[0]));
            }
            @Override public boolean onRenderProcessGone(WebView view, RenderProcessGoneDetail detail) {
                return recoverRenderer(view);
            }
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                if (isLocal(request.getUrl())) return false;
                if (request.isForMainFrame()) openExternal(request.getUrl());
                return true;
            }
        });
        game.setWebChromeClient(new WebChromeClient() {
            @Override public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (view != game) { callback.onReceiveValue(null); return true; }
                if (fileResult != null) fileResult.onReceiveValue(null);
                fileResult = callback;
                Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT).addCategory(Intent.CATEGORY_OPENABLE)
                        .setType("application/json");
                try { startActivityForResult(intent, IMPORT); }
                catch (ActivityNotFoundException error) { fileResult.onReceiveValue(null); fileResult = null; }
                return true;
            }
            @Override public boolean onCreateWindow(WebView view, boolean dialog, boolean userGesture, android.os.Message message) {
                if (view != game || !userGesture) return false;
                WebView popup = createDocumentPopup(loader);
                ((WebView.WebViewTransport) message.obj).setWebView(popup);
                message.sendToTarget(); return true;
            }
        });
        game.addJavascriptInterface(new BackupExport(), "NulldelveFiles");
        final WebView exportView = game;
        game.setDownloadListener((url, agent, disposition, mime, length) -> {
            if (game != exportView) return;
            if (!url.startsWith("blob:https://" + HOST + "/")) return;
            exportView.evaluateJavascript("fetch(" + JSONObject.quote(url) + ").then(r=>r.text()).then(text=>NulldelveFiles.save(text))", null);
        });
        // Always use the same HTTPS origin so checkpoints survive app updates.
        game.loadUrl(START);
        if (Build.VERSION.SDK_INT >= 33) {
            getOnBackInvokedDispatcher().registerOnBackInvokedCallback(
                    android.window.OnBackInvokedDispatcher.PRIORITY_DEFAULT, this::handleBack);
        }
        immersive();
    }

    /** Keep bundled legal/account documents on their offline HTTPS asset origin. */
    private WebView createDocumentPopup(WebViewAssetLoader loader) {
        closeDocument();
        WebView popup = new WebView(this);
        popup.setBackgroundColor(Color.rgb(16, 22, 32));
        WebSettings settings = popup.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        popup.setWebViewClient(new WebViewClient() {
            @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                WebResourceResponse local = loader.shouldInterceptRequest(request.getUrl());
                if (local != null) return local;
                if (backendPolicy.allows(request.getMethod(), request.getUrl().toString(),
                        request.isForMainFrame(), request.getRequestHeaders())) return null;
                return new WebResourceResponse("text/plain", "UTF-8", 404, "Not Found",
                        Collections.emptyMap(), new ByteArrayInputStream(new byte[0]));
            }
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                if (documentView != view) return true;
                if (isLocal(request.getUrl())) {
                    if ("/assets/game/index.html".equals(request.getUrl().getPath())) { closeDocument(); return true; }
                    return false;
                }
                if (request.isForMainFrame()) { openExternal(request.getUrl()); closeDocument(); }
                return true;
            }
            @Override public boolean onRenderProcessGone(WebView view, RenderProcessGoneDetail detail) {
                if (documentView == view) closeDocument(); else view.destroy();
                return true;
            }
        });
        Dialog dialog = new Dialog(this);
        LinearLayout column = new LinearLayout(this); column.setOrientation(LinearLayout.VERTICAL);
        column.setBackgroundColor(Color.rgb(16, 22, 32));
        Button close = new Button(this); close.setText(R.string.back_to_game); close.setOnClickListener(view -> dialog.dismiss());
        column.addView(close, new LinearLayout.LayoutParams(-1, -2));
        column.addView(popup, new LinearLayout.LayoutParams(-1, 0, 1));
        dialog.setContentView(column);
        documentDialog = dialog; documentView = popup;
        dialog.setOnDismissListener(ignored -> {
            if (documentDialog == dialog) { documentDialog = null; documentView = null; }
            popup.destroy();
        });
        dialog.show();
        if (dialog.getWindow() != null) dialog.getWindow().setLayout(-1, -1);
        return popup;
    }
    private void closeDocument() {
        if (documentDialog != null) documentDialog.dismiss();
    }
    private BackendOriginPolicy loadBackendPolicy() {
        try (InputStream input = getAssets().open("game/backend-config.json")) {
            ByteArrayOutputStream output = new ByteArrayOutputStream();
            byte[] buffer = new byte[1024]; int count;
            while ((count = input.read(buffer)) != -1) {
                if (output.size() + count > 8192) return BackendOriginPolicy.disabled();
                output.write(buffer, 0, count);
            }
            JSONObject config = new JSONObject(output.toString("UTF-8"));
            return BackendOriginPolicy.fromConfig(config.optString("supabaseUrl", ""),
                    config.optString("publishableKey", ""));
        } catch (Exception ignored) { return BackendOriginPolicy.disabled(); }
    }
    /** A dead renderer cannot run JavaScript or capture a safe new save. */
    private boolean recoverRenderer(WebView failed) {
        if (failed != game) { failed.destroy(); return true; }
        game = null;
        closeDocument();
        // These callbacks belong to the dead page, never a replacement page.
        fileResult = null;
        pendingBackup = null;
        lastBack = 0;
        if (failed.getParent() instanceof ViewGroup) ((ViewGroup) failed.getParent()).removeView(failed);
        failed.removeJavascriptInterface("NulldelveFiles");
        failed.destroy();
        showRendererRecovery();
        return true;
    }
    private void showRendererRecovery() {
        if (!foreground || isFinishing() || isDestroyed() || rendererRecovery != null) return;
        rendererRecovery = new AlertDialog.Builder(this).setTitle("Graphics interrupted")
                .setMessage("Restart the game, then choose Continue to return to your latest checkpoint. Your saved progress has not been replaced.")
                .setCancelable(false)
                .setPositiveButton("Restart game", (dialog, which) -> recreate())
                .setNegativeButton("Exit", (dialog, which) -> finish()).create();
        rendererRecovery.show();
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
                if (game == null || pendingBackup != null || game.getUrl() == null || !isLocal(Uri.parse(game.getUrl()))) return;
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
        if (documentDialog != null) { closeDocument(); return; }
        if (game == null) { showRendererRecovery(); return; }
        final WebView current = game;
        current.evaluateJavascript("window.dispatchEvent(new Event('nulldelve-back',{cancelable:true}))", unhandled -> {
            if (isFinishing() || isDestroyed() || game != current) return;
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
        foreground = false;
        if (game != null) {
            game.evaluateJavascript("window.dispatchEvent(new Event('blur'))", null);
            game.onPause();
        }
        super.onPause();
    }
    @Override protected void onResume() {
        super.onResume(); foreground = true;
        if (game != null) game.onResume(); else showRendererRecovery();
    }
    @Override protected void onDestroy() {
        closeDocument();
        if (rendererRecovery != null) { rendererRecovery.dismiss(); rendererRecovery = null; }
        if (fileResult != null) { fileResult.onReceiveValue(null); fileResult = null; }
        pendingBackup = null;
        if (game != null) {
            game.removeJavascriptInterface("NulldelveFiles"); game.destroy(); game = null;
        }
        super.onDestroy();
    }
}
