# MeyPlayer

**App owner & developer:** Kamil  
**Version:** 1.3.2

Offline video & music player for **Windows (.exe installer + portable)** and **Android (.apk)**, built from one shared UI (`www/`).

## Get the installers (no setup on your PC needed)
1. Create a free GitHub repository and upload everything in this folder (keep the `.github` folder).
2. Open the **Actions** tab. The *Build MeyPlayer* workflow starts by itself (or click **Run workflow**).
3. After ~10 minutes, open the finished run and download:
   - **MeyPlayer-Windows** → `MeyPlayer-Setup-1.3.2.exe` (installer) and `MeyPlayer-Portable-1.3.2.exe`
   - **MeyPlayer-Android** → `MeyPlayer-1.3.2.apk`
4. To publish a GitHub Release with the files attached, push a tag such as `v1.3.2`.

Android: allow "Install unknown apps" for your browser/file manager, then open the APK. Allow media access on first launch.
Windows: SmartScreen may warn because the exe is unsigned. Click **More info → Run anyway**.

### Keep the same Android signing key (recommended)
Without secrets, every build gets a new temporary key, so you would have to uninstall before updating. To keep one key, add these repository secrets:
`ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`.

## Build locally instead
- Windows: `npm install` then `npm run dist:win` (output in `dist/`). `npm start` runs it without installing.
- Android (needs Android Studio / SDK + JDK 17): `npm install`, `npm run android:init`, then `npm run android:debug`.

## Features
Library: folder list with new-video badges, thumbnails, durations, resume bars, sort by date/name/size, search, Music tab, playlists, favourites, history, PIN-protected Privacy folder, dark theme, custom scan folders. Windows extras: open-with/file associations and drag & drop.

Player tools (shown in the top row; use **Customise Items** to pick which ones appear): Night Mode, Shuffle, Loop (all/one), Mute, Sleep Timer, A-B Repeat, Audio Effect (bass boost, volume boost up to 250%, reverb), 10-band Equalizer with presets, Speed 0.25–4x, Screenshot, Background Play, Screen Rotation.

More menu: Audio Track, Subtitle (.srt/.vtt, auto-loads a matching file, size and sync delay settings), Playing Queue, Aspect Ratio (Fit/Fill/Stretch/16:9/4:3/100%), Display Settings (brightness/contrast/saturation), Bookmarks, Cut (exports a WebM clip), Favourite, Add To Playlist, Information, Share / Show in Folder, Tutorial, Fullscreen.

Bottom bar (desktop-player style): playlist panel, lock, aspect ratio, picture-in-picture/fullscreen, screenshot · open, previous, play/pause, next, stop · subtitle, equalizer, mute and volume slider. Other controls, swipe left/right to seek, swipe up/down for brightness (left side) or volume (right side), double-tap to skip ±10 s.
Keyboard: Space, ←/→, ↑/↓, F, M, N/P, S.

## Format notes
MeyPlayer plays what the system's Chromium engine supports: MP4/MKV/WebM/MOV with H.264, VP8/VP9, AV1 (and HEVC where the device hardware supports it); audio MP3/AAC/M4A/WAV/OGG/Opus/FLAC. Old AVI/WMV/FLV codecs (DivX, WMV9) are not supported.

## Owner
MeyPlayer is owned by **Kamil**. © 2026 Kamil. All rights reserved.

## Main menu (right-click on the video, long-press on Android, or the ☰ button at bottom left)
Quick Open File (Ctrl+O) · File · Recent Files · Play · View · Video · Audio · Subtitles · Video Track · Audio Track · Subtitle Track · Navigate · Capture · Filters · Playlists · Options (F2) · Properties (Alt+J) · Exit (Alt+F4) · Favorites · Help → Keyboard Shortcuts / Gesture Tutorial / About MeyPlayer.
The ⓘ button in the top bar (library and player) also opens About MeyPlayer — owner & developer: Kamil.

## Open with MeyPlayer
- Android: MeyPlayer registers itself as a video/audio viewer, so it appears in the "Open with" list of file managers, Downloads, WhatsApp, etc. (requires installing a build made from version 1.3.2 or later).
- Windows: the installer adds MeyPlayer to "Open with" for common video and audio formats.
