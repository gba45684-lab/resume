package com.krapal.resumeforge;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.ContentValues;
import android.content.Intent;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.pdf.PdfDocument;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import androidx.core.app.NotificationCompat;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.OutputStream;

@CapacitorPlugin(name = "PdfExport")
public class PdfExportPlugin extends Plugin {
    private static final String CHANNEL_ID = "resumate_downloads";
    private static final int NOTIFICATION_ID = 240914;
    private static final int PAGE_WIDTH = 794;
    private static final int PAGE_HEIGHT = 1123;

    @PluginMethod
    public void savePdf(PluginCall call) {
        final String html = call.getString("html", "");
        final String fileName = call.getString("fileName", "ResuMate-Resume.pdf");
        if (html.trim().isEmpty()) { call.reject("PDF content is empty"); return; }
        getActivity().runOnUiThread(() -> render(call, html, fileName));
    }

    private void render(PluginCall call, String html, String fileName) {
        final WebView view = new WebView(getContext());
        view.getSettings().setJavaScriptEnabled(false);
        view.setBackgroundColor(Color.WHITE);
        view.setVisibility(View.INVISIBLE);
        getActivity().addContentView(view, new ViewGroup.LayoutParams(1, 1));
        view.setWebViewClient(new WebViewClient() {
            @Override public void onPageFinished(WebView v, String url) { writePdf(call, view, fileName); }
        });
        view.loadDataWithBaseURL("https://localhost/", html, "text/html", "UTF-8", null);
    }

    private void writePdf(PluginCall call, WebView view, String fileName) {
        try {
            view.measure(View.MeasureSpec.makeMeasureSpec(PAGE_WIDTH, View.MeasureSpec.EXACTLY), View.MeasureSpec.makeMeasureSpec(0, View.MeasureSpec.UNSPECIFIED));
            int contentHeight = Math.max(PAGE_HEIGHT, view.getMeasuredHeight());
            view.layout(0, 0, PAGE_WIDTH, contentHeight);
            int pageCount = Math.max(1, (int) Math.ceil(contentHeight / (double) PAGE_HEIGHT));

            ContentValues values = new ContentValues();
            String safeName = fileName.toLowerCase().endsWith(".pdf") ? fileName : fileName + ".pdf";
            values.put(MediaStore.Downloads.DISPLAY_NAME, safeName);
            values.put(MediaStore.Downloads.MIME_TYPE, "application/pdf");
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                values.put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS + "/ResuMate");
                values.put(MediaStore.Downloads.IS_PENDING, 1);
            }
            final Uri uri = getContext().getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values);
            if (uri == null) throw new IllegalStateException("Unable to create PDF in Downloads");

            PdfDocument document = new PdfDocument();
            for (int page = 0; page < pageCount; page++) {
                PdfDocument.PageInfo info = new PdfDocument.PageInfo.Builder(PAGE_WIDTH, PAGE_HEIGHT, page + 1).create();
                PdfDocument.Page pdfPage = document.startPage(info);
                Canvas canvas = pdfPage.getCanvas();
                canvas.drawColor(Color.WHITE);
                canvas.save();
                canvas.translate(0, -page * PAGE_HEIGHT);
                view.draw(canvas);
                canvas.restore();
                document.finishPage(pdfPage);
            }
            OutputStream out = getContext().getContentResolver().openOutputStream(uri);
            if (out == null) throw new IllegalStateException("Unable to open PDF destination");
            document.writeTo(out);
            out.close();
            document.close();
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                ContentValues done = new ContentValues();
                done.put(MediaStore.Downloads.IS_PENDING, 0);
                getContext().getContentResolver().update(uri, done, null, null);
            }
            showDownloadNotification(uri, safeName);
            JSObject result = new JSObject();
            result.put("uri", uri.toString());
            result.put("fileName", safeName);
            call.resolve(result);
        } catch (Exception e) {
            call.reject(e.getMessage() == null ? "PDF export failed" : e.getMessage());
        } finally {
            cleanup(view);
        }
    }

    private void showDownloadNotification(Uri uri, String fileName) {
        NotificationManager manager = (NotificationManager) getContext().getSystemService(NotificationManager.class);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            manager.createNotificationChannel(new NotificationChannel(CHANNEL_ID, "ResuMate Downloads", NotificationManager.IMPORTANCE_DEFAULT));
        }
        Intent open = new Intent(Intent.ACTION_VIEW);
        open.setDataAndType(uri, "application/pdf");
        open.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= 23) flags |= PendingIntent.FLAG_IMMUTABLE;
        PendingIntent pending = PendingIntent.getActivity(getContext(), NOTIFICATION_ID, open, flags);
        NotificationCompat.Builder notification = new NotificationCompat.Builder(getContext(), CHANNEL_ID)
            .setSmallIcon(com.krapal.resumeforge.R.mipmap.ic_launcher)
            .setContentTitle("Resume PDF downloaded")
            .setContentText(fileName)
            .setAutoCancel(true)
            .setContentIntent(pending)
            .setPriority(NotificationCompat.PRIORITY_DEFAULT);
        manager.notify(NOTIFICATION_ID, notification.build());
    }

    private void cleanup(WebView view) { try { view.stopLoading(); view.destroy(); } catch (Exception ignored) {} }
}
