(function () {
'use strict';

/* ===================== Helpers ===================== */
const VAT = 0.12, r2 = n => Math.round(n * 100) / 100;
function quoteCalc(q) {
    const sub = r2((q.items || []).reduce((s, i) => s + i.qty * i.price, 0)), tr = r2(q.transport || 0), vat = r2((sub + tr) * VAT);
    return { sub, tr, vat, total: r2(sub + tr + vat) };
}
const DB_KEY = 'bw_super_db_v3', SET_KEY = 'bw_super_settings_v1', SIDEBAR_KEY = 'bw_super_sidebar_v1';
const THEME_KEY = 'bw_theme', PROFILE_KEY = 'bw_super_profile', LANDING = 'LandingPage.html', ME = 'u1';
const $ = id => document.getElementById(id);
const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => 'i' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const peso = n => '₱' + Math.round(Number(n) || 0).toLocaleString('en-US');
const fmtDate = ts => new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const initials = n => n.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
const tone = n => ['blue', 'gray', 'green', 'orange'][[...n].reduce((a, c) => a + c.charCodeAt(0), 0) % 4];
const badge = n => `<span class="client-badge ${tone(n)}">${esc(initials(n))}</span>`;
const emptyRow = (cols, msg) => `<tr class="empty-row"><td colspan="${cols}">${msg}</td></tr>`;
const readJSON = (k, fb) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? fb : v; } catch (e) { return fb; } };
const writeJSON = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };

let profile = readJSON(PROFILE_KEY, { name: 'Clarrisan', email: 'clarrisan@gmail.com' });
const firstName = () => profile.name.split(/\s+/)[0] || '';

const TABS = {
    dashboard: { crumb: 'OVERVIEW > DASHBOARD', title: 'System Dashboard', sub: '' },
    quotations: { crumb: 'MANAGEMENT > QUOTATIONS', title: 'Quotations', sub: 'Review, approve, or modify outgoing business proposals.' },
    projects: { crumb: 'MANAGEMENT > PROJECTS', title: 'Project Summary', sub: 'Track installations and security deployments by status and start date.' },
    financial: { crumb: 'PORTFOLIO > FINANCIAL SUMMARY', title: 'Financial Performance', sub: 'Real-time revenue, expense tracking, and profit analysis.' },
    activity: { crumb: 'SYSTEM > AUDIT TRAIL', title: 'Activity Log', sub: '' },
    settings: { crumb: 'SYSTEM SUPPORT > SETTINGS', title: 'System Settings', sub: 'Manage your dashboard appearance and account security.' }
};
const setDashSub = () => { TABS.dashboard.sub = `Welcome back, ${firstName()}. Here is a live summary of system status and recent operations.`; };
setDashSub();

const ui = {
    tab: 'dashboard', metric: 'revenue', range: 6, eventsShown: 5, perPage: 5, confirm: null, activeQuote: null,
    q: { page: 1, search: '', status: 'all' },
    p: { page: 1, search: '', status: 'all', from: '', to: '' },
    l: { page: 1, search: '', admin: 'all' }, a: { page: 1 }
};
let db;

/* ===================== Data ===================== */
const keyOf = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
const curKey = () => keyOf(new Date());
function lastMonths(n) {
    const out = [], now = new Date();
    for (let i = n - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        out.push({ key: keyOf(d), label: d.toLocaleString('en-US', { month: 'short' }), full: d.toLocaleString('en-US', { month: 'long', year: 'numeric' }) });
    }
    return out;
}

function seed() {
    const now = Date.now(), day = 864e5, min = 6e4, hr = 36e5;
    const months = lastMonths(12);
    const rev = [120000, 140000, 135000, 150000, 160000, 165000, 180000, 220000, 290000, 250000, 310000, 348200];
    const hp = [6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11], hq = [3, 4, 2, 5, 3, 4, 6, 4, 5, 3, 4];
    const revenue = {}, hProj = {}, hQuote = {};
    months.forEach((m, i) => { revenue[m.key] = rev[i]; if (i < 11) { hProj[m.key] = hp[i]; hQuote[m.key] = hq[i]; } });
    const projects = [
        ['Security Quotation Install', 'Apex Systems', 'active', 2], ['Network Upgrade', 'Nova Retail', 'active', 3],
        ['Access Control System', 'Vortex Logistics', 'active', 40], ['Structured Cabling', 'Helios Tower', 'active', 45],
        ['Clinic Security Setup', 'Orion Clinic', 'active', 50], ['Fiber Backbone', 'Summit Mall', 'active', 55],
        ['Firewall Rollout', 'Pacific Bank', 'active', 60], ['Warehouse Surveillance', 'Delta Warehouse', 'active', 65],
        ['School WiFi', 'Zenith School', 'active', 70], ['PoS Network', 'Harbor Hotel', 'active', 75],
        ['IoT Sensors', 'Atlas Factory', 'active', 80], ['Office Fit-out', 'Lumen Office', 'active', 85],
        ['Intercom Install', 'Crest Condo', 'completed', 120], ['Pharmacy Cameras', 'Metro Pharmacy', 'completed', 140],
        ['Resort Cabling', 'Sol Resort', 'hold', 100]
    ].map((p, i) => ({ id: uid(), code: 'PRJ-' + String(i + 1).padStart(3, '0'), name: p[0], client: p[1], status: p[2], start: now - p[3] * day }));
        const I = (name, qty, price) => ({ name, qty, price });
        const CAB = I('Cabling & Installation', 1, 6500), CFG = I('System Configuration & Commissioning', 1, 3000);
        const Q = (n, client, scope, items, transport, status, age, notes) => {
            const q = { id: 'Q-' + (1000 + n), client, scope, items, transport, status, date: now - age * hr, notes: notes || '' };
            q.amount = quoteCalc(q).total; return q;
        };
        const quotes = [
        Q(1,'Apex Inc.','CCTV Installation & Cabling',[I('16-Channel DVR',1,12500),I('IP Camera (Dome)',8,4200),I('Power Adapter & Connectors',8,350),CAB],0,'pending',2),
        Q(2,'Nova Retail','Network Upgrade',[I('PoE Switch 8-Port',4,5400),I('Cat6 Cable (305m Box)',3,6500),I('UPS 650VA',2,3800),I('Cabling & Installation',2,6500),CFG],1500,'pending',12),
        Q(3,'Orion Clinic','Clinic Security Setup',[I('IP Camera (Dome)',6,4200),I('8-Channel DVR',1,8500),I('1TB Surveillance HDD',1,3200),I('Power Adapter & Connectors',6,350),CAB],0,'pending',28),
        Q(4,'Vortex Logistics','Access Control System',[I('Fingerprint Door Lock',6,9800),I('Gate Access Controller',2,11500),I('Video Doorbell',2,6200),I('Cabling & Installation',2,6500),CFG],800,'approved',72),
        Q(5,'Helios Tower','Structured Cabling',[I('Cat6 Cable (305m Box)',10,6500),I('PoE Switch 8-Port',8,5400),I('UPS 650VA',4,3800),I('Cabling & Installation',4,6500)],2000,'approved',96),
        Q(6,'Atlas Factory','IoT Sensors',[I('Wi-Fi Indoor Camera',10,2900),I('PoE Switch 8-Port',2,5400),CAB,CFG],0,'rejected',120,'Budget Constraints: Proposed budget exceeded target.'),
        Q(7,'Harbor Hotel','PoS Network',[I('PoE Switch 8-Port',6,5400),I('Cat6 Cable (305m Box)',5,6500),I('UPS 650VA',4,3800),I('Cabling & Installation',3,6500),CFG],1000,'pending',20),
        Q(8,'Zenith School','School WiFi',[I('PoE Switch 8-Port',8,5400),I('Cat6 Cable (305m Box)',4,6500),I('Cabling & Installation',2,6500),CFG],500,'pending',30)
        ];
    const A = (id, name, email, role, ago) => ({ id, name, email, role, lastActivity: now - ago * min });
    const E = (id, desc, name, user, ago) => ({ id, desc, name, user, time: now - ago * min, status: 'completed' });
    return {
        projects, revenue, hProj, hQuote,
        quotes,
        events: [
            E(8847, 'Accepted an inquiry from Apex Inc.', 'Clarrisan', 'Administrator 1', 20),
            E(8846, 'Approved quotation #Q-1004 for Vortex Logistics', 'Maria Santos', 'Administrator 2', 90),
            E(8845, 'Marked project "Intercom Install" as Completed', 'John Reyes', 'Administrator 3', 17 * 60),
            E(8844, 'Rejected quotation #Q-1006 for Atlas Factory', 'Clarrisan', 'Administrator 1', 26 * 60),
            E(8843, 'Approved quotation #Q-1005 for Helios Tower', 'Maria Santos', 'Administrator 2', 30 * 60),
            E(8842, 'Added project "School WiFi" for Zenith School', 'John Reyes', 'Administrator 3', 50 * 60)
        ],
        notifs: [
            { text: 'New quotation request from Apex Inc.', time: now - 15 * min, read: false },
            { text: 'System audit backup completed successfully.', time: now - 180 * min, read: false }
        ],
        accounts: [
            A('u1', profile.name, profile.email, 'Administrator 1', 2),
            A('u2', 'Maria Santos', 'maria.santos@beyondwires.com', 'Administrator 2', 90),
            A('u3', 'John Reyes', 'john.reyes@beyondwires.com', 'Administrator 3', 17 * 60)
        ]
    };
}
function save() { writeJSON(DB_KEY, db); }
function load() {
    const r = readJSON(DB_KEY, null);
    db = r && r.quotes && r.accounts && r.projects && r.events ? r : seed();
}
function loadSettings() {
    const s = readJSON(SET_KEY, null);
    if (s) { ui.range = s.range || 6; ui.eventsShown = s.events || 5; ui.perPage = s.perPage || 5; }
}

const me = () => db.accounts.find(a => a.id === ME) || { name: profile.name, role: 'Administrator 1' };
const activeProjects = () => db.projects.filter(p => p.status === 'active').length;
const pendingQuotes = () => db.quotes.filter(q => q.status === 'pending').length;
const curRevenue = () => db.revenue[curKey()] || 0;
function metricValue(metric, key) {
    if (key === curKey()) return metric === 'revenue' ? curRevenue() : metric === 'projects' ? activeProjects() : pendingQuotes();
    return ((metric === 'revenue' ? db.revenue : metric === 'projects' ? db.hProj : db.hQuote)[key]) || 0;
}


/* log / notify / toast / commit */
function logEvent(desc) {
    const id = db.events.reduce((m, e) => Math.max(m, e.id), 8800) + 1, a = me();
    db.events.unshift({ id, desc, name: a.name, user: a.role, time: Date.now(), status: 'completed' });
    db.events = db.events.slice(0, 200);
    a.lastActivity = Date.now();
}
function notify(text) { db.notifs.unshift({ text, time: Date.now(), read: false }); db.notifs = db.notifs.slice(0, 30); }
function toast(msg, type) {
    type = type || 'success';
    const el = document.createElement('div');
    el.className = 'toast ' + type;
    el.innerHTML = `<i class="fa-solid ${type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-check'}"></i> ${esc(msg)}`;
    $('toast-stack').appendChild(el);
    setTimeout(() => el.remove(), 3000);
}
function commit(desc, note) {
    if (desc) logEvent(desc);
    if (note) notify(note);
    save(); renderAll();
}
function fmtTime(ts) {
    const d = new Date(ts), t = new Date(), y = new Date(); y.setDate(t.getDate() - 1);
    const day = d.toDateString() === t.toDateString() ? 'Today' : d.toDateString() === y.toDateString() ? 'Yesterday' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return { main: `${day}, ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`, sub: fmtDate(ts) };
}
function ago(ts) {
    const s = Math.max(1, Math.floor((Date.now() - ts) / 1000));
    if (s < 60) return 'just now';
    if (s < 3600) return Math.floor(s / 60) + ' mins ago';
    if (s < 86400) return Math.floor(s / 3600) + ' hours ago';
    return Math.floor(s / 86400) + ' days ago';
}
function downloadCSV(name, rows) {
    const q = v => '"' + String(v).replace(/"/g, '""') + '"';
    const url = URL.createObjectURL(new Blob(['\ufeff' + rows.map(r => r.map(q).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8;' }));
    const a = document.createElement('a');
    a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}

/* shared pager */
function pager(id, st, total, noun, rerender) {
    const per = ui.perPage, pages = Math.max(1, Math.ceil(total / per));
    if (st.page > pages) st.page = pages;
    const start = (st.page - 1) * per, end = Math.min(start + per, total);
    let nums = '';
    for (let p = 1; p <= pages; p++) nums += `<button class="page-num ${p === st.page ? 'active' : ''}" data-page="${p}">${p}</button>`;
    const el = $(id);
    el.innerHTML = `<span class="pagination-info">SHOWING ${total ? start + 1 : 0}-${end} OF ${total} ${noun}</span>
        <div class="pagination-controls"><button class="page-btn" data-page="${st.page - 1}" ${st.page === 1 ? 'disabled' : ''}>Prev</button>${nums}
        <button class="page-btn" data-page="${st.page + 1}" ${st.page === pages ? 'disabled' : ''}>Next</button></div>`;
    el.onclick = e => { const b = e.target.closest('[data-page]'); if (b && !b.disabled) { st.page = parseInt(b.dataset.page, 10); rerender(); } };
}
const pageSlice = (list, st) => list.slice((st.page - 1) * ui.perPage, st.page * ui.perPage);

/* ===================== Dashboard ===================== */
function renderKPIs() {
    $('kpi-projects-val').textContent = activeProjects();
    const k = curKey(), added = db.projects.filter(p => keyOf(new Date(p.start)) === k).length;
    $('kpi-projects-sub').innerHTML = added ? `<i class="fa-solid fa-arrow-up"></i> +${added} this month` : 'No new projects this month';
    $('kpi-projects-sub').className = 'kpi-sub ' + (added ? 'up' : 'muted');
    const pq = pendingQuotes();
    $('kpi-quotes-val').textContent = pq;
    $('kpi-quotes-sub').innerHTML = pq ? '<i class="fa-solid fa-clock"></i> Requires review' : '<i class="fa-solid fa-circle-check"></i> All reviewed';
    $('kpi-quotes-sub').className = 'kpi-sub ' + (pq ? 'warn' : 'up');
    const cur = curRevenue(), prev = db.revenue[lastMonths(2)[0].key] || 0, sub = $('kpi-revenue-sub');
    $('kpi-revenue-val').textContent = peso(cur);
    if (!prev) { sub.textContent = 'No previous month data'; sub.className = 'kpi-sub muted'; }
    else {
        const pct = (cur - prev) / prev * 100;
        sub.innerHTML = `<i class="fa-solid fa-arrow-${pct >= 0 ? 'up' : 'down'}"></i> ${pct >= 0 ? '+' : ''}${pct.toFixed(1)}% vs last month`;
        sub.className = 'kpi-sub ' + (pct >= 0 ? 'up' : 'down');
    }
}

const METRIC = {
    revenue: { fmt: peso, axis: v => v >= 1000 ? '₱' + (v / 1000) + 'k' : '₱' + v, color: '#2563eb', sub: 'Monthly incoming collections' },
    projects: { fmt: v => v + ' projects', axis: v => v, color: '#16a34a', sub: 'Active projects at month end' },
    quotes: { fmt: v => v + ' pending', axis: v => v, color: '#d97706', sub: 'Quotations waiting for review' }
};
let chartPts = [];
const CW = 720, CH = 260, PL = 52, PR = 18, PT = 18, PB = 32;

function renderStats() {
    const m = METRIC[ui.metric], months = lastMonths(ui.range), vals = months.map(x => metricValue(ui.metric, x.key));
    $('chart-subtitle').textContent = `${m.sub} · last ${ui.range} months`;
    const cur = vals[vals.length - 1], prev = vals.length > 1 ? vals[vals.length - 2] : 0;
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length, peakI = vals.indexOf(Math.max(...vals));
    let chg = '—', cls = '';
    if (prev) { const p = (cur - prev) / prev * 100; chg = (p >= 0 ? '+' : '') + p.toFixed(1) + '%'; cls = p >= 0 ? 'up' : 'down'; }
    $('stat-tiles').innerHTML = `
        <div class="stat-tile"><span>CURRENT</span><strong>${m.fmt(cur)}</strong><small>${months[months.length - 1].full}</small></div>
        <div class="stat-tile"><span>AVERAGE</span><strong>${ui.metric === 'revenue' ? peso(avg) : avg.toFixed(1)}</strong><small>per month</small></div>
        <div class="stat-tile"><span>PEAK</span><strong>${m.fmt(vals[peakI])}</strong><small>${months[peakI].full}</small></div>
        <div class="stat-tile"><span>VS LAST MONTH</span><strong class="${cls}">${chg}</strong><small>change</small></div>`;
    const maxV = Math.max(...vals, 1);
    let top;
    if (ui.metric === 'revenue') {
        const raw = maxV * 1.1 / 4, mag = Math.pow(10, Math.floor(Math.log10(raw)));
        top = [1, 2, 2.5, 5, 10].map(k => k * mag).find(v => v >= raw) * 4;
    } else top = Math.max(4, Math.ceil(maxV * 1.1 / 4) * 4);
    const x = i => PL + (vals.length === 1 ? (CW - PL - PR) / 2 : i * (CW - PL - PR) / (vals.length - 1));
    const y = v => PT + (CH - PT - PB) * (1 - v / top), base = y(0);
    chartPts = vals.map((v, i) => ({ x: x(i), y: y(v), v, month: months[i] }));
    let svg = `<defs><linearGradient id="areaG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${m.color}" stop-opacity="0.28"/><stop offset="1" stop-color="${m.color}" stop-opacity="0"/></linearGradient></defs>`;
    for (let t = 0; t <= 4; t++) {
        const yy = y(top / 4 * t);
        svg += `<line x1="${PL}" x2="${CW - PR}" y1="${yy}" y2="${yy}" stroke="#94a3b8" stroke-opacity=".3" stroke-dasharray="${t === 0 ? '0' : '4 4'}"/>`;
        svg += `<text x="${PL - 8}" y="${yy + 3}" text-anchor="end" font-size="10" fill="#94a3b8">${m.axis(top / 4 * t)}</text>`;
    }
    let line = `M ${chartPts[0].x} ${chartPts[0].y}`;
    for (let i = 1; i < chartPts.length; i++) {
        const a = chartPts[i - 1], b = chartPts[i], mx = (a.x + b.x) / 2;
        line += ` C ${mx} ${a.y}, ${mx} ${b.y}, ${b.x} ${b.y}`;
    }
    svg += `<path d="${line} L ${chartPts[chartPts.length - 1].x} ${base} L ${chartPts[0].x} ${base} Z" fill="url(#areaG)"/>`;
    svg += `<path d="${line}" fill="none" stroke="${m.color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`;
    chartPts.forEach((p, i) => {
        const last = i === chartPts.length - 1;
        svg += `<circle cx="${p.x}" cy="${p.y}" r="${last ? 5 : 3.5}" fill="#fff" stroke="${m.color}" stroke-width="2"/>`;
        svg += `<text x="${p.x}" y="${CH - 10}" text-anchor="middle" font-size="11" fill="${last ? m.color : '#94a3b8'}" font-weight="${last ? 700 : 500}">${p.month.label}</text>`;
    });
    svg += `<line id="hover-line" x1="0" x2="0" y1="${PT}" y2="${base}" stroke="${m.color}" stroke-opacity="0.35" stroke-dasharray="3 3" style="display:none"/>`;
    svg += `<circle id="hover-dot" r="6" fill="${m.color}" stroke="#fff" stroke-width="2" style="display:none"/>`;
    $('chart-svg').innerHTML = svg;
}
function chartHover(e) {
    if (!chartPts.length) return;
    const r = $('chart-svg').getBoundingClientRect(), vx = (e.clientX - r.left) / r.width * CW;
    let best = 0;
    chartPts.forEach((p, i) => { if (Math.abs(p.x - vx) < Math.abs(chartPts[best].x - vx)) best = i; });
    const p = chartPts[best], tip = $('chart-tip'), hl = $('hover-line'), hd = $('hover-dot');
    hl.setAttribute('x1', p.x); hl.setAttribute('x2', p.x); hl.style.display = '';
    hd.setAttribute('cx', p.x); hd.setAttribute('cy', p.y); hd.style.display = '';
    tip.innerHTML = `${METRIC[ui.metric].fmt(p.v)}<small>${p.month.full}</small>`;
    tip.style.left = (p.x / CW * r.width) + 'px'; tip.style.top = (p.y / CH * r.height) + 'px';
    tip.classList.add('show');
}
function chartLeave() {
    $('chart-tip').classList.remove('show');
    ['hover-line', 'hover-dot'].forEach(id => { const el = $(id); if (el) el.style.display = 'none'; });
}
function bar(label, count, total, cls) {
    const pct = total ? Math.round(count / total * 100) : 0;
    return `<div class="bd-row"><div class="bd-label"><span>${label}</span><span>${count} · ${pct}%</span></div><div class="bd-track"><div class="bd-fill ${cls}" style="width:${pct}%"></div></div></div>`;
}
function renderBreakdown() {
    const P = db.projects, Q = db.quotes, c = (arr, s) => arr.filter(x => x.status === s).length;
    const approved = c(Q, 'approved'), decided = approved + c(Q, 'rejected');
    $('breakdown').innerHTML =
        `<div class="breakdown-title">PROJECTS (${P.length})</div>` + bar('Active', c(P, 'active'), P.length, 'primary') + bar('Completed', c(P, 'completed'), P.length, 'success') + bar('On Hold', c(P, 'hold'), P.length, 'warning') +
        `<div class="bd-divider"></div><div class="breakdown-title">QUOTATIONS (${Q.length}) · APPROVAL RATE ${decided ? Math.round(approved / decided * 100) + '%' : '—'}</div>` +
        bar('Pending', c(Q, 'pending'), Q.length, 'warning') + bar('Approved', approved, Q.length, 'success') + bar('Rejected', c(Q, 'rejected'), Q.length, 'danger');
}
function renderEvents() {
    const rows = db.events.slice(0, ui.eventsShown);
    $('events-tbody').innerHTML = rows.length ? rows.map(e => `<tr>
        <td><span class="req-id">#EVT-${e.id}</span></td><td>${esc(e.desc)}</td><td>${esc(e.user)}</td><td>${fmtTime(e.time).main}</td>
        <td class="text-right"><span class="status-badge completed"><i class="fa-solid fa-circle-check"></i> Success</span></td></tr>`).join('') : emptyRow(5, 'No recent operations.');
}

/* Dashboard modals */

function renderRevenueModal() {
    $('rev-list').innerHTML = lastMonths(12).reverse().map((m, i) => `
        <div class="item-row"><div class="item-info"><strong>${m.full}</strong><span>${i === 0 ? 'Current month' : ''}</span></div>
        <div class="item-actions"><strong style="font-size:13px;">${peso(db.revenue[m.key] || 0)}</strong></div></div>`).join('');
}



/* ===================== Quotations ===================== */
const QBADGE = {
    pending: '<span class="status-badge pending"><i class="fa-solid fa-clock"></i> Pending</span>',
    approved: '<span class="status-badge approved"><i class="fa-solid fa-circle-check"></i> Approved</span>',
    revision: '<span class="status-badge revision"><i class="fa-solid fa-rotate"></i> Needs Revision</span>',
    rejected: '<span class="status-badge rejected"><i class="fa-solid fa-circle-xmark"></i> Rejected</span>'
};
const QLABEL = { pending: 'Pending', approved: 'Approved', revision: 'Needs Revision', rejected: 'Rejected' };
function renderQuotes() {
    const term = ui.q.search.toLowerCase();
    const searched = db.quotes.filter(x => (x.id + ' ' + x.client + ' ' + x.scope + ' ' + fmtDate(x.date) + ' ' + x.amount).toLowerCase().includes(term));
    const cnt = s => s === 'all' ? searched.length : searched.filter(x => x.status === s).length;
    $('q-tabs').innerHTML = ['all', 'pending', 'approved', 'revision', 'rejected'].map(s =>
        `<button class="seg-btn ${ui.q.status === s ? 'active' : ''}" data-qs="${s}" role="tab">${s === 'all' ? 'All' : QLABEL[s]}<b>${cnt(s)}</b></button>`).join('');
    const list = searched.filter(x => ui.q.status === 'all' || x.status === ui.q.status).sort((a, b) => b.date - a.date);
    const pages = Math.max(1, Math.ceil(list.length / ui.perPage));
    if (ui.q.page > pages) ui.q.page = pages;
    $('q-tbody').innerHTML = list.length ? pageSlice(list, ui.q).map(x => {
        const view = `<button class="icon-action" title="View quotation" data-qact="view" data-id="${x.id}"><i class="fa-solid fa-eye"></i></button>`;
        const actions = x.status === 'approved'
            ? view + '<button class="icon-action success" title="Approved" disabled><i class="fa-solid fa-check"></i></button>'
            : view + `<button class="icon-action success" title="Approve" data-qact="approve" data-id="${x.id}"><i class="fa-solid fa-check"></i></button>
               <button class="icon-action revision" title="Modify Revision" data-qact="revise" data-id="${x.id}"><i class="fa-solid fa-pen-to-square"></i></button>
               <button class="icon-action delete" title="Reject" data-qact="reject" data-id="${x.id}"><i class="fa-solid fa-xmark"></i></button>`;
        const note = (x.status === 'revision' || x.status === 'rejected') && x.notes ? `<div class="note-line">${esc(x.notes)}</div>` : '';
        return `<tr><td><span class="req-id">#${x.id}</span></td>
            <td><div class="client-cell">${badge(x.client)}<div class="client-info"><strong>${esc(x.client)}</strong><span>Project: ${esc(x.scope)}</span></div></div></td>
            <td>${fmtDate(x.date)}</td><td><strong>${peso(x.amount)}</strong></td><td>${QBADGE[x.status]}${note}</td>
            <td class="text-right"><div class="action-icons">${actions}</div></td></tr>`;
    }).join('') : emptyRow(6, 'No quotations match your search or filter.');
    pager('q-pager', ui.q, list.length, 'QUOTATIONS', renderQuotes);
}
function closePanels() { $('panel-revision').classList.remove('active'); $('panel-reject').classList.remove('active'); ui.activeQuote = null; }
const quoteById = id => db.quotes.find(q => q.id === id);
function quoteDocHTML(x) {
    const t = quoteCalc(x), adj = r2(x.amount - t.total), per = 10, items = x.items || [], pages = [];
    for (let i = 0; i < items.length; i += per) pages.push(items.slice(i, i + per));
    if (!pages.length) pages.push([]);
    const total = pages.length + 2; let n = 0;
    const foot = () => `<div class="qv-foot">Page ${++n} of ${total}</div>`;
    const row = (a, b, c) => `<div class="qv-row ${c || ''}"><span>${a}</span><b>${b}</b></div>`;
    let h = `<div class="qv-page"><div class="qv-brand">BEYONDWIRES</div><h4>Quotation ${esc(x.id)}</h4>${row('Date', fmtDate(x.date))}${row('Prepared for', esc(x.client))}${row('Project', esc(x.scope))}<p>Scope of work: supply and installation of the items listed in this quotation, including testing and commissioning.</p>${foot()}</div>`;
    pages.forEach((c, i) => {
        h += `<div class="qv-page"><h4>List of Accessories${i ? ' (cont.)' : ''}</h4>${c.map(it => row(`${esc(it.name)} x ${it.qty}`, peso(it.qty * it.price))).join('') || '<p>No items listed.</p>'}${foot()}</div>`;
    });
    return h + `<div class="qv-page"><h4>Cost Summary</h4>${row('Subtotal', peso(t.sub))}${row('Other expenses (transport)', peso(t.tr))}${row('VAT (12%)', peso(t.vat))}${Math.abs(adj) > 0.009 ? row('Revision adjustment', peso(adj)) : ''}${row('Total Cost', peso(x.amount), 'total')}<p>This quotation is valid for 30 days from the date issued. Final scope and schedule are confirmed after approval.</p>${foot()}</div>`;
}
function viewQuote(id) {
    const x = quoteById(id); if (!x) return;
    $('qv-title').textContent = 'Quotation #' + x.id;
    $('qv-sub').innerHTML = QBADGE[x.status] + ' &nbsp;' + esc(x.client) + ' · ' + peso(x.amount);
    $('qv-docs').innerHTML = quoteDocHTML(x); $('qv-docs').scrollLeft = 0;
    $('qv-note').hidden = !x.notes; $('qv-note').textContent = x.notes ? 'Notes: ' + x.notes : '';
    openModal('modal-viewquote');
}
function approveQuote(id) {
    closePanels();
    const x = quoteById(id); if (!x) return;
    x.status = 'approved';
    commit(`Approved quotation #${id} for ${x.client}`, `Quotation #${id} approved.`);
    toast(`Quotation #${id} approved successfully`);
}
function openRevision(id) {
    const x = quoteById(id); if (!x) return;
    ui.activeQuote = id; $('panel-reject').classList.remove('active');
    $('rev-title').textContent = 'Modify & Resubmit: #' + id;
    $('rev-amount').value = x.amount || '';
    $('rev-notes').value = x.notes || 'Updated scope and pricing adjustments requested by reviewer.';
    $('panel-revision').classList.add('active');
    $('panel-revision').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
function openReject(id) {
    const x = quoteById(id); if (!x) return;
    ui.activeQuote = id; $('panel-revision').classList.remove('active');
    $('rej-title').textContent = 'Reject with Feedback: #' + id;
    $('rej-notes').value = '';
    $('panel-reject').classList.add('active');
    $('panel-reject').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
function submitRevision() {
    const x = quoteById(ui.activeQuote); if (!x) return;
    const amt = parseFloat($('rev-amount').value.replace(/[^0-9.-]+/g, ''));
    if (!isNaN(amt) && amt > 0) x.amount = amt;
    x.notes = $('rev-notes').value.trim(); x.status = 'revision';
    const id = x.id; closePanels();
    commit(`Sent revised quotation #${id} to ${x.client}`, `Quotation #${id} moved to Needs Revision.`);
    toast(`Quotation #${id} moved to Needs Revision`);
}
function submitRejection() {
    const x = quoteById(ui.activeQuote); if (!x) return;
    const notes = $('rej-notes').value.trim();
    x.notes = $('rej-reason').value + (notes ? ': ' + notes : ''); x.status = 'rejected';
    const id = x.id; closePanels();
    commit(`Rejected quotation #${id} for ${x.client}`, `Quotation #${id} rejected.`);
    toast(`Quotation #${id} rejected`);
}

/* ===================== Projects ===================== */
const PSTATUS = {
    active: '<span class="status-badge progress">Active</span>',
    completed: '<span class="status-badge completed">Completed</span>',
    hold: '<span class="status-badge hold">On Hold</span>'
};
function projFiltered(ignoreStatus) {
    const t = ui.p.search.toLowerCase();
    const from = ui.p.from ? new Date(ui.p.from + 'T00:00:00').getTime() : -Infinity;
    const to = ui.p.to ? new Date(ui.p.to + 'T23:59:59').getTime() : Infinity;
    return db.projects.filter(p => (p.code + ' ' + p.client + ' ' + p.name + ' ' + fmtDate(p.start)).toLowerCase().includes(t)
        && p.start >= from && p.start <= to && (ignoreStatus || ui.p.status === 'all' || p.status === ui.p.status));
}
function renderProjectsTab() {
    const base = projFiltered(true), c = s => base.filter(p => p.status === s).length;
    $('p-counts').innerHTML = `<div class="count-chip"><span>TOTAL PROJECTS</span><strong>${base.length}</strong></div>
        <div class="count-chip active"><span>ACTIVE</span><strong>${c('active')}</strong></div>
        <div class="count-chip completed"><span>COMPLETED</span><strong>${c('completed')}</strong></div>
        <div class="count-chip hold"><span>ON HOLD</span><strong>${c('hold')}</strong></div>`;
    const list = projFiltered(false), pages = Math.max(1, Math.ceil(list.length / ui.perPage));
    if (ui.p.page > pages) ui.p.page = pages;
    $('p-tbody').innerHTML = list.length ? pageSlice(list, ui.p).map(p => `<tr>
        <td><span class="req-id">#${esc(p.code)}</span></td>
        <td><div class="client-cell">${badge(p.client)}<div class="client-info"><strong>${esc(p.client)}</strong><span>${esc(p.name)}</span></div></div></td>
        <td>${fmtDate(p.start)}</td><td>${PSTATUS[p.status] || ''}</td></tr>`).join('') : emptyRow(4, 'No projects match your filters.');
    pager('p-pager', ui.p, list.length, 'PROJECTS', renderProjectsTab);
}

/* ===================== Financial ===================== */
const PERIODS = { Q1: ['₱301,000', '₱193,000', '₱108,000'], Q2: ['₱376,000', '₱220,000', '₱156,000'], YTD: ['₱1,284,500', '₱642,300', '₱642,200'] };
const FIN = [
    { m: 'December 2023', rev: 185000, exp: 98000 }, { m: 'November 2023', rev: 162000, exp: 92000 }, { m: 'October 2023', rev: 158000, exp: 88000 },
    { m: 'September 2023', rev: 144000, exp: 84000 }, { m: 'August 2023', rev: 138000, exp: 79000 }
].map((r, i) => Object.assign(r, { i, net: r.rev - r.exp, margin: (r.rev - r.exp) / r.rev * 100 }));
const FSORT = [
    ['default', 'Newest first'], ['rev-desc', 'Gross Revenue: highest to lowest'], ['rev-asc', 'Gross Revenue: lowest to highest'],
    ['exp-desc', 'Expenses: highest to lowest'], ['exp-asc', 'Expenses: lowest to highest'],
    ['net-desc', 'Net Profit: highest to lowest'], ['net-asc', 'Net Profit: lowest to highest'],
    ['margin-desc', 'Margin: highest to lowest'], ['margin-asc', 'Margin: lowest to highest']
];
let finSort = 'default', finPeriod = 'YTD', finReady = false, finCharts = [];
const finRows = () => {
    if (finSort === 'default') return FIN.slice();
    const [k, d] = finSort.split('-');
    return FIN.slice().sort((a, b) => d === 'desc' ? b[k] - a[k] : a[k] - b[k]);
};
function renderFinTable() {
    $('fin-tbody').innerHTML = finRows().map(r => `<tr><td><strong>${r.m}</strong></td><td>${peso(r.rev)}</td><td class="text-danger">${peso(r.exp)}</td><td class="text-success bold">${peso(r.net)}</td><td><span class="badge-soft">${r.margin.toFixed(1)}%</span></td></tr>`).join('');
    $('fin-sort-menu').innerHTML = '<span class="menu-label" style="display:block;padding:6px 16px">SORT BY</span>' +
        FSORT.map(o => `<button class="menu-btn ${o[0] === finSort ? 'on' : ''}" data-fsort="${o[0]}">${o[1]}</button>`).join('');
    $('fin-sort-label').textContent = finSort === 'default' ? 'Filter' : FSORT.find(o => o[0] === finSort)[1].split(':')[0] + (finSort.endsWith('desc') ? ' ↓' : ' ↑');
}
function exportFinReport() {
    const rows = [['BEYOND WIRES - FINANCIAL REPORT'], ['Period', finPeriod], ['Generated', new Date().toLocaleString()], ['Prepared by', profile.name], [],
        ['SUMMARY'], ['Total Revenue', $('fin-revenue').textContent], ['Total Expenses', $('fin-expenses').textContent], ['Net Profit', $('fin-profit').textContent], [],
        ['EXPENSE BREAKDOWN'], ['Category', 'Amount'], ['Operations', '₱289,000'], ['Payroll', '₱160,000'], ['Marketing', '₱96,000'], ['Hardware / Supplies', '₱52,000'], ['Software', '₱45,000'], [],
        ['MONTHLY PERFORMANCE'], ['Month', 'Gross Revenue', 'Operating Expenses', 'Net Profit', 'Margin %']]
        .concat(finRows().map(r => [r.m, r.rev, r.exp, r.net, r.margin.toFixed(1) + '%']));
    downloadCSV(`financial-report-${finPeriod}.csv`, rows);
    commit(`Exported financial report (${finPeriod})`);
    toast('Financial report downloaded');
}
function initFinance() {
    if (typeof Chart === 'undefined') return;
    if (finReady) { finCharts.forEach(c => c.resize()); return; }
    finReady = true;
    finCharts.push(new Chart($('trendChart'), {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [
                { label: 'Revenue', data: [95, 105, 101, 114, 128, 134, 141, 138, 144, 158, 162, 185], borderColor: '#2563eb', backgroundColor: 'rgba(37,99,235,0.05)', borderWidth: 3, tension: 0.35, fill: true, pointRadius: 3, pointBackgroundColor: '#2563eb' },
                { label: 'Expenses', data: [62, 67, 64, 70, 73, 77, 81, 79, 84, 88, 92, 98], borderColor: '#ef4444', backgroundColor: 'transparent', borderWidth: 2, tension: 0.35, pointRadius: 3, pointBackgroundColor: '#ef4444' }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, grid: { color: 'rgba(148,163,184,.2)' }, ticks: { callback: v => '₱' + v + 'k', color: '#94a3b8', font: { size: 11 } } }, x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 11 } } } }
        }
    }));
    finCharts.push(new Chart($('expenseDonutChart'), {
        type: 'doughnut',
        data: { labels: ['Operations', 'Payroll', 'Marketing', 'Hardware / Supplies', 'Software'], datasets: [{ data: [289, 160, 96, 52, 45], backgroundColor: ['#1e293b', '#2563eb', '#10b981', '#f59e0b', '#64748b'], borderWidth: 2, borderColor: '#ffffff' }] },
        options: { responsive: true, maintainAspectRatio: false, cutout: '72%', plugins: { legend: { display: false } } }
    }));
}

/* ===================== Activity ===================== */
function avatar(name) {
    let h = 0; for (const c of name) h = (h * 31 + c.charCodeAt(0)) % 360;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56"><rect width="56" height="56" fill="hsl(${h},55%,48%)"/><text x="50%" y="54%" font-family="Arial" font-size="22" font-weight="700" fill="#fff" text-anchor="middle" dominant-baseline="middle">${esc(initials(name))}</text></svg>`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}
const userCell = (name, sub, extra) => `<div class="user-cell"><div class="avatar-wrap"><img class="user-avatar" src="${avatar(name)}" alt=""></div>
    <div class="user-details"><strong>${esc(name)}${extra || ''}</strong><span>${esc(sub)}</span></div></div>`;

function renderLog() {
    const sel = $('l-admin'), roles = db.accounts.map(a => a.role).sort();
    sel.innerHTML = '<option value="all">All Administrators</option>' + roles.map(r => `<option value="${esc(r)}">${esc(r)}</option>`).join('');
    if (!roles.includes(ui.l.admin)) ui.l.admin = 'all';
    sel.value = ui.l.admin;
    const q = ui.l.search.toLowerCase();
    const list = db.events.filter(e => (ui.l.admin === 'all' || e.user === ui.l.admin) && (!q || (e.desc + ' ' + e.name + ' ' + e.user).toLowerCase().includes(q)));
    $('l-tbody').innerHTML = list.length ? pageSlice(list, ui.l).map(e => {
        const t = fmtTime(e.time);
        return `<tr><td>${userCell(e.name || e.user, e.user)}</td><td>${esc(e.desc)}</td><td><div class="timestamp-cell"><strong>${t.main}</strong><span>${t.sub}</span></div></td></tr>`;
    }).join('') : emptyRow(3, 'No activity matches your search or filter.');
    pager('l-pager', ui.l, list.length, 'ACTIVITIES', renderLog);
}
function renderAccounts() {
    const list = db.accounts, pages = Math.max(1, Math.ceil(list.length / ui.perPage));
    if (ui.a.page > pages) ui.a.page = pages;
    $('a-tbody').innerHTML = pageSlice(list, ui.a).map(a => {
        const t = fmtTime(a.lastActivity), self = a.id === ME;
        return `<tr><td>${userCell(a.name, a.email, self ? '<span class="you-tag">YOU</span>' : '')}</td><td>${esc(a.role)}</td>
            <td><div class="timestamp-cell"><strong>${t.main}</strong><span>${t.sub}</span></div></td>
            <td class="text-right"><button class="icon-btn" data-del="${a.id}" ${self ? 'disabled title="You cannot delete your own account"' : 'title="Delete account"'}><i class="fa-solid fa-trash-can"></i></button></td></tr>`;
    }).join('');
    pager('a-pager', ui.a, list.length, 'ACCOUNTS', renderAccounts);
    TABS.activity.sub = `${db.events.length} logged activities · ${db.accounts.length} administrator accounts`;
    if (ui.tab === 'activity') $('page-sub').textContent = TABS.activity.sub;
}
const validName = v => /^\p{L}+(?:[\s.'-]\p{L}+)*$/u.test(v);
const validEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
const validPass = v => v.length >= 8 && /\d/.test(v);
function nextAdminRole() {
    const n = db.accounts.reduce((m, a) => Math.max(m, parseInt((a.role.match(/(\d+)$/) || [0, 0])[1], 10)), 0) + 1;
    return 'Administrator ' + n;
}
function openAdd() {
    ['add-name', 'add-email', 'add-pass'].forEach(i => $(i).value = '');
    ['fg-name', 'fg-email', 'fg-pass'].forEach(i => $(i).classList.remove('invalid'));
    openModal('modal-add'); setTimeout(() => $('add-name').focus(), 50);
}
function submitAdd() {
    const name = $('add-name').value.trim().replace(/\s+/g, ' '), email = $('add-email').value.trim(), pass = $('add-pass').value;
    const okE = validEmail(email), dup = db.accounts.some(a => a.email.toLowerCase() === email.toLowerCase());
    $('fg-name').classList.toggle('invalid', !validName(name));
    $('name-error').textContent = name ? 'Names can contain letters and spaces only.' : 'Please enter a name.';
    $('email-error').textContent = dup ? 'This email already exists.' : 'Please enter a valid email.';
    $('fg-email').classList.toggle('invalid', !okE || dup);
    $('fg-pass').classList.toggle('invalid', !validPass(pass));
    if (!validName(name) || !okE || dup || !validPass(pass)) return;
    // The password is validated only; never store it in the browser. Hash and save it on your server.
    const role = nextAdminRole();
    db.accounts.push({ id: uid(), name, email, role, lastActivity: Date.now() });
    ui.l = { page: 1, search: '', admin: 'all' }; $('l-search').value = '';
    closeModal('modal-add');
    commit(`Created ${role} account for ${name}`, `New administrator account created for ${name}.`);
    toast(`Account added: ${name} (${role})`);
}
function openDeleteList() {
    const items = db.accounts.filter(a => a.id !== ME);
    $('delete-list').innerHTML = items.length ? items.map(a => `<div class="item-row pick" data-pick="${a.id}"><div class="item-info"><strong>${esc(a.name)}</strong><span>${esc(a.role)} · ${esc(a.email)}</span></div><i class="fa-solid fa-trash-can" style="color:#94a3b8"></i></div>`).join('') : '<div class="list-empty">No other accounts to delete.</div>';
    openModal('modal-delacct');
}
function askDeleteAccount(id) {
    const a = db.accounts.find(x => x.id === id); if (!a) return;
    if (id === ME) return toast('You cannot delete your own account.', 'error');
    closeModal('modal-delacct');
    confirmDelete(`Are you sure you want to permanently delete <strong>${esc(a.name)}</strong> (${esc(a.role)})? This cannot be undone.`, () => {
        db.accounts = db.accounts.filter(x => x.id !== id);
        commit(`Deleted account of ${a.name} (${a.role})`, `Account deleted: ${a.name}.`);
        toast(`Account deleted: ${a.name}`);
    });
}

/* ===================== Settings ===================== */
const validGmail = v => {
    const m = v.toLowerCase().match(/^([a-z0-9.]+)@gmail\.com$/); if (!m) return false;
    const u = m[1]; return u.length >= 6 && u.length <= 30 && !u.startsWith('.') && !u.endsWith('.') && !u.includes('..');
};
let savedTheme = readJSON(THEME_KEY, 'light'), selectedTheme = savedTheme;
const dirty = new Set();
function setErr(id, msg) { $(id).closest('.st-input').classList.toggle('invalid', !!msg); $(id + 'Err').textContent = msg || ''; }
function paintStatus() {
    const d = dirty.size > 0 || selectedTheme !== savedTheme;
    $('stStatus').classList.toggle('dirty', d);
    $('stStatus').firstElementChild.className = 'fa-solid ' + (d ? 'fa-circle-exclamation' : 'fa-circle-check');
    $('stStatusText').textContent = d ? 'Unsaved changes' : 'All settings up to date';
}
function applyTheme(t) { document.documentElement.setAttribute('data-theme', t); }
function paintTheme() {
    $$('.st-theme').forEach(b => {
        const t = b.dataset.themeOpt;
        b.classList.toggle('selected', t === selectedTheme); b.classList.toggle('is-active', t === savedTheme);
        b.setAttribute('aria-pressed', String(t === selectedTheme));
    });
    paintStatus();
}
function syncProfile() {
    const a = db.accounts.find(x => x.id === ME);
    if (a) { a.name = profile.name; a.email = profile.email; }
    $('top-name').textContent = profile.name;
    setDashSub();
    if (ui.tab === 'dashboard') $('page-sub').textContent = TABS.dashboard.sub;
}
function fillProfile() { $('stFullName').value = profile.name; $('stEmail').value = profile.email; }
function saveProfileField(field) {
    if (field === 'name') {
        const v = $('stFullName').value.trim().replace(/\s+/g, ' ');
        if (!v) return setErr('stFullName', 'Please enter your full name.');
        if (!validName(v)) return setErr('stFullName', 'Full name can contain letters and spaces only.');
        if (v === profile.name) { setErr('stFullName', ''); return paintStatus(); }
        profile.name = v;
    } else {
        const v = $('stEmail').value.trim().toLowerCase();
        if (!validGmail(v)) return setErr('stEmail', 'Enter a valid Gmail address (6–30 letters, numbers or periods before @gmail.com).');
        if (v === profile.email) { setErr('stEmail', ''); return paintStatus(); }
        profile.email = v;
    }
    writeJSON(PROFILE_KEY, profile); fillProfile(); syncProfile();
    dirty.delete(field); paintStatus();
    commit(`Updated own ${field === 'name' ? 'name' : 'email address'}`);
    toast('Account details updated');
}
const EYE_ON = '<svg viewBox="0 0 24 24"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>';
const EYE_OFF = '<svg viewBox="0 0 24 24"><path d="M3 3l18 18"/><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8"/><path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.1 4.1"/><path d="M6.2 6.2C3.5 8 2 12 2 12s3.6 7 10 7c1.2 0 2.3-.2 3.3-.6"/></svg>';
function initSettings() {
    fillProfile(); applyTheme(savedTheme); paintTheme();
    $$('#tab-settings .st-input input').forEach(inp => inp.addEventListener('input', () => {
        setErr(inp.id, '');
        dirty.add(inp.id === 'stFullName' ? 'name' : inp.id === 'stEmail' ? 'email' : 'pw'); paintStatus();
    }));
    ['stFullName', 'stEmail'].forEach(id => {
        const f = id === 'stFullName' ? 'name' : 'email';
        $(id).addEventListener('change', () => saveProfileField(f));
        $(id).addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); $(id).blur(); } });
    });
    $$('.st-theme').forEach(b => b.addEventListener('click', () => { selectedTheme = b.dataset.themeOpt; paintTheme(); }));
    $('stSaveTheme').addEventListener('click', () => {
        savedTheme = selectedTheme; writeJSON(THEME_KEY, savedTheme); applyTheme(savedTheme); paintTheme();
        toast(`${savedTheme === 'dark' ? 'Dark' : 'Light'} mode applied`);
    });
    $$('.st-eye').forEach(btn => {
        btn.innerHTML = EYE_ON;
        btn.addEventListener('click', () => {
            const input = $(btn.dataset.target), reveal = input.type === 'password';
            input.type = reveal ? 'text' : 'password'; btn.innerHTML = reveal ? EYE_OFF : EYE_ON;
            btn.setAttribute('aria-label', reveal ? 'Hide password' : 'Show password');
        });
    });
    $('stPwForm').addEventListener('submit', e => {
        e.preventDefault();
        const cur = $('stCurPw').value, nw = $('stNewPw').value, cf = $('stConfPw').value;
        let ok = true;
        if (!cur) { setErr('stCurPw', 'Please enter your current password.'); ok = false; } // real verification needs a server
        if (!validPass(nw)) { setErr('stNewPw', 'Use at least 8 characters and include a number.'); ok = false; }
        else if (nw === cur) { setErr('stNewPw', 'New password must be different from the current one.'); ok = false; }
        if (!cf) { setErr('stConfPw', 'Please confirm your new password.'); ok = false; }
        else if (cf !== nw) { setErr('stConfPw', 'Passwords do not match.'); ok = false; }
        if (!ok) return;
        $('stPwForm').reset();
        $$('.st-eye').forEach(b => { $(b.dataset.target).type = 'password'; b.innerHTML = EYE_ON; });
        dirty.delete('pw'); paintStatus();
        commit('Changed own account password');
        toast('Password changed successfully');
    });
}

/* ===================== Shared chrome ===================== */
function renderNotifs() {
    $('notif-list').innerHTML = db.notifs.length ? db.notifs.map(n => `<div class="notif-item ${n.read ? '' : 'unread'}"><strong>${esc(n.text)}</strong><span>${ago(n.time)}</span></div>`).join('') : '<div class="notif-empty">No notifications</div>';
    $('notif-dot').style.display = db.notifs.some(n => !n.read) ? 'block' : 'none';
}
function renderAll() { renderKPIs(); renderStats(); renderBreakdown(); renderEvents(); renderNotifs(); renderQuotes(); renderProjectsTab(); renderLog(); renderAccounts(); renderFinTable(); }
function closeDropdowns() { $$('.dropdown-menu').forEach(m => m.classList.remove('show')); }
function openModal(id) { closeDropdowns(); $(id).classList.add('active'); }
function closeModal(id) { $(id).classList.remove('active'); }
function confirmDelete(html, fn) { ui.confirm = fn; $('confirm-text').innerHTML = html; openModal('modal-confirm'); }

function showTab(name) {
    if (!TABS[name]) name = 'dashboard';
    ui.tab = name;
    $$('.tab-panel').forEach(p => p.classList.toggle('active', p.id === 'tab-' + name));
    $$('.sidebar .nav-item').forEach(a => a.classList.toggle('active', a.dataset.tab === name));
    $('page-crumb').textContent = TABS[name].crumb;
    $('page-title').textContent = TABS[name].title;
    $('page-sub').textContent = TABS[name].sub;
    if (location.hash !== '#' + name) history.replaceState(null, '', '#' + name);
    closeDropdowns(); window.scrollTo(0, 0);
    if (name === 'financial') initFinance();
}
function setCollapsed(c) {
    $('app').classList.toggle('collapsed', c);
    $('sidebar-toggle').innerHTML = `<i class="fa-solid ${c ? 'fa-angles-right' : 'fa-angles-left'}"></i>`;
    $('sidebar-toggle').title = c ? 'Expand sidebar' : 'Minimize sidebar';
    $('sidebar-toggle').setAttribute('aria-label', $('sidebar-toggle').title);
    try { localStorage.setItem(SIDEBAR_KEY, c ? '1' : '0'); } catch (e) {}
    finCharts.forEach(ch => setTimeout(() => ch.resize(), 300));
}
const syncRange = () => $$('#range-tabs .seg-btn').forEach(x => x.classList.toggle('active', parseInt(x.dataset.range, 10) === ui.range));

/* ===================== Wiring ===================== */
function init() {
    load(); loadSettings();
    syncProfile();

    $('sidebar').addEventListener('click', e => { const a = e.target.closest('[data-tab]'); if (a) { e.preventDefault(); showTab(a.dataset.tab); } });
    window.addEventListener('hashchange', () => showTab(location.hash.slice(1)));
    $('sidebar-toggle').onclick = () => setCollapsed(!$('app').classList.contains('collapsed'));
    let startCollapsed = false; try { startCollapsed = localStorage.getItem(SIDEBAR_KEY) === '1'; } catch (e) {}
    setCollapsed(startCollapsed);

    // header dropdowns
    $$('[data-dd]').forEach(b => b.addEventListener('click', e => {
        e.stopPropagation();
        const el = $(b.dataset.dd), open = el.classList.contains('show');
        closeDropdowns(); if (!open) { el.classList.add('show'); renderNotifs(); }
    }));
    $$('.dropdown-menu[data-keep]').forEach(m => m.addEventListener('click', e => e.stopPropagation()));
    document.addEventListener('click', closeDropdowns);
    $('mark-read').onclick = () => { db.notifs.forEach(n => n.read = true); save(); renderNotifs(); toast('All notifications marked as read'); };
    $('my-profile').onclick = () => showTab('settings');
    $('logout').onclick = () => { closeDropdowns(); toast('Logged out successfully.'); setTimeout(() => { location.href = LANDING; }, 400); };

    // modals
    $$('[data-close]').forEach(b => b.addEventListener('click', () => closeModal(b.dataset.close)));
    $$('.modal-overlay').forEach(o => o.addEventListener('click', e => { if (e.target === o) o.classList.remove('active'); }));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') { $$('.modal-overlay.active').forEach(o => o.classList.remove('active')); closeDropdowns(); } });
    $('confirm-yes').onclick = () => { closeModal('modal-confirm'); const f = ui.confirm; ui.confirm = null; if (f) f(); };

    // dashboard
    const press = (id, fn) => { $(id).addEventListener('click', fn); $(id).addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } }); };
    press('kpi-projects', () => showTab('projects'));
    press('kpi-quotes', () => showTab('quotations'));
    press('kpi-revenue', () => { renderRevenueModal(); openModal('modal-revenue'); });
    $('view-activity').onclick = e => { e.preventDefault(); showTab('activity'); };
    $('metric-tabs').addEventListener('click', e => {
        const b = e.target.closest('[data-metric]'); if (!b) return;
        ui.metric = b.dataset.metric; $$('#metric-tabs .seg-btn').forEach(x => x.classList.toggle('active', x === b)); renderStats();
    });
    $('range-tabs').addEventListener('click', e => { const b = e.target.closest('[data-range]'); if (b) { ui.range = parseInt(b.dataset.range, 10); syncRange(); renderStats(); } });
    syncRange();
    $('chart-svg').addEventListener('mousemove', chartHover);
    $('chart-svg').addEventListener('mouseleave', chartLeave);
    $('chart-svg').addEventListener('touchstart', e => chartHover(e.touches[0]), { passive: true });
    $('chart-svg').addEventListener('touchmove', e => chartHover(e.touches[0]), { passive: true });


    // quotations
    $('q-search').addEventListener('input', e => { ui.q.search = e.target.value; ui.q.page = 1; renderQuotes(); });
    $('q-tabs').addEventListener('click', e => { const b = e.target.closest('[data-qs]'); if (b) { ui.q.status = b.dataset.qs; ui.q.page = 1; renderQuotes(); } });
    $('q-tbody').addEventListener('click', e => {
        const b = e.target.closest('[data-qact]'); if (!b || b.disabled) return;
        ({ view: viewQuote, approve: approveQuote, revise: openRevision, reject: openReject })[b.dataset.qact](b.dataset.id);
    });
    $$('[data-panel-close]').forEach(b => b.addEventListener('click', closePanels));
    $('rev-send').onclick = submitRevision;
    $('rej-send').onclick = submitRejection;

    // projects
    $('p-search').addEventListener('input', e => { ui.p.search = e.target.value; ui.p.page = 1; renderProjectsTab(); });
    $('p-status').addEventListener('change', e => { ui.p.status = e.target.value; ui.p.page = 1; renderProjectsTab(); });
    $('p-from').addEventListener('change', e => { ui.p.from = e.target.value; ui.p.page = 1; renderProjectsTab(); });
    $('p-to').addEventListener('change', e => { ui.p.to = e.target.value; ui.p.page = 1; renderProjectsTab(); });
    $('p-reset').onclick = () => {
        ui.p = { page: 1, search: '', status: 'all', from: '', to: '' };
        $('p-search').value = ''; $('p-status').value = 'all'; $('p-from').value = ''; $('p-to').value = '';
        renderProjectsTab(); toast('Filters reset');
    };

    // financial
    $('fin-period').addEventListener('click', e => {
        const b = e.target.closest('[data-period]'); if (!b) return;
        finPeriod = b.dataset.period;
        $$('#fin-period .filter-tab').forEach(x => x.classList.toggle('active', x === b));
        const v = PERIODS[finPeriod];
        $('fin-revenue').textContent = v[0]; $('fin-expenses').textContent = v[1]; $('fin-profit').textContent = v[2];
    });
    $('fin-export').onclick = exportFinReport;
    $('fin-sort-menu').addEventListener('click', e => { const b = e.target.closest('[data-fsort]'); if (b) { finSort = b.dataset.fsort; renderFinTable(); } });
    $('fin-csv').onclick = () => {
        downloadCSV('monthly-performance.csv', [['Month', 'Gross Revenue', 'Operating Expenses', 'Net Profit', 'Margin %']].concat(finRows().map(r => [r.m, r.rev, r.exp, r.net, r.margin.toFixed(1) + '%'])));
        toast('Monthly performance CSV downloaded');
    };

    // activity
    $('act-add').onclick = openAdd;
    $('act-del').onclick = openDeleteList;
    $('confirm-add').onclick = submitAdd;
    ['add-name', 'add-email', 'add-pass'].forEach(i => $(i).addEventListener('keydown', e => { if (e.key === 'Enter') submitAdd(); }));
    $('l-search').addEventListener('input', e => { ui.l.search = e.target.value; ui.l.page = 1; renderLog(); });
    $('l-admin').addEventListener('change', e => { ui.l.admin = e.target.value; ui.l.page = 1; renderLog(); });
    $('l-reset').onclick = () => { ui.l = { page: 1, search: '', admin: 'all' }; $('l-search').value = ''; renderLog(); toast('Filters reset'); };
    $('a-tbody').addEventListener('click', e => { const b = e.target.closest('[data-del]'); if (b && !b.disabled) askDeleteAccount(b.dataset.del); });
    $('delete-list').addEventListener('click', e => { const it = e.target.closest('[data-pick]'); if (it) askDeleteAccount(it.dataset.pick); });

    initSettings();
    renderAll();
    showTab(location.hash.slice(1));
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();

/* ===== Shared: date limits (2019-2028) + mobile drawer ===== */
(function () {
  'use strict';
  const MIN = '2019-01-01', MAX = '2028-12-31', MN = 2019, MX = 2028;
  const MON = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  function toast(msg) {
    const t = document.createElement('div'); t.className = 'bw-toast'; t.textContent = msg;
    document.body.appendChild(t); setTimeout(() => t.remove(), 2800);
  }
  const limitInputs = () => document.querySelectorAll('input[type=date]').forEach(i => { i.min = MIN; i.max = MAX; });
  limitInputs();
  document.addEventListener('change', e => {
    const i = e.target;
    if (i.type === 'date' && i.value && (i.value < MIN || i.value > MAX)) { i.value = ''; toast('Please choose a date between 2019 and 2028.'); }
  }, true);

  const parse = t => { const m = /([A-Za-z]+)\s+(\d{4})/.exec(t || ''); const i = m ? MON.indexOf(m[1]) : -1; return i < 0 ? null : { m: i, y: +m[2] }; };
  const lock = (b, on) => {
    if (!b) return;
    if (on) { b.dataset.bwLock = 1; b.disabled = true; }
    else if (b.dataset.bwLock) { delete b.dataset.bwLock; b.disabled = false; }
  };
  function syncCals() {
    document.querySelectorAll('.si-cal-head,.cp-head').forEach(h => {
      const p = parse((h.querySelector('b') || {}).textContent); if (!p) return;
      const k = p.y * 12 + p.m;
      lock(h.firstElementChild, k <= MN * 12);
      lock(h.lastElementChild, k >= MX * 12 + 11);
    });
  }
  let raf; new MutationObserver(() => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { limitInputs(); syncCals(); }); })
    .observe(document.body, { subtree: true, childList: true, characterData: true });
  syncCals();

  const mq = matchMedia('(max-width: 900px)');
  const bd = document.createElement('div'); bd.className = 'bw-backdrop'; document.body.appendChild(bd);
  const closeNav = () => document.body.classList.remove('nav-open');
  document.addEventListener('click', e => {
    if (mq.matches && e.target.closest('.sidebar-toggle')) {
      e.stopImmediatePropagation(); e.preventDefault(); document.body.classList.toggle('nav-open'); return;
    }
    if (e.target === bd || (mq.matches && e.target.closest('.sidebar .nav-item'))) closeNav();
  }, true);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeNav(); });
  mq.addEventListener('change', closeNav);
})();