(() => {
'use strict';
/* Glovebox: vehicle repair, parts and warranty history. Static app; data in Firebase (see README.md). */

/* ---------- Vehicle catalog (year → make → model) ---------- */
const CATALOG = {};
const VEHICLE_DATA = window.VEHICLE_DATA || {};
for (const [make, list] of Object.entries(VEHICLE_DATA)) {
  CATALOG[make] = list.map(([m, rs]) => ({
    m,
    r: rs.split(',').map(p => { const [a, b] = p.split('-').map(Number); return [a + 1900, (isNaN(b) ? a : b) + 1900]; })
  }));
}
const MAKES = Object.keys(CATALOG).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
const MAX_YEAR = new Date().getFullYear() + 1;
const DATA_FIRST = 1992;
function modelOk(e, y) {
  if (y < DATA_FIRST) return true;
  return e.r.some(([a, b]) => {
    if (y >= 2025) return a <= y && b >= 2022;        // dataset thins out after 2024: carry recent models forward
    if (y >= 2023) return a <= y && b >= y - 1;
    return a <= y && b >= y;
  });
}
const makesFor = y => MAKES.filter(mk => CATALOG[mk].some(e => modelOk(e, y)));
const modelsFor = (mk, y) => (CATALOG[mk] || []).filter(e => modelOk(e, y)).map(e => e.m);

/* ---------- Small helpers ---------- */
const MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const pad = n => String(n).padStart(2, '0');
const isoOf = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const todayISO = () => isoOf(new Date());
const parseISO = s => { if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null; const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const today0 = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
const fmtDate = s => { const d = parseISO(s); return d ? `${MON[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}` : ''; };
const daysUntil = s => { const d = parseISO(s); return d ? Math.round((d - today0()) / 86400000) : null; };
const addMonthsISO = (s, m) => { const d = parseISO(s) || today0(); const day = d.getDate(); const r = new Date(d.getFullYear(), d.getMonth() + m, 1); const last = new Date(r.getFullYear(), r.getMonth() + 1, 0).getDate(); r.setDate(Math.min(day, last)); return isoOf(r); };
const addDaysISO = (s, n) => { const d = parseISO(s) || today0(); d.setDate(d.getDate() + n); return isoOf(d); };
const fmtNum = n => Number(n).toLocaleString('en-US');
const money = n => (n == null || n === '' || isNaN(Number(n))) ? '' : '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const moneyShort = n => '$' + Math.round(Number(n) || 0).toLocaleString('en-US');
const intOrNull = s => { const t = String(s ?? '').replace(/[^0-9]/g, ''); return t ? Math.min(Number(t), 9999999) : null; };
const moneyOrNull = s => { const t = String(s ?? '').replace(/[^0-9.]/g, ''); if (!t) return null; const n = Number(t); return isFinite(n) ? Math.round(n * 100) / 100 : null; };
const sum = arr => arr.reduce((a, b) => a + (Number(b) || 0), 0);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const newId = () => (window.crypto && crypto.randomUUID) ? crypto.randomUUID().replace(/-/g, '') : Date.now().toString(36) + Math.random().toString(36).slice(2, 12);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const safeImg = u => (typeof u === 'string' && u.startsWith('data:image/')) ? u : '';
const listJoin = a => a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1];
const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;

const ICONS = {
  car: '<path d="M5 17H3.5v-4.3l2-5.1A2.4 2.4 0 0 1 7.7 6h8.6a2.4 2.4 0 0 1 2.2 1.6l2 5.1V17H19"/><path d="M3.8 12.4h16.4"/><circle cx="7.5" cy="17" r="2"/><circle cx="16.5" cy="17" r="2"/><path d="M9.5 17h5"/>',
  shield: '<path d="M12 3l7 3v5.5c0 4.4-3 8-7 9.5-4-1.5-7-5.1-7-9.5V6z"/><path d="M9 12l2 2 4-4"/>',
  wrench: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.1L4 16.7 7.3 20l5.3-5.3a4 4 0 0 0 5.1-5.4l-2.5 2.5-2.6-.6-.6-2.6z"/>',
  drop: '<path d="M12 3.5s-6 6.6-6 10.8a6 6 0 0 0 12 0C18 10.1 12 3.5 12 3.5z"/>',
  box: '<path d="M3.5 7.5L12 3l8.5 4.5v9L12 21l-8.5-4.5z"/><path d="M3.5 7.5L12 12l8.5-4.5M12 12v9"/>',
  clip: '<rect x="5" y="4.5" width="14" height="16.5" rx="2"/><path d="M9 4.5V3h6v1.5M8.5 11.5l2 2 4-4M8.5 17h7"/>',
  dots: '<circle cx="6" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="18" cy="12" r="1.2"/>',
  camera: '<path d="M4 8h3l1.5-2h7L17 8h3v11H4z"/><circle cx="12" cy="13.5" r="3.5"/>',
  image: '<rect x="4" y="5" width="16" height="14" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="M20 16l-5-5-8 8"/>',
  receipt: '<path d="M6 3h12v18l-2-1.4-2 1.4-2-1.4-2 1.4-2-1.4L6 21z"/><path d="M9 8h6M9 12h6M9 16h3"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  chev: '<path d="M9 5l7 7-7 7"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/>',
  scan: '<path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M7.5 12h9"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
  bell: '<path d="M6 16v-5a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
  store: '<path d="M4 9.5L5.5 4h13L20 9.5"/><path d="M4 9.5a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0 2.7 2.7 0 0 0 5.3 0"/><path d="M5.5 11.5V20h13v-8.5M10 20v-5h4v5"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'
};
const icon = (n, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n] || ''}</svg>`;

const KINDS = [
  { id: 'repair', label: 'Repair', icon: 'wrench' },
  { id: 'maintenance', label: 'Maintenance', icon: 'drop' },
  { id: 'part', label: 'Part bought', icon: 'box' },
  { id: 'inspection', label: 'Inspection', icon: 'clip' },
  { id: 'other', label: 'Other', icon: 'dots' }
];
const KIND = Object.fromEntries(KINDS.map(k => [k.id, k]));
const STATUSES = [
  { id: 'done', label: 'Done' },
  { id: 'progress', label: 'In progress' },
  { id: 'waiting', label: 'Waiting on parts' }
];
const STATUS = Object.fromEntries(STATUSES.map(s => [s.id, s]));
const W_PRESETS = [
  { id: '90d', label: '90 days', days: 90 },
  { id: '6m', label: '6 months', months: 6 },
  { id: '12m', label: '1 year', months: 12 },
  { id: '24m', label: '2 years', months: 24 },
  { id: '36m', label: '3 years', months: 36 },
  { id: 'life', label: 'Lifetime' },
  { id: 'custom', label: 'Pick a date' }
];
const COLORS = [['White', '#F4F4F1'], ['Black', '#141618'], ['Silver', '#C3C8CD'], ['Gray', '#6D747B'], ['Red', '#B2241C'], ['Blue', '#2356A8'], ['Green', '#2E6A45'], ['Brown', '#6A4931'], ['Beige', '#D9C8A7'], ['Orange', '#E0661A'], ['Yellow', '#E6C01D']];
const COLOR = Object.fromEntries(COLORS);
const DIY = 'Me (DIY)';
const isDIY = s => /^\s*(me\b|myself|diy\b|me \(diy\))/i.test(s || '');
const MAX_PHOTOS = 6;

/* ---------- State ---------- */
const S = {
  status: 'loading', slow: false, subError: false, readOnly: false, canWrite: null,
  vehicles: new Map(), records: new Map(),
  view: 'garage', vehicleId: null, vtab: 'history', q: '', vq: '', openShop: null, rolled: false, everWrote: false
};
let auth = null, fs = null, uid = null, userEmail = '';
const unsubs = [];
const CFG = window.GLOVEBOX_CONFIG || {};
const PHOTO_MAX_CHARS = 850000;          // Firestore documents top out at 1 MiB
const LINK_EMAIL_KEY = 'glovebox-email-for-link';
const photoCache = new Map();
const clone = o => JSON.parse(JSON.stringify(o));
function mapErr(e) {
  const c = String((e && e.code) || '').replace(/^(firestore|auth)\//, '');
  if (c === 'permission-denied') return { code: 'denied', message: e.message };
  if (c === 'unauthenticated') return { code: 'auth', message: e.message };
  if (c === 'resource-exhausted') return { code: 'quota_exceeded', message: e.message };
  if (c === 'unavailable' || c === 'deadline-exceeded' || c === 'network-request-failed') return { code: 'unavailable', message: e.message };
  if (c === 'invalid-argument') return { code: 'too_big', message: e.message };
  return { code: 'unknown', message: e && e.message };
}
const userDoc = () => fs.collection('users').doc(uid);
function table(name) {
  return {
    doc: id => {
      const ref = () => userDoc().collection(name).doc(id);
      return {
        async set(data) { try { await ref().set(clone(data)); } catch (e) { throw mapErr(e); } },
        async update(patch) { try { await ref().update(clone(patch)); } catch (e) { throw mapErr(e); } },
        async delete() { try { await ref().delete(); } catch (e) { throw mapErr(e); } }
      };
    }
  };
}
const refs = { vehicles: table('vehicles'), records: table('records') };
const photos = {
  async put(id, dataUrl) {
    try { await userDoc().collection('photos').doc(id).set({ dataUrl, createdAt: Date.now() }); }
    catch (e) { throw mapErr(e); }
    photoCache.set(id, dataUrl);
  },
  async remove(ids) {
    for (const id of ids) {
      photoCache.delete(id);
      try { await userDoc().collection('photos').doc(id).delete(); } catch (e) { throw mapErr(e); }
    }
  },
  async url(id) {
    if (photoCache.has(id)) return photoCache.get(id);
    let snap;
    try { snap = await userDoc().collection('photos').doc(id).get(); } catch (e) { throw mapErr(e); }
    const u = snap.exists ? safeImg(snap.data().dataUrl) : '';
    if (u) photoCache.set(id, u);
    return u;
  }
};

/* ---------- Derived data ---------- */
const byDateDesc = (a, b) => (b.date || '').localeCompare(a.date || '') || (b.createdAt || 0) - (a.createdAt || 0);
const vehiclesSorted = () => [...S.vehicles.values()].sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
const recordsOf = vid => [...S.records.values()].filter(r => r.vehicleId === vid).sort(byDateDesc);
const allRecords = () => [...S.records.values()].filter(r => S.vehicles.has(r.vehicleId)).sort(byDateDesc);
const vName = v => v ? [v.year, v.make, v.model].filter(Boolean).join(' ') : 'Unknown vehicle';
const vShort = v => v ? (v.nickname || `${v.make} ${v.model}`) : 'Unknown vehicle';
function curMiles(v) {
  if (!v) return 0;
  let m = Number(v.mileage) || 0;
  for (const r of S.records.values()) if (r.vehicleId === v.id && Number(r.miles) > m) m = Number(r.miles);
  return m;
}
const isOpen = r => r.status && r.status !== 'done';

function wInfo(r) {
  const w = r.warranty;
  if (!w || !w.on) return null;
  const v = S.vehicles.get(r.vehicleId);
  const cur = curMiles(v);
  const endMiles = (w.miles && r.miles) ? Number(r.miles) + Number(w.miles) : null;
  const days = w.lifetime ? null : (w.until ? daysUntil(w.until) : null);
  let state;
  if (w.lifetime) state = 'active';
  else if (days == null && endMiles == null) state = 'open';
  else if ((days != null && days < 0) || (endMiles != null && cur >= endMiles)) state = 'expired';
  else if ((days != null && days <= 60) || (endMiles != null && endMiles - cur <= 1000)) state = 'soon';
  else state = 'active';
  return { state, days, endMiles, milesLeft: endMiles != null ? endMiles - cur : null, w };
}
function wLine(i) {
  if (i.w.lifetime) return 'Lifetime warranty';
  const p = [];
  if (i.w.until) p.push(i.days != null && i.days < 0 ? `Ended ${fmtDate(i.w.until)}` : `Good until ${fmtDate(i.w.until)}`);
  if (i.endMiles != null) p.push(`${fmtNum(i.endMiles)} mi`);
  else if (i.w.miles) p.push(`${fmtNum(i.w.miles)} mi from install`);
  return p.length ? p.join(' or ') : 'No end date saved';
}
function wLeft(i) {
  if (i.w.lifetime) return 'Lifetime';
  if (i.state === 'expired') return 'Expired';
  const b = [];
  if (i.days != null) b.push(i.days === 0 ? 'Ends today' : i.days === 1 ? '1 day left' : `${fmtNum(i.days)} days left`);
  if (i.milesLeft != null) b.push(`${fmtNum(i.milesLeft)} mi left`);
  return b.join(' · ');
}
const wClass = i => ({ active: 'good', open: 'good', soon: 'warn', expired: 'muted' }[i.state]);

function dueInfo(r) {
  const n = r.next;
  if (!n || n.cleared || (!n.date && !n.miles)) return null;
  const v = S.vehicles.get(r.vehicleId);
  if (!v) return null;
  const cur = curMiles(v);
  const days = n.date ? daysUntil(n.date) : null;
  const ml = n.miles ? Number(n.miles) - cur : null;
  let state = 'later';
  if ((days != null && days < 0) || (ml != null && ml <= 0)) state = 'over';
  else if ((days != null && days <= 30) || (ml != null && ml <= 500)) state = 'soon';
  return { state, days, milesLeft: ml, label: n.label || r.title, n, r, v };
}
function dueLine(d) {
  const p = [];
  if (d.n.date) p.push(fmtDate(d.n.date));
  if (d.n.miles) p.push(fmtNum(d.n.miles) + ' mi');
  return 'Due ' + p.join(' or ');
}
function dueLeft(d) {
  if (d.state === 'over') return 'Overdue';
  const b = [];
  if (d.days != null) b.push(d.days === 0 ? 'today' : `in ${plural(d.days, 'day')}`);
  if (d.milesLeft != null && curMiles(d.v) > 0) b.push(`${fmtNum(d.milesLeft)} mi to go`);
  return b.join(' · ');
}
const dueRank = d => (d.state === 'over' ? 0 : d.state === 'soon' ? 1 : 2) * 1e7 + (d.days ?? 1e6);

function alertsAll() {
  const out = [];
  for (const r of allRecords()) {
    const d = dueInfo(r);
    if (d && d.state !== 'later') out.push({ sev: d.state === 'over' ? 'bad' : 'warn', icon: 'bell', title: d.state === 'over' ? `${d.label} is overdue` : `${d.label} is coming up`, sub: `${vShort(d.v)} · ${dueLine(d)}`, rid: r.id, rank: d.state === 'over' ? 0 : 2 });
    const w = wInfo(r);
    if (w && w.state === 'soon') out.push({ sev: 'warn', icon: 'shield', title: `Warranty ending: ${r.warranty.covers || r.title}`, sub: `${vShort(S.vehicles.get(r.vehicleId))} · ${wLeft(w)}`, rid: r.id, rank: 1 });
  }
  return out.sort((a, b) => a.rank - b.rank);
}
function knownNames(field) {
  const seen = new Map();
  for (const r of allRecords()) {
    const n = (r[field] || '').trim();
    if (!n || (field === 'doneBy' && isDIY(n))) continue;
    const k = n.toLowerCase();
    if (!seen.has(k)) seen.set(k, n);
  }
  return [...seen.values()];
}

/* ---------- Rendering: shared pieces ---------- */
function odo(n, o = {}) {
  const known = n > 0;
  const s = known ? String(Math.round(n)).padStart(6, '0') : '------';
  let lead = known;
  const cells = [...s].map((c, i) => {
    if (c !== '0') lead = false;
    const cls = (lead && i < s.length - 1) ? ' lead' : '';
    return `<span class="cell${i === s.length - 1 ? ' last' : ''}${cls}"><span class="dg" style="--i:${i}">${c === '-' ? '–' : c}</span></span>`;
  }).join('');
  return `<span class="odo${o.lg ? ' lg' : ''}${o.roll ? ' roll' : ''}" role="img" aria-label="${known ? fmtNum(n) + ' miles' : 'Mileage not logged yet'}">${cells}<span class="unit" aria-hidden="true">MI</span></span>`;
}
const colorDot = c => COLOR[c] ? `<span class="dot" style="background:${COLOR[c]}"></span>` : '';
function statusChip(r) {
  if (r.status === 'progress') return `<span class="chip info">In progress</span>`;
  if (r.status === 'waiting') return `<span class="chip warn">Waiting on parts</span>`;
  return '';
}
function wChip(i) {
  if (!i) return '';
  if (i.state === 'expired') return `<span class="chip tag">Warranty expired</span>`;
  if (i.state === 'soon') return `<span class="chip warn tag">Warranty ends soon</span>`;
  return `<span class="chip good tag">Under warranty</span>`;
}
function recordRow(r, o = {}) {
  const d = parseISO(r.date), k = KIND[r.kind] || KIND.other, v = S.vehicles.get(r.vehicleId);
  const meta = [o.showVehicle ? vShort(v) : '', r.doneBy, r.vendor && !r.doneBy ? 'from ' + r.vendor : '', r.miles ? fmtNum(r.miles) + ' mi' : ''].filter(Boolean).map(esc).join(' · ');
  const n = (r.photos || []).length;
  return `<button class="wo" data-act="open-record" data-id="${esc(r.id)}">
    <span class="wo-date mono"><b>${d ? MON[d.getMonth()] + ' ' + pad(d.getDate()) : '—'}</b><span>${d ? d.getFullYear() : ''}</span></span>
    <span class="wo-main">
      <span class="wo-title">${icon(k.icon)}<span>${esc(r.title)}</span></span>
      ${meta ? `<span class="wo-meta">${meta}</span>` : ''}
      <span class="chips">${statusChip(r)}${wChip(wInfo(r))}${n ? `<span class="chip">${icon('receipt')}${n}</span>` : ''}</span>
    </span>
    <span class="wo-cost mono">${r.cost != null ? money(r.cost) : ''}</span>
  </button>`;
}
function wCard(r, i, showVehicle) {
  const who = r.warranty.provider || r.doneBy || r.vendor || '';
  return `<button class="wcard ${wClass(i)}" data-act="open-record" data-id="${esc(r.id)}">
    <span class="wc-tag">${icon('shield')}</span>
    <span class="wc-main">
      <span class="wc-title">${esc(r.warranty.covers || r.title)}</span>
      <span class="wc-meta">${[showVehicle ? vShort(S.vehicles.get(r.vehicleId)) : '', who ? 'through ' + who : ''].filter(Boolean).map(esc).join(' · ')}</span>
      <span class="wc-meta">${esc(wLine(i))}</span>
    </span>
    <span class="wc-left"><b>${esc(wLeft(i))}</b>${(r.photos || []).length ? `<span>${icon('receipt')}Receipt</span>` : ''}</span>
  </button>`;
}
function alertHTML(a) {
  return `<button class="alert ${a.sev}" data-act="open-record" data-id="${esc(a.rid)}">${icon(a.icon)}<span><b>${esc(a.title)}</b><span class="sub">${esc(a.sub)}</span></span></button>`;
}
function banners() {
  let h = '';
  if (S.slow) h += `<div class="banner"><span class="grow">Can't reach your records right now. Check your connection; this page keeps trying.</span></div>`;
  if (S.subError) h += `<div class="banner"><span class="grow">Couldn't refresh your records. What you see may be out of date.</span><button class="btn sm" data-act="resub">Try again</button></div>`;
  return h;
}
const footer = () => `<div class="foot">
  <p>Signed in as <b>${esc(userEmail)}</b> · <button class="link" data-act="signout">Sign out</button></p>
  <p>Your records and receipt photos are private to your sign-in and sync between your phone and computer. On a phone, use your browser's “Add to Home Screen” to keep Glovebox one tap away.</p>
  <p>Year, make and model lists from <a href="https://github.com/abhionlyone/us-car-models-data" target="_blank" rel="noopener">US Car Models Data</a> (1992–2026), CC BY 4.0. Missing yours? Pick “Other” and type it in.</p>
</div>`;

/* ---------- Views ---------- */
function viewState() {
  const brand = `<header class="brand"><div><h1 class="wordmark"><span class="mark" aria-hidden="true"></span>Glovebox</h1><p>Repairs, parts and warranties for every vehicle</p></div></header>`;
  const msg = `<p class="err" id="si-msg" role="alert">${esc(S.signinErr || '')}</p>${S.signinOk ? `<p class="ok" role="status">${esc(S.signinOk)}</p>` : ''}`;
  if (S.status === 'signin') return brand + `<div class="state signin">
      <h2>Sign in</h2>
      <p>Use the Google account or email address that was set up for Glovebox.</p>
      <button type="button" class="btn primary wide" data-act="google">Continue with Google</button>
      <div class="or" aria-hidden="true"><span>or</span></div>
      <form id="link-form" class="signin-sub" novalidate>
        <div class="field"><label for="si-email">Email me a sign-in link</label><input id="si-email" type="email" autocomplete="email" inputmode="email" autocapitalize="off" spellcheck="false" placeholder="you@example.com" value="${esc(S.linkEmail || '')}"></div>
        <button type="submit" class="btn wide">Send link</button>
      </form>
      ${msg}
    </div>`;
  if (S.status === 'confirmemail') return brand + `<form class="state signin" id="confirm-form" novalidate>
      <h2>Finish signing in</h2>
      <p>You opened the sign-in link on a different device or browser. Type the email address you asked for the link with.</p>
      <div class="field"><label for="ce-email">Email</label><input id="ce-email" type="email" autocomplete="email" inputmode="email" autocapitalize="off" spellcheck="false"></div>
      <button type="submit" class="btn primary wide">Sign in</button>
      ${msg}
    </form>`;
  if (S.status === 'notallowed') return brand + `<div class="state signin">
      <h2>This account isn't set up yet</h2>
      <p>You're signed in as <b>${esc(userEmail || 'an account with no email')}</b>, but it isn't on Glovebox's list. Ask the person who set up Glovebox to add this email, then reload.</p>
      <button type="button" class="btn wide" data-act="signout-now">Sign in with a different account</button>
    </div>`;
  if (S.status === 'loading' && !S.slow) return brand + `<div class="skel"></div><div class="skel"></div>`;
  const st = {
    loading: ['Still loading your garage', 'The server is slow to answer. Check your connection.'],
    loadfail: ["Couldn't load your records", 'Check your connection, then try again.'],
    config: ["Glovebox isn't set up yet", 'This copy is missing its Firebase settings in config.js.']
  }[S.status] || ['Something went wrong', 'Reload the page and try again.'];
  return brand + `<div class="state"><h2>${esc(st[0])}</h2><p>${esc(st[1])}</p>${S.status === 'loadfail' ? '<button class="btn primary" data-act="resub" style="margin-top:16px">Try again</button>' : ''}</div>`;
}

function viewGarage() {
  const vs = vehiclesSorted();
  const head = `<header class="brand"><div><h1 class="wordmark"><span class="mark" aria-hidden="true"></span>Glovebox</h1><p>Repairs, parts and warranties for every vehicle</p></div>${vs.length && !S.readOnly ? `<button class="btn sm" data-act="add-vehicle">${icon('plus')}Vehicle</button>` : ''}</header>`;
  if (!vs.length) {
    return head + banners() + `<section class="empty">
      ${odo(0, { lg: true })}
      <h2>Every repair, part and warranty in one place.</h2>
      <p>Add each vehicle once. Then every time something gets fixed or you buy a part, log it and snap the receipt. Next time you wonder who did the brakes or whether that battery is still covered, it's right here.</p>
      <ol class="steps">
        <li><span><b>Add a vehicle</b><span>Pick the year, make and model.</span></span></li>
        <li><span><b>Log the work</b><span>What was done, who did it, what it cost, and any warranty.</span></span></li>
        <li><span><b>Snap the receipt</b><span>Take a photo so the proof is saved with the record.</span></span></li>
      </ol>
      ${S.readOnly ? '' : `<button class="btn primary" data-act="add-vehicle">${icon('plus')}Add your first vehicle</button>`}
    </section>` + footer();
  }
  return head + banners() + `<div class="search">${icon('search')}<label class="vh" for="gq">Search all records</label><input id="gq" type="search" placeholder="Search parts, shops, notes…" value="${esc(S.q)}" autocomplete="off" enterkeyhint="search"></div><div id="gresults">${garageBody()}</div>` + footer();
}
function garageBody() {
  if (S.q.trim()) return searchResults(S.q);
  const al = alertsAll().slice(0, 6);
  const roll = !S.rolled;
  S.rolled = true;
  const vs = vehiclesSorted();
  return (al.length ? `<div class="sec-h"><h2>Needs attention</h2><span>${al.length}</span></div><div class="alerts">${al.map(alertHTML).join('')}</div>` : '')
    + `<div class="sec-h"><h2>Your vehicles</h2><span>${vs.length}</span></div>
       <div class="vgrid">${vs.map(v => vcard(v, roll)).join('')}${S.readOnly ? '' : `<button class="add-tile" data-act="add-vehicle">${icon('plus')}Add a vehicle</button>`}</div>`;
}
function vcard(v, roll) {
  const recs = recordsOf(v.id);
  const open = recs.find(isOpen);
  const last = recs.find(r => !isOpen(r));
  const wa = recs.map(wInfo).filter(i => i && i.state !== 'expired').length;
  const over = recs.map(dueInfo).filter(d => d && d.state === 'over').length;
  const line = open
    ? `${statusChip(open)}<b>${esc(open.title)}</b>${open.doneBy ? '<br>' + esc(open.doneBy) + ' · since ' + esc(fmtDate(open.date)) : ''}`
    : last ? `Last: <b>${esc(last.title)}</b>${last.doneBy ? ' · ' + esc(last.doneBy) : ''} · ${fmtDate(last.date)}` : 'No work logged yet';
  const sub = [v.nickname, v.plate].filter(Boolean).map(esc).join(' · ');
  return `<button class="vcard" data-act="open-vehicle" data-id="${esc(v.id)}">
    <span class="vc-top">
      <span class="vc-id"><span class="eyebrow">${esc(v.year)}${v.color ? ` · ${colorDot(v.color)}${esc(v.color)}` : ''}</span><span class="vc-name">${esc(v.make)} ${esc(v.model)}</span>${sub ? `<span class="vc-sub">${sub}</span>` : ''}</span>
      ${odo(curMiles(v), { roll })}
    </span>
    <span class="vc-line">${line}</span>
    <span class="chips">${wa ? `<span class="chip good tag">${wa} under warranty</span>` : ''}${over ? `<span class="chip bad">${over} overdue</span>` : ''}<span class="chip">${plural(recs.length, 'record')}</span></span>
  </button>`;
}
function matches(r, terms) {
  const v = S.vehicles.get(r.vehicleId);
  const hay = [r.title, r.doneBy, r.vendor, r.notes, r.invoice, r.warranty?.covers, r.warranty?.provider, r.warranty?.notes, r.next?.label, vName(v), v?.nickname, (KIND[r.kind] || {}).label, fmtDate(r.date)].join(' ').toLowerCase();
  return terms.every(t => hay.includes(t));
}
function searchResults(q) {
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  const hits = allRecords().filter(r => matches(r, terms));
  if (!hits.length) return `<p class="pad muted">Nothing matches “${esc(q)}”. Try a part name, a shop, or a word from your notes.</p>`;
  return `<div class="sec-h"><h2>Results</h2><span>${hits.length}</span></div><div class="wo-list">${hits.slice(0, 150).map(r => recordRow(r, { showVehicle: true })).join('')}</div>`;
}

function viewVehicle() {
  const v = S.vehicles.get(S.vehicleId);
  if (!v) { S.view = 'garage'; return viewGarage(); }
  const recs = recordsOf(v.id);
  const cur = curMiles(v);
  const open = recs.filter(isOpen);
  const lastDone = recs.find(r => !isOpen(r));
  const yr = String(new Date().getFullYear());
  const spentYr = sum(recs.filter(r => (r.date || '').startsWith(yr)).map(r => r.cost));
  const spentAll = sum(recs.map(r => r.cost));
  const ws = recs.map(r => [r, wInfo(r)]).filter(x => x[1]);
  const wActive = ws.filter(x => x[1].state !== 'expired');
  const dues = recs.map(dueInfo).filter(Boolean).sort((a, b) => dueRank(a) - dueRank(b));
  const photos = recs.flatMap(r => (r.photos || []).map(p => ({ p, r })));
  const sub = [
    v.nickname ? `“${esc(v.nickname)}”` : '',
    v.color ? `${colorDot(v.color)}${esc(v.color)}` : '',
    v.plate ? `Plate <span class="mono">${esc(v.plate)}</span>` : '',
    v.vin ? `VIN <span class="mono">${esc(v.vin)}</span>` : ''
  ].filter(Boolean).map(s => `<span>${s}</span>`).join('');
  const tab = S.vtab;
  let body;
  if (tab === 'warranties') {
    body = ws.length ? `<div class="wlist">${sortWarranties(ws).map(([r, i]) => wCard(r, i, false)).join('')}</div>`
      : `<p class="pad muted">No warranties saved for this vehicle. When you log a repair or part, switch on “This has a warranty”.</p>`;
  } else if (tab === 'receipts') {
    body = photos.length ? `<div class="pgrid">${photos.map(({ p, r }) => `<button class="ph" data-act="open-record" data-id="${esc(r.id)}"><img src="${esc(safeImg(p.thumb))}" alt="Receipt for ${esc(r.title)}"><span class="cap">${esc(r.title)}<br>${esc(fmtDate(r.date))}</span></button>`).join('')}</div>`
      : `<p class="pad muted">No receipt photos yet. Use “Snap receipt” above, or add photos when you log work.</p>`;
  } else {
    body = recs.length
      ? `<div class="toolrow"><div class="search">${icon('search')}<label class="vh" for="vq">Search this vehicle</label><input id="vq" type="search" placeholder="Search this vehicle…" value="${esc(S.vq)}" autocomplete="off"></div><button class="btn" data-act="copy-history" data-id="${esc(v.id)}" aria-label="Copy history as text">${icon('copy')}<span>Copy</span></button></div><div id="vresults">${historyList(recs, S.vq)}</div>`
      : `<p class="pad muted">Nothing logged yet. Tap “Log work” for a repair, service or part, or “Snap receipt” to start from a photo.</p>`;
  }
  return `<header class="vhead">
      <button class="back" data-act="back">${icon('back')}Garage</button>
      <div class="eyebrow">${esc(v.year)}</div>
      <h1 class="v-title">${esc(v.make)} ${esc(v.model)}${v.trim ? ` <span class="trim">${esc(v.trim)}</span>` : ''}</h1>
      ${sub ? `<div class="v-sub">${sub}</div>` : ''}
      <div class="v-odo">${odo(cur, { lg: true })}<small>${cur ? 'Highest odometer logged' : 'Add the odometer when you log work'}</small></div>
      ${S.readOnly ? '' : `<div class="actions">
        <button class="btn primary" data-act="log-work" data-id="${esc(v.id)}">${icon('plus')}Log work</button>
        <label class="btn" for="snapInput" role="button" tabindex="0">${icon('camera')}Snap receipt</label>
        <button class="btn" data-act="edit-vehicle" data-id="${esc(v.id)}" aria-label="Edit vehicle details" title="Edit vehicle">${icon('edit')}</button>
      </div>`}
    </header>
    ${banners()}
    ${open.length ? `<div class="band">${open.map(r => `<button class="alert ${r.status === 'waiting' ? 'waiting' : ''}" data-act="open-record" data-id="${esc(r.id)}">${icon('wrench')}<span><b>${r.status === 'waiting' ? 'Waiting on parts' : 'Working on'}: ${esc(r.title)}</b><span class="sub">${esc([r.doneBy, r.vendor && 'parts from ' + r.vendor, 'started ' + fmtDate(r.date)].filter(Boolean).join(' · '))}</span></span></button>`).join('')}</div>` : ''}
    <dl class="stats">
      <div class="stat wide"><dt>Last service</dt><dd>${lastDone ? `${esc(lastDone.title)}<small>${esc([fmtDate(lastDone.date), lastDone.doneBy].filter(Boolean).join(' · '))}</small>` : '—'}</dd></div>
      <div class="stat"><dt>Warranties</dt><dd>${wActive.length} active<small>${ws.length - wActive.length} expired</small></dd></div>
      <div class="stat"><dt>Spent</dt><dd><span class="mono">${moneyShort(spentYr)}</span><small>this year · ${moneyShort(spentAll)} total</small></dd></div>
    </dl>
    ${dues.length ? `<div class="sec-h"><h2>Coming up</h2><span>${dues.length}</span></div><div class="due-list">${dues.map(d => `<div class="due ${d.state}">${icon('bell')}<button class="txt" data-act="open-record" data-id="${esc(d.r.id)}"><b>${esc(d.label)}</b><span class="sub">${esc(dueLine(d))}${dueLeft(d) ? ' · ' + esc(dueLeft(d)) : ''}</span></button>${S.readOnly ? '' : `<button class="btn sm" data-act="due-done" data-id="${esc(d.r.id)}">Log it</button>`}</div>`).join('')}</div>` : ''}
    <div class="subtabs" role="tablist" aria-label="Vehicle records">
      ${[['history', 'History', recs.length], ['warranties', 'Warranties', ws.length], ['receipts', 'Receipts', photos.length]].map(([id, l, n]) => `<button role="tab" id="tab-${id}" aria-selected="${tab === id}" data-act="vtab" data-tab="${id}">${l}<span class="n">${n}</span></button>`).join('')}
    </div>
    <div role="tabpanel" aria-labelledby="tab-${tab}">${body}</div>`;
}
function historyList(recs, q) {
  const terms = (q || '').toLowerCase().split(/\s+/).filter(Boolean);
  const list = terms.length ? recs.filter(r => matches(r, terms)) : recs;
  if (!list.length) return `<p class="pad muted">Nothing matches “${esc(q)}”.</p>`;
  const groups = new Map();
  for (const r of list) { const y = (r.date || '').slice(0, 4) || 'Undated'; if (!groups.has(y)) groups.set(y, []); groups.get(y).push(r); }
  return [...groups].map(([y, rs]) => `<h3 class="year-h">${esc(y)}${sum(rs.map(r => r.cost)) ? ' · ' + moneyShort(sum(rs.map(r => r.cost))) : ''}</h3><div class="wo-list">${rs.map(r => recordRow(r)).join('')}</div>`).join('');
}
function sortWarranties(ws) {
  const rank = { soon: 0, active: 1, open: 2, expired: 3 };
  return ws.slice().sort(([ra, a], [rb, b]) => {
    if (rank[a.state] !== rank[b.state]) return rank[a.state] - rank[b.state];
    if (a.state === 'expired') return (rb.warranty.until || rb.date || '').localeCompare(ra.warranty.until || ra.date || '');
    const ka = a.w.lifetime ? 1e9 : (a.days ?? 1e8), kb = b.w.lifetime ? 1e9 : (b.days ?? 1e8);
    return ka - kb;
  });
}

function viewWarranties() {
  const ws = allRecords().map(r => [r, wInfo(r)]).filter(x => x[1]);
  const sorted = sortWarranties(ws);
  const soon = sorted.filter(x => x[1].state === 'soon'), act = sorted.filter(x => x[1].state === 'active' || x[1].state === 'open'), exp = sorted.filter(x => x[1].state === 'expired');
  const sec = (t, arr) => arr.length ? `<div class="sec-h"><h2>${t}</h2><span>${arr.length}</span></div><div class="wlist">${arr.map(([r, i]) => wCard(r, i, true)).join('')}</div>` : '';
  return `<header class="brand"><div><h1 class="page-title">Warranties</h1><p>What's still covered, how long it lasts, and who backs it</p></div></header>${banners()}
    ${ws.length ? `<div class="summary"><span class="chip good tag">${act.length} active</span>${soon.length ? `<span class="chip warn tag">${soon.length} ending within 60 days</span>` : ''}<span class="chip tag">${exp.length} expired</span></div>`
      + sec('Ending soon', soon) + sec('Active', act) + sec('Expired', exp)
      : `<div class="state"><h2>No warranties saved yet</h2><p>When you log a repair or a part, switch on “This has a warranty” and add how long it lasts. It shows up here with the receipt, so you can prove it when something fails.</p></div>`}`;
}

function viewShops() {
  const shops = new Map(), stores = new Map();
  let diy = 0;
  const add = (map, name, r, cost) => { const k = name.toLowerCase(); let e = map.get(k); if (!e) { e = { k, name, jobs: [], total: 0, vids: new Set() }; map.set(k, e); } e.jobs.push(r); e.vids.add(r.vehicleId); if (cost) e.total += Number(r.cost) || 0; };
  for (const r of allRecords()) {
    const by = (r.doneBy || '').trim(), ve = (r.vendor || '').trim();
    if (by) { if (isDIY(by)) diy++; else add(shops, by, r, true); }
    if (ve) add(stores, ve, r, !by || isDIY(by));
  }
  const card = (e, pre, verb) => {
    const key = pre + e.k, opened = S.openShop === key, last = e.jobs[0];
    const vnames = [...e.vids].map(id => vShort(S.vehicles.get(id)));
    return `<div class="shop" data-open="${opened ? 1 : 0}">
      <button class="shop-h" data-act="toggle-shop" data-key="${esc(key)}" aria-expanded="${opened}">
        ${icon(pre === 's:' ? 'wrench' : 'store')}
        <span class="grow"><span class="nm">${esc(e.name)}</span><span class="sub">${esc(plural(e.jobs.length, verb))}${e.total ? ' · ' + moneyShort(e.total) : ''} · last ${esc(fmtDate(last.date))}</span><span class="sub">${esc(vnames.join(', '))}</span></span>
        ${icon('chev', 'chev')}
      </button>
      ${opened ? `<div class="wo-list">${e.jobs.map(r => recordRow(r, { showVehicle: true })).join('')}</div>` : ''}
    </div>`;
  };
  const byLast = (a, b) => (b.jobs[0].date || '').localeCompare(a.jobs[0].date || '');
  const sl = [...shops.values()].sort(byLast), pl = [...stores.values()].sort(byLast);
  return `<header class="brand"><div><h1 class="page-title">Shops &amp; stores</h1><p>Who worked on what, and where the parts came from</p></div></header>${banners()}
    ${sl.length ? `<div class="sec-h"><h2>Shops &amp; mechanics</h2><span>${sl.length}</span></div>${sl.map(e => card(e, 's:', 'job')).join('')}` : ''}
    ${diy ? `<p class="pad muted">${icon('wrench')} ${plural(diy, 'job')} done yourself.</p>` : ''}
    ${pl.length ? `<div class="sec-h"><h2>Parts stores</h2><span>${pl.length}</span></div>${pl.map(e => card(e, 'p:', 'purchase')).join('')}` : ''}
    ${!sl.length && !pl.length ? `<div class="state"><h2>No shops yet</h2><p>Fill in “Who did the work” and “Parts bought from” when you log something, and every shop and store gets its own history here.</p></div>` : ''}`;
}

function renderTabs() {
  const t = document.getElementById('tabs');
  if (S.status !== 'ok') { t.hidden = true; return; }
  t.hidden = false;
  const cur = S.view === 'vehicle' ? 'garage' : S.view;
  t.innerHTML = `<div class="in">${[['garage', 'Garage', 'car'], ['warranties', 'Warranties', 'shield'], ['shops', 'Shops', 'wrench']].map(([id, l, ic]) => `<button data-act="nav" data-view="${id}" ${cur === id ? 'aria-current="page"' : ''}>${icon(ic)}${l}</button>`).join('')}</div>`;
}
function render() {
  const app = document.getElementById('app');
  const ae = document.activeElement;
  const fid = ae && ae.id && app.contains(ae) ? ae.id : null;
  let sel = null;
  try { if (fid && ae.selectionStart != null) sel = [ae.selectionStart, ae.selectionEnd]; } catch (e) { }
  let html;
  if (S.status !== 'ok') html = viewState();
  else if (S.view === 'vehicle') html = viewVehicle();
  else if (S.view === 'warranties') html = viewWarranties();
  else if (S.view === 'shops') html = viewShops();
  else html = viewGarage();
  app.innerHTML = html;
  renderTabs();
  if (fid) {
    const el = document.getElementById(fid);
    if (el) { el.focus({ preventScroll: true }); if (sel) try { el.setSelectionRange(sel[0], sel[1]); } catch (e) { } }
  }
}

/* ---------- Toast / sheets / confirm ---------- */
let toastT;
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2600);
}
const sheets = [];
let sheetN = 0;
function openSheet({ title, body, primary, onMount, onClose, refresh, closeLabel }) {
  const n = ++sheetN;
  const wrap = document.createElement('div');
  wrap.className = 'sheet-wrap';
  wrap.innerHTML = `<div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sh-t-${n}" tabindex="-1">
    <header class="sh-head"><button type="button" class="link" data-sh="close">${esc(closeLabel || (primary ? 'Cancel' : 'Close'))}</button><h2 id="sh-t-${n}">${esc(title)}</h2>${primary ? `<button type="button" class="btn primary sm" data-sh="primary">${esc(primary.label)}</button>` : '<span></span>'}</header>
    <div class="sh-body"></div></div>`;
  const s = { wrap, body: wrap.querySelector('.sh-body'), refresh, onClose, busy: false, primaryBtn: wrap.querySelector('[data-sh="primary"]'), primaryLabel: primary?.label };
  s.body.innerHTML = body;
  wrap.addEventListener('click', e => {
    if (e.target === wrap && !primary && !s.busy) { closeSheet(s); return; }
    const b = e.target.closest('[data-sh]');
    if (!b || s.busy) return;
    if (b.dataset.sh === 'close') closeSheet(s);
    else if (b.dataset.sh === 'primary') primary.onClick(s);
  });
  document.getElementById('sheets').appendChild(wrap);
  sheets.push(s);
  document.body.classList.add('locked');
  onMount && onMount(s);
  wrap.querySelector('.sheet').focus({ preventScroll: true });
  return s;
}
function closeSheet(s) {
  const i = sheets.indexOf(s);
  if (i < 0) return;
  sheets.splice(i, 1);
  s.wrap.remove();
  s.onClose && s.onClose();
  if (!sheets.length) document.body.classList.remove('locked');
}
function setBusy(s, busy, label) {
  s.busy = busy;
  if (s.primaryBtn) { s.primaryBtn.disabled = busy; s.primaryBtn.textContent = busy ? (label || 'Saving…') : s.primaryLabel; }
}
function refreshSheets() { for (const s of sheets.slice()) s.refresh && s.refresh(s); }
function confirmBox({ title, text, ok = 'Delete', danger = true }) {
  return new Promise(res => {
    const wrap = document.createElement('div');
    wrap.className = 'sheet-wrap confirm';
    wrap.innerHTML = `<div class="cbox" role="alertdialog" aria-modal="true" aria-labelledby="cb-t" aria-describedby="cb-d"><h2 id="cb-t">${esc(title)}</h2><p id="cb-d">${esc(text)}</p><div class="btnrow end"><button type="button" class="btn" data-c="no">Cancel</button><button type="button" class="btn ${danger ? 'danger' : 'primary'}" data-c="yes">${esc(ok)}</button></div></div>`;
    const done = v => { wrap.remove(); document.removeEventListener('keydown', onKey, true); res(v); };
    const onKey = e => { if (e.key === 'Escape') { e.stopPropagation(); done(false); } };
    wrap.addEventListener('click', e => { if (e.target === wrap) return done(false); const b = e.target.closest('[data-c]'); if (b) done(b.dataset.c === 'yes'); });
    document.addEventListener('keydown', onKey, true);
    document.getElementById('sheets').appendChild(wrap);
    wrap.querySelector('[data-c="no"]').focus();
  });
}
document.addEventListener('keydown', e => {
  const lb = e.target.closest && e.target.closest('label[role="button"][for]');
  if (lb && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); const inp = document.getElementById(lb.htmlFor); if (inp) inp.click(); return; }
  if (e.key !== 'Escape') return;
  const v = document.querySelector('.viewer');
  if (v) { v.remove(); return; }
  const s = sheets[sheets.length - 1];
  if (s && !s.busy) closeSheet(s);
});

/* ---------- Storage ---------- */
async function write(fn) {
  try { return await fn(); }
  catch (e) {
    if (e && e.code === 'unavailable') { await sleep(600 + Math.random() * 800); return await fn(); }
    throw e;
  }
}
function writeErr(e) {
  switch (e && e.code) {
    case 'auth': return 'Your sign-in expired. Reload the page, sign in, and try again.';
    case 'quota_exceeded': return 'Storage is full. Delete some old photos or records, then try again.';
    case 'denied': return "Your account isn't allowed to save here. Ask the person who set up Glovebox.";
    case 'too_big': return 'That photo is too large to save. Try a closer shot, or a screenshot of it.';
    case 'unavailable': return "Couldn't reach the server. Check your connection and try again.";
    default: return "Couldn't save. Try again in a moment.";
  }
}
const getPhoto = id => photos.url(id);
async function deleteRecordDocs(r) {
  try { await write(() => photos.remove((r.photos || []).map(p => p.id))); } catch (e) { }
  await write(() => refs.records.doc(r.id).delete());
}

/* ---------- Images ---------- */
async function loadImage(file) {
  try { return await createImageBitmap(file); }
  catch (e) {
    return await new Promise((res, rej) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => { res(img); setTimeout(() => URL.revokeObjectURL(url), 1000); };
      img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('decode')); };
      img.src = url;
    });
  }
}
function drawScaled(img, maxSide) {
  const w = img.width, h = img.height, s = Math.min(1, maxSide / Math.max(w, h));
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(w * s)); c.height = Math.max(1, Math.round(h * s));
  const x = c.getContext('2d');
  x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height);
  x.drawImage(img, 0, 0, c.width, c.height);
  return c;
}
async function compressPhoto(file) {
  const img = await loadImage(file);
  let side = 1800, q = 0.82, url = '';
  for (let i = 0; i < 12; i++) {
    url = drawScaled(img, side).toDataURL('image/jpeg', q);
    if (url.length <= PHOTO_MAX_CHARS) break;
    if (q > 0.58) q -= 0.08; else { side = Math.round(side * 0.82); q = 0.74; }
  }
  const thumb = drawScaled(img, 240).toDataURL('image/jpeg', 0.62);
  if (img.close) try { img.close(); } catch (e) { }
  return { full: url, thumb };
}
function openViewer(ids, idx, local) {
  let i = idx || 0, zoom = false;
  const wrap = document.createElement('div');
  wrap.className = 'viewer';
  wrap.setAttribute('role', 'dialog'); wrap.setAttribute('aria-modal', 'true'); wrap.setAttribute('aria-label', 'Receipt photo');
  wrap.innerHTML = `<header><span class="mono" data-count></span><div class="btnrow">${ids.length > 1 ? '<button type="button" class="vbtn" data-vw="prev" aria-label="Previous photo">‹</button><button type="button" class="vbtn" data-vw="next" aria-label="Next photo">›</button>' : ''}<button type="button" class="vbtn" data-vw="zoom">Zoom</button><button type="button" class="vbtn" data-vw="close">Close</button></div></header><div class="stage"></div>`;
  const stage = wrap.querySelector('.stage'), count = wrap.querySelector('[data-count]');
  async function show() {
    count.textContent = ids.length > 1 ? `${i + 1} / ${ids.length}` : '';
    stage.innerHTML = '<p class="pad">Loading photo…</p>';
    let url = local && local.get(ids[i]);
    if (!url) { try { url = await getPhoto(ids[i]); } catch (e) { url = ''; } }
    if (!url) { stage.innerHTML = '<p class="pad">This photo couldn\'t be loaded. Check your connection and try again.</p>'; return; }
    const im = new Image(); im.alt = `Receipt photo ${i + 1}`; im.src = url;
    stage.innerHTML = ''; stage.appendChild(im);
  }
  wrap.addEventListener('click', e => {
    const b = e.target.closest('[data-vw]');
    if (!b) { if (e.target.tagName === 'IMG') { zoom = !zoom; wrap.classList.toggle('zoom', zoom); } return; }
    const a = b.dataset.vw;
    if (a === 'close') wrap.remove();
    else if (a === 'zoom') { zoom = !zoom; wrap.classList.toggle('zoom', zoom); b.textContent = zoom ? 'Fit' : 'Zoom'; }
    else if (a === 'prev') { i = (i - 1 + ids.length) % ids.length; show(); }
    else if (a === 'next') { i = (i + 1) % ids.length; show(); }
  });
  document.body.appendChild(wrap);
  wrap.querySelector('[data-vw="close"]').focus();
  show();
}

/* ---------- Vehicle form ---------- */
function openVehicleForm(v) {
  if (S.readOnly) return toast(writeErr({ code: 'read_only' }));
  const isEdit = !!v;
  let color = v?.color || '';
  const years = [];
  for (let y = MAX_YEAR; y >= DATA_FIRST; y--) years.push(y);
  const body = `<div class="form">
    <section class="fcard">
      <h3>Vehicle</h3>
      <div class="field"><label for="v-year">Year</label><select id="v-year"><option value="">Select year</option>${years.map(y => `<option value="${y}">${y}</option>`).join('')}<option value="older">${DATA_FIRST - 1} or older</option></select></div>
      <div class="field" id="v-old-wrap" hidden><label for="v-old">Which year?</label><input id="v-old" inputmode="numeric" maxlength="4" placeholder="e.g. 1987"></div>
      <div class="field"><label for="v-make">Make</label><select id="v-make" disabled><option value="">Pick a year first</option></select><input id="v-make-o" placeholder="Type the make" maxlength="40" hidden aria-label="Make"></div>
      <div class="field"><label for="v-model">Model</label><select id="v-model" disabled><option value="">Pick a make first</option></select><input id="v-model-o" placeholder="Type the model" maxlength="60" hidden aria-label="Model"></div>
      <div class="field"><label for="v-trim">Trim <span class="opt">optional</span></label><input id="v-trim" maxlength="40" placeholder="e.g. EX-L, XLT, Sport" value="${esc(v?.trim)}"></div>
    </section>
    <section class="fcard">
      <h3>Details</h3>
      <div class="field"><label for="v-nick">Nickname <span class="opt">optional</span></label><input id="v-nick" maxlength="40" placeholder="e.g. The van, Work truck" value="${esc(v?.nickname)}"></div>
      <div class="field"><span class="flabel" id="v-color-l">Color <span class="opt">optional</span></span><div class="swatches" id="v-color" role="group" aria-labelledby="v-color-l">${COLORS.map(([n, c]) => `<button type="button" style="--c:${c}" aria-label="${n}" title="${n}" aria-pressed="${color === n}" data-color="${n}"></button>`).join('')}</div></div>
      <div class="row2">
        <div class="field"><label for="v-plate">Plate</label><input id="v-plate" maxlength="12" autocapitalize="characters" value="${esc(v?.plate)}"></div>
        <div class="field"><label for="v-miles">Odometer now</label><div class="suffix"><input id="v-miles" inputmode="numeric" maxlength="9" value="${v?.mileage ? fmtNum(v.mileage) : ''}"><span>mi</span></div></div>
      </div>
      <div class="field"><label for="v-vin">VIN <span class="opt">optional · on the dash or door sticker</span></label><input id="v-vin" class="mono" maxlength="17" autocapitalize="characters" spellcheck="false" value="${esc(v?.vin)}"></div>
      <div class="field"><label for="v-notes">Handy specs and notes</label><textarea id="v-notes" maxlength="1500" placeholder="Oil type, tire size, wiper blade sizes, battery group…">${esc(v?.notes)}</textarea></div>
    </section>
    ${isEdit ? `<button type="button" class="btn danger-ghost wide" id="v-del">Delete this vehicle</button>` : ''}
  </div>`;
  openSheet({
    title: isEdit ? 'Edit vehicle' : 'Add a vehicle',
    body,
    primary: { label: 'Save', onClick: s => saveVehicle(s) },
    onMount: s => {
      const $ = id => s.body.querySelector('#' + id);
      const ySel = $('v-year'), mkSel = $('v-make'), mdSel = $('v-model'), mkO = $('v-make-o'), mdO = $('v-model-o'), old = $('v-old');
      const yearVal = () => ySel.value === 'older' ? intOrNull(old.value) : intOrNull(ySel.value);
      function fillMakes(keep) {
        const y = yearVal();
        if (!y && ySel.value !== 'older') { mkSel.disabled = true; mkSel.innerHTML = '<option value="">Pick a year first</option>'; mkO.hidden = true; fillModels(); return; }
        const list = ySel.value === 'older' ? MAKES : makesFor(y);
        mkSel.disabled = false;
        mkSel.innerHTML = `<option value="">Select make</option>${list.map(m => `<option value="${esc(m)}">${esc(m)}</option>`).join('')}<option value="__other">Other make…</option>`;
        if (keep) {
          if (list.includes(keep)) mkSel.value = keep;
          else { mkSel.value = '__other'; mkO.value = keep; }
        } else if (mkO.value && !mkO.hidden) mkSel.value = '__other';
        mkO.hidden = mkSel.value !== '__other';
      }
      function fillModels(keep) {
        const mk = mkSel.value, y = yearVal();
        mdO.hidden = true;
        if (!mk) { mdSel.hidden = false; mdSel.disabled = true; mdSel.innerHTML = '<option value="">Pick a make first</option>'; return; }
        if (mk === '__other') { mdSel.hidden = true; mdO.hidden = false; if (keep) mdO.value = keep; return; }
        const list = ySel.value === 'older' ? modelsFor(mk, 0) : modelsFor(mk, y);
        mdSel.hidden = false; mdSel.disabled = false;
        mdSel.innerHTML = `<option value="">Select model</option>${list.map(m => `<option value="${esc(m)}">${esc(m)}</option>`).join('')}<option value="__other">Other model…</option>`;
        if (keep) { if (list.includes(keep)) mdSel.value = keep; else { mdSel.value = '__other'; mdO.value = keep; } }
        mdO.hidden = mdSel.value !== '__other';
      }
      ySel.addEventListener('change', () => { $('v-old-wrap').hidden = ySel.value !== 'older'; const keepMk = mkSel.value === '__other' ? mkO.value : mkSel.value; const keepMd = mdSel.value === '__other' ? mdO.value : mdSel.value; fillMakes(keepMk); fillModels(keepMd); });
      old.addEventListener('input', () => { if (mkSel.disabled) { fillMakes(); fillModels(); } });
      mkSel.addEventListener('change', () => { mkO.hidden = mkSel.value !== '__other'; if (!mkO.hidden) mkO.focus(); fillModels(); });
      mdSel.addEventListener('change', () => { mdO.hidden = mdSel.value !== '__other'; if (!mdO.hidden) mdO.focus(); });
      $('v-color').addEventListener('click', e => {
        const b = e.target.closest('[data-color]'); if (!b) return;
        color = color === b.dataset.color ? '' : b.dataset.color;
        s.body.querySelectorAll('[data-color]').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.color === color)));
      });
      $('v-vin').addEventListener('input', e => { const p = e.target.selectionStart; e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); try { e.target.setSelectionRange(p, p); } catch (x) { } });
      if (v) {
        if (v.year >= DATA_FIRST && v.year <= MAX_YEAR) ySel.value = String(v.year);
        else { ySel.value = 'older'; $('v-old-wrap').hidden = false; old.value = v.year || ''; }
        fillMakes(v.make); fillModels(v.model);
      }
      s.getColor = () => color;
      s.vehicle = v || null;
      if (isEdit) $('v-del').addEventListener('click', () => deleteVehicle(v, s));
    }
  });
}
function fieldErr(root, el, msg) {
  root.querySelectorAll('.err').forEach(x => x.remove());
  root.querySelectorAll('[aria-invalid]').forEach(x => x.removeAttribute('aria-invalid'));
  if (!el) return;
  el.setAttribute('aria-invalid', 'true');
  const p = document.createElement('div'); p.className = 'err'; p.textContent = msg; p.id = el.id + '-err';
  el.setAttribute('aria-describedby', p.id);
  (el.closest('.suffix, .prefix') || el).insertAdjacentElement('afterend', p);
  el.focus();
  el.scrollIntoView({ block: 'center', behavior: 'smooth' });
}
async function saveVehicle(s) {
  const $ = id => s.body.querySelector('#' + id);
  const ySel = $('v-year');
  const year = ySel.value === 'older' ? intOrNull($('v-old').value) : intOrNull(ySel.value);
  if (!year || year < 1900 || year > MAX_YEAR + 1) return fieldErr(s.body, ySel.value === 'older' ? $('v-old') : ySel, 'Pick the model year.');
  const make = $('v-make').value === '__other' ? $('v-make-o').value.trim() : $('v-make').value;
  if (!make) return fieldErr(s.body, $('v-make').value === '__other' ? $('v-make-o') : $('v-make'), 'Pick the make, or choose Other and type it.');
  const model = ($('v-make').value === '__other' || $('v-model').value === '__other') ? $('v-model-o').value.trim() : $('v-model').value;
  if (!model) return fieldErr(s.body, (!$('v-model-o').hidden) ? $('v-model-o') : $('v-model'), 'Pick the model, or choose Other and type it.');
  const vin = $('v-vin').value.trim();
  if (vin && year >= 1981 && vin.length !== 17) return fieldErr(s.body, $('v-vin'), `A VIN has 17 characters. This one has ${vin.length}.`);
  fieldErr(s.body, null);
  const old = s.vehicle;
  const id = old?.id || newId();
  const data = {
    year, make, model,
    trim: $('v-trim').value.trim(), nickname: $('v-nick').value.trim(), color: s.getColor(),
    plate: $('v-plate').value.trim().toUpperCase(), vin, mileage: intOrNull($('v-miles').value),
    notes: $('v-notes').value.trim(),
    createdAt: old?.createdAt || Date.now(), updatedAt: Date.now()
  };
  setBusy(s, true);
  try {
    await write(() => refs.vehicles.doc(id).set(data));
    S.everWrote = true;
    closeSheet(s);
    toast(old ? 'Vehicle updated' : 'Vehicle added');
    if (!old) { S.vehicles.set(id, { ...data, id }); S.view = 'vehicle'; S.vehicleId = id; S.vtab = 'history'; S.vq = ''; render(); window.scrollTo(0, 0); }
  } catch (e) { setBusy(s, false); toast(writeErr(e)); }
}
async function deleteVehicle(v, s) {
  const recs = recordsOf(v.id);
  const ok = await confirmBox({ title: `Delete ${vName(v)}?`, text: recs.length ? `This also deletes its ${plural(recs.length, 'record')} and their receipt photos. This can't be undone.` : "This can't be undone." });
  if (!ok) return;
  setBusy(s, true, 'Deleting…');
  try {
    for (const r of recs) await deleteRecordDocs(r);
    await write(() => refs.vehicles.doc(v.id).delete());
    closeSheet(s);
    S.view = 'garage'; S.vehicleId = null; render(); window.scrollTo(0, 0);
    toast('Vehicle deleted');
  } catch (e) { setBusy(s, false); toast(writeErr(e)); }
}

/* ---------- Record form ---------- */
function openRecordForm(init = {}, opts = {}) {
  if (S.readOnly) return toast(writeErr({ code: 'read_only' }));
  const base = init.id ? S.records.get(init.id) : null;
  const rec = base ? JSON.parse(JSON.stringify(base)) : null;
  const v = S.vehicles.get(rec?.vehicleId || init.vehicleId);
  if (!v) return;
  const cur = curMiles(v);
  const F = {
    id: rec?.id || null, vehicleId: v.id,
    kind: rec?.kind || init.kind || 'repair', status: rec?.status || 'done',
    photos: (rec?.photos || []).map(p => ({ id: p.id, thumb: p.thumb, isNew: false })),
    removed: [], clears: new Set(init.clears || []), createdAt: rec?.createdAt,
    touched: new Set(), wPreset: rec?.warranty?.preset || null, nextCleared: !!rec?.next?.cleared, origNext: rec?.next || null,
    adding: 0
  };
  const w = rec?.warranty || { on: false };
  const nx = rec?.next || null;
  const shops = knownNames('doneBy'), vendors = knownNames('vendor');
  const openDues = recordsOf(v.id).filter(r => r.id !== F.id).map(dueInfo).filter(Boolean);
  const body = `<div class="form">
    <section class="fcard">
      <div class="seg" role="radiogroup" aria-label="Type of work" id="f-kind">${KINDS.map(k => `<button type="button" role="radio" aria-checked="${F.kind === k.id}" data-kind="${k.id}">${icon(k.icon)}${k.label}</button>`).join('')}</div>
      <div class="field"><label for="f-title">What was done or bought</label><input id="f-title" maxlength="120" autocomplete="off" placeholder="e.g. Front brake pads and rotors" value="${esc(rec?.title ?? init.title ?? '')}"></div>
      <div class="row2">
        <div class="field"><label for="f-date">Date</label><input id="f-date" type="date" value="${esc(rec?.date || todayISO())}"></div>
        <div class="field"><label for="f-miles">Odometer</label><div class="suffix"><input id="f-miles" inputmode="numeric" maxlength="9" placeholder="${cur ? fmtNum(cur) : 'e.g. 84,210'}" value="${rec?.miles ? fmtNum(rec.miles) : ''}"><span>mi</span></div></div>
      </div>
      <div class="field"><span class="flabel" id="f-status-l">Status</span><div class="seg" role="radiogroup" aria-labelledby="f-status-l" id="f-status">${STATUSES.map(st => `<button type="button" role="radio" aria-checked="${F.status === st.id}" data-status="${st.id}">${st.label}</button>`).join('')}</div></div>
    </section>
    <section class="fcard">
      <h3>Receipts &amp; photos</h3>
      <div class="photos" id="f-photos"></div>
      <div class="btnrow">
        <label class="btn" for="f-cam" role="button" tabindex="0">${icon('camera')}Take photo</label>
        <label class="btn" for="f-lib" role="button" tabindex="0">${icon('image')}Choose photos</label>
      </div>
      <input type="file" id="f-cam" class="vh" accept="image/*" capture="environment" tabindex="-1">
      <input type="file" id="f-lib" class="vh" accept="image/*" multiple tabindex="-1">
    </section>
    <section class="fcard">
      <h3>Who and where</h3>
      <div class="field"><label for="f-doneby">Who did the work</label><input id="f-doneby" list="dl-shops" maxlength="80" autocomplete="off" placeholder="Shop or mechanic" value="${esc(rec?.doneBy)}">
        <div class="quick">${[DIY, ...shops.slice(0, 3)].map(n => `<button type="button" data-fill="f-doneby" data-val="${esc(n)}">${esc(n)}</button>`).join('')}</div></div>
      <div class="field"><label for="f-vendor">Parts bought from</label><input id="f-vendor" list="dl-vendors" maxlength="80" autocomplete="off" placeholder="e.g. AutoZone, RockAuto, the dealer" value="${esc(rec?.vendor)}">
        ${vendors.length ? `<div class="quick">${vendors.slice(0, 3).map(n => `<button type="button" data-fill="f-vendor" data-val="${esc(n)}">${esc(n)}</button>`).join('')}</div>` : ''}</div>
      <div class="row2">
        <div class="field"><label for="f-cost">Total cost</label><div class="prefix"><span>$</span><input id="f-cost" inputmode="decimal" maxlength="12" value="${rec?.cost != null ? Number(rec.cost).toFixed(2) : ''}"></div></div>
        <div class="field"><label for="f-invoice">Invoice or order #</label><input id="f-invoice" class="mono" maxlength="40" value="${esc(rec?.invoice)}"></div>
      </div>
      <datalist id="dl-shops">${[DIY, ...shops].map(n => `<option value="${esc(n)}"></option>`).join('')}</datalist>
      <datalist id="dl-vendors">${vendors.map(n => `<option value="${esc(n)}"></option>`).join('')}</datalist>
    </section>
    <section class="fcard">
      <label class="switch"><input type="checkbox" id="f-w-on" ${w.on ? 'checked' : ''}>This has a warranty</label>
      <div id="f-w" class="form" ${w.on ? '' : 'hidden'}>
        <div class="field"><label for="f-w-covers">What it covers <span class="opt">if different from above</span></label><input id="f-w-covers" maxlength="120" value="${esc(w.covers)}" placeholder="e.g. Pads only, parts and labor"></div>
        <div class="field"><span class="flabel" id="f-w-len">How long</span><div class="seg" role="radiogroup" aria-labelledby="f-w-len" id="f-w-preset">${W_PRESETS.map(p => `<button type="button" role="radio" aria-checked="${F.wPreset === p.id}" data-preset="${p.id}">${p.label}</button>`).join('')}</div></div>
        <div class="row2" id="f-w-limits">
          <div class="field"><label for="f-w-until">Good until</label><input id="f-w-until" type="date" value="${esc(w.until)}"></div>
          <div class="field"><label for="f-w-miles">or miles covered</label><div class="suffix"><input id="f-w-miles" inputmode="numeric" maxlength="7" placeholder="e.g. 12,000" value="${w.miles ? fmtNum(w.miles) : ''}"><span>mi</span></div></div>
        </div>
        <div class="field"><label for="f-w-provider">Warranty is through</label><input id="f-w-provider" maxlength="80" value="${esc(w.provider)}" placeholder="Shop, store, or manufacturer"></div>
        <div class="field"><label for="f-w-notes">How to claim it <span class="opt">optional</span></label><input id="f-w-notes" maxlength="200" value="${esc(w.notes)}" placeholder="e.g. Bring receipt, call first, parts only"></div>
      </div>
    </section>
    <section class="fcard">
      <label class="switch"><input type="checkbox" id="f-n-on" ${nx ? 'checked' : ''}>Remind me when it's due again</label>
      <div id="f-n" class="form" ${nx ? '' : 'hidden'}>
        <div class="field"><label for="f-n-label">What's due</label><input id="f-n-label" maxlength="80" value="${esc(nx?.label)}" placeholder="e.g. Next oil change"></div>
        <div class="row2">
          <div class="field"><label for="f-n-date">By date</label><input id="f-n-date" type="date" value="${esc(nx?.date)}"></div>
          <div class="field"><label for="f-n-miles">or odometer</label><div class="suffix"><input id="f-n-miles" inputmode="numeric" maxlength="9" value="${nx?.miles ? fmtNum(nx.miles) : ''}"><span>mi</span></div></div>
        </div>
        <div class="quick" id="f-n-quick"><button type="button" data-nm="3">+3 months</button><button type="button" data-nm="6">+6 months</button><button type="button" data-nm="12">+1 year</button><button type="button" data-nmi="3000">+3,000 mi</button><button type="button" data-nmi="5000">+5,000 mi</button><button type="button" data-nmi="7500">+7,500 mi</button></div>
      </div>
    </section>
    ${openDues.length ? `<section class="fcard"><h3>Does this take care of a reminder?</h3><div class="checks">${openDues.map(d => `<label><input type="checkbox" data-clear="${esc(d.r.id)}" ${F.clears.has(d.r.id) ? 'checked' : ''}><span><b>${esc(d.label)}</b><br><span class="muted">${esc(dueLine(d))}</span></span></label>`).join('')}</div></section>` : ''}
    <section class="fcard"><div class="field"><label for="f-notes">Notes</label><textarea id="f-notes" maxlength="3000" placeholder="Part numbers, what the mechanic said, anything to remember">${esc(rec?.notes)}</textarea></div></section>
    ${F.id ? `<button type="button" class="btn danger-ghost wide" id="f-del">Delete this record</button>` : ''}
  </div>`;
  openSheet({
    title: F.id ? 'Edit record' : `Log work · ${vShort(v)}`,
    body,
    primary: { label: 'Save', onClick: s => saveRecord(s, F, v) },
    onMount: s => {
      const root = s.body, $ = id => root.querySelector('#' + id);
      const local = new Map();
      s.F = F;
      const seg = (id, attr, set) => $(id).addEventListener('click', e => {
        const b = e.target.closest(`[${attr}]`); if (!b) return;
        $(id).querySelectorAll(`[${attr}]`).forEach(x => x.setAttribute('aria-checked', String(x === b)));
        set(b.getAttribute(attr));
      });
      seg('f-kind', 'data-kind', k => { F.kind = k; F.touched.add('kind'); });
      seg('f-status', 'data-status', st => { F.status = st; });
      root.addEventListener('click', e => {
        const f = e.target.closest('[data-fill]');
        if (f) { const el = $(f.dataset.fill); el.value = f.dataset.val; el.classList.remove('filled'); F.touched.add(el.id); }
      });
      root.addEventListener('input', e => { if (e.target.id) { F.touched.add(e.target.id); e.target.classList.remove('filled'); } });
      root.addEventListener('change', e => { const c = e.target.closest('[data-clear]'); if (c) { c.checked ? F.clears.add(c.dataset.clear) : F.clears.delete(c.dataset.clear); } });

      // Warranty
      const wOn = $('f-w-on');
      const applyLifetime = () => { const life = F.wPreset === 'life'; $('f-w-until').disabled = life; $('f-w-miles').disabled = life; $('f-w-limits').style.opacity = life ? .45 : 1; };
      const applyPreset = () => {
        const p = W_PRESETS.find(x => x.id === F.wPreset);
        if (!p) return;
        const d = $('f-date').value || todayISO();
        if (p.days) $('f-w-until').value = addDaysISO(d, p.days);
        else if (p.months) $('f-w-until').value = addMonthsISO(d, p.months);
        else if (p.id === 'life') $('f-w-until').value = '';
        applyLifetime();
      };
      const markPreset = () => $('f-w-preset').querySelectorAll('[data-preset]').forEach(x => x.setAttribute('aria-checked', String(x.dataset.preset === F.wPreset)));
      wOn.addEventListener('change', () => {
        $('f-w').hidden = !wOn.checked;
        if (wOn.checked && !$('f-w-provider').value) { const by = $('f-doneby').value.trim(); $('f-w-provider').value = (by && !isDIY(by)) ? by : $('f-vendor').value.trim(); }
      });
      $('f-w-preset').addEventListener('click', e => {
        const b = e.target.closest('[data-preset]'); if (!b) return;
        F.wPreset = b.dataset.preset; markPreset();
        if (F.wPreset === 'custom') { applyLifetime(); $('f-w-until').focus(); } else applyPreset();
      });
      $('f-w-until').addEventListener('input', () => { if (F.wPreset !== 'custom') { F.wPreset = 'custom'; markPreset(); } });
      $('f-date').addEventListener('change', () => { if (F.wPreset && F.wPreset !== 'custom') applyPreset(); });
      applyLifetime();

      // Reminder
      const nOn = $('f-n-on');
      nOn.addEventListener('change', () => {
        $('f-n').hidden = !nOn.checked;
        if (nOn.checked && !$('f-n-label').value) { const t = $('f-title').value.trim(); $('f-n-label').value = t ? 'Next ' + t.charAt(0).toLowerCase() + t.slice(1) : ''; }
      });
      $('f-n-quick').addEventListener('click', e => {
        const b = e.target.closest('button'); if (!b) return;
        if (b.dataset.nm) $('f-n-date').value = addMonthsISO($('f-date').value || todayISO(), Number(b.dataset.nm));
        if (b.dataset.nmi) { const m = intOrNull($('f-miles').value) || cur; if (!m) { fieldErr(root, $('f-miles'), 'Add the odometer reading first.'); return; } $('f-n-miles').value = fmtNum(m + Number(b.dataset.nmi)); }
      });

      // Photos
      const renderPhotos = () => {
        const tiles = F.photos.map((p, i) => `<div class="ph"><button type="button" class="ph-open" data-view="${i}" aria-label="View photo ${i + 1}"><img src="${esc(safeImg(p.thumb))}" alt=""></button><button type="button" class="rm" data-rm="${i}" aria-label="Remove photo ${i + 1}">${icon('x')}</button></div>`);
        for (let i = 0; i < F.adding; i++) tiles.push('<div class="ph busy"><span class="spin"></span></div>');
        $('f-photos').innerHTML = tiles.join('');
      };
      $('f-photos').addEventListener('click', e => {
        const rm = e.target.closest('[data-rm]');
        if (rm) { const [p] = F.photos.splice(Number(rm.dataset.rm), 1); if (p && !p.isNew) F.removed.push(p.id); renderPhotos(); return; }
        const vw = e.target.closest('[data-view]');
        if (vw) { F.photos.forEach(p => p.full && local.set(p.id, p.full)); openViewer(F.photos.map(p => p.id), Number(vw.dataset.view), local); }
      });
      async function addFiles(files) {
        const list = [...files].filter(f => f && (/^image\//.test(f.type) || !f.type)).slice(0, Math.max(0, MAX_PHOTOS - F.photos.length));
        if (!list.length) { if (files.length) toast(F.photos.length >= MAX_PHOTOS ? `Up to ${MAX_PHOTOS} photos per record.` : 'Pick a photo (JPG or PNG).'); return; }
        F.adding += list.length; renderPhotos();
        let added = 0;
        for (const f of list) {
          try { const c = await compressPhoto(f); F.photos.push({ id: newId(), thumb: c.thumb, full: c.full, isNew: true }); added++; }
          catch (e) { toast("Couldn't open that photo. Try a JPG or PNG, or take a screenshot of it."); }
          F.adding--; renderPhotos();
        }
      }
      $('f-cam').addEventListener('change', e => { addFiles(e.target.files); e.target.value = ''; });
      $('f-lib').addEventListener('change', e => { addFiles(e.target.files); e.target.value = ''; });

      renderPhotos();
      if (F.id) $('f-del').addEventListener('click', async () => {
        const ok = await confirmBox({ title: 'Delete this record?', text: `“${rec.title}” and its receipt photos will be deleted. This can't be undone.` });
        if (!ok) return;
        setBusy(s, true, 'Deleting…');
        try { await deleteRecordDocs(rec); closeSheet(s); toast('Record deleted'); }
        catch (e) { setBusy(s, false); toast(writeErr(e)); }
      });
      if (opts.files && opts.files.length) addFiles(opts.files);
    }
  });
}
async function saveRecord(s, F, v) {
  const root = s.body, $ = id => root.querySelector('#' + id), val = id => $(id).value.trim();
  if (F.adding) return toast('Hang on, still adding photos.');
  const title = val('f-title') || (F.photos.length ? 'Receipt' : '');
  if (!title) return fieldErr(root, $('f-title'), 'Add a short description, like “Oil change” or “Battery”.');
  const date = parseISO(val('f-date')) ? val('f-date') : todayISO();
  const wOn = $('f-w-on').checked, nOn = $('f-n-on').checked;
  const nDate = parseISO(val('f-n-date')) ? val('f-n-date') : '', nMiles = intOrNull(val('f-n-miles'));
  if (nOn && !nDate && !nMiles) return fieldErr(root, $('f-n-date'), 'Add a date or an odometer reading for the reminder, or switch it off.');
  fieldErr(root, null);
  const rid = F.id || newId();
  const rec = {
    vehicleId: v.id, kind: F.kind, status: F.status, title, date,
    miles: intOrNull(val('f-miles')), doneBy: val('f-doneby'), vendor: val('f-vendor'),
    cost: moneyOrNull(val('f-cost')), invoice: val('f-invoice'), notes: val('f-notes'),
    warranty: wOn ? {
      on: true, covers: val('f-w-covers'), preset: F.wPreset || 'custom', lifetime: F.wPreset === 'life',
      until: F.wPreset === 'life' ? '' : (parseISO(val('f-w-until')) ? val('f-w-until') : ''),
      miles: F.wPreset === 'life' ? null : intOrNull(val('f-w-miles')),
      provider: val('f-w-provider'), notes: val('f-w-notes')
    } : { on: false },
    next: nOn ? { label: val('f-n-label') || 'Next ' + title, date: nDate, miles: nMiles, cleared: !!(F.nextCleared && F.origNext && (F.origNext.date || '') === nDate && (F.origNext.miles || null) === nMiles) } : null,
    photos: [], createdAt: F.createdAt || Date.now(), updatedAt: Date.now()
  };
  setBusy(s, true);
  try {
    for (const p of F.photos) {
      if (p.isNew) { await write(() => photos.put(p.id, p.full)); p.isNew = false; }
      rec.photos.push({ id: p.id, thumb: p.thumb });
    }
    await write(() => refs.records.doc(rid).set(rec));
    S.everWrote = true;
    if (F.removed.length) { try { await write(() => photos.remove(F.removed)); } catch (e) { } }
    for (const cid of F.clears) { const r = S.records.get(cid); if (r && r.next && !r.next.cleared) { try { await write(() => refs.records.doc(cid).update({ next: { ...r.next, cleared: true } })); } catch (e) { } } }
    const vv = S.vehicles.get(v.id);
    if (vv && rec.miles && rec.miles > (Number(vv.mileage) || 0)) { try { await write(() => refs.vehicles.doc(v.id).update({ mileage: rec.miles, updatedAt: Date.now() })); } catch (e) { } }
    closeSheet(s);
    toast(F.id ? 'Record updated' : 'Saved to ' + vShort(v));
  } catch (e) { setBusy(s, false); toast(writeErr(e)); }
}

/* ---------- Record detail ---------- */
function recordDetailHTML(r) {
  const v = S.vehicles.get(r.vehicleId), k = KIND[r.kind] || KIND.other, w = wInfo(r), d = dueInfo(r);
  const photos = r.photos || [];
  return `<div class="eyebrow">${esc(k.label)} · ${esc(vName(v))}</div>
    <h2 class="d-title">${esc(r.title)}</h2>
    <div class="chips">${statusChip(r)}${wChip(w)}</div>
    <dl class="facts">
      <div><dt>Date</dt><dd>${esc(fmtDate(r.date)) || '—'}</dd></div>
      <div><dt>Odometer</dt><dd class="mono">${r.miles ? fmtNum(r.miles) + ' mi' : '—'}</dd></div>
      <div><dt>Done by</dt><dd>${esc(r.doneBy) || '—'}</dd></div>
      <div><dt>Parts from</dt><dd>${esc(r.vendor) || '—'}</dd></div>
      <div><dt>Cost</dt><dd class="mono">${money(r.cost) || '—'}</dd></div>
      <div><dt>Invoice #</dt><dd class="mono">${esc(r.invoice) || '—'}</dd></div>
    </dl>
    ${w ? `<div class="wbox ${wClass(w)}">${icon('shield')}<div><b>${esc(r.warranty.covers ? 'Warranty: ' + r.warranty.covers : 'Warranty')}</b><p>${esc(wLine(w))}${wLeft(w) && !w.w.lifetime ? ' · ' + esc(wLeft(w)) : ''}</p>${r.warranty.provider ? `<p class="sub">Through ${esc(r.warranty.provider)}</p>` : ''}${r.warranty.notes ? `<p class="sub">${esc(r.warranty.notes)}</p>` : ''}</div></div>` : ''}
    ${d ? `<div class="wbox ${d.state === 'over' ? 'warn' : 'muted'}">${icon('bell')}<div><b>${esc(d.label)}</b><p>${esc(dueLine(d))}${dueLeft(d) ? ' · ' + esc(dueLeft(d)) : ''}</p></div></div>` : ''}
    ${r.notes ? `<div class="notes">${esc(r.notes)}</div>` : ''}
    ${photos.length ? `<div class="sec-h"><h2>Receipts &amp; photos</h2><span>${photos.length}</span></div><div class="pgrid">${photos.map((p, i) => `<button type="button" class="ph" data-photo="${i}" aria-label="Open photo ${i + 1}"><img src="${esc(safeImg(p.thumb))}" alt=""></button>`).join('')}</div>` : ''}
    ${S.readOnly ? '' : `<div class="btnrow" style="margin-top:18px">${isOpen(r) ? `<button type="button" class="btn primary" data-rd="done">Mark done</button>` : ''}<button type="button" class="btn" data-rd="edit">${icon('edit')}Edit</button>${d ? `<button type="button" class="btn" data-rd="log-next">Log ${esc(d.label.replace(/^next\s+/i, ''))}</button>` : ''}<button type="button" class="btn danger-ghost" data-rd="delete">Delete</button></div>`}`;
}
function openRecordDetail(id) {
  const r0 = S.records.get(id);
  if (!r0) return;
  openSheet({
    title: 'Record',
    body: recordDetailHTML(r0),
    refresh: s => { const r = S.records.get(id); if (!r) { closeSheet(s); return; } if (!s.busy) s.body.innerHTML = recordDetailHTML(r); },
    onMount: s => {
      s.body.addEventListener('click', async e => {
        const r = S.records.get(id); if (!r) return;
        const ph = e.target.closest('[data-photo]');
        if (ph) { openViewer((r.photos || []).map(p => p.id), Number(ph.dataset.photo)); return; }
        const b = e.target.closest('[data-rd]'); if (!b || s.busy) return;
        const a = b.dataset.rd;
        if (a === 'edit') { closeSheet(s); openRecordForm({ id }); }
        else if (a === 'log-next') { const d = dueInfo(r); closeSheet(s); openRecordForm({ vehicleId: r.vehicleId, title: (d?.label || r.title).replace(/^next\s+/i, '').replace(/^./, c => c.toUpperCase()), kind: r.kind, clears: [r.id] }); }
        else if (a === 'done') {
          s.busy = true; b.disabled = true;
          try { await write(() => refs.records.doc(id).update({ status: 'done', updatedAt: Date.now() })); toast('Marked done'); }
          catch (err) { toast(writeErr(err)); }
          s.busy = false; s.refresh(s);
        } else if (a === 'delete') {
          const ok = await confirmBox({ title: 'Delete this record?', text: `“${r.title}” and its receipt photos will be deleted. This can't be undone.` });
          if (!ok) return;
          s.busy = true;
          try { await deleteRecordDocs(r); closeSheet(s); toast('Record deleted'); }
          catch (err) { s.busy = false; toast(writeErr(err)); }
        }
      });
    }
  });
}

/* ---------- Copy history ---------- */
async function copyHistory(vid) {
  const v = S.vehicles.get(vid); if (!v) return;
  const recs = recordsOf(vid), cur = curMiles(v);
  const lines = [vName(v) + (v.trim ? ' ' + v.trim : '') + (v.nickname ? ` (${v.nickname})` : '')];
  const idl = [v.plate && 'Plate ' + v.plate, v.vin && 'VIN ' + v.vin, cur ? 'Odometer ' + fmtNum(cur) + ' mi' : ''].filter(Boolean).join(' · ');
  if (idl) lines.push(idl);
  lines.push('', `Service history, newest first (${plural(recs.length, 'record')})`, '');
  for (const r of recs) {
    lines.push('• ' + [fmtDate(r.date), r.miles ? fmtNum(r.miles) + ' mi' : '', (KIND[r.kind] || KIND.other).label, r.title, r.doneBy, r.vendor && 'parts from ' + r.vendor, r.cost != null ? money(r.cost) : '', isOpen(r) ? STATUS[r.status].label : ''].filter(Boolean).join(' · '));
    const w = wInfo(r);
    if (w) lines.push('   Warranty: ' + wLine(w) + (r.warranty.provider ? ', through ' + r.warranty.provider : ''));
  }
  const text = lines.join('\n');
  try { await navigator.clipboard.writeText(text); toast('History copied. Paste it into a text or email.'); }
  catch (e) {
    openSheet({ title: 'Copy history', body: `<p class="hint" style="margin-bottom:10px">Select the text below and copy it.</p><textarea id="copy-ta" rows="16" readonly class="mono" style="font-size:13px">${esc(text)}</textarea>`, onMount: s => { const ta = s.body.querySelector('textarea'); ta.focus(); ta.select(); } });
  }
}

/* ---------- Events ---------- */
const go = (view, extra = {}) => { Object.assign(S, { view }, extra); render(); window.scrollTo(0, 0); };
const ACTS = {
  nav: t => go(t.dataset.view, { vehicleId: null }),
  'open-vehicle': t => go('vehicle', { vehicleId: t.dataset.id, vtab: 'history', vq: '' }),
  back: () => go('garage', { vehicleId: null }),
  'add-vehicle': () => openVehicleForm(),
  'edit-vehicle': t => { const v = S.vehicles.get(t.dataset.id); if (v) openVehicleForm(v); },
  'log-work': t => openRecordForm({ vehicleId: t.dataset.id }),
  'open-record': t => openRecordDetail(t.dataset.id),
  vtab: t => { S.vtab = t.dataset.tab; render(); },
  'copy-history': t => copyHistory(t.dataset.id),
  'toggle-shop': t => { S.openShop = S.openShop === t.dataset.key ? null : t.dataset.key; render(); },
  'due-done': t => { const r = S.records.get(t.dataset.id); const d = r && dueInfo(r); if (!r) return; openRecordForm({ vehicleId: r.vehicleId, title: (d?.label || r.title).replace(/^next\s+/i, '').replace(/^./, c => c.toUpperCase()), kind: r.kind, clears: [r.id] }); },
  resub: () => { if (uid) subscribe(); },
  google: () => signInGoogle(),
  'signout-now': () => auth && auth.signOut(),
  signout: async () => { if (await confirmBox({ title: 'Sign out of Glovebox?', text: 'Your records stay saved. Sign in again any time with the same account.', ok: 'Sign out', danger: false })) { try { await auth.signOut(); } catch (e) { signedOut(); } } }
};
document.addEventListener('click', e => {
  const t = e.target.closest('[data-act]');
  if (!t || (!document.getElementById('app').contains(t) && !document.getElementById('tabs').contains(t))) return;
  const fn = ACTS[t.dataset.act];
  if (fn) fn(t, e);
});
document.addEventListener('input', e => {
  if (e.target.id === 'gq') { S.q = e.target.value; const g = document.getElementById('gresults'); if (g) g.innerHTML = garageBody(); }
  else if (e.target.id === 'vq') { S.vq = e.target.value; const g = document.getElementById('vresults'); if (g) g.innerHTML = historyList(recordsOf(S.vehicleId), S.vq); }
});
document.getElementById('snapInput').addEventListener('change', e => {
  const files = [...e.target.files];
  e.target.value = '';
  if (files.length && S.vehicleId && S.vehicles.has(S.vehicleId)) openRecordForm({ vehicleId: S.vehicleId }, { files });
});


/* ---------- Account ---------- */
function authMsg(e) {
  const c = String((e && e.code) || '').replace(/^auth\//, '');
  return {
    'unauthorized-domain': "This web address isn't on Firebase's list of authorized domains yet.",
    'operation-not-allowed': "That sign-in method isn't turned on in Firebase yet.",
    'network-request-failed': "Couldn't reach the server. Check your connection.",
    'invalid-email': "That doesn't look like an email address.",
    'invalid-action-code': 'That sign-in link has expired or was already used. Ask for a new one.',
    'expired-action-code': 'That sign-in link has expired. Ask for a new one.',
    'too-many-requests': 'Too many tries. Wait a few minutes, then try again.',
    'user-disabled': 'This account has been turned off.'
  }[c] || 'Sign-in failed. Try again in a moment.';
}
function setSigninMsg(err, ok) { S.signinErr = err || ''; S.signinOk = ok || ''; render(); }
async function signInGoogle() {
  setSigninMsg('', '');
  const p = new firebase.auth.GoogleAuthProvider();
  p.setCustomParameters({ prompt: 'select_account' });
  try { await auth.signInWithPopup(p); }
  catch (e) {
    const c = String(e && e.code || '');
    if (c === 'auth/popup-blocked' || c === 'auth/operation-not-supported-in-this-environment') {
      try { await auth.signInWithRedirect(p); } catch (e2) { setSigninMsg(authMsg(e2)); }
    } else if (c !== 'auth/popup-closed-by-user' && c !== 'auth/cancelled-popup-request') setSigninMsg(authMsg(e));
  }
}
document.addEventListener('submit', async e => {
  if (e.target.id === 'link-form') {
    e.preventDefault();
    const email = e.target.querySelector('#si-email').value.trim().toLowerCase();
    S.linkEmail = email;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setSigninMsg("That doesn't look like an email address.");
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true; btn.textContent = 'Sending…';
    try {
      await auth.sendSignInLinkToEmail(email, { url: location.origin + location.pathname, handleCodeInApp: true });
      try { localStorage.setItem(LINK_EMAIL_KEY, email); } catch (x) { }
      setSigninMsg('', `Check ${email} for a sign-in link (look in spam too). Open it on this device.`);
    } catch (err) { setSigninMsg(authMsg(err)); }
  } else if (e.target.id === 'confirm-form') {
    e.preventDefault();
    const email = e.target.querySelector('#ce-email').value.trim().toLowerCase();
    if (!email) return setSigninMsg('Type your email address.');
    await finishEmailLink(email);
  }
});
async function finishEmailLink(email) {
  try {
    await auth.signInWithEmailLink(email, location.href);
    try { localStorage.removeItem(LINK_EMAIL_KEY); } catch (x) { }
    history.replaceState(null, '', location.pathname);
  } catch (err) {
    history.replaceState(null, '', location.pathname);
    S.status = 'signin'; setSigninMsg(authMsg(err));
  }
}
function signedOut() {
  while (unsubs.length) { try { unsubs.pop()(); } catch (e) { } }
  uid = null; userEmail = '';
  S.vehicles = new Map(); S.records = new Map(); photoCache.clear();
  while (sheets.length) closeSheet(sheets[sheets.length - 1]);
  Object.assign(S, { status: 'signin', view: 'garage', vehicleId: null, q: '', vq: '', subError: false, rolled: false, slow: false });
  render();
}
function subscribe() {
  while (unsubs.length) { try { unsubs.pop()(); } catch (e) { } }
  S.subError = false;
  let gotV = false, gotR = false;
  const slowT = setTimeout(() => { if (!(gotV && gotR)) { S.slow = true; render(); } }, 10000);
  const done = () => {
    if (gotV && gotR) { clearTimeout(slowT); S.slow = false; if (S.status === 'loading') S.status = 'ok'; }
    render(); refreshSheets();
  };
  const fail = e => {
    clearTimeout(slowT); S.slow = false;
    const m = mapErr(e);
    if (m.code === 'denied') S.status = 'notallowed';
    else if (S.status === 'ok') S.subError = true;
    else S.status = 'loadfail';
    render();
  };
  unsubs.push(userDoc().collection('vehicles').onSnapshot(snap => {
    S.vehicles = new Map(snap.docs.map(d => [d.id, { ...d.data(), id: d.id }])); gotV = true; done();
  }, fail));
  unsubs.push(userDoc().collection('records').onSnapshot(snap => {
    S.records = new Map(snap.docs.map(d => [d.id, { ...d.data(), id: d.id }])); gotR = true; done();
  }, fail));
}
async function signedIn(user) {
  uid = user.uid; userEmail = (user.email || '').toLowerCase();
  S.status = 'loading'; S.signinErr = ''; S.signinOk = ''; render();
  let ok = false;
  try { ok = !!userEmail && (await fs.collection('allowed').doc(userEmail).get()).exists; } catch (e) { ok = false; }
  if (uid !== user.uid) return;
  if (!ok) { S.status = 'notallowed'; render(); return; }
  subscribe();
}
async function start() {
  render();
  if (!window.firebase || !CFG.apiKey || !CFG.projectId) { S.status = 'config'; render(); return; }
  firebase.initializeApp(CFG);
  auth = firebase.auth();
  fs = firebase.firestore();
  try { fs.settings({ ignoreUndefinedProperties: true }); } catch (e) { }
  try { auth.useDeviceLanguage(); } catch (e) { }
  if (auth.isSignInWithEmailLink(location.href)) {
    let email = '';
    try { email = localStorage.getItem(LINK_EMAIL_KEY) || ''; } catch (e) { }
    if (email) await finishEmailLink(email);
    else { S.status = 'confirmemail'; render(); }
  }
  auth.onAuthStateChanged(user => {
    if (user && !user.isAnonymous) signedIn(user);
    else if (S.status !== 'confirmemail') signedOut();
  });
}
start();
})();
