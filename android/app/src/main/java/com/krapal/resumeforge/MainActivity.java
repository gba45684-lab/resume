package com.krapal.resumeforge;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(android.os.Bundle savedInstanceState) {
        registerPlugin(PdfExportPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
