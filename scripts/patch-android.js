// Patches the generated Capacitor Android project for MeyPlayer:
// storage/media permissions, runtime permission request, launcher icons, release signing.
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const app = path.join(root, 'android', 'app');
const res = path.join(app, 'src', 'main', 'res');
const must = p => { if (!fs.existsSync(p)) throw new Error('Missing ' + p + ' — run "npx cap add android" first'); return p; };

// 1) Manifest
const manPath = must(path.join(app, 'src', 'main', 'AndroidManifest.xml'));
let man = fs.readFileSync(manPath, 'utf8');
const perms = [
  '<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />',
  '<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="29" />',
  '<uses-permission android:name="android.permission.READ_MEDIA_VIDEO" />',
  '<uses-permission android:name="android.permission.READ_MEDIA_AUDIO" />',
  '<uses-permission android:name="android.permission.WAKE_LOCK" />',
];
for (const p of perms) { const name = p.match(/name="([^"]+)"/)[1]; if (!man.includes(name)) man = man.replace('</manifest>', '    ' + p + '\n</manifest>'); }
if (!man.includes('requestLegacyExternalStorage')) man = man.replace('<application', '<application\n        android:requestLegacyExternalStorage="true"');
// keep video playing through rotation without reloading
man = man.replace(/android:configChanges="[^"]*"/, 'android:configChanges="orientation|keyboardHidden|keyboard|screenSize|smallestScreenSize|screenLayout|locale|uiMode|navigation|density"');
fs.writeFileSync(manPath, man);

// 2) MainActivity — ask for media permission on first launch, then trigger a rescan
const javaDir = path.join(app, 'src', 'main', 'java', 'com', 'meyplayer', 'app');
fs.mkdirSync(javaDir, { recursive: true });
fs.writeFileSync(path.join(javaDir, 'MainActivity.java'), `package com.meyplayer.app;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static final int REQ = 4242;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        String[] perms = Build.VERSION.SDK_INT >= 33
            ? new String[]{ Manifest.permission.READ_MEDIA_VIDEO, Manifest.permission.READ_MEDIA_AUDIO }
            : new String[]{ Manifest.permission.READ_EXTERNAL_STORAGE };
        boolean need = false;
        for (String p : perms) if (checkSelfPermission(p) != PackageManager.PERMISSION_GRANTED) need = true;
        if (need) requestPermissions(perms, REQ);
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == REQ && getBridge() != null) {
            getBridge().getWebView().post(() ->
                getBridge().getWebView().evaluateJavascript("window.meyRescan && window.meyRescan()", null));
        }
    }
}
`);

// 3) Launcher icons
const iconSrc = path.join(root, 'build', 'android');
for (const d of fs.readdirSync(iconSrc)) {
  const dest = path.join(res, d); fs.mkdirSync(dest, { recursive: true });
  for (const f of fs.readdirSync(path.join(iconSrc, d))) fs.copyFileSync(path.join(iconSrc, d, f), path.join(dest, f));
}
fs.mkdirSync(path.join(res, 'values'), { recursive: true });
fs.writeFileSync(path.join(res, 'values', 'ic_launcher_background.xml'),
  '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#6D4AFF</color>\n</resources>\n');
// splash: plain brand colour instead of the default Capacitor splash image
for (const d of fs.readdirSync(res)) {
  const s = path.join(res, d, 'splash.png');
  if (fs.existsSync(s)) fs.copyFileSync(path.join(iconSrc, 'mipmap-xxxhdpi', 'ic_launcher_foreground.png'), s);
}

// 4) Release signing from environment variables (set by CI)
const gradlePath = must(path.join(app, 'build.gradle'));
let g = fs.readFileSync(gradlePath, 'utf8');
if (!g.includes('MEY_KEYSTORE')) {
  g = g.replace(/android\s*\{/, `android {
    signingConfigs {
        release {
            if (System.getenv("MEY_KEYSTORE")) {
                storeFile file(System.getenv("MEY_KEYSTORE"))
                storePassword System.getenv("MEY_KEYSTORE_PASSWORD")
                keyAlias System.getenv("MEY_KEY_ALIAS")
                keyPassword System.getenv("MEY_KEY_PASSWORD")
            }
        }
    }`);
  g = g.replace(/release\s*\{\s*\n(\s*)minifyEnabled/, (m, sp) => `release {\n${sp}if (System.getenv("MEY_KEYSTORE")) signingConfig signingConfigs.release\n${sp}minifyEnabled`);
  fs.writeFileSync(gradlePath, g);
}
console.log('MeyPlayer Android project patched.');
