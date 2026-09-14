package com.krapal.resumeforge;

import android.content.ContentValues;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.print.PrintAttributes;
import android.print.PrintDocumentAdapter;
import android.print.PrintDocumentInfo;
import android.os.ParcelFileDescriptor;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "PdfExport")
public class PdfExportPlugin extends Plugin {
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
        ContentValues values = new ContentValues();
        values.put(MediaStore.Downloads.DISPLAY_NAME, fileName.toLowerCase().endsWith(".pdf") ? fileName : fileName + ".pdf");
        values.put(MediaStore.Downloads.MIME_TYPE, "application/pdf");
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            values.put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS + "/ResuMate");
            values.put(MediaStore.Downloads.IS_PENDING, 1);
        }
        final Uri uri = getContext().getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values);
        if (uri == null) { cleanup(view); call.reject("Unable to create PDF in Downloads"); return; }
        PrintDocumentAdapter adapter = view.createPrintDocumentAdapter("ResuMate");
        PrintAttributes attrs = new PrintAttributes.Builder()
            .setMediaSize(PrintAttributes.MediaSize.ISO_A4)
            .setResolution(new PrintAttributes.Resolution("resumate", "ResuMate", 300, 300))
            .setMinMargins(PrintAttributes.Margins.NO_MARGINS).build();
        adapter.onLayout(null, attrs, null, new PrintDocumentAdapter.LayoutResultCallback() {
            @Override public void onLayoutFinished(PrintDocumentInfo info, boolean changed) {
                try {
                    ParcelFileDescriptor fd = getContext().getContentResolver().openFileDescriptor(uri, "w");
                    if (fd == null) throw new IllegalStateException("Unable to open PDF destination");
                    adapter.onWrite(new android.print.PageRange[]{android.print.PageRange.ALL_PAGES}, fd, null, new PrintDocumentAdapter.WriteResultCallback() {
                        @Override public void onWriteFinished(android.print.PageRange[] pages) {
                            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                                ContentValues done = new ContentValues();
                                done.put(MediaStore.Downloads.IS_PENDING, 0);
                                getContext().getContentResolver().update(uri, done, null, null);
                            }
                            JSObject result = new JSObject();
                            result.put("uri", uri.toString());
                            result.put("fileName", fileName);
                            call.resolve(result);
                            cleanup(view);
                        }
                        @Override public void onWriteFailed(CharSequence error) { cleanup(view); call.reject(error == null ? "PDF write failed" : error.toString()); }
                    });
                } catch (Exception e) { cleanup(view); call.reject(e.getMessage() == null ? "PDF export failed" : e.getMessage()); }
            }
            @Override public void onLayoutFailed(CharSequence error) { cleanup(view); call.reject(error == null ? "PDF layout failed" : error.toString()); }
        }, null);
    }

    private void cleanup(WebView view) { try { view.stopLoading(); view.destroy(); } catch (Exception ignored) {} }
}
