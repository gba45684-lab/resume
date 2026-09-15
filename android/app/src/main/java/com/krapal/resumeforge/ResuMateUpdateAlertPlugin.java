package com.krapal.resumeforge;

import android.content.Context;
import android.media.AudioAttributes;
import android.media.MediaPlayer;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.os.VibratorManager;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "ResuMateUpdateAlert")
public class ResuMateUpdateAlertPlugin extends Plugin {
    private static final long RING_MS = 8000L;
    private final Handler handler = new Handler(Looper.getMainLooper());
    private MediaPlayer player;

    @PluginMethod
    public void ringUpdate(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            stopInternal();
            try {
                Uri sound = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
                player = MediaPlayer.create(getContext(), sound);
                if (player != null) {
                    if (Build.VERSION.SDK_INT >= 21) {
                        player.setAudioAttributes(new AudioAttributes.Builder()
                            .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                            .build());
                    }
                    player.setLooping(true);
                    player.start();
                    handler.postDelayed(this::stopInternal, RING_MS);
                }
                vibrate();
            } catch (Exception ignored) {
                vibrate();
            }
            call.resolve();
        });
    }

    @PluginMethod
    public void stopUpdateRing(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            stopInternal();
            call.resolve();
        });
    }

    private void vibrate() {
        try {
            Vibrator vibrator;
            if (Build.VERSION.SDK_INT >= 31) {
                VibratorManager manager = (VibratorManager) getContext().getSystemService(Context.VIBRATOR_MANAGER_SERVICE);
                vibrator = manager.getDefaultVibrator();
            } else {
                vibrator = (Vibrator) getContext().getSystemService(Context.VIBRATOR_SERVICE);
            }
            long[] pattern = {0, 350, 180, 350, 180, 700};
            if (Build.VERSION.SDK_INT >= 26) vibrator.vibrate(VibrationEffect.createWaveform(pattern, -1));
            else vibrator.vibrate(pattern, -1);
        } catch (Exception ignored) {}
    }

    private void stopInternal() {
        handler.removeCallbacksAndMessages(null);
        try {
            if (player != null) {
                if (player.isPlaying()) player.stop();
                player.release();
            }
        } catch (Exception ignored) {}
        player = null;
    }
}
