/* MeyPlayer — owner: Kamil — shared UI for Windows (Electron), Android (Capacitor) and browser */
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const VIDEO_EXT = ['mp4','m4v','mkv','webm','mov','avi','3gp','ts','mpg','mpeg','wmv','flv','ogv'];
const AUDIO_EXT = ['mp3','m4a','aac','wav','ogg','oga','opus','flac','wma'];
const SUB_EXT = ['srt','vtt'];
const ext = n => (n.split('.').pop() || '').toLowerCase();
const kindOf = n => VIDEO_EXT.includes(ext(n)) ? 'video' : AUDIO_EXT.includes(ext(n)) ? 'audio' : SUB_EXT.includes(ext(n)) ? 'sub' : null;
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmtT = s => { if (!isFinite(s) || s < 0) s = 0; s = Math.floor(s); const h = Math.floor(s/3600), m = Math.floor(s%3600/60), x = s%60; const p = n => String(n).padStart(2,'0'); return h ? `${h}:${p(m)}:${p(x)}` : `${p(m)}:${p(x)}`; };
const fmtSize = b => !b ? '' : b > 1073741824 ? (b/1073741824).toFixed(2)+' GB' : b > 1048576 ? (b/1048576).toFixed(1)+' MB' : Math.round(b/1024)+' KB';
const fmtDate = t => t ? new Date(t).toLocaleString() : '';
const baseName = p => p.split(/[\\/]/).pop();
const stem = n => n.replace(/\.[^.]+$/, '');
const dirOf = p => p.replace(/[\\/][^\\/]*$/, '');

/* ---------------- Icons ---------------- */
const I = {
  folder:'<path d="M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  music:'<circle cx="7" cy="18" r="3"/><path d="M10 18V4l10-2v13"/><circle cx="17" cy="15" r="3"/>',
  playlist:'<path d="M3 6h13M3 11h13M3 16h8"/><path d="M16 14l5 3-5 3z"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
  sort:'<path d="M4 6h16M7 12h10M10 18h4"/>',
  close:'<path d="M6 6l12 12M18 6L6 18"/>',
  file:'<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/><path d="M10 13l4 2.5-4 2.5z"/>',
  back:'<path d="M19 12H5M11 6l-6 6 6 6"/>',
  dots:'<circle cx="12" cy="5" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="12" cy="19" r="1.4"/>',
  play:'<path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.4-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5z" fill="currentColor"/>',
  pause:'<rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor"/><rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor"/>',
  prev:'<path d="M6 5v14" /><path d="M19 5L9 12l10 7z" fill="currentColor"/>',
  next:'<path d="M18 5v14"/><path d="M5 5l10 7-10 7z" fill="currentColor"/>',
  lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/><circle cx="12" cy="16" r="1.3" fill="currentColor"/>',
  unlock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 7.5-2"/><circle cx="12" cy="16" r="1.3" fill="currentColor"/>',
  aspect:'<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M7 12h10M7 12l2-2M7 12l2 2M17 12l-2-2M17 12l-2 2"/>',
  pip:'<rect x="3" y="5" width="18" height="14" rx="2"/><rect x="12" y="12" width="7" height="5" rx="1" fill="currentColor"/>',
  full:'<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
  night:'<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  edit:'<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
  shuffle:'<path d="M3 7h3c4 0 6 10 10 10h5M3 17h3c1.5 0 2.7-1.4 3.8-3.2M14 10.2C15 8.4 16.2 7 18 7h3"/><path d="M18 4l3 3-3 3M18 14l3 3-3 3"/>',
  loop:'<path d="M17 2l3 3-3 3"/><path d="M4 11V9a4 4 0 0 1 4-4h12"/><path d="M7 22l-3-3 3-3"/><path d="M20 13v2a4 4 0 0 1-4 4H4"/>',
  loop1:'<path d="M17 2l3 3-3 3"/><path d="M4 11V9a4 4 0 0 1 4-4h12"/><path d="M7 22l-3-3 3-3"/><path d="M20 13v2a4 4 0 0 1-4 4H4"/><path d="M11 10l1.5-1v6"/>',
  mute:'<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M17 9l5 6M22 9l-5 6"/>',
  vol:'<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/>',
  timer:'<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9 2h6"/>',
  ab:'<path d="M3 11l3-7 3 7M4.2 8.5h3.6"/><path d="M14 13h4.5a2.5 2.5 0 0 1 0 5H14zM14 13v-0h4a2 2 0 0 0 0-4h-4v4"/><path d="M10 4h7l-2-2M14 20H7l2 2"/>',
  wave:'<path d="M3 12h2M7 8v8M11 4v16M15 7v10M19 10v4M21 12h0"/>',
  eq:'<path d="M6 4v16M12 4v16M18 4v16"/><circle cx="6" cy="14" r="2" fill="currentColor"/><circle cx="12" cy="8" r="2" fill="currentColor"/><circle cx="18" cy="15" r="2" fill="currentColor"/>',
  camera:'<path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2"/><rect x="7" y="9" width="10" height="7" rx="1.5"/><circle cx="12" cy="12.5" r="2"/>',
  headphones:'<path d="M3 18v-6a9 9 0 0 1 18 0v6"/><rect x="3" y="14" width="4" height="7" rx="1.5"/><rect x="17" y="14" width="4" height="7" rx="1.5"/>',
  rotate:'<rect x="7" y="3" width="10" height="18" rx="2" transform="rotate(-45 12 12)"/><path d="M3 12a9 9 0 0 1 3-6.7M21 12a9 9 0 0 1-3 6.7"/>',
  note:'<circle cx="8" cy="18" r="3"/><path d="M11 18V4c3 0 6 2 7 5"/>',
  sub:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 13h4M13 13h4M7 16h7M16 16h1"/>',
  queue:'<path d="M3 6h14M3 11h14M3 16h8"/><path d="M15 14l6 3.5-6 3.5z" fill="currentColor"/>',
  display:'<rect x="3" y="4" width="18" height="5" rx="1.5"/><rect x="3" y="13" width="18" height="5" rx="1.5"/><path d="M7 6.5h.01M7 15.5h.01"/>',
  bookmark:'<path d="M6 4h9v17l-4.5-3L6 21z"/><path d="M15 4h3v14"/>',
  cut:'<rect x="5" y="5" width="14" height="14" rx="1.5"/><path d="M10 9l5 3-5 3z"/><path d="M3 5h2M19 19h2"/>',
  heart:'<path d="M12 20s-7-4.4-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 4.6-9 9-9 9z"/>',
  heartf:'<path d="M12 20s-7-4.4-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 4.6-9 9-9 9z" fill="currentColor"/>',
  addlist:'<path d="M3 6h14M3 11h14M3 16h8M17 14v6M14 17h6"/>',
  info:'<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  share:'<path d="M14 5l7 6-7 6v-4c-5 0-8 1.5-11 5 1-5 4-9 11-10z"/>',
  bulb:'<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.5 1 2.5h6c0-1 .2-1.7 1-2.5A6 6 0 0 0 12 3z"/>',
  chev:'<path d="M9 5l7 7-7 7"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  history:'<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>',
  shield:'<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><rect x="9" y="11" width="6" height="5" rx="1"/><path d="M10 11V9.5a2 2 0 0 1 4 0V11"/>',
  gear:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 0 1-4 0v-.1a1.6 1.6 0 0 0-2.7-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 3.6 15H3a2 2 0 0 1 0-4h.1a1.6 1.6 0 0 0 1.1-2.7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 9.7 4.4V3a2 2 0 0 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7H21a2 2 0 0 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1.3z"/>',
  refresh:'<path d="M20 11a8 8 0 0 0-14.9-3M4 4v4h4M4 13a8 8 0 0 0 14.9 3M20 20v-4h-4"/>',
  folderplus:'<path d="M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M12 10v6M9 13h6"/>',
  trash:'<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  eyeoff:'<path d="M3 3l18 18M10.6 6.1A9.7 9.7 0 0 1 12 6c5 0 9 6 9 6a17 17 0 0 1-3.2 3.7M6.2 7.6A17 17 0 0 0 3 12s4 6 9 6a9 9 0 0 0 4-.9"/><path d="M9.9 10a3 3 0 0 0 4.2 4.2"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  check:'<path d="M5 12l5 5L20 7"/>',
};
const ic = (n, cls='') => `<svg class="ic ${cls}" viewBox="0 0 24 24">${I[n]||''}</svg>`;
const paintIcons = (root=document) => $$('[data-icon]', root).forEach(el => { if (!el.dataset.painted) { el.innerHTML = ic(el.dataset.icon) + el.innerHTML; el.dataset.painted = 1; }});
const setIcon = (el, n) => { el.dataset.icon = n; el.innerHTML = ic(n); };

/* ---------------- Storage ---------------- */
const store = {
  get(k, d) { try { const v = localStorage.getItem('mey.' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem('mey.' + k, JSON.stringify(v)); } catch {} },
};
const S = {
  fav: new Set(store.get('fav', [])),
  playlists: store.get('playlists', {}),
  history: store.get('history', []),
  pos: store.get('pos', {}),
  played: new Set(store.get('played', [])),
  bookmarks: store.get('bookmarks', {}),
  hidden: new Set(store.get('hidden', [])),
  pin: store.get('pin', ''),
  folders: store.get('folders', []),
  settings: Object.assign({ dark:false, resume:true, sort:'date', speed:1, bgPlay:false, night:false,
    tools:['night','custom','shuffle','loop','mute','sleep','ab','effect','eq','speed','shot','bg','rotate'],
    eq:[0,0,0,0,0,0,0,0,0,0], eqPreset:'Normal', bass:0, boost:100, reverb:0, cueSize:22, disp:{b:100,c:100,s:100} }, store.get('settings', {})),
};
const save = k => {
  const v = S[k]; store.set(k, v instanceof Set ? [...v] : v);
};

/* ---------------- Platform layer ---------------- */
const Cap = window.Capacitor;
const isAndroid = !!(Cap && Cap.isNativePlatform && Cap.isNativePlatform());
const isElectron = !!window.meyAPI;
const Plat = {
  name: isElectron ? 'windows' : isAndroid ? 'android' : 'browser',
  async scan() {
    if (isElectron) {
      const roots = [...(await meyAPI.defaultRoots()), ...S.folders];
      return await meyAPI.scan(roots);
    }
    if (isAndroid) return await androidScan();
    return browserFiles;
  },
  url(m) {
    if (m.file) return m._blob || (m._blob = URL.createObjectURL(m.file));
    if (isElectron) return meyAPI.fileUrl(m.path);
    if (isAndroid) return Cap.convertFileSrc(m.uri || ('file://' + m.path));
    return m.path;
  },
  async addFolder() {
    if (isElectron) { const p = await meyAPI.pickFolder(); if (p && !S.folders.includes(p)) { S.folders.push(p); save('folders'); } return !!p; }
    $('#inFolder').click(); return false;
  },
  async saveData(name, blob) {
    if (isElectron) { const p = await meyAPI.saveFile(name, new Uint8Array(await blob.arrayBuffer())); return p; }
    if (isAndroid) {
      const FS = Cap.Plugins.Filesystem;
      const data = await new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result.split(',')[1]); fr.readAsDataURL(blob); });
      const res = await FS.writeFile({ path: 'MeyPlayer/' + name, data, directory: 'DOCUMENTS', recursive: true });
      return 'Documents/MeyPlayer/' + name + (res ? '' : '');
    }
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click(); return 'Downloads/' + name;
  },
  async share(m) {
    if (isElectron) { meyAPI.showItem(m.path); return; }
    if (isAndroid && Cap.Plugins.Share) { try { await Cap.Plugins.Share.share({ title: m.name, files: [m.uri || 'file://' + m.path] }); } catch (e) { toast('Share cancelled'); } return; }
    if (m.file && navigator.canShare && navigator.canShare({ files: [m.file] })) { try { await navigator.share({ files: [m.file], title: m.name }); } catch {} return; }
    toast('Sharing is not available here');
  },
  async orientation(mode) {
    if (isAndroid && Cap.Plugins.ScreenOrientation) {
      if (mode === 'auto') return Cap.Plugins.ScreenOrientation.unlock();
      return Cap.Plugins.ScreenOrientation.lock({ orientation: mode });
    }
    try { if (mode === 'auto') screen.orientation.unlock(); else await screen.orientation.lock(mode); return true; } catch { return false; }
  },
};
let browserFiles = [];

async function androidPerms() {
  // Permission prompt is requested natively by MainActivity on launch; here we just check readability.
  return true;
}
async function androidScan() {
  const FS = Cap.Plugins.Filesystem;
  const base = 'file:///storage/emulated/0/';
  const roots = ['DCIM','Movies','Download','Pictures','Music','Documents','Recordings','Telegram','WhatsApp/Media','Android/media/com.whatsapp/WhatsApp/Media', ...S.folders.map(f => f.replace(/^\/storage\/emulated\/0\//,''))];
  const out = []; const seen = new Set();
  async function walk(uriDir, depth) {
    if (depth > 6 || seen.has(uriDir)) return; seen.add(uriDir);
    let res; try { res = await FS.readdir({ path: uriDir }); } catch { return; }
    for (const f of res.files || []) {
      const name = typeof f === 'string' ? f : f.name;
      if (!name || name.startsWith('.')) continue;
      const uri = (f.uri) || (uriDir.replace(/\/$/, '') + '/' + name);
      if (f.type === 'directory') { await walk(uri, depth + 1); continue; }
      const k = kindOf(name); if (!k) continue;
      const path = decodeURI(uri.replace(/^file:\/\//, ''));
      out.push({ path, uri, name, size: f.size || 0, mtime: f.mtime || f.ctime || 0, kind: k });
    }
  }
  for (const r of roots) await walk(base + r, 0);
  return out;
}

/* ---------------- Library ---------------- */
let LIB = [];          // all media {id,path,name,folder,size,mtime,kind,...}
let SUBS = new Map();  // folder/stem -> sub path
const meta = new Map(); // path -> {dur,w,h,thumb}
const byPath = p => LIB.find(m => m.path === p);
async function rescan(quiet) {
  try {
    const list = await Plat.scan();
    SUBS = new Map(); LIB = [];
    for (const f of list) {
      const k = f.kind || kindOf(f.name); if (!k) continue;
      if (k === 'sub') { SUBS.set(dirOf(f.path) + '/' + stem(f.name).toLowerCase(), f); continue; }
      LIB.push(Object.assign({}, f, { kind: k, folder: f.folder || dirOf(f.path) }));
    }
    if (!quiet) toast(`Found ${LIB.length} media files`);
  } catch (e) { console.error(e); toast('Scan failed: ' + e.message); }
  render();
}
function addBrowserFiles(files) {
  for (const file of files) {
    const k = kindOf(file.name); if (!k) continue;
    const rel = file.webkitRelativePath || ('Opened files/' + file.name);
    const path = rel;
    if (browserFiles.some(b => b.path === path)) continue;
    browserFiles.push({ path, name: file.name, size: file.size, mtime: file.lastModified, kind: k, file, folder: dirOf(rel) || 'Opened files' });
  }
}
const visible = () => LIB.filter(m => !S.hidden.has(m.path));
function folders(kind = 'video') {
  const map = new Map();
  for (const m of visible()) {
    if (kind && m.kind !== kind) continue;
    if (!map.has(m.folder)) map.set(m.folder, []);
    map.get(m.folder).push(m);
  }
  return [...map.entries()].map(([path, items]) => ({ path, name: baseName(path) || path, items,
    fresh: items.filter(i => !S.played.has(i.path) && Date.now() - (i.mtime || 0) < 3 * 86400000).length }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
function sorted(items) {
  const s = S.settings.sort, a = [...items];
  if (s === 'name') a.sort((x, y) => x.name.localeCompare(y.name, undefined, { numeric: true }));
  else if (s === 'size') a.sort((x, y) => (y.size || 0) - (x.size || 0));
  else a.sort((x, y) => (y.mtime || 0) - (x.mtime || 0));
  return a;
}

/* thumbnails & durations (lazy, one at a time) */
const thumbQ = []; let thumbBusy = false;
const thumbVid = document.createElement('video'); thumbVid.muted = true; thumbVid.preload = 'metadata';
function wantThumb(m) { if (meta.has(m.path) || thumbQ.includes(m)) return; thumbQ.push(m); pumpThumbs(); }
function pumpThumbs() {
  if (thumbBusy || !thumbQ.length) return;
  const m = thumbQ.shift(); thumbBusy = true;
  const done = (info) => { meta.set(m.path, info); thumbBusy = false; updateRowMeta(m); setTimeout(pumpThumbs, 10); };
  const v = thumbVid; let finished = false;
  const timer = setTimeout(() => { if (!finished) { finished = true; done({}); } }, 6000);
  v.onloadedmetadata = () => { if (m.kind === 'audio') { finished = true; clearTimeout(timer); done({ dur: v.duration }); return; } v.currentTime = Math.min(v.duration * 0.15 || 1, 8); };
  v.onseeked = () => {
    if (finished) return; finished = true; clearTimeout(timer);
    let thumb = '';
    try { const c = document.createElement('canvas'); c.width = 216; c.height = 128; const g = c.getContext('2d');
      const r = Math.max(c.width / v.videoWidth, c.height / v.videoHeight); const w = v.videoWidth * r, h = v.videoHeight * r;
      g.drawImage(v, (c.width - w) / 2, (c.height - h) / 2, w, h); thumb = c.toDataURL('image/jpeg', .7); } catch {}
    done({ dur: v.duration, w: v.videoWidth, h: v.videoHeight, thumb });
  };
  v.onerror = () => { if (!finished) { finished = true; clearTimeout(timer); done({ err: true }); } };
  v.src = Plat.url(m);
}
function updateRowMeta(m) {
  const el = document.querySelector(`[data-path="${CSS.escape(m.path)}"] .thumb`); if (!el) return;
  const i = meta.get(m.path) || {};
  if (i.thumb) el.style.backgroundImage = `url(${i.thumb})`, el.innerHTML = '';
  if (i.dur) el.insertAdjacentHTML('beforeend', `<span class="dur">${fmtT(i.dur)}</span>`);
  const p = S.pos[m.path]; if (p && i.dur) el.insertAdjacentHTML('beforeend', `<span class="prog" style="width:${Math.min(100, p / i.dur * 100)}%"></span>`);
}

/* ---------------- Views ---------------- */
let tab = 'local', openFolder = null, query = '', subView = null;
const view = $('#view');
function render() {
  $$('#bottomnav button').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.body.classList.toggle('dark', S.settings.dark);
  if (query) return renderSearch();
  if (tab === 'local') return openFolder ? renderFolder(openFolder) : renderFolders();
  if (tab === 'music') return renderMusic();
  if (tab === 'playlists') return subView ? renderListView(subView) : renderPlaylists();
  if (tab === 'me') return subView === 'privacy' ? renderPrivacy() : subView === 'settings' ? renderSettings() : renderMe();
}
function title(t) { $('#pageTitle').textContent = t; }
function mediaRow(m, extra = '') {
  const i = meta.get(m.path) || {}; if (!meta.has(m.path)) setTimeout(() => wantThumb(m));
  const isNew = !S.played.has(m.path) && Date.now() - (m.mtime || 0) < 3 * 86400000;
  const th = m.kind === 'audio' ? `<div class="thumb sq">${ic('note')}</div>` :
    `<div class="thumb" ${i.thumb ? `style="background-image:url(${i.thumb})"` : ''}>${i.thumb ? '' : ic('play')}${i.dur ? `<span class="dur">${fmtT(i.dur)}</span>` : ''}${S.pos[m.path] && i.dur ? `<span class="prog" style="width:${Math.min(100, S.pos[m.path] / i.dur * 100)}%"></span>` : ''}</div>`;
  return `<div class="row media" data-path="${esc(m.path)}">${th}<div class="meta"><div class="name ${isNew ? 'new' : ''}">${esc(m.name)}</div>
    <div class="sub">${[fmtSize(m.size), m.mtime ? new Date(m.mtime).toLocaleDateString() : '', extra].filter(Boolean).join(' · ')}</div></div>
    <button class="icon-btn more" data-act="item">${ic('dots')}</button></div>`;
}
function bindMediaRows(list) {
  $$('.row.media', view).forEach(r => {
    const m = byPath(r.dataset.path) || list.find(x => x.path === r.dataset.path);
    r.onclick = e => { if (e.target.closest('[data-act="item"]')) return itemMenu(m, list); openPlayer(m, list); };
    let t; r.oncontextmenu = e => { e.preventDefault(); itemMenu(m, list); };
    r.ontouchstart = () => { t = setTimeout(() => itemMenu(m, list), 550); }; r.ontouchend = r.ontouchmove = () => clearTimeout(t);
  });
}
function shortcuts() {
  const sc = [['music','Music',()=>switchTab('music')],['folderplus','Add Folder',addFolder],['file','Open File',()=>$('#inFiles').click()],
    ['playlist','My Playlists',()=>switchTab('playlists')],['heart','Favourites',()=>{switchTab('playlists');subView='fav';render();}],
    ['history','History',()=>{switchTab('playlists');subView='history';render();}],['shield','Privacy',()=>{switchTab('me');subView='privacy';render();}],['refresh','Rescan',()=>rescan()]];
  return { html: `<div class="shortcuts">${sc.map((s,i)=>`<button class="sc" data-sc="${i}"><span class="bubble" style="color:${['#f08a24','#3b82f6','#16a34a','#8b5cf6','#ef4058','#0ea5e9','#2563eb','#64748b'][i]}">${ic(s[0])}</span>${s[1]}</button>`).join('')}</div>`,
    bind: () => $$('.sc', view).forEach(b => b.onclick = sc[b.dataset.sc][2]) };
}
function renderFolders() {
  title('Folders');
  const f = folders('video'); const sc = shortcuts();
  let h = sc.html;
  if (!f.length) {
    h += `<div class="empty"><img src="assets/logo.png"><div><b>Welcome to MeyPlayer</b></div><div>${Plat.name === 'browser' ? 'Open a folder or files to start watching.' : 'No videos found yet. Add a folder or rescan your storage.'}</div>
      <button class="btn" id="eAdd">${ic('folderplus')}Add folder</button><button class="btn ghost" id="eOpen">${ic('file')}Open files</button></div>`;
  } else {
    h += f.map(x => `<div class="row" data-folder="${esc(x.path)}"><div class="thumb folder">${x.items[0] && meta.get(x.items[0].path)?.thumb ? '' : ''}</div>
      ${x.fresh ? `<span class="badge">${x.fresh}</span>` : ''}<div class="meta"><div class="name">${esc(x.name)}</div><div class="sub">${x.items.length} video${x.items.length > 1 ? 's' : ''}</div></div></div>`).join('');
  }
  view.innerHTML = h + `<button id="fab" title="Play last">${ic('play')}</button>`; sc.bind();
  $$('.row[data-folder]', view).forEach(r => r.onclick = () => { openFolder = r.dataset.folder; render(); view.scrollTop = 0; });
  if ($('#eAdd')) { $('#eAdd').onclick = addFolder; $('#eOpen').onclick = () => $('#inFiles').click(); }
  $('#fab').onclick = () => { const h0 = S.history.find(h => byPath(h.path)); if (h0) { const m = byPath(h0.path); openPlayer(m, sorted(visible().filter(x => x.folder === m.folder))); } else toast('Nothing played yet'); };
}
function renderFolder(path) {
  const items = sorted(visible().filter(m => m.folder === path && m.kind === 'video'));
  title(baseName(path) || 'Folder');
  view.innerHTML = `<div class="crumb"><button class="icon-btn" id="upBtn">${ic('back')}</button><b>${esc(baseName(path))}</b><span style="color:var(--sub);font-size:14px">&nbsp;${items.length} video${items.length === 1 ? "" : "s"}</span></div>` + items.map(m => mediaRow(m)).join('');
  $('#upBtn').onclick = () => { openFolder = null; render(); };
  bindMediaRows(items);
}
function renderMusic() {
  title('Music');
  const items = sorted(visible().filter(m => m.kind === 'audio'));
  view.innerHTML = items.length ? `<div class="sec-title"><span>${items.length} song${items.length === 1 ? '' : 's'}</span><button class="chip" id="playAll">${'Play all'}</button></div>` + items.map(m => mediaRow(m, esc(baseName(m.folder)))).join('')
    : `<div class="empty"><img src="assets/logo.png"><div>No music found.</div><button class="btn" id="eOpen">${ic('file')}Open audio files</button></div>`;
  if ($('#playAll')) $('#playAll').onclick = () => openPlayer(items[0], items);
  if ($('#eOpen')) $('#eOpen').onclick = () => $('#inFiles').click();
  bindMediaRows(items);
}
function renderPlaylists() {
  title('Playlists');
  const pl = Object.keys(S.playlists);
  view.innerHTML = `<div class="card">
    <div class="row" data-v="fav"><div class="thumb sq" style="color:#ef4058">${ic('heartf')}</div><div class="meta"><div class="name">Favourites</div><div class="sub">${[...S.fav].filter(byPath).length} items</div></div></div>
    <div class="row" data-v="history"><div class="thumb sq" style="color:#0ea5e9">${ic('history')}</div><div class="meta"><div class="name">History</div><div class="sub">${S.history.filter(h=>byPath(h.path)).length} items</div></div></div></div>
    <div class="sec-title"><span>My playlists</span><button class="chip" id="newPl">+ New</button></div><div class="card">
    ${pl.length ? pl.map(n => `<div class="row" data-v="pl:${esc(n)}"><div class="thumb sq" style="color:var(--accent)">${ic('playlist')}</div><div class="meta"><div class="name">${esc(n)}</div><div class="sub">${S.playlists[n].length} items</div></div><button class="icon-btn more" data-del="${esc(n)}">${ic('trash')}</button></div>`).join('')
      : '<div class="empty" style="padding:24px">No playlists yet. Use “Add To Playlist” from any video.</div>'}</div>`;
  $$('.row[data-v]', view).forEach(r => r.onclick = e => { const d = e.target.closest('[data-del]'); if (d) { if (confirm('Delete playlist "' + d.dataset.del + '"?')) { delete S.playlists[d.dataset.del]; save('playlists'); render(); } return; } subView = r.dataset.v; render(); });
  $('#newPl').onclick = () => { const n = prompt('Playlist name'); if (n && !S.playlists[n]) { S.playlists[n] = []; save('playlists'); render(); } };
}
function listFor(v) {
  if (v === 'fav') return [...S.fav].map(byPath).filter(Boolean);
  if (v === 'history') return S.history.map(h => byPath(h.path)).filter(Boolean);
  if (v.startsWith('pl:')) return (S.playlists[v.slice(3)] || []).map(byPath).filter(Boolean);
  return [];
}
function renderListView(v) {
  const items = listFor(v); const name = v === 'fav' ? 'Favourites' : v === 'history' ? 'History' : v.slice(3);
  title(name);
  view.innerHTML = `<div class="crumb"><button class="icon-btn" id="upBtn">${ic('back')}</button><b>${esc(name)}</b>
    ${items.length ? `<button class="chip" id="playAll" style="margin-left:auto">Play all</button>` : ''}${v === 'history' && items.length ? `<button class="chip" id="clr">Clear</button>` : ''}</div>` +
    (items.length ? items.map(m => mediaRow(m)).join('') : '<div class="empty">Empty</div>');
  $('#upBtn').onclick = () => { subView = null; render(); };
  if ($('#playAll')) $('#playAll').onclick = () => openPlayer(items[0], items);
  if ($('#clr')) $('#clr').onclick = () => { S.history = []; save('history'); render(); };
  bindMediaRows(items);
}
function renderSearch() {
  title('Search');
  const q = query.toLowerCase(); const items = visible().filter(m => m.name.toLowerCase().includes(q)).slice(0, 300);
  view.innerHTML = `<div class="sec-title">${items.length} results</div>` + items.map(m => mediaRow(m, esc(baseName(m.folder)))).join('');
  bindMediaRows(items);
}
function renderMe() {
  title('Me');
  view.innerHTML = `<div class="card" style="padding:18px;display:flex;align-items:center;gap:14px"><img src="assets/logo.png" style="width:64px;border-radius:16px">
    <div><div style="font-size:20px;font-weight:700">MeyPlayer</div><div style="color:var(--sub);font-size:13px">by Kamil</div><div style="color:var(--sub);font-size:14px">${visible().filter(m=>m.kind==='video').length} videos · ${visible().filter(m=>m.kind==='audio').length} songs · ${Plat.name}</div></div></div>
    <div class="card">
      <div class="row" id="mPriv"><div class="thumb sq" style="color:#2563eb">${ic('shield')}</div><div class="meta"><div class="name">Privacy folder</div><div class="sub">${S.hidden.size} hidden · PIN protected</div></div>${ic('chev')}</div>
      <div class="row" id="mSet"><div class="thumb sq" style="color:#64748b">${ic('gear')}</div><div class="meta"><div class="name">Settings</div><div class="sub">Theme, scan folders, playback</div></div>${ic('chev')}</div>
      <div class="row" id="mTut"><div class="thumb sq" style="color:#f59e0b">${ic('bulb')}</div><div class="meta"><div class="name">Gesture tutorial</div><div class="sub">Learn player controls</div></div>${ic('chev')}</div>
      <div class="row" id="mAbout"><div class="thumb sq" style="color:var(--accent)">${ic('info')}</div><div class="meta"><div class="name">About</div><div class="sub">MeyPlayer 1.0.0 · Owner: Kamil</div></div>${ic('chev')}</div>
    </div>`;
  $('#mPriv').onclick = () => { subView = 'privacy'; render(); };
  $('#mSet').onclick = () => { subView = 'settings'; render(); };
  $('#mTut').onclick = () => toast('Open any video, then tap ⋮ → Tutorial');
  $('#mAbout').onclick = () => sheet(`<div class="sheet-h">About MeyPlayer</div><div style="padding:0 20px 10px;text-align:center"><img src="assets/logo.png" style="width:90px;border-radius:22px"><p>Version 1.0.0<br>Offline video & music player for Windows and Android.</p></div><table class="info"><tr><td>App owner</td><td>Kamil</td></tr><tr><td>Version</td><td>1.0.0</td></tr><tr><td>Platforms</td><td>Windows, Android</td></tr><tr><td>Running on</td><td>${Plat.name}</td></tr></table><p style="text-align:center;color:var(--sub);font-size:13px">© ${new Date().getFullYear()} Kamil. All rights reserved.</p>`);
}
let privUnlocked = false;
function renderPrivacy() {
  title('Privacy');
  const back = `<div class="crumb"><button class="icon-btn" id="upBtn">${ic('back')}</button><b>Privacy folder</b></div>`;
  const bindBack = () => $('#upBtn').onclick = () => { subView = null; privUnlocked = false; render(); };
  if (!S.pin) {
    view.innerHTML = back + `<div class="empty">${ic('shield')}<p>Set a 4-digit PIN to protect hidden videos.</p><div class="field"><input id="pin1" type="password" inputmode="numeric" maxlength="8" placeholder="New PIN"></div><button class="btn" id="setPin">Set PIN</button></div>`;
    bindBack(); $('#setPin').onclick = () => { const v = $('#pin1').value; if (v.length < 4) return toast('PIN must be at least 4 digits'); S.pin = v; save('pin'); privUnlocked = true; render(); };
    return;
  }
  if (!privUnlocked) {
    view.innerHTML = back + `<div class="empty">${ic('lock')}<p>Enter PIN</p><div class="field"><input id="pin1" type="password" inputmode="numeric" maxlength="8"></div><button class="btn" id="unl">Unlock</button></div>`;
    bindBack(); const go = () => { if ($('#pin1').value === S.pin) { privUnlocked = true; render(); } else toast('Wrong PIN'); };
    $('#unl').onclick = go; $('#pin1').onkeydown = e => e.key === 'Enter' && go(); $('#pin1').focus(); return;
  }
  const items = [...S.hidden].map(byPath).filter(Boolean);
  view.innerHTML = back + (items.length ? items.map(m => mediaRow(m, 'hidden')).join('') : '<div class="empty">No hidden videos. Use ⋮ → Hide on any video.</div>');
  bindBack(); bindMediaRows(items);
}
function renderSettings() {
  title('Settings'); const st = S.settings;
  view.innerHTML = `<div class="crumb"><button class="icon-btn" id="upBtn">${ic('back')}</button><b>Settings</b></div>
  <div class="card">
    <div class="opt" id="sDark">${ic('night')}Dark theme<span class="r">${st.dark ? 'On' : 'Off'}</span></div>
    <div class="opt" id="sResume">${ic('history')}Resume where I left off<span class="r">${st.resume ? 'On' : 'Off'}</span></div>
    <div class="opt" id="sBg">${ic('headphones')}Background play<span class="r">${st.bgPlay ? 'On' : 'Off'}</span></div>
    <div class="opt" id="sSort">${ic('sort')}Sort by<span class="r">${st.sort}</span></div>
  </div>
  <div class="sec-title"><span>Scan folders</span><button class="chip" id="sAdd">+ Add</button></div>
  <div class="card">${S.folders.length ? S.folders.map((f,i) => `<div class="opt">${ic('folder')}<span style="word-break:break-all">${esc(f)}</span><button class="icon-btn r" data-rm="${i}">${ic('trash')}</button></div>`).join('') : `<div class="opt" style="color:var(--sub)">${Plat.name==='windows'?'Videos, Downloads, Desktop, Music and Pictures are scanned automatically.':Plat.name==='android'?'Camera, Movies, Download, Music and WhatsApp folders are scanned automatically.':'Use Add Folder to load files.'}</div>`}</div>
  <div class="card"><div class="opt" id="sRescan">${ic('refresh')}Rescan media now</div><div class="opt" id="sReset" style="color:#ef4058">${ic('trash')}Clear history & resume points</div></div>`;
  $('#upBtn').onclick = () => { subView = null; render(); };
  $('#sDark').onclick = () => { st.dark = !st.dark; save('settings'); render(); };
  $('#sResume').onclick = () => { st.resume = !st.resume; save('settings'); render(); };
  $('#sBg').onclick = () => { st.bgPlay = !st.bgPlay; save('settings'); render(); };
  $('#sSort').onclick = sortMenu;
  $('#sAdd').onclick = addFolder;
  $('#sRescan').onclick = () => rescan();
  $('#sReset').onclick = () => { if (confirm('Clear history and resume points?')) { S.history = []; S.pos = {}; S.played.clear(); ['history','pos','played'].forEach(save); toast('Cleared'); } };
  $$('[data-rm]', view).forEach(b => b.onclick = () => { S.folders.splice(+b.dataset.rm, 1); save('folders'); rescan(true); });
}
function switchTab(t) { tab = t; subView = null; openFolder = null; query = ''; $('#searchBar').classList.add('hidden'); render(); view.scrollTop = 0; }
async function addFolder() { if (await Plat.addFolder()) rescan(); }
function sortMenu() {
  const o = [['date','Date (newest)'],['name','Name'],['size','Size (largest)']];
  sheet(`<div class="sheet-h">Sort by</div>` + o.map(([k,l]) => `<div class="opt ${S.settings.sort===k?'sel':''}" data-k="${k}">${l}</div>`).join('') +
    `<div class="opt" data-k="dark">${ic('night')}${S.settings.dark ? 'Light theme' : 'Dark theme'}</div>`, b => $$('[data-k]', b).forEach(x => x.onclick = () => {
      if (x.dataset.k === 'dark') S.settings.dark = !S.settings.dark; else S.settings.sort = x.dataset.k; save('settings'); closeSheet(); render(); }));
}
function itemMenu(m, list) {
  const fav = S.fav.has(m.path), hid = S.hidden.has(m.path);
  sheet(`<div class="sheet-h" style="font-size:16px;word-break:break-all">${esc(m.name)}</div>
    <div class="opt" data-a="play">${ic('play')}Play</div>
    <div class="opt" data-a="fav">${ic(fav?'heartf':'heart')}${fav?'Remove from favourites':'Add to favourites'}</div>
    <div class="opt" data-a="pl">${ic('addlist')}Add to playlist</div>
    <div class="opt" data-a="info">${ic('info')}Information</div>
    <div class="opt" data-a="share">${ic('share')}${isElectron ? 'Show in folder' : 'Share'}</div>
    <div class="opt" data-a="hide">${ic('eyeoff')}${hid ? 'Unhide (move out of Privacy)' : 'Hide (move to Privacy)'}</div>`, b => $$('[data-a]', b).forEach(x => x.onclick = () => {
      const a = x.dataset.a; closeSheet();
      if (a === 'play') openPlayer(m, list);
      if (a === 'fav') { toggleFav(m); render(); }
      if (a === 'pl') playlistMenu(m);
      if (a === 'info') infoSheet(m);
      if (a === 'share') Plat.share(m);
      if (a === 'hide') { if (hid) S.hidden.delete(m.path); else { if (!S.pin) toast('Tip: set a PIN in Me → Privacy'); S.hidden.add(m.path); } save('hidden'); render(); toast(hid ? 'Unhidden' : 'Moved to Privacy'); }
    }));
}
function toggleFav(m) { if (S.fav.has(m.path)) { S.fav.delete(m.path); toast('Removed from favourites'); } else { S.fav.add(m.path); toast('Added to favourites ♥'); } save('fav'); }
function playlistMenu(m, dark) {
  const names = Object.keys(S.playlists);
  sheet(`<div class="sheet-h">Add to playlist</div><div class="opt" data-n="">${ic('plus')}New playlist…</div>` +
    names.map(n => `<div class="opt" data-n="${esc(n)}">${ic('playlist')}${esc(n)}<span class="r">${S.playlists[n].includes(m.path) ? '✓' : S.playlists[n].length}</span></div>`).join(''),
    b => $$('[data-n]', b).forEach(x => x.onclick = () => {
      let n = x.dataset.n; if (!n) { n = prompt('Playlist name'); if (!n) return; S.playlists[n] = S.playlists[n] || []; }
      if (!S.playlists[n].includes(m.path)) S.playlists[n].push(m.path); save('playlists'); closeSheet(); toast('Added to ' + n);
    }), dark);
}
function infoSheet(m, dark) {
  const i = meta.get(m.path) || {}; const v = P.media === m ? video : null;
  const rows = [['Name', m.name], ['Location', m.folder], ['Size', fmtSize(m.size)], ['Date', fmtDate(m.mtime)], ['Format', ext(m.name).toUpperCase()],
    ['Duration', fmtT(v ? v.duration : i.dur)], ['Resolution', (v && v.videoWidth) ? `${v.videoWidth} × ${v.videoHeight}` : i.w ? `${i.w} × ${i.h}` : '—'], ['Path', m.path]];
  sheet(`<div class="sheet-h">Information</div><table class="info">${rows.map(r => `<tr><td>${r[0]}</td><td>${esc(r[1] || '—')}</td></tr>`).join('')}</table>`, null, dark);
}

/* ---------------- Sheet & toast ---------------- */
function sheet(html, bind, dark) {
  const s = $('#sheet'); $('#sheetBody').innerHTML = html; s.classList.toggle('dark', !!dark || S.settings.dark);
  s.classList.remove('hidden'); $('#sheetBack').classList.remove('hidden'); s.scrollTop = 0;
  if (bind) bind($('#sheetBody'));
  P.keepControls = true;
}
function closeSheet() { $('#sheet').classList.add('hidden'); $('#sheetBack').classList.add('hidden'); P.keepControls = false; if (P.open) poke(); }
$('#sheetBack').onclick = closeSheet;
let toastT; function toast(t) { const e = $('#toast'); e.textContent = t; e.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => e.classList.remove('show'), 2200); }

/* ======================= PLAYER ======================= */
const video = $('#video'), player = $('#player');
const P = { open: false, media: null, queue: [], idx: 0, loop: 'off', shuffle: false, ab: [null, null], sleepAt: 0, sleepEnd: false, sleepT: null,
  aspect: 0, rotate: 0, locked: false, keepControls: false, orient: 'auto', audio: null, subCues: [], subOffset: 0, track: null };
const ASPECTS = ['Fit', 'Fill', 'Stretch', '16:9', '4:3', '100%'];
const TOOLS = {
  night: ['night', 'Night Mode', () => { S.settings.night = !S.settings.night; save('settings'); applyNight(); toast('Night mode ' + (S.settings.night ? 'on' : 'off')); }, () => S.settings.night],
  custom: ['edit', 'Customise Items', customiseTools],
  shuffle: ['shuffle', 'Shuffle', () => { P.shuffle = !P.shuffle; toast('Shuffle ' + (P.shuffle ? 'on' : 'off')); }, () => P.shuffle],
  loop: ['loop', 'Loop', cycleLoop, () => P.loop !== 'off'],
  mute: ['mute', 'Mute', () => { video.muted = !video.muted; toast(video.muted ? 'Muted' : 'Sound on'); }, () => video.muted],
  sleep: ['timer', 'Sleep Timer', sleepMenu, () => !!(P.sleepAt || P.sleepEnd)],
  ab: ['ab', 'A - B Repeat', abRepeat, () => P.ab[0] != null],
  effect: ['wave', 'Audio Effect', effectMenu, () => S.settings.bass || S.settings.reverb || S.settings.boost !== 100],
  eq: ['eq', 'Equalizer', eqMenu, () => S.settings.eq.some(x => x)],
  speed: [null, 'Speed', speedMenu],
  shot: ['camera', 'Screenshot', screenshot],
  bg: ['headphones', 'Background Play', () => { S.settings.bgPlay = !S.settings.bgPlay; save('settings'); toast('Background play ' + (S.settings.bgPlay ? 'on' : 'off')); }, () => S.settings.bgPlay],
  rotate: ['rotate', 'Screen Rotation', rotateScreen, () => P.orient !== 'auto' || P.rotate],
};
function renderTools() {
  const row = $('#toolRow');
  row.innerHTML = S.settings.tools.filter(k => TOOLS[k]).map(k => { const [icn, label, , on] = TOOLS[k];
    const inner = k === 'speed' ? `${+video.playbackRate.toFixed(2)}X` : k === 'loop' && P.loop === 'one' ? ic('loop1') : ic(icn);
    return `<button class="tool ${on && on() ? 'on' : ''}" data-t="${k}"><span class="tc">${inner}</span>${label}</button>`; }).join('');
  $$('.tool', row).forEach(b => b.onclick = e => { e.stopPropagation(); TOOLS[b.dataset.t][2](); renderTools(); poke(); });
}
function customiseTools() {
  const all = Object.keys(TOOLS).filter(k => k !== 'custom');
  sheet(`<div class="sheet-h">Customise items<span style="font-size:13px;color:var(--sub)">tap to show/hide</span></div><div class="grid">` +
    all.map(k => `<div class="gi ${S.settings.tools.includes(k) ? 'on' : ''}" data-k="${k}"><span class="circ">${k === 'speed' ? '1X' : ic(TOOLS[k][0])}</span>${TOOLS[k][1]}</div>`).join('') + `</div>`,
    b => $$('.gi', b).forEach(g => g.onclick = () => { const k = g.dataset.k, t = S.settings.tools;
      if (t.includes(k)) t.splice(t.indexOf(k), 1); else t.push(k); if (!t.includes('custom')) t.unshift('custom');
      g.classList.toggle('on'); save('settings'); renderTools(); }), true);
}

function openPlayer(m, list) {
  if (!m) return;
  P.queue = list && list.length ? list : [m]; P.idx = Math.max(0, P.queue.indexOf(m));
  player.classList.remove('hidden'); P.open = true; player.focus();
  if (isAndroid && Cap.Plugins.StatusBar) Cap.Plugins.StatusBar.hide().catch(() => {});
  load(m);
}
function load(m, autoplay = true) {
  saveProgress();
  P.media = m; P.ab = [null, null]; P.subCues = []; P.subOffset = 0; clearTracks();
  player.classList.toggle('audio', m.kind === 'audio'); $('#audioTitle').textContent = stem(m.name);
  $('#pTitle').textContent = m.kind === 'audio' ? stem(m.name) : m.name;
  video.src = Plat.url(m); video.playbackRate = S.settings.speed || 1;
  video.onloadedmetadata = () => {
    $('#tDur').textContent = fmtT(video.duration);
    const p = S.pos[m.path];
    if (S.settings.resume && p > 5 && p < video.duration - 5) { video.currentTime = p; toast('Resumed from ' + fmtT(p)); }
    const i = meta.get(m.path) || {}; meta.set(m.path, Object.assign(i, { dur: video.duration, w: video.videoWidth, h: video.videoHeight }));
    $('#pBadges').innerHTML = video.videoHeight ? `<span>${video.videoHeight >= 2160 ? '4K' : video.videoHeight >= 1080 ? 'FHD' : video.videoHeight >= 720 ? 'HD' : 'SD'}</span>` : '';
    applyAspect(); drawMarks();
    autoSubtitle(m);
  };
  video.onerror = () => toast('Cannot play this file format on this device');
  if (autoplay) video.play().catch(() => {});
  S.played.add(m.path); save('played');
  S.history = [{ path: m.path, t: Date.now() }, ...S.history.filter(h => h.path !== m.path)].slice(0, 200); save('history');
  renderTools(); applyNight(); applyDisplay(); poke();
  if ('mediaSession' in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({ title: stem(m.name), artist: 'MeyPlayer', artwork: [{ src: 'assets/logo.png', sizes: '256x256', type: 'image/png' }] });
    navigator.mediaSession.setActionHandler('nexttrack', () => next(1)); navigator.mediaSession.setActionHandler('previoustrack', () => next(-1));
  }
}
function closePlayer() {
  saveProgress(); video.pause(); video.removeAttribute('src'); video.load();
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  if (document.pictureInPictureElement) document.exitPictureInPicture().catch(() => {});
  if (P.orient !== 'auto') { P.orient = 'auto'; Plat.orientation('auto'); }
  if (isAndroid && Cap.Plugins.StatusBar) Cap.Plugins.StatusBar.show().catch(() => {});
  player.classList.add('hidden'); P.open = false; P.locked = false; setLocked(false); closeSheet(); render();
}
function saveProgress() { if (P.media && video.currentTime > 0) { const d = video.duration; S.pos[P.media.path] = d && video.currentTime > d - 3 ? 0 : video.currentTime; save('pos'); } }
function next(dir = 1, auto = false) {
  const n = P.queue.length; if (!n) return;
  if (auto && P.loop === 'one') { video.currentTime = 0; video.play(); return; }
  let i;
  if (P.shuffle && n > 1) { do i = Math.floor(Math.random() * n); while (i === P.idx); }
  else { i = P.idx + dir; if (i >= n) { if (auto && P.loop !== 'all') return; i = 0; } if (i < 0) i = n - 1; }
  P.idx = i; S.pos[P.media.path] = 0; load(P.queue[i]);
}
function togglePlay() { if (video.paused) video.play().catch(() => {}); else video.pause(); }
video.onplay = video.onpause = () => { setIcon($('#pPlay'), video.paused ? 'play' : 'pause'); if (!video.paused) poke(); };
video.onended = () => { if (P.sleepEnd) { P.sleepEnd = false; toast('Sleep timer: stopped'); renderTools(); return; } next(1, true); };
let lastSave = 0;
video.ontimeupdate = () => {
  const d = video.duration || 0, t = video.currentTime;
  if (!seeking) { $('#seek').value = d ? t / d * 1000 : 0; $('#seekFill').style.width = (d ? t / d * 100 : 0) + '%'; }
  $('#tCur').textContent = fmtT(t);
  if (P.ab[0] != null && P.ab[1] != null && t >= P.ab[1]) video.currentTime = P.ab[0];
  if (P.sleepAt && Date.now() >= P.sleepAt) { P.sleepAt = 0; video.pause(); toast('Sleep timer: paused'); renderTools(); }
  if (Date.now() - lastSave > 5000) { lastSave = Date.now(); saveProgress(); }
};
video.onprogress = () => { try { const b = video.buffered; if (b.length) $('#seekBuf').style.width = b.end(b.length - 1) / video.duration * 100 + '%'; } catch {} };
let seeking = false;
$('#seek').oninput = e => { seeking = true; const d = video.duration || 0; const t = e.target.value / 1000 * d; $('#tCur').textContent = fmtT(t); $('#seekFill').style.width = e.target.value / 10 + '%'; poke(); };
$('#seek').onchange = e => { seeking = false; video.currentTime = e.target.value / 1000 * (video.duration || 0); };

/* controls visibility */
let hideT;
function poke() { player.classList.remove('hide-ctl'); clearTimeout(hideT); hideT = setTimeout(() => { if (!video.paused && !P.keepControls && !P.locked) player.classList.add('hide-ctl'); }, 3500); }
function setLocked(v) { P.locked = v; $('#pUnlock').classList.toggle('hidden', !v); player.classList.toggle('hide-ctl', v); if (!v) poke(); }
$('#pLock').onclick = () => { setLocked(true); toast('Screen locked'); };
$('#pUnlock').onclick = e => { e.stopPropagation(); setLocked(false); toast('Unlocked'); };
$('#pBack').onclick = closePlayer;
$('#pPlay').onclick = togglePlay;
$('#pPrev').onclick = () => next(-1);
$('#pNext').onclick = () => next(1);
$('#pMore').onclick = moreMenu;
$('#pAspect').onclick = () => { P.aspect = (P.aspect + 1) % ASPECTS.length; applyAspect(); toast('Aspect: ' + ASPECTS[P.aspect]); };
$('#pPip').onclick = async () => {
  if (document.pictureInPictureEnabled && !isAndroid && P.media.kind === 'video') {
    try { if (document.pictureInPictureElement) await document.exitPictureInPicture(); else await video.requestPictureInPicture(); return; } catch {}
  }
  toggleFullscreen();
};
function toggleFullscreen() { if (document.fullscreenElement) document.exitFullscreen(); else player.requestFullscreen().catch(() => toast('Fullscreen not available')); }

/* gestures on stage */
const stage = $('#stage'); let g = null, tapT = null, lastTap = 0, brightness = 1;
stage.addEventListener('pointerdown', e => { if (P.locked) { $('#pUnlock').classList.remove('hidden'); return; } g = { x: e.clientX, y: e.clientY, t: video.currentTime, v: video.volume, b: brightness, mode: null, time: Date.now() }; });
stage.addEventListener('pointermove', e => {
  if (!g || P.locked) return; const dx = e.clientX - g.x, dy = e.clientY - g.y;
  if (!g.mode) { if (Math.abs(dx) > 18) g.mode = 'seek'; else if (Math.abs(dy) > 18) g.mode = e.clientX < innerWidth / 2 ? 'bright' : 'vol'; else return; }
  const hud = $('#gestureHud'); hud.classList.remove('hidden');
  if (g.mode === 'seek') { const nt = Math.max(0, Math.min(video.duration || 0, g.t + dx / innerWidth * 120)); g.nt = nt; hud.innerHTML = `${fmtT(nt)} / ${fmtT(video.duration)}<br><small>${dx > 0 ? '+' : ''}${Math.round(nt - g.t)}s</small>`; }
  if (g.mode === 'vol') { const v = Math.max(0, Math.min(1, g.v - dy / (innerHeight * .6))); video.volume = v; video.muted = false; hud.innerHTML = ic('vol') + Math.round(v * 100) + '%'; }
  if (g.mode === 'bright') { brightness = Math.max(.2, Math.min(1.6, g.b - dy / (innerHeight * .6))); applyDisplay(); hud.innerHTML = ic('sun') + Math.round(brightness * 100) + '%'; }
});
stage.addEventListener('pointerup', e => {
  if (P.locked) { setTimeout(() => !P.locked || $('#pUnlock').classList.add('hidden'), 2500); return; }
  $('#gestureHud').classList.add('hidden');
  if (g && g.mode === 'seek' && g.nt != null) video.currentTime = g.nt;
  if (g && !g.mode) {
    const now = Date.now();
    if (now - lastTap < 300) { clearTimeout(tapT); lastTap = 0; const third = e.clientX / innerWidth;
      if (third < .35) seekBy(-10, e.clientX); else if (third > .65) seekBy(10, e.clientX); else togglePlay();
    } else { lastTap = now; tapT = setTimeout(() => { if (player.classList.contains('hide-ctl')) poke(); else if (!video.paused) player.classList.add('hide-ctl'); }, 300); }
  }
  g = null;
});
function seekBy(s, x) { video.currentTime = Math.max(0, Math.min(video.duration || 0, video.currentTime + s)); const f = $('#seekFlash'); f.textContent = (s > 0 ? '+' : '') + s + 's'; f.style.left = x < innerWidth / 2 ? '12%' : 'auto'; f.style.right = x < innerWidth / 2 ? 'auto' : '12%'; f.classList.remove('hidden'); clearTimeout(f._t); f._t = setTimeout(() => f.classList.add('hidden'), 600); }
player.addEventListener('mousemove', () => !P.locked && poke());
player.addEventListener('wheel', e => { if (!P.open || P.locked || !$('#sheet').classList.contains('hidden')) return; video.volume = Math.max(0, Math.min(1, video.volume - Math.sign(e.deltaY) * .05)); const hud = $('#gestureHud'); hud.innerHTML = ic('vol') + Math.round(video.volume * 100) + '%'; hud.classList.remove('hidden'); clearTimeout(hud._t); hud._t = setTimeout(() => hud.classList.add('hidden'), 700); }, { passive: true });
document.addEventListener('keydown', e => {
  if (!P.open || e.target.tagName === 'INPUT') return;
  const k = e.key;
  if (k === ' ' || k === 'k') { e.preventDefault(); togglePlay(); }
  else if (k === 'ArrowRight') seekBy(e.shiftKey ? 30 : 10, innerWidth);
  else if (k === 'ArrowLeft') seekBy(e.shiftKey ? -30 : -10, 0);
  else if (k === 'ArrowUp') { video.volume = Math.min(1, video.volume + .05); toast('Volume ' + Math.round(video.volume * 100) + '%'); }
  else if (k === 'ArrowDown') { video.volume = Math.max(0, video.volume - .05); toast('Volume ' + Math.round(video.volume * 100) + '%'); }
  else if (k === 'f') toggleFullscreen();
  else if (k === 'm') TOOLS.mute[2]();
  else if (k === 'n') next(1); else if (k === 'p') next(-1);
  else if (k === 's') screenshot();
  else if (k === 'Escape') { if (!$('#sheet').classList.contains('hidden')) closeSheet(); else if (!document.fullscreenElement) closePlayer(); }
  else return; poke(); renderTools();
});

/* --- tool implementations --- */
function applyNight() { player.classList.toggle('night', !!S.settings.night); }
function applyDisplay() { const d = S.settings.disp; video.style.filter = `brightness(${d.b / 100 * brightness}) contrast(${d.c / 100}) saturate(${d.s / 100})`; }
function applyAspect() {
  const a = ASPECTS[P.aspect], vw = video.videoWidth || 16, vh = video.videoHeight || 9;
  video.style.width = video.style.height = ''; video.style.objectFit = 'contain';
  if (a === 'Fill') video.style.objectFit = 'cover';
  else if (a === 'Stretch') video.style.objectFit = 'fill';
  else if (a === '16:9' || a === '4:3') { const r = a === '16:9' ? 16 / 9 : 4 / 3; const W = stage.clientWidth, H = stage.clientHeight;
    let w = W, h = W / r; if (h > H) { h = H; w = H * r; } video.style.width = w + 'px'; video.style.height = h + 'px'; video.style.objectFit = 'fill'; }
  else if (a === '100%') { video.style.width = vw + 'px'; video.style.height = vh + 'px'; video.style.objectFit = 'none'; }
  video.style.transform = P.rotate ? `rotate(${P.rotate}deg)` + (P.rotate % 180 ? ` scale(${Math.min(stage.clientHeight / stage.clientWidth, stage.clientWidth / stage.clientHeight)})` : '') : '';
}
addEventListener('resize', () => P.open && applyAspect());
function cycleLoop() { P.loop = P.loop === 'off' ? 'all' : P.loop === 'all' ? 'one' : 'off'; video.loop = false; toast({ off: 'Loop off', all: 'Loop all', one: 'Loop current video' }[P.loop]); }
function sleepMenu() {
  const opts = [[0, 'Off'], [15, '15 minutes'], [30, '30 minutes'], [45, '45 minutes'], [60, '60 minutes'], [90, '90 minutes'], [-1, 'End of current video']];
  const left = P.sleepAt ? Math.ceil((P.sleepAt - Date.now()) / 60000) + ' min left' : P.sleepEnd ? 'at end of video' : 'off';
  sheet(`<div class="sheet-h">Sleep timer<span style="font-size:13px;color:var(--sub)">${left}</span></div>` + opts.map(([v, l]) => `<div class="opt" data-v="${v}">${l}</div>`).join(''),
    b => $$('[data-v]', b).forEach(x => x.onclick = () => { const v = +x.dataset.v; P.sleepAt = v > 0 ? Date.now() + v * 60000 : 0; P.sleepEnd = v === -1; closeSheet(); renderTools(); toast(v ? 'Sleep timer set' : 'Sleep timer off'); }), true);
}
function abRepeat() {
  if (P.ab[0] == null) { P.ab[0] = video.currentTime; toast('Point A set at ' + fmtT(P.ab[0]) + ' — tap again for B'); }
  else if (P.ab[1] == null) { if (video.currentTime <= P.ab[0] + .5) return toast('B must be after A'); P.ab[1] = video.currentTime; video.currentTime = P.ab[0]; toast(`Repeating ${fmtT(P.ab[0])} – ${fmtT(P.ab[1])}`); }
  else { P.ab = [null, null]; toast('A-B repeat off'); }
  drawMarks();
}
function drawMarks() {
  const d = video.duration || 0;
  ['abA', 'abB'].forEach((id, i) => { const el = $('#' + id); el.classList.toggle('hidden', P.ab[i] == null || !d); if (d && P.ab[i] != null) el.style.left = P.ab[i] / d * 100 + '%'; });
  const bm = P.media ? S.bookmarks[P.media.path] || [] : [];
  $('#bmMarks').innerHTML = d ? bm.map(b => `<i style="left:${b / d * 100}%"></i>`).join('') : '';
}
function speedMenu() {
  const sp = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3, 4];
  sheet(`<div class="sheet-h">Playback speed</div><div class="chips">` + sp.map(s => `<span class="chip ${video.playbackRate === s ? 'sel' : ''}" data-s="${s}">${s}X</span>`).join('') + `</div>
    <div class="sl"><label>Custom <b id="spv">${video.playbackRate.toFixed(2)}X</b></label><input type="range" id="spr" min="0.25" max="4" step="0.05" value="${video.playbackRate}"></div>`,
    b => { $$('[data-s]', b).forEach(c => c.onclick = () => { setSpeed(+c.dataset.s); closeSheet(); });
      $('#spr', b).oninput = e => { setSpeed(+e.target.value); $('#spv', b).textContent = (+e.target.value).toFixed(2) + 'X'; }; }, true);
}
function setSpeed(s) { video.playbackRate = s; S.settings.speed = s; save('settings'); renderTools(); }
async function screenshot() {
  if (P.media.kind !== 'video' || !video.videoWidth) return toast('No video frame to capture');
  try {
    const c = document.createElement('canvas'); c.width = video.videoWidth; c.height = video.videoHeight;
    const g2 = c.getContext('2d'); g2.filter = video.style.filter || 'none'; g2.drawImage(video, 0, 0);
    const blob = await new Promise(r => c.toBlob(r, 'image/png'));
    const name = `MeyPlayer_${stem(P.media.name).slice(0, 40)}_${fmtT(video.currentTime).replace(/:/g, '-')}.png`;
    const where = await Plat.saveData(name, blob); toast('Screenshot saved: ' + where);
  } catch (e) { toast('Screenshot failed: ' + e.message); }
}
async function rotateScreen() {
  if (isAndroid) {
    P.orient = P.orient === 'auto' ? 'landscape' : P.orient === 'landscape' ? 'portrait' : 'auto';
    await Plat.orientation(P.orient); toast('Orientation: ' + P.orient);
  } else { P.rotate = (P.rotate + 90) % 360; applyAspect(); toast('Rotated ' + P.rotate + '°'); }
}
document.addEventListener('visibilitychange', () => {
  if (document.hidden && P.open && !video.paused && !S.settings.bgPlay && !document.pictureInPictureElement) { video.pause(); P.bgPaused = true; }
  else if (!document.hidden && P.bgPaused) { P.bgPaused = false; }
});

/* --- Web Audio: equalizer & effects --- */
const EQ_FREQ = [31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
const EQ_PRESETS = { Normal: [0,0,0,0,0,0,0,0,0,0], Pop: [-1,1,3,4,3,0,-1,-1,0,1], Rock: [5,4,2,-1,-2,-1,2,4,5,5], Jazz: [3,2,1,2,-1,-1,0,1,2,3],
  Classical: [4,3,2,1,-1,-1,0,2,3,4], Dance: [6,5,2,0,0,-2,-2,0,4,5], 'Bass Boost': [7,6,5,3,1,0,0,0,0,0], Vocal: [-2,-2,-1,1,4,5,4,2,0,-1], 'Treble Boost': [0,0,0,0,0,1,3,5,7,8] };
function audioGraph() {
  if (P.audio) return P.audio;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const src = ctx.createMediaElementSource(video);
    const bands = EQ_FREQ.map((f, i) => { const b = ctx.createBiquadFilter(); b.type = i === 0 ? 'lowshelf' : i === 9 ? 'highshelf' : 'peaking'; b.frequency.value = f; b.Q.value = 1.1; return b; });
    const bass = ctx.createBiquadFilter(); bass.type = 'lowshelf'; bass.frequency.value = 120;
    const gain = ctx.createGain(); const dry = ctx.createGain(); const wet = ctx.createGain(); const conv = ctx.createConvolver();
    const len = ctx.sampleRate * 2.2, ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
    conv.buffer = ir;
    let node = src; bands.forEach(b => { node.connect(b); node = b; }); node.connect(bass); bass.connect(gain);
    gain.connect(dry); dry.connect(ctx.destination); gain.connect(conv); conv.connect(wet); wet.connect(ctx.destination);
    P.audio = { ctx, bands, bass, gain, wet, dry };
    applyAudio(); return P.audio;
  } catch (e) { toast('Audio processing unavailable: ' + e.message); return null; }
}
function applyAudio() {
  const a = P.audio; if (!a) return; const st = S.settings;
  a.bands.forEach((b, i) => b.gain.value = st.eq[i]); a.bass.gain.value = st.bass; a.gain.gain.value = st.boost / 100;
  a.wet.gain.value = st.reverb / 100 * .8; a.dry.gain.value = 1 - st.reverb / 100 * .35;
  if (a.ctx.state === 'suspended') a.ctx.resume();
}
function eqMenu() {
  if (!audioGraph()) return; const st = S.settings;
  sheet(`<div class="sheet-h">Equalizer<button class="chip" id="eqReset">Reset</button></div><div class="chips">` +
    Object.keys(EQ_PRESETS).map(p => `<span class="chip ${st.eqPreset === p ? 'sel' : ''}" data-p="${p}">${p}</span>`).join('') + `</div>
    <div class="eq">${EQ_FREQ.map((f, i) => `<div class="band"><span id="eqv${i}">${st.eq[i] > 0 ? '+' : ''}${st.eq[i]}</span><input type="range" min="-12" max="12" step="1" value="${st.eq[i]}" data-i="${i}"><span>${f >= 1000 ? f / 1000 + 'k' : f}</span></div>`).join('')}</div>`,
    b => {
      const sync = () => $$('.eq input', b).forEach((r, i) => { r.value = st.eq[i]; $('#eqv' + i, b).textContent = (st.eq[i] > 0 ? '+' : '') + st.eq[i]; });
      $$('[data-p]', b).forEach(c => c.onclick = () => { st.eq = [...EQ_PRESETS[c.dataset.p]]; st.eqPreset = c.dataset.p; $$('[data-p]', b).forEach(x => x.classList.toggle('sel', x === c)); sync(); applyAudio(); save('settings'); renderTools(); });
      $$('.eq input', b).forEach(r => r.oninput = () => { st.eq[+r.dataset.i] = +r.value; st.eqPreset = 'Custom'; $$('[data-p]', b).forEach(x => x.classList.remove('sel')); sync(); applyAudio(); save('settings'); renderTools(); });
      $('#eqReset', b).onclick = () => $('[data-p="Normal"]', b).click();
    }, true);
}
function effectMenu() {
  if (!audioGraph()) return; const st = S.settings;
  const sl = (id, label, min, max, val, unit) => `<div class="sl"><label>${label}<b id="${id}v">${val}${unit}</b></label><input type="range" id="${id}" min="${min}" max="${max}" value="${val}"></div>`;
  sheet(`<div class="sheet-h">Audio effect<button class="chip" id="fxReset">Reset</button></div>` + sl('fxBass', 'Bass boost', 0, 15, st.bass, ' dB') + sl('fxBoost', 'Volume boost', 50, 250, st.boost, '%') + sl('fxRev', 'Reverb / room', 0, 100, st.reverb, '%'),
    b => {
      const bind = (id, key, unit) => $('#' + id, b).oninput = e => { st[key] = +e.target.value; $('#' + id + 'v', b).textContent = e.target.value + unit; applyAudio(); save('settings'); renderTools(); };
      bind('fxBass', 'bass', ' dB'); bind('fxBoost', 'boost', '%'); bind('fxRev', 'reverb', '%');
      $('#fxReset', b).onclick = () => { st.bass = 0; st.boost = 100; st.reverb = 0; applyAudio(); save('settings'); closeSheet(); effectMenu(); renderTools(); };
    }, true);
}

/* --- More menu --- */
function moreMenu() {
  const m = P.media; const fav = S.fav.has(m.path);
  const items = [['note', 'Audio Track', audioTrackMenu], ['sub', 'Subtitle', subtitleMenu], ['queue', 'Playing Queue', queueMenu], ['aspect', 'Aspect Ratio', aspectMenu],
    ['display', 'Display Settings', displayMenu], ['bookmark', 'Bookmark', bookmarkMenu], ['cut', 'Cut', cutMenu], [fav ? 'heartf' : 'heart', 'Favourite', () => { toggleFav(m); closeSheet(); }],
    ['addlist', 'Add To Playlist', () => playlistMenu(m, true)], ['info', 'Information', () => infoSheet(m, true)], ['share', isElectron ? 'Show in Folder' : 'Share', () => { closeSheet(); Plat.share(m); }],
    ['bulb', 'Tutorial', () => { closeSheet(); tutorial(); }], ['full', 'Fullscreen', () => { closeSheet(); toggleFullscreen(); }]];
  sheet(`<div class="grid">${items.map((x, i) => `<div class="gi ${x[1] === 'Favourite' && fav ? 'on' : ''}" data-i="${i}"><span class="circ">${ic(x[0])}</span>${x[1]}</div>`).join('')}</div>`,
    b => $$('.gi', b).forEach(g => g.onclick = () => items[+g.dataset.i][2]()), true);
}
function audioTrackMenu() {
  const at = video.audioTracks;
  if (!at || at.length <= 1) return sheet(`<div class="sheet-h">Audio track</div><div class="opt sel">${ic('check')}Track 1 (default)</div><div class="opt" style="color:var(--sub);font-size:14px">${at ? 'This file has a single audio track.' : 'Multiple audio tracks are not supported on this device.'}</div>`, null, true);
  sheet(`<div class="sheet-h">Audio track</div>` + [...at].map((t, i) => `<div class="opt ${t.enabled ? 'sel' : ''}" data-i="${i}">${ic('note')}${esc(t.label || t.language || 'Track ' + (i + 1))}</div>`).join(''),
    b => $$('[data-i]', b).forEach(o => o.onclick = () => { [...at].forEach((t, i) => t.enabled = i === +o.dataset.i); closeSheet(); toast('Audio track changed'); }), true);
}
function clearTracks() { [...video.textTracks].forEach(t => t.mode = 'disabled'); P.track = null; }
function parseSubs(text) {
  text = text.replace(/\r/g, '').replace(/^WEBVTT[^\n]*\n/, '');
  const cues = []; const toS = s => { const p = s.trim().replace(',', '.').split(':'); return p.length === 3 ? +p[0] * 3600 + +p[1] * 60 + +p[2] : +p[0] * 60 + +p[1]; };
  for (const block of text.split(/\n\s*\n/)) {
    const lines = block.split('\n').filter(Boolean); const ti = lines.findIndex(l => l.includes('-->')); if (ti < 0) continue;
    const [a, b] = lines[ti].split('-->'); cues.push({ s: toS(a), e: toS(b.trim().split(' ')[0]), t: lines.slice(ti + 1).join('\n').replace(/<[^>]+>/g, '') });
  }
  return cues;
}
function loadSubs(text, label) {
  P.subCues = parseSubs(text); if (!P.subCues.length) return toast('No subtitles found in file');
  clearTracks(); P.track = video.addTextTrack('subtitles', label, 'en'); P.track.mode = 'showing'; rebuildCues(); toast('Subtitle loaded: ' + label);
}
function rebuildCues() {
  const t = P.track; if (!t) return; while (t.cues && t.cues.length) t.removeCue(t.cues[0]);
  for (const c of P.subCues) { const s = Math.max(0, c.s + P.subOffset), e = Math.max(s + .1, c.e + P.subOffset); try { t.addCue(new VTTCue(s, e, c.t)); } catch {} }
  player.style.setProperty('--cue-size', S.settings.cueSize + 'px');
}
async function autoSubtitle(m) {
  const s = SUBS.get(m.folder + '/' + stem(m.name).toLowerCase()); if (!s) return;
  try { const r = await fetch(Plat.url(s)); loadSubs(await r.text(), s.name); } catch {}
}
function subtitleMenu() {
  sheet(`<div class="sheet-h">Subtitle</div>
    <div class="opt" id="subLoad">${ic('file')}Load subtitle file (.srt / .vtt)</div>
    <div class="opt ${!P.track ? 'sel' : ''}" id="subOff">${ic('close')}Off</div>
    ${P.track ? `<div class="opt sel">${ic('check')}${esc(P.track.label)}</div>` : ''}
    <div class="sl"><label>Text size<b id="csv">${S.settings.cueSize}px</b></label><input type="range" id="cs" min="12" max="48" value="${S.settings.cueSize}"></div>
    <div class="sl"><label>Sync delay<b id="sov">${P.subOffset.toFixed(1)}s</b></label><input type="range" id="so" min="-10" max="10" step="0.1" value="${P.subOffset}"></div>`,
    b => {
      $('#subLoad', b).onclick = () => { closeSheet(); $('#inSub').click(); };
      $('#subOff', b).onclick = () => { clearTracks(); closeSheet(); toast('Subtitles off'); };
      $('#cs', b).oninput = e => { S.settings.cueSize = +e.target.value; $('#csv', b).textContent = e.target.value + 'px'; player.style.setProperty('--cue-size', e.target.value + 'px'); save('settings'); };
      $('#so', b).onchange = e => { P.subOffset = +e.target.value; rebuildCues(); };
      $('#so', b).oninput = e => $('#sov', b).textContent = (+e.target.value).toFixed(1) + 's';
    }, true);
}
$('#inSub').onchange = async e => { const f = e.target.files[0]; if (f) loadSubs(await f.text(), f.name); e.target.value = ''; };
function queueMenu() {
  sheet(`<div class="sheet-h">Playing queue<span style="font-size:13px;color:var(--sub)">${P.queue.length} items${P.shuffle ? ' · shuffle' : ''}</span></div>` +
    P.queue.map((m, i) => `<div class="opt ${i === P.idx ? 'sel' : ''}" data-i="${i}">${ic(i === P.idx ? 'play' : m.kind === 'audio' ? 'note' : 'file')}<span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(m.name)}</span></div>`).join(''),
    b => { $$('[data-i]', b).forEach(o => o.onclick = () => { P.idx = +o.dataset.i; closeSheet(); load(P.queue[P.idx]); }); const s = $('.sel', b); if (s) s.scrollIntoView({ block: 'center' }); }, true);
}
function aspectMenu() {
  sheet(`<div class="sheet-h">Aspect ratio</div>` + ASPECTS.map((a, i) => `<div class="opt ${P.aspect === i ? 'sel' : ''}" data-i="${i}">${a}</div>`).join(''),
    b => $$('[data-i]', b).forEach(o => o.onclick = () => { P.aspect = +o.dataset.i; applyAspect(); closeSheet(); }), true);
}
function displayMenu() {
  const d = S.settings.disp; const sl = (k, l) => `<div class="sl"><label>${l}<b id="d${k}v">${d[k]}%</b></label><input type="range" min="30" max="200" value="${d[k]}" data-k="${k}"></div>`;
  sheet(`<div class="sheet-h">Display settings<button class="chip" id="dReset">Reset</button></div>` + sl('b', 'Brightness') + sl('c', 'Contrast') + sl('s', 'Saturation') +
    `<div class="opt" id="dNight">${ic('night')}Night mode (eye comfort)<span class="r">${S.settings.night ? 'On' : 'Off'}</span></div>`,
    b => { $$('[data-k]', b).forEach(r => r.oninput = () => { d[r.dataset.k] = +r.value; $('#d' + r.dataset.k + 'v', b).textContent = r.value + '%'; applyDisplay(); save('settings'); });
      $('#dReset', b).onclick = () => { S.settings.disp = { b: 100, c: 100, s: 100 }; brightness = 1; applyDisplay(); save('settings'); closeSheet(); displayMenu(); };
      $('#dNight', b).onclick = () => { TOOLS.night[2](); renderTools(); closeSheet(); }; }, true);
}
function bookmarkMenu() {
  const k = P.media.path; const list = (S.bookmarks[k] || []).sort((a, b) => a - b);
  sheet(`<div class="sheet-h">Bookmarks<button class="chip" id="bmAdd">+ Add at ${fmtT(video.currentTime)}</button></div>` +
    (list.length ? list.map((t, i) => `<div class="opt" data-t="${t}">${ic('bookmark')}${fmtT(t)}<button class="icon-btn r" data-del="${i}">${ic('trash')}</button></div>`).join('') : '<div class="opt" style="color:var(--sub)">No bookmarks yet</div>'),
    b => {
      $('#bmAdd', b).onclick = () => { (S.bookmarks[k] = S.bookmarks[k] || []).push(Math.floor(video.currentTime)); save('bookmarks'); drawMarks(); closeSheet(); toast('Bookmark added'); };
      $$('[data-t]', b).forEach(o => o.onclick = e => { const d = e.target.closest('[data-del]'); if (d) { list.splice(+d.dataset.del, 1); S.bookmarks[k] = list; save('bookmarks'); drawMarks(); closeSheet(); bookmarkMenu(); return; } video.currentTime = +o.dataset.t; closeSheet(); });
    }, true);
}
function cutMenu() {
  const d = video.duration || 0; let a = P.ab[0] ?? Math.floor(video.currentTime), z = P.ab[1] ?? Math.min(d, a + 15);
  sheet(`<div class="sheet-h">Cut clip</div>
    <div class="sl"><label>Start<b id="ca">${fmtT(a)}</b></label><input type="range" id="cA" min="0" max="${d}" step="0.5" value="${a}"></div>
    <div class="sl"><label>End<b id="cz">${fmtT(z)}</b></label><input type="range" id="cZ" min="0" max="${d}" step="0.5" value="${z}"></div>
    <div class="opt" style="color:var(--sub);font-size:13px">Exports a WebM clip. The clip is recorded in real time, so keep the player open until it finishes.</div>
    <div class="sheet-actions"><button class="btn ghost" id="cPrev">Preview</button><button class="btn" id="cGo">${ic('cut')}Export clip</button></div>`,
    b => {
      $('#cA', b).oninput = e => { a = +e.target.value; $('#ca', b).textContent = fmtT(a); video.currentTime = a; };
      $('#cZ', b).oninput = e => { z = +e.target.value; $('#cz', b).textContent = fmtT(z); };
      $('#cPrev', b).onclick = () => { P.ab = [a, z]; drawMarks(); video.currentTime = a; video.play(); closeSheet(); toast('Previewing (A-B repeat on)'); renderTools(); };
      $('#cGo', b).onclick = () => { if (z - a < 1) return toast('Clip must be at least 1 second'); closeSheet(); exportClip(a, z); };
    }, true);
}
async function exportClip(a, z) {
  const cs = video.captureStream || video.mozCaptureStream; if (!cs || !window.MediaRecorder) return toast('Cut is not supported on this device');
  try {
    P.ab = [null, null]; drawMarks(); video.pause(); video.currentTime = a;
    await new Promise(r => video.addEventListener('seeked', r, { once: true }));
    const stream = cs.call(video); const type = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'].find(t => MediaRecorder.isTypeSupported(t));
    const rec = new MediaRecorder(stream, { mimeType: type, videoBitsPerSecond: 6e6 }); const chunks = [];
    rec.ondataavailable = e => e.data.size && chunks.push(e.data);
    const stopped = new Promise(r => rec.onstop = r);
    rec.start(500); video.play(); toast(`Cutting ${fmtT(a)} – ${fmtT(z)}…`);
    await new Promise(r => { const chk = () => { if (video.currentTime >= z || video.ended || video.paused) { video.removeEventListener('timeupdate', chk); r(); } }; video.addEventListener('timeupdate', chk); });
    video.pause(); rec.stop(); await stopped;
    const blob = new Blob(chunks, { type: 'video/webm' });
    const where = await Plat.saveData(`${stem(P.media.name).slice(0, 40)}_cut_${fmtT(a).replace(/:/g, '-')}.webm`, blob);
    toast('Clip saved: ' + where);
  } catch (e) { toast('Cut failed: ' + e.message); }
}
function tutorial() {
  const t = document.createElement('div'); t.className = 'tut';
  t.innerHTML = `<div><b>☀</b>Swipe up/down on the left<br>to change brightness</div><div><b>⇆</b>Swipe left/right to seek<br>Double-tap centre to play/pause</div><div><b>🔊</b>Swipe up/down on the right<br>to change volume</div>
    <div><b>«10</b>Double-tap left<br>to rewind 10s</div><div><b>🔒</b>Lock button<br>blocks accidental touches</div><div><b>10»</b>Double-tap right<br>to forward 10s</div>
    <button class="btn close">Got it</button>`;
  player.appendChild(t); t.querySelector('.close').onclick = () => t.remove();
  if (!isAndroid) t.insertAdjacentHTML('beforeend', '<div style="grid-column:1/4;font-size:13px;opacity:.8">Keyboard: Space play/pause · ←/→ seek · ↑/↓ volume · F fullscreen · M mute · N/P next/prev · S screenshot · mouse wheel volume</div>');
}

/* ---------------- Wiring ---------------- */
$$('#bottomnav button').forEach(b => b.onclick = () => switchTab(b.dataset.tab));
$('#btnSearch').onclick = () => { $('#searchBar').classList.remove('hidden'); $('#searchInput').focus(); };
$('#btnSearchClose').onclick = () => { query = ''; $('#searchInput').value = ''; $('#searchBar').classList.add('hidden'); render(); };
$('#searchInput').oninput = e => { query = e.target.value.trim(); render(); };
$('#btnSort').onclick = sortMenu;
$('#btnOpenFile').onclick = () => isElectron ? meyAPI.openFiles().then(ps => ps && ps.length && openPaths(ps)) : $('#inFiles').click();
$('#inFiles').onchange = e => { const fs = [...e.target.files]; e.target.value = ''; if (!fs.length) return;
  if (isElectron) return openPaths(fs.map(f => meyAPI.pathForFile(f)).filter(Boolean));
  const before = browserFiles.length; addBrowserFiles(fs); const added = browserFiles.slice(before);
  if (!isElectron && !isAndroid) { LIB = [...browserFiles]; }
  else added.forEach(a => { if (!byPath(a.path)) LIB.push(a); });
  render(); const list = added.length ? added : [];
  if (list[0]) openPlayer(list[0], list);
};
$('#inFolder').onchange = e => { addBrowserFiles([...e.target.files]); e.target.value = ''; if (!isAndroid) LIB = [...browserFiles]; else browserFiles.forEach(b => !byPath(b.path) && LIB.push(b)); render(); toast(`Loaded ${browserFiles.length} files`); };
function openPaths(paths) {
  const items = paths.map(p => byPath(p) || (() => { const k = kindOf(p); if (!k || k === 'sub') return null; const m = { path: p, name: baseName(p), folder: dirOf(p), kind: k, size: 0, mtime: 0 }; LIB.push(m); return m; })()).filter(Boolean);
  if (items[0]) openPlayer(items[0], items.length > 1 ? items : sorted(LIB.filter(m => m.folder === items[0].folder && m.kind === items[0].kind)));
}
/* drag & drop (desktop) */
addEventListener('dragover', e => e.preventDefault());
addEventListener('drop', e => { e.preventDefault(); const fs = [...e.dataTransfer.files]; if (!fs.length) return;
  if (isElectron) return openPaths(fs.map(f => meyAPI.pathForFile(f)).filter(Boolean));
  const before = browserFiles.length; addBrowserFiles(fs); LIB = [...browserFiles]; render(); const add = browserFiles.slice(before); if (add[0]) openPlayer(add[0], add); });
/* Android hardware back button */
if (isAndroid && Cap.Plugins.App) Cap.Plugins.App.addListener('backButton', () => {
  if (!$('#sheet').classList.contains('hidden')) return closeSheet();
  if ($('.tut')) return $('.tut').remove();
  if (P.open) return P.locked ? toast('Screen is locked') : closePlayer();
  if (query) return $('#btnSearchClose').click();
  if (openFolder || subView) { openFolder = null; subView = null; return render(); }
  if (tab !== 'local') return switchTab('local');
  Cap.Plugins.App.minimizeApp ? Cap.Plugins.App.minimizeApp() : Cap.Plugins.App.exitApp();
});
if (isAndroid && Cap.Plugins.App) Cap.Plugins.App.addListener('resume', () => { if (!P.open) rescan(true); });
if (isElectron) meyAPI.onOpenFile(ps => openPaths(ps));
addEventListener('beforeunload', saveProgress);
paintIcons();

window.meyRescan = () => rescan(true);
(async function init() {
  document.body.classList.toggle('dark', S.settings.dark);
  if (Plat.name === 'browser') { render(); return; }
  view.innerHTML = `<div class="empty"><img src="assets/logo.png"><div>Scanning your media…</div></div>`;
  await rescan(true);
  if (isElectron) { const ps = await meyAPI.initialFiles(); if (ps && ps.length) openPaths(ps); }
})();
