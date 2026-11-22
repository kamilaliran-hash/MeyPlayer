// MeyPlayer — Windows desktop shell (Electron) — owner: Kamil
const { app, BrowserWindow, protocol, ipcMain, dialog, shell, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { Readable } = require('stream');

const VIDEO = ['mp4','m4v','mkv','webm','mov','avi','3gp','ts','mpg','mpeg','wmv','flv','ogv'];
const AUDIO = ['mp3','m4a','aac','wav','ogg','oga','opus','flac','wma'];
const SUBS = ['srt','vtt'];
const ALL = new Set([...VIDEO, ...AUDIO, ...SUBS]);
const MIME = { mp4:'video/mp4', m4v:'video/mp4', mkv:'video/x-matroska', webm:'video/webm', mov:'video/quicktime', avi:'video/x-msvideo', '3gp':'video/3gpp',
  ts:'video/mp2t', mpg:'video/mpeg', mpeg:'video/mpeg', wmv:'video/x-ms-wmv', flv:'video/x-flv', ogv:'video/ogg', mp3:'audio/mpeg', m4a:'audio/mp4', aac:'audio/aac',
  wav:'audio/wav', ogg:'audio/ogg', oga:'audio/ogg', opus:'audio/ogg', flac:'audio/flac', wma:'audio/x-ms-wma', srt:'text/plain', vtt:'text/vtt',
  html:'text/html', js:'text/javascript', css:'text/css', png:'image/png', svg:'image/svg+xml', json:'application/json' };
const extOf = p => path.extname(p).slice(1).toLowerCase();

// Single privileged scheme: app UI and media share one origin, so screenshots, equalizer and cut all work.
protocol.registerSchemesAsPrivileged([{ scheme: 'mey', privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true, corsEnabled: true } }]);
app.commandLine.appendSwitch('enable-blink-features', 'AudioVideoTracks');
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

let win = null;
const pending = [];
const argFiles = argv => argv.slice(1).filter(a => !a.startsWith('-') && ALL.has(extOf(a)) && fs.existsSync(a)).map(a => path.resolve(a));

if (!app.requestSingleInstanceLock()) { app.quit(); }
else {
  app.on('second-instance', (_e, argv) => {
    const files = argFiles(argv);
    if (win) { if (win.isMinimized()) win.restore(); win.focus(); if (files.length) win.webContents.send('open-file', files); }
  });
}
pending.push(...argFiles(process.argv));

function serveFile(filePath, request) {
  const stat = fs.statSync(filePath);
  const type = MIME[extOf(filePath)] || 'application/octet-stream';
  const range = request.headers.get('range');
  if (range) {
    const m = /bytes=(\d*)-(\d*)/.exec(range) || [];
    let start = m[1] ? parseInt(m[1], 10) : 0;
    let end = m[2] ? parseInt(m[2], 10) : stat.size - 1;
    if (!m[1] && m[2]) { start = stat.size - parseInt(m[2], 10); end = stat.size - 1; }
    end = Math.min(end, stat.size - 1);
    if (start > end || start >= stat.size) return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${stat.size}` } });
    return new Response(Readable.toWeb(fs.createReadStream(filePath, { start, end })), { status: 206, headers: {
      'Content-Type': type, 'Accept-Ranges': 'bytes', 'Content-Length': String(end - start + 1), 'Content-Range': `bytes ${start}-${end}/${stat.size}` } });
  }
  return new Response(Readable.toWeb(fs.createReadStream(filePath)), { status: 200, headers: { 'Content-Type': type, 'Accept-Ranges': 'bytes', 'Content-Length': String(stat.size) } });
}

function createWindow() {
  win = new BrowserWindow({
    width: 1280, height: 800, minWidth: 420, minHeight: 600, backgroundColor: '#f5f6fb', title: 'MeyPlayer',
    icon: path.join(__dirname, '..', 'build', 'icon.png'), autoHideMenuBar: true,
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, sandbox: false },
  });
  Menu.setApplicationMenu(null);
  win.loadURL('mey://app/index.html');
  win.on('enter-full-screen', () => win.setMenuBarVisibility(false));
}

app.whenReady().then(() => {
  const www = path.join(__dirname, '..', 'www');
  protocol.handle('mey', request => {
    try {
      const u = new URL(request.url);
      if (u.hostname === 'media') {
        const p = decodeURIComponent(u.searchParams.get('p') || '');
        if (!p || !fs.existsSync(p)) return new Response('Not found', { status: 404 });
        return serveFile(p, request);
      }
      let rel = decodeURIComponent(u.pathname).replace(/^\/+/, '') || 'index.html';
      const full = path.normalize(path.join(www, rel));
      if (!full.startsWith(www) || !fs.existsSync(full)) return new Response('Not found', { status: 404 });
      return serveFile(full, request);
    } catch (e) { return new Response(String(e), { status: 500 }); }
  });
  createWindow();
});
app.setAboutPanelOptions({ applicationName: 'MeyPlayer', applicationVersion: '1.3.2', copyright: 'Copyright © 2026 Kamil', authors: ['Kamil'] });
app.on('window-all-closed', () => app.quit());

/* ---------- IPC ---------- */
ipcMain.handle('roots', () => {
  const r = [];
  for (const n of ['videos', 'downloads', 'desktop', 'music', 'pictures']) { try { r.push(app.getPath(n)); } catch {} }
  try { const od = path.join(os.homedir(), 'OneDrive'); if (fs.existsSync(od)) r.push(path.join(od, 'Videos'), path.join(od, 'Pictures')); } catch {}
  return [...new Set(r)].filter(p => fs.existsSync(p));
});

const SKIP = new Set(['node_modules', 'AppData', '$RECYCLE.BIN', 'System Volume Information', 'Windows', 'Program Files', 'Program Files (x86)']);
ipcMain.handle('scan', async (_e, roots) => {
  const out = []; const seen = new Set();
  async function walk(dir, depth) {
    if (depth > 6 || out.length > 20000) return;
    let real; try { real = await fs.promises.realpath(dir); } catch { return; }
    if (seen.has(real)) return; seen.add(real);
    let ents; try { ents = await fs.promises.readdir(dir, { withFileTypes: true }); } catch { return; }
    for (const d of ents) {
      if (d.name.startsWith('.') || SKIP.has(d.name)) continue;
      const p = path.join(dir, d.name);
      if (d.isDirectory()) { await walk(p, depth + 1); continue; }
      const x = extOf(d.name); if (!ALL.has(x)) continue;
      try { const st = await fs.promises.stat(p); out.push({ path: p, name: d.name, size: st.size, mtime: st.mtimeMs, folder: dir,
        kind: VIDEO.includes(x) ? 'video' : AUDIO.includes(x) ? 'audio' : 'sub' }); } catch {}
    }
  }
  for (const r of roots || []) await walk(r, 0);
  return out;
});
ipcMain.handle('pick-folder', async () => {
  const r = await dialog.showOpenDialog(win, { properties: ['openDirectory'] });
  return r.canceled ? null : r.filePaths[0];
});
ipcMain.handle('open-files', async () => {
  const r = await dialog.showOpenDialog(win, { properties: ['openFile', 'multiSelections'], filters: [{ name: 'Media', extensions: [...VIDEO, ...AUDIO] }, { name: 'All files', extensions: ['*'] }] });
  return r.canceled ? [] : r.filePaths;
});
ipcMain.handle('save-file', async (_e, name, bytes) => {
  const dir = path.join(app.getPath(name.endsWith('.png') ? 'pictures' : 'videos'), 'MeyPlayer');
  await fs.promises.mkdir(dir, { recursive: true });
  const p = path.join(dir, name.replace(/[<>:"/\\|?*]/g, '_'));
  await fs.promises.writeFile(p, Buffer.from(bytes));
  return p;
});
ipcMain.handle('show-item', (_e, p) => shell.showItemInFolder(p));
ipcMain.handle('win', (_e, a) => { if (!win) return false; if (a === 'quit') { app.quit(); return true; } if (a === 'top') { const v = !win.isAlwaysOnTop(); win.setAlwaysOnTop(v); return v; } return false; });
ipcMain.handle('initial-files', () => pending.splice(0));
