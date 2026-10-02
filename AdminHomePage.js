
/* ==========================================================
   Beyond Wires - Admin (unified)  |  JS/AdminHomePage.js
   Flow: Inquiry -> Quotation (draft / superadmin / customer) -> Project -> Done
   All data lives in the DB object below (saved to localStorage for now).
   Replace the save() calls / seeds with your backend when ready.
   ========================================================== */
(function () {
    'use strict';
 
    /* =========================================================
       Helpers
    ========================================================= */
    const $  = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
    const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const pad = (n, w = 2) => String(n).padStart(w, '0');
    const round2 = n => Math.round(n * 100) / 100;
    const peso = n => '\u20B1' + Number(n).toLocaleString('en-PH', { minimumFractionDigits: Number.isInteger(+n) ? 0 : 2, maximumFractionDigits: 2 });
    const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const iso = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
    const toDate = s => new Date(String(s).slice(0, 10) + 'T00:00:00');
    const fmtDate = s => { const d = toDate(s); return MONTHS[d.getMonth()].slice(0, 3) + ' ' + d.getDate() + ', ' + d.getFullYear(); };
    const fmtLong = s => { const d = toDate(s); return DAYS[d.getDay()] + ', ' + fmtDate(s); };
    const fmtTime = s => new Date(s).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    const ini = n => String(n).split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
    const PALETTE = ['#3b82f6', '#6366f1', '#0ea5e9', '#14b8a6', '#8b5cf6', '#f59e0b'];
    const avColor = n => PALETTE[[...String(n)].reduce((a, c) => a + c.charCodeAt(0), 0) % PALETTE.length];
 
    const store = {
        get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
        set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* ignore */ }  }
    };
 
    const LOGIN_URL = 'LandingPage.html';
    const VAT_RATE = 0.12;
    const SLOTS = ['9:00 AM', '10:30 AM', '1:00 PM', '3:30 PM'];
    const TODAY = iso(new Date());
    const addDays = n => { const d = new Date(); d.setDate(d.getDate() + n); return iso(d); };
    const workday = n => { const d = new Date(); d.setDate(d.getDate() + n); if (d.getDay() === 0) d.setDate(d.getDate() + 1); return iso(d); };
 
    let toastTimer;
    function toast(msg) {
        const t = $('#toast'); t.textContent = msg; t.classList.add('show');
        clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
    }
 
    /* =========================================================
       Catalog (products / services / packages)
    ========================================================= */
    const CATS = ['Cameras', 'Recorders & Storage', 'Power & Cabling', 'Access Control', 'Solar & Lighting'];
    const CATALOG = [
        { id: 'cam-dome',   type: 'product', cat: 'Cameras', name: 'IP Camera (Dome)', price: 4200, icon: 'fa-video' },
        { id: 'cam-bullet', type: 'product', cat: 'Cameras', name: 'IP Camera (Bullet)', price: 4800, icon: 'fa-camera' },
        { id: 'cam-ptz',    type: 'product', cat: 'Cameras', name: 'PTZ Camera 4MP', price: 14500, icon: 'fa-video' },
        { id: 'cam-wifi',   type: 'product', cat: 'Cameras', name: 'Wi-Fi Indoor Camera', price: 2900, icon: 'fa-wifi' },
        { id: 'dvr-8',      type: 'product', cat: 'Recorders & Storage', name: '8-Channel DVR', price: 8500, icon: 'fa-hard-drive' },
        { id: 'dvr-16',     type: 'product', cat: 'Recorders & Storage', name: '16-Channel DVR', price: 12500, icon: 'fa-hard-drive' },
        { id: 'nvr-16',     type: 'product', cat: 'Recorders & Storage', name: '16-Channel NVR', price: 15800, icon: 'fa-server' },
        { id: 'hdd-1',      type: 'product', cat: 'Recorders & Storage', name: '1TB Surveillance HDD', price: 3200, icon: 'fa-database' },
        { id: 'hdd-2',      type: 'product', cat: 'Recorders & Storage', name: '2TB Surveillance HDD', price: 4600, icon: 'fa-database' },
        { id: 'pwr',        type: 'product', cat: 'Power & Cabling', name: 'Power Adapter & Connectors', price: 350, icon: 'fa-plug' },
        { id: 'cat6',       type: 'product', cat: 'Power & Cabling', name: 'Cat6 Cable (305m Box)', price: 6500, icon: 'fa-network-wired' },
        { id: 'poe',        type: 'product', cat: 'Power & Cabling', name: 'PoE Switch 8-Port', price: 5400, icon: 'fa-ethernet' },
        { id: 'ups',        type: 'product', cat: 'Power & Cabling', name: 'UPS 650VA', price: 3800, icon: 'fa-car-battery' },
        { id: 'lock',       type: 'product', cat: 'Access Control', name: 'Fingerprint Door Lock', price: 9800, icon: 'fa-fingerprint' },
        { id: 'bell',       type: 'product', cat: 'Access Control', name: 'Video Doorbell', price: 6200, icon: 'fa-bell' },
        { id: 'gate',       type: 'product', cat: 'Access Control', name: 'Gate Access Controller', price: 11500, icon: 'fa-door-closed' },
        { id: 'sol60',      type: 'product', cat: 'Solar & Lighting', name: 'Solar Streetlight 60W', price: 18500, icon: 'fa-solar-panel' },
        { id: 'solflood',   type: 'product', cat: 'Solar & Lighting', name: 'Solar Floodlight 100W', price: 7200, icon: 'fa-lightbulb' },
        { id: 'svc-install', type: 'service', name: 'Cabling & Installation', price: 6500, icon: 'fa-screwdriver-wrench', desc: 'Labor and materials for cabling and mounting' },
        { id: 'svc-survey',  type: 'service', name: 'Site Survey', price: 1500, icon: 'fa-clipboard-check', desc: 'On-site assessment and layout planning' },
        { id: 'svc-config',  type: 'service', name: 'System Configuration & Commissioning', price: 3000, icon: 'fa-sliders', desc: 'Setup, testing and customer handover' },
        { id: 'svc-maint',   type: 'service', name: 'Annual Maintenance Plan', price: 8000, icon: 'fa-shield-halved', desc: 'Two preventive visits per year' },
        { id: 'svc-reloc',   type: 'service', name: 'Camera Relocation', price: 1800, icon: 'fa-up-down-left-right', desc: 'Per camera' },
        { id: 'pkg-home4',   type: 'package', name: '4-Camera Home CCTV Package', price: 24900, icon: 'fa-box-open', desc: '4 dome cameras, 8-ch DVR, 1TB HDD, cabling & installation' },
        { id: 'pkg-biz8',    type: 'package', name: '8-Camera Business CCTV Package', price: 52000, icon: 'fa-box-open', desc: '8 bullet cameras, 16-ch NVR, 2TB HDD, PoE switch, installation' },
        { id: 'pkg-access',  type: 'package', name: '2-Door Access Control Package', price: 21500, icon: 'fa-box-open', desc: '2 fingerprint locks, controller, installation' },
        { id: 'pkg-solar3',  type: 'package', name: 'Solar Streetlight Package (3 units)', price: 62000, icon: 'fa-box-open', desc: '3 solar streetlights with poles and installation' }
    ];
    const line = (id, qty) => { const c = CATALOG.find(x => x.id === id); return { id, name: c.name, qty, price: c.price }; };
 
    /* =========================================================
       Data (seeded once, then persisted)
    ========================================================= */
    const defChecklist = () => ['Site preparation', 'Equipment mounting', 'Cabling & PoE', 'Recorder setup & configuration', 'Testing & customer handover'].map(label => ({ label, state: 'Pending' }));
    const doneChecklist = n => defChecklist().map((c, i) => ({ label: c.label, state: i < n ? 'Done' : i === n ? 'In progress' : 'Pending' }));
 
    function seed() {
        const lg = (t, d) => ({ t, d });
        return {
            counters: { receipt: 30 },
            inquiries: [
                { id: 'INQ-2026-001', name: 'Juan Dela Cruz', email: 'juan@email.com', address: 'Congressional Campus, Caloocan City', placeType: 'Residential', purchase: 'Both', siteVisit: true, pref: { date: '2026-01-20', time: '1:00 PM' }, submitted: '2026-01-12T10:12', status: 'Accepted', quoteId: 'QUO-2026-001' },
                { id: 'INQ-2026-002', name: 'Sarah Jenkins', email: 'sarah.jenkins@email.com', address: 'Ayala Ave, Makati City', placeType: 'Commercial', purchase: 'Both', siteVisit: true, pref: { date: workday(3), time: '1:00 PM' }, submitted: '2026-10-01T10:12', status: 'New Inquiry' },
                { id: 'INQ-2026-003', name: 'Amanda Lee', email: 'amanda.lee@email.com', address: 'Katipunan Ave, Quezon City', placeType: 'Commercial', purchase: 'Buying a Service', siteVisit: true, pref: { date: workday(4), time: '9:00 AM' }, submitted: '2026-09-29T11:20', status: 'Pending Visit' },
                { id: 'INQ-2026-004', name: 'Ricardo Tan', email: 'ricardo.tan@email.com', address: 'Rizal Ave, Caloocan City', placeType: 'Residential', purchase: 'Buying a Product', siteVisit: false, pref: null, submitted: '2026-09-30T09:05', status: 'Accepted' },
                { id: 'INQ-2026-005', name: 'Grace Villanueva', email: 'grace.v@email.com', address: 'Commonwealth Ave, Quezon City', placeType: 'Residential', purchase: 'Both', siteVisit: false, pref: null, submitted: '2026-10-02T08:40', status: 'New Inquiry' }
            ],
            quotes: [
                { id: 'QUO-2026-001', inqId: 'INQ-2026-001', customer: 'Juan Dela Cruz', email: 'juan@email.com', placeType: 'Residential', purchase: 'Both', date: '2026-01-12', status: 'Sent to Customer', transport: 0,
                  scope: scopeFor('Both'), items: [line('dvr-16', 1), line('cam-dome', 8), line('pwr', 8), line('svc-install', 1)], log: [lg('Approved by superadmin', 'Jan 13, 2026'), lg('Sent to superadmin', 'Jan 12, 2026'), lg('Draft created', 'Jan 12, 2026')] },
                { id: 'QUO-2026-002', inqId: null, customer: 'Marco Santos', email: 'marco@email.com', placeType: 'Residential', purchase: 'Both', date: '2026-09-18', status: 'Approved', transport: 500,
                  scope: scopeFor('Both'), items: [line('pkg-home4', 1)], log: [lg('Approved by customer. Project PRJ-001 created', 'Sep 25, 2026'), lg('Draft created', 'Sep 18, 2026')] },
                { id: 'QUO-2026-003', inqId: null, customer: 'Lara Mendoza', email: 'lara@email.com', placeType: 'Commercial', purchase: 'Both', date: '2026-09-10', status: 'Approved', transport: 800,
                  scope: scopeFor('Both'), items: [line('cam-bullet', 6), line('nvr-16', 1), line('hdd-2', 1), line('svc-install', 1), line('svc-config', 1)], log: [lg('Approved by customer. Project PRJ-002 created', 'Sep 16, 2026'), lg('Draft created', 'Sep 10, 2026')] },
                { id: 'QUO-2026-004', inqId: null, customer: 'Daniel Cruz', email: 'daniel@email.com', placeType: 'Residential', purchase: 'Buying a Product', date: '2026-09-30', status: 'Draft', transport: 0,
                  scope: scopeFor('Buying a Product'), items: [line('cam-dome', 4), line('dvr-8', 1), line('pwr', 4)], log: [lg('Draft created', 'Sep 30, 2026')] },
                { id: 'QUO-2026-005', inqId: null, customer: 'Helena Zhao', email: 'helena@email.com', placeType: 'Residential', purchase: 'Both', date: '2026-08-20', status: 'Approved', transport: 0,
                  scope: scopeFor('Both'), items: [line('sol60', 2), line('svc-install', 1)], log: [lg('Approved by customer. Project PRJ-003 created', 'Aug 25, 2026'), lg('Draft created', 'Aug 20, 2026')] }
            ],
            projects: [
                { id: 'PRJ-001', quoteId: 'QUO-2026-002', customer: 'Marco Santos', type: 'Residential', title: '4-Camera Home CCTV Package', status: 'Payment Under Review', agreement: 'half', method: 'Online', paid: 0,
                  proof: { ref: 'GC-8841-2207', amount: 14224, submitted: 'Oct 1, 3:12 PM' }, receipt: null, checklist: defChecklist() },
                { id: 'PRJ-002', quoteId: 'QUO-2026-003', customer: 'Lara Mendoza', type: 'Commercial', title: '6-Camera Business CCTV with NVR', status: 'Installation In Progress', agreement: 'half', method: 'Online', paid: 33320,
                  proof: { ref: 'GC-7710-4412', amount: 33320, submitted: 'Sep 18, 10:40 AM', verified: true }, receipt: { no: 'RC-2026-030', amount: 33320, method: 'Online', date: '2026-09-18' }, checklist: doneChecklist(3) },
                { id: 'PRJ-003', quoteId: 'QUO-2026-005', customer: 'Helena Zhao', type: 'Residential', title: 'Solar Streetlight Installation', status: 'Done', agreement: 'full', method: 'Online', paid: 48720,
                  proof: { ref: 'GC-5521-0099', amount: 48720, submitted: 'Aug 26, 1:05 PM', verified: true }, receipt: { no: 'RC-2026-029', amount: 48720, method: 'Online', date: '2026-08-26' }, checklist: doneChecklist(5) }
            ],
            bookings: [
                { id: 'b1', customer: 'Juan Dela Cruz', type: 'Site Visit', date: workday(2), time: '9:00 AM' },
                { id: 'b2', customer: 'Amanda Lee', type: 'Site Visit', date: workday(2), time: '1:00 PM' },
                { id: 'b3', customer: 'Marco Santos', type: 'Installation', date: workday(4), time: '9:00 AM' },
                { id: 'b4', customer: 'Lara Mendoza', type: 'Installation', date: workday(6), time: '9:00 AM' },
                { id: 'b5', customer: 'Helena Zhao', type: 'Site Visit', date: workday(6), time: '10:30 AM' },
                { id: 'b6', customer: 'Sarah Jenkins', type: 'Site Visit', date: workday(8), time: '3:30 PM' },
                { id: 'b7', customer: 'Daniel Cruz', type: 'Installation', date: workday(8), time: '9:00 AM' }
            ],
            requests: [
                { id: 'r1', bookingId: 'b6', reason: 'I have a work commitment that afternoon and need a later date.', newDate: workday(9), newTime: '1:00 PM', status: 'Pending', ago: '10 min ago', proposed: null },
                { id: 'r2', bookingId: 'b3', reason: 'The building admin has not released our access permit yet.', newDate: workday(7), newTime: '10:30 AM', status: 'Pending', ago: '2 hours ago', proposed: null }
            ]
        };
    }
    function scopeFor(p) {
        if (p === 'Buying a Product') return 'Scope of work: supply of CCTV and related accessories.';
        if (p === 'Buying a Service') return 'Scope of work: installation, configuration and commissioning of CCTV and related accessories.';
        return 'Scope of work: supply and installation of CCTV and related accessories, including testing and commissioning.';
    }
 
    let DB = store.get('bw_admin_db_v2', null) || seed();
    const save = () => store.set('bw_admin_db_v2', DB);
 
    /* ---------- derived helpers ---------- */
    const calc = (items, transport) => {
        const sub = round2(items.reduce((s, i) => s + i.qty * i.price, 0));
        const tr = round2(Number(transport) || 0);
        const vat = round2((sub + tr) * VAT_RATE);
        return { sub, tr, vat, total: round2(sub + tr + vat) };
    };
    const qTotal = q => calc(q.items, q.transport).total;
    const projQuote = p => DB.quotes.find(q => q.id === p.quoteId);
    const dueNow = p => { const t = qTotal(projQuote(p)); return p.agreement === 'half' ? Math.round(t * 100 / 2) / 100 : p.agreement === 'full' ? t : 0; };
    const openInquiries = () => DB.inquiries.filter(i => !i.quoteId);
    const dateStatus = (d, ex) => {
        if (d < TODAY || toDate(d).getDay() === 0) return 'off';
        const n = DB.bookings.filter(b => b.date === d && b.id !== ex).length;
        return n >= SLOTS.length ? 'off' : n >= 2 ? 'limit' : 'avail';
    };
    const slotTaken = (d, t, ex) => DB.bookings.some(b => b.date === d && b.time === t && b.id !== ex);
    const typeCls = t => t === 'Installation' ? 'install' : 'visit';
    const logEntry = (q, t) => { const d = new Date(); q.log.unshift({ t, d: MONTHS[d.getMonth()].slice(0, 3) + ' ' + d.getDate() + ', ' + d.getFullYear() }); };
    const nextQuoteId = () => 'QUO-' + new Date().getFullYear() + '-' + pad(DB.quotes.reduce((m, q) => Math.max(m, +q.id.split('-')[2]), 0) + 1, 3);
    const nextProjectId = () => 'PRJ-' + pad(DB.projects.reduce((m, p) => Math.max(m, +p.id.split('-')[1]), 0) + 1, 3);
    const QS_CLS = { 'Draft': 'draft', 'Pending Superadmin': 'pending', 'Sent to Customer': 'sent', 'Approved': 'approved', 'Declined': 'declined' };
    const qsPill = s => '<span class="qs ' + QS_CLS[s] + '">' + esc(s) + '</span>';
 
    /* =========================================================
       Panes (show one child of a tab at a time)
    ========================================================= */
    function pane(tab, id) { $$('#tab-' + tab + ' .pane').forEach(p => { p.hidden = p.id !== id; }); window.scrollTo(0, 0); }
 
    /* =========================================================
       Modal
    ========================================================= */
    let mHandler = null;
    function openModal(html, handler) { const h = $('#modalHost'); h.innerHTML = '<div class="mc">' + html + '</div>'; h.style.display = 'flex'; mHandler = handler || null; return h; }
    function closeModal() { const h = $('#modalHost'); h.style.display = 'none'; h.innerHTML = ''; mHandler = null; }
    $('#modalHost').addEventListener('click', e => {
        if (e.target.id === 'modalHost' || e.target.closest('[data-close]')) return closeModal();
        if (mHandler) mHandler(e);
    });
 
    /* =========================================================
       Calendar picker (dark in tabs, light inside modals)
    ========================================================= */
    function Picker(host, o) {
        const base = o.date ? toDate(o.date) : new Date();
        const st = { y: base.getFullYear(), m: base.getMonth(), date: o.date || '', time: o.time || '' };
        function draw() {
            const first = new Date(st.y, st.m, 1).getDay(), dim = new Date(st.y, st.m + 1, 0).getDate();
            let g = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => '<div class="cp-dow">' + d + '</div>').join('');
            for (let i = 0; i < first; i++) g += '<div></div>';
            for (let d = 1; d <= dim; d++) {
                const k = st.y + '-' + pad(st.m + 1) + '-' + pad(d), s = dateStatus(k, o.exclude);
                const dis = !o.allowAll && s === 'off';
                const has = o.dots && DB.bookings.some(b => b.date === k);
                g += '<button type="button" class="cp-d ' + s + (k === st.date ? ' sel' : '') + (has ? ' has' : '') + '" data-d="' + k + '"' + (dis ? ' disabled' : '') + '>' + d + '</button>';
            }
            let h = '<div class="cp"><div class="cp-head"><button type="button" class="cp-nav" data-n="-1" aria-label="Previous month">&lsaquo;</button><b>' + MONTHS[st.m] + ' ' + st.y + '</b><button type="button" class="cp-nav" data-n="1" aria-label="Next month">&rsaquo;</button></div>' +
                '<div class="cp-grid">' + g + '</div><div class="cp-legend"><span><i class="avail"></i>Available</span><span><i class="limit"></i>Limited Slots</span><span><i class="off"></i>Unavailable</span></div>';
            if (o.times) {
                h += '<div class="cp-label">Available Time Slots</div><div class="ts-grid">' + SLOTS.map(t => {
                    const tk = st.date && slotTaken(st.date, t, o.exclude);
                    return '<button type="button" class="ts' + (t === st.time ? ' on' : '') + (tk ? ' taken' : '') + '" data-t="' + t + '"' + (tk ? ' disabled' : '') + '>' + t + '</button>';
                }).join('') + '</div>';
            }
            host.innerHTML = h + '</div>';
        }
        host.addEventListener('click', e => {
            const n = e.target.closest('[data-n]');
            if (n) { st.m += +n.dataset.n; if (st.m < 0) { st.m = 11; st.y--; } if (st.m > 11) { st.m = 0; st.y++; } return draw(); }
            const d = e.target.closest('[data-d]');
            if (d && !d.disabled) { st.date = d.dataset.d; if (st.time && slotTaken(st.date, st.time, o.exclude)) st.time = ''; draw(); return o.onChange && o.onChange(st.date, st.time); }
            const t = e.target.closest('[data-t]');
            if (t && !t.disabled) { st.time = t.dataset.t; draw(); o.onChange && o.onChange(st.date, st.time); }
        });
        draw();
        return { get: () => ({ date: st.date, time: st.time }), refresh: draw };
    }
 
    /* =========================================================
       Routing / sidebar / dropdowns
    ========================================================= */
    const TABS = {
        dashboard:  ['Dashboard',  'Overview of inquiries, quotations, projects and schedules'],
        inquiries:  ['Inquiries',  'Review incoming inquiries and create quotations'],
        quotations: ['Quotation',  'Track every quotation from draft to customer approval'],
        projects:   ['Projects',   'Payments, installation progress and completion'],
        schedules:  ['Schedules',  'Site visits, installations and reschedule requests'],
        settings:   ['Settings',   'Customize your theme and manage your account']
    };
    function activateTab(name) {
        if (!TABS[name]) name = 'dashboard';
        $$('.tab-panel').forEach(p => p.classList.toggle('active', p.id === 'tab-' + name));
        $$('.nav-item[data-tab]').forEach(a => a.classList.toggle('active', a.dataset.tab === name));
        $('#pageTitle').textContent = TABS[name][0];
        $('#pageSubtitle').textContent = TABS[name][1];
        document.title = TABS[name][0] + ' - Beyond Wires';
        closeDropdowns();
        refreshAll();
        window.scrollTo(0, 0);
    }
    function showTab(name) { if (location.hash === '#' + name) activateTab(name); else location.hash = name; }
    window.addEventListener('hashchange', () => activateTab(location.hash.slice(1)));
    document.addEventListener('click', e => { const a = e.target.closest('a[data-tab]'); if (a) { e.preventDefault(); showTab(a.dataset.tab); } });
 
    function setSidebar(collapsed) {
        $('#app').classList.toggle('collapsed', collapsed);
        const b = $('#sidebar-toggle'), l = collapsed ? 'Expand sidebar' : 'Minimize sidebar';
        b.setAttribute('aria-label', l); b.title = l;
        b.innerHTML = '<i class="fa-solid ' + (collapsed ? 'fa-angles-right' : 'fa-angles-left') + '"></i>';
        store.set('bw_admin_sidebar', collapsed);
    }
    $('#sidebar-toggle').addEventListener('click', () => setSidebar(!$('#app').classList.contains('collapsed')));
 
    function closeDropdowns(except) { $$('.dropdown-menu.show').forEach(m => { if (m !== except) m.classList.remove('show'); }); }
    document.addEventListener('click', e => {
        const t = e.target.closest('[data-dd]');
        if (t) { const m = document.getElementById(t.dataset.dd), open = !m.classList.contains('show'); closeDropdowns(); m.classList.toggle('show', open); return; }
        if (!e.target.closest('.dropdown-menu[data-keep]')) closeDropdowns();
    });
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') { closeDropdowns(); closeModal(); }
        if ((e.key === 'Enter' || e.key === ' ') && e.target.id === 'profile-btn') { e.preventDefault(); e.target.click(); }
    });
    $('#my-profile').addEventListener('click', () => { closeDropdowns(); showTab('settings'); });
    $('#logout').addEventListener('click', () => {
        closeDropdowns();
        if (confirm('Are you sure you want to log out?')) { toast('Logging out...'); setTimeout(() => { window.location.href = LOGIN_URL; }, 500); }
    });
 
    /* ---------- notifications (derived from real data) ---------- */
    const readSet = new Set(store.get('bw_admin_read', []));
    function notifs() {
        const a = [];
        openInquiries().filter(i => i.status === 'New Inquiry').forEach(i => a.push({ id: 'inq-' + i.id, text: 'New inquiry from ' + i.name, time: fmtDate(i.submitted), go: 'inquiries' }));
        DB.requests.filter(r => r.status === 'Pending').forEach(r => { const b = DB.bookings.find(x => x.id === r.bookingId); a.push({ id: 'req-' + r.id, text: 'Reschedule request from ' + b.customer, time: r.ago, go: 'schedules' }); });
        DB.projects.filter(p => p.status === 'Payment Under Review').forEach(p => a.push({ id: 'pay-' + p.id, text: 'Payment proof from ' + p.customer + ' awaiting confirmation', time: p.proof ? p.proof.submitted : '', go: 'projects', proj: p.id }));
        DB.projects.filter(p => p.status === 'Awaiting Final Payment').forEach(p => a.push({ id: 'fin-' + p.id, text: p.customer + ': final payment due', time: '', go: 'projects', proj: p.id }));
        return a;
    }
    function renderNotifs() {
        const list = notifs();
        $('#notif-list').innerHTML = list.map((n, i) => '<div class="notif-item' + (readSet.has(n.id) ? '' : ' unread') + '" data-i="' + i + '" style="cursor:pointer">' + esc(n.text) + '<span>' + esc(n.time) + '</span></div>').join('') || '<div class="notif-item">No notifications</div>';
        $('#notif-dot').style.display = list.some(n => !readSet.has(n.id)) ? '' : 'none';
    }
    $('#notif-list').addEventListener('click', e => {
        const it = e.target.closest('.notif-item[data-i]'); if (!it) return;
        const n = notifs()[+it.dataset.i]; readSet.add(n.id); store.set('bw_admin_read', [...readSet]);
        closeDropdowns(); showTab(n.go); if (n.proj) openProject(n.proj); else renderNotifs();
    });
    $('#mark-read').addEventListener('click', () => { notifs().forEach(n => readSet.add(n.id)); store.set('bw_admin_read', [...readSet]); renderNotifs(); toast('All notifications marked as read'); });
 

 
    /* =========================================================
       Dashboard
    ========================================================= */
    function renderDashboard() {
        const inq = openInquiries(), fresh = inq.filter(i => i.status === 'New Inquiry');
        const oldest = fresh.slice().sort((a, b) => a.submitted.localeCompare(b.submitted))[0];
        const drafts = DB.quotes.filter(q => q.status === 'Draft').length, pend = DB.quotes.filter(q => q.status === 'Pending Superadmin').length, sentC = DB.quotes.filter(q => q.status === 'Sent to Customer').length;
        const active = DB.projects.filter(p => p.status !== 'Done');
        const payN = active.filter(p => /Payment/.test(p.status)).length, instN = active.filter(p => p.status === 'Installation In Progress').length;
        const up = DB.bookings.filter(b => b.date >= TODAY).sort((a, b) => (a.date + SLOTS.indexOf(a.time)).localeCompare(b.date + SLOTS.indexOf(b.time)));
        const cards = [
            { go: 'inquiries', ico: 'fa-inbox', c: 'blue', label: 'PENDING INQUIRIES', val: fresh.length, meta: ['<b>' + fresh.filter(i => i.siteVisit).length + '</b> requesting a site visit', oldest ? 'Oldest: <b>' + fmtDate(oldest.submitted) + '</b>' : 'All caught up'], foot: 'Review inquiries' },
            { go: 'quotations', ico: 'fa-file-invoice-dollar', c: 'violet', label: 'PENDING QUOTATIONS', val: drafts + pend, meta: ['<b>' + drafts + '</b> drafts \u00B7 <b>' + pend + '</b> awaiting superadmin', '<b>' + sentC + '</b> waiting on customer'], foot: 'Open quotations' },
            { go: 'projects', ico: 'fa-folder-open', c: 'green', label: 'ACTIVE PROJECTS', val: active.length, meta: ['<b>' + payN + '</b> in payment stage', '<b>' + instN + '</b> installing now'], foot: 'View projects' },
            { go: 'schedules', ico: 'fa-regular fa-calendar', c: 'amber', label: 'UPCOMING SCHEDULES', val: up.length, meta: [up[0] ? 'Next: <b>' + fmtDate(up[0].date) + ' \u00B7 ' + up[0].time + '</b>' : 'Nothing scheduled', '<b>' + DB.requests.filter(r => r.status === 'Pending').length + '</b> reschedule request(s)'], foot: 'Open calendar' }
        ];
        $('#dashStats').innerHTML = cards.map(c => '<div class="stat-card v2" data-go="' + c.go + '"><div class="stat-top"><span class="stat-label">' + c.label + '</span><span class="stat-ico ' + c.c + '"><i class="' + (c.ico.indexOf('regular') > -1 ? c.ico : 'fa-solid ' + c.ico) + '"></i></span></div>' +
            '<span class="stat-value">' + pad(c.val) + '</span><div class="stat-meta">' + c.meta.map(m => '<span>' + m + '</span>').join('') + '</div><div class="stat-foot"><span>' + c.foot + '</span><i class="fa-solid fa-arrow-right"></i></div></div>').join('');
        $('#dashPipeline').innerHTML = [['INQUIRIES', inq.length, 'inquiries'], ['QUOTATIONS', DB.quotes.length, 'quotations'], ['PROJECTS', DB.projects.length, 'projects'], ['COMPLETED', DB.projects.filter(p => p.status === 'Done').length, 'projects']]
            .map((s, i) => (i ? '<i class="fa-solid fa-chevron-right pipe-arrow"></i>' : '') + '<div class="pipe-step" data-go="' + s[2] + '"><small>' + s[0] + '</small><b>' + s[1] + '</b></div>').join('');
 
        const latest = inq.slice().sort((a, b) => b.submitted.localeCompare(a.submitted)).slice(0, 4);
        $('#dash-inquiries').innerHTML = latest.map(i => '<div class="list-item" data-go="inquiries"><div class="item-left"><div class="mini-av" style="background:' + avColor(i.name) + '">' + ini(i.name) + '</div><div class="item-details"><span class="item-title">' + esc(i.name.toUpperCase()) + '</span><span class="item-desc">' + esc(i.placeType) + ' \u00B7 ' + esc(i.purchase) + '</span></div></div>' + statusBadge(i.status) + '</div>').join('') || '<div class="empty-note">No open inquiries</div>';
        $('#dash-schedule').innerHTML = up.slice(0, 5).map(b => { const d = toDate(b.date); return '<div class="list-item" data-go="schedules" data-date="' + b.date + '"><div class="item-left"><div class="date-chip"><small>' + MONTHS[d.getMonth()].slice(0, 3) + '</small><b>' + d.getDate() + '</b></div><div class="item-details"><span class="item-title">' + esc(b.customer.toUpperCase()) + '</span><span class="item-desc">' + b.time + ' \u00B7 ' + DAYS[d.getDay()] + '</span></div></div><span class="type-pill ' + typeCls(b.type) + '">' + b.type.toUpperCase() + '</span></div>'; }).join('') || '<div class="empty-note">No upcoming schedules</div>';
    }
    document.addEventListener('click', e => {
        const el = e.target.closest('#tab-dashboard [data-go]'); if (!el) return;
        if (el.dataset.date) schedDate = el.dataset.date;
        showTab(el.dataset.go);
    });
 
    /* =========================================================
       Inquiries
    ========================================================= */
    const statusBadge = s => '<span class="status-badge ' + ({ 'New Inquiry': 'new', 'Accepted': 'accepted', 'Pending Visit': 'pending' }[s] || 'new') + '"><span class="dot"></span> ' + esc(s) + '</span>';
 
    function renderInquiries() {
        const q = $('#inqSearch').value.trim().toLowerCase(), st = $('#statusFilter').value;
        const rows = openInquiries().filter(i => (st === 'all' || i.status === st) &&
            (!q || [i.name, i.id, i.placeType, i.purchase, i.email].some(v => String(v || '').toLowerCase().includes(q))))
            .sort((a, b) => b.submitted.localeCompare(a.submitted));
        $('#inqTable').innerHTML = '<table><thead><tr><th>CUSTOMER NAME</th><th>DATE SUBMITTED</th><th>PROPERTY TYPE</th><th>SITE VISIT</th><th>STATUS</th><th class="text-right">ACTIONS</th></tr></thead><tbody>' +
            (rows.map(i => '<tr data-id="' + i.id + '"><td><div class="customer-info"><div class="avatar" style="background:' + avColor(i.name) + '">' + ini(i.name) + '</div><div><span>' + esc(i.name) + '</span><small class="cust-sub">' + i.id + '</small></div></div></td>' +
                '<td class="date-col">' + fmtDate(i.submitted) + ', ' + fmtTime(i.submitted) + '</td><td><span class="badge blue">' + esc(i.placeType || '\u2014') + '</span></td>' +
                '<td><div class="visit-info"><span class="pill ' + (i.siteVisit ? 'yes' : 'no') + '"><span class="dot"></span> ' + (i.siteVisit ? 'YES' : 'NO') + '</span>' + (i.siteVisit && i.pref ? '<span class="pref-time">Pref: ' + fmtDate(i.pref.date) + ', ' + i.pref.time + '</span>' : '') + '</div></td>' +
                '<td>' + statusBadge(i.status) + '</td><td class="actions-col">' +
                (i.status === 'Accepted' ? '<button class="btn-quotation" data-a="quote">Create Quotation</button>' : '<button class="btn-accept" data-a="accept">Accept</button>') +
                '<button class="btn-details" data-a="details">Details</button></td></tr>').join('') || '<tr><td colspan="6" class="empty-row">No inquiries match your search.</td></tr>') + '</tbody></table>';
    }
    $('#inqSearch').addEventListener('input', renderInquiries);
    $('#statusFilter').addEventListener('change', renderInquiries);
    $('#inqTable').addEventListener('click', e => {
        const b = e.target.closest('button[data-a]'); if (!b) return;
        const i = DB.inquiries.find(x => x.id === b.closest('tr').dataset.id);
        if (b.dataset.a === 'details') return openInquiry(i);
        if (b.dataset.a === 'accept') { i.status = 'Accepted'; save(); toast('Inquiry from ' + i.name + ' accepted'); return refreshAll(); }
        if (b.dataset.a === 'quote') startQuoteFromInquiry(i);
    });
    function openInquiry(i) {
        const f = (l, v, full) => '<div' + (full ? ' class="mc-full"' : '') + '><label>' + l + '</label><b>' + esc(v || '\u2014') + '</b></div>';
        openModal('<button class="mc-x" data-close aria-label="Close">&times;</button><h2>Inquiry Details</h2><p class="mc-sub">' + i.id + ' \u2022 ' + fmtDate(i.submitted) + '</p><div class="mc-grid">' +
            f('NAME', i.name) + f('EMAIL', i.email) + f('ADDRESS', i.address) + f('TYPE OF PLACE', i.placeType) + f('CUSTOMER PURCHASE OPTION', i.purchase) + f('SITE VISIT', i.siteVisit ? 'Yes' : 'No') +
            f('PREFERRED DATE & TIME', i.pref ? fmtDate(i.pref.date) + ' \u2022 ' + i.pref.time : '') + '</div>');
    }
 
    /* =========================================================
       Quotation document (3+ page A4 template) + PDF
    ========================================================= */
    function quoteDocHTML(q) {
        const t = calc(q.items, q.transport), PER = 13, chunks = [];
        for (let i = 0; i < q.items.length; i += PER) chunks.push(q.items.slice(i, i + PER));
        if (!chunks.length) chunks.push([]);
        const total = chunks.length + 2; let n = 0;
        const foot = () => '<div class="qd-foot">Page ' + (++n) + ' of ' + total + '</div>';
        let h = '<div class="qd-page"><div class="qd-brand">BEYONDWIRES</div><h1>Quotation ' + esc(q.id) + '</h1>' +
            '<div class="qd-row"><span>Date</span><b>' + fmtDate(q.date) + '</b></div><div class="qd-row"><span>Prepared for</span><b>' + esc(q.customer) + '</b></div>' +
            '<p class="qd-scope">' + esc(q.scope) + '</p>' + foot() + '</div>';
        chunks.forEach((c, ci) => {
            h += '<div class="qd-page"><h2>List of Accessories' + (ci ? ' (cont.)' : '') + '</h2>' +
                (c.map(i => '<div class="qd-line"><span>' + esc(i.name) + ' x ' + i.qty + '</span><b>' + peso(i.qty * i.price) + '</b></div>').join('') || '<p class="qd-scope">No items added yet.</p>') + foot() + '</div>';
        });
        h += '<div class="qd-page"><h2>Cost Summary</h2><div class="qd-line"><span>Subtotal</span><b>' + peso(t.sub) + '</b></div>' +
            '<div class="qd-line"><span>Other expenses (transport)</span><b>' + peso(t.tr) + '</b></div><div class="qd-line"><span>VAT (' + Math.round(VAT_RATE * 100) + '%)</span><b>' + peso(t.vat) + '</b></div>' +
            '<div class="qd-line total"><span>Total Cost</span><b>' + peso(t.total) + '</b></div>' +
            '<div class="qd-terms"><h3>Terms</h3>This quotation is valid for 30 days from the date issued.<br>Payment options: Half Payment, Full Payment, or Full Payment After Installation (residential customers only).<br>Final scope and schedule are confirmed after approval.</div>' +
            '<div class="qd-sign"><span>Prepared by (BeyondWires)</span><span>Customer acceptance</span></div>' + foot() + '</div>';
        return h;
    }
    function downloadPDF(q) {
        const wrap = document.createElement('div');
        wrap.className = 'qd-pdf'; wrap.innerHTML = quoteDocHTML(q);
        if (window.html2pdf) {
            wrap.style.cssText = 'position:fixed;left:-10000px;top:0';
            document.body.appendChild(wrap);
            toast('Preparing PDF...');
            html2pdf().set({ margin: 0, filename: q.id + '.pdf', image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'px', format: [794, 1123], hotfixes: ['px_scaling'] }, pagebreak: { mode: ['css'], after: '.qd-page' } })
                .from(wrap).save().then(() => wrap.remove()).catch(() => { wrap.remove(); toast('Could not create the PDF'); });
        } else printHTML(wrap.innerHTML);   // fallback: browser "Save as PDF"
    }
    function printHTML(html) {
        const host = document.createElement('div'); host.id = 'printHost'; host.innerHTML = html;
        document.body.appendChild(host); document.body.classList.add('print-doc');
        window.print();
        setTimeout(() => { host.remove(); document.body.classList.remove('print-doc'); }, 500);
    }
 
    /* =========================================================
       Quotation builder (shared by Inquiries + Quotation tabs)
    ========================================================= */
    let B = null;
    function startQuoteFromInquiry(i) {
        const q = { id: nextQuoteId(), inqId: i.id, customer: i.name, email: i.email, placeType: i.placeType, purchase: i.purchase, date: TODAY, status: 'Draft', transport: 0, scope: scopeFor(i.purchase), items: [], log: [] };
        openBuilder(q, 'inq', true);
    }
    function openBuilder(q, origin, isNew) {
        const host = origin === 'inq' ? $('#inqBuilder') : $('#qBuilder');
        B = { q: JSON.parse(JSON.stringify(q)), origin, host, isNew, type: 'all', cat: 'All', search: '', step: 'build' };
        if (origin === 'inq') pane('inquiries', 'inqBuilder'); else pane('quotations', 'qBuilder');
        renderBuilder();
    }
    function builderBar() {
        const q = B.q;
        return '<div class="section-card b-bar"><button class="btn-outline" data-b="cancel"><i class="fa-solid fa-arrow-left"></i> ' + (B.origin === 'inq' ? 'Back to Inquiries' : 'Back to Quotations') + '</button>' +
            '<div class="b-cust"><div class="avatar" style="background:' + avColor(q.customer) + '">' + ini(q.customer) + '</div><div><small>CUSTOMER</small><b>' + esc(q.customer) + '</b></div></div>' +
            '<div><small>INQUIRY</small><b>' + esc(q.inqId || '\u2014') + '</b></div><div><small>QUOTATION NO.</small><b>' + esc(q.id) + '</b></div></div>';
    }
    function renderBuilder() {
        const q = B.q;
        if (B.step === 'build') {
            B.host.innerHTML = builderBar() + '<div class="b-layout"><div class="b-left"><div class="b-tools"><div class="search-box"><i class="fa-solid fa-magnifying-glass"></i><input type="search" id="bSearch" placeholder="Search products, services or packages..." value="' + esc(B.search) + '"></div>' +
                '<div class="seg" id="bType">' + [['all', 'All'], ['product', 'Products'], ['service', 'Services'], ['package', 'Packages']].map(s => '<button type="button" data-b="type" data-v="' + s[0] + '">' + s[1] + '</button>').join('') + '</div></div>' +
                '<div class="cat-nav" id="bCats"></div><div class="b-grid" id="bGrid"></div></div>' +
                '<div class="b-right section-card"><span class="card-label-top">QUOTATION ITEMS</span><div id="bCart"></div>' +
                '<div class="form-group" style="margin-top:14px"><label>OTHER EXPENSES (TRANSPORT)</label><input type="number" id="bTransport" min="0" step="1" value="' + (q.transport || 0) + '"></div><div class="b-totals" id="bTotals"></div>' +
                '<button class="btn-primary full-width" data-b="preview">Preview Quotation</button></div></div>';
            renderTypeNav(); renderCats(); renderGrid(); renderCart();
        } else {
            B.host.innerHTML = builderBar() + '<div class="b-layout"><div class="qd-wrap"><div class="qd-scale">' + quoteDocHTML(q) + '</div></div>' +
                '<div class="b-right section-card"><span class="card-label-top">EDIT QUOTATION</span><label class="card-label-top" style="margin-bottom:6px">SCOPE OF WORK</label>' +
                '<textarea data-pf="scope">' + esc(q.scope) + '</textarea><label class="card-label-top">LINE ITEMS</label>' +
                q.items.map(i => '<div class="b-edit" data-id="' + i.id + '"><b>' + esc(i.name) + '</b><div class="two"><input type="number" min="1" step="1" data-pf="qty" value="' + i.qty + '" aria-label="Quantity"><input type="number" min="0" step="0.01" data-pf="price" value="' + i.price + '" aria-label="Unit price"></div></div>').join('') +
                '<div class="form-group" style="margin-top:12px"><label>OTHER EXPENSES (TRANSPORT)</label><input type="number" min="0" data-pf="transport" value="' + (q.transport || 0) + '"></div><div class="b-totals" id="pTotals"></div>' +
                '<button class="btn-primary full-width" data-b="pdf"><i class="fa-solid fa-file-pdf"></i> Download PDF</button>' +
                '<button class="btn-primary full-width" data-b="save">' + (B.isNew ? 'Save Draft' : 'Save Changes') + '</button>' +
                (q.status === 'Draft' ? '<button class="btn-primary full-width" data-b="send">Send to Superadmin</button>' : '') +
                '<button class="btn-outline full-width" data-b="edit">Back to Builder</button></div></div>';
            renderTotals('#pTotals');
        }
    }
    function renderTypeNav() { $$('#bType button').forEach(b => b.classList.toggle('on', b.dataset.v === B.type)); }
    function renderCats() {
        const el = $('#bCats'); if (!el) return;
        el.style.display = B.type === 'product' ? '' : 'none';
        el.innerHTML = ['All'].concat(CATS).map(c => '<button type="button" data-b="cat" data-v="' + c + '" class="' + (B.cat === c ? 'on' : '') + '">' + (c === 'All' ? 'All Products' : c) + '</button>').join('');
    }
    function renderGrid() {
        const s = B.search.trim().toLowerCase();
        const items = CATALOG.filter(c => (B.type === 'all' || c.type === B.type) && (B.type !== 'product' || B.cat === 'All' || c.cat === B.cat) &&
            (!s || (c.name + ' ' + (c.cat || '') + ' ' + (c.desc || '')).toLowerCase().includes(s)));
        $('#bGrid').innerHTML = items.map(c => {
            const it = B.q.items.find(i => i.id === c.id);
            return '<div class="b-card' + (it ? ' in' : '') + '"><div class="ic"><i class="fa-solid ' + c.icon + '"></i></div><h3>' + esc(c.name) + '</h3><small>' + esc(c.desc || c.cat) + '</small>' +
                '<div class="row"><b>' + peso(c.price) + '</b><div class="stepper"><button type="button" data-b="dec" data-id="' + c.id + '" aria-label="Decrease">&minus;</button><span>' + (it ? it.qty : 0) + '</span><button type="button" data-b="inc" data-id="' + c.id + '" aria-label="Increase">+</button></div></div></div>';
        }).join('') || '<div class="empty-note" style="grid-column:1/-1">Nothing matches your search.</div>';
    }
    function renderCart() {
        $('#bCart').innerHTML = B.q.items.map(i => '<div class="b-ci"><div>' + esc(i.name) + '<small>' + i.qty + ' \u00D7 ' + peso(i.price) + '</small></div><div style="display:flex;align-items:center;gap:10px"><b>' + peso(i.qty * i.price) + '</b><button type="button" class="rm" data-b="rm" data-id="' + i.id + '" aria-label="Remove">&times;</button></div></div>').join('') || '<p class="empty-note">No items yet. Add products, services or packages.</p>';
        renderTotals('#bTotals');
    }
    function renderTotals(sel) {
        const t = calc(B.q.items, B.q.transport);
        $(sel).innerHTML = '<div><span>Subtotal</span><span>' + peso(t.sub) + '</span></div><div><span>Other expenses (transport)</span><span>' + peso(t.tr) + '</span></div><div><span>VAT (' + Math.round(VAT_RATE * 100) + '%)</span><span>' + peso(t.vat) + '</span></div><div class="g"><span>Total Cost</span><b>' + peso(t.total) + '</b></div>';
    }
    function setQty(id, qty) {
        const c = CATALOG.find(x => x.id === id);
        if (qty <= 0) B.q.items = B.q.items.filter(i => i.id !== id);
        else { const it = B.q.items.find(i => i.id === id); if (it) it.qty = qty; else B.q.items.push({ id, name: c.name, qty, price: c.price }); }
        renderGrid(); renderCart();
    }
    function commitQuote(status) {
        if (!B.q.items.length) return toast('Add at least one item first');
        const q = B.q, wasNew = B.isNew;
        if (wasNew) logEntry(q, 'Draft created');
        if (status && status !== q.status) { q.status = status; logEntry(q, 'Sent to superadmin'); }
        else if (!wasNew) logEntry(q, 'Quotation edited');
        const idx = DB.quotes.findIndex(x => x.id === q.id);
        if (idx >= 0) DB.quotes[idx] = q; else DB.quotes.unshift(q);
        if (q.inqId) { const inq = DB.inquiries.find(i => i.id === q.inqId); if (inq) inq.quoteId = q.id; }
        save(); B = null;
        $('#qStatusFilter').value = 'all'; $('#qSearch').value = '';
        pane('inquiries', 'inqList'); pane('quotations', 'qList');
        toast(q.id + (q.status === 'Draft' ? ' saved as draft' : ' sent to superadmin') + '. Find it under Quotation.');
        showTab('quotations');
    }
    function leaveBuilder() {
        const origin = B.origin; B = null;
        if (origin === 'inq') pane('inquiries', 'inqList'); else pane('quotations', 'qList');
    }
    document.addEventListener('click', e => {
        const b = e.target.closest('[data-b]'); if (!b || !B) return;
        switch (b.dataset.b) {
            case 'cancel': if (!B.q.items.length || confirm('Leave without saving this quotation?')) leaveBuilder(); break;
            case 'type': B.type = b.dataset.v; B.cat = 'All'; renderTypeNav(); renderCats(); renderGrid(); break;
            case 'cat': B.cat = b.dataset.v; renderCats(); renderGrid(); break;
            case 'inc': case 'dec': { const it = B.q.items.find(i => i.id === b.dataset.id); setQty(b.dataset.id, (it ? it.qty : 0) + (b.dataset.b === 'inc' ? 1 : -1)); break; }
            case 'rm': setQty(b.dataset.id, 0); break;
            case 'preview': if (!B.q.items.length) return toast('Add at least one item first'); B.step = 'preview'; renderBuilder(); window.scrollTo(0, 0); break;
            case 'edit': B.step = 'build'; renderBuilder(); break;
            case 'pdf': downloadPDF(B.q); break;
            case 'save': commitQuote(null); break;
            case 'send': commitQuote('Pending Superadmin'); break;
        }
    });
    document.addEventListener('input', e => {
        if (!B) return;
        const t = e.target;
        if (t.id === 'bSearch') { B.search = t.value; return renderGrid(); }
        if (t.id === 'bTransport') { B.q.transport = Math.max(0, +t.value || 0); return renderTotals('#bTotals'); }
        if (!t.dataset.pf) return;
        const f = t.dataset.pf;
        if (f === 'scope') B.q.scope = t.value;
        else if (f === 'transport') B.q.transport = Math.max(0, +t.value || 0);
        else { const it = B.q.items.find(i => i.id === t.closest('.b-edit').dataset.id); if (f === 'qty') it.qty = Math.max(1, Math.floor(+t.value) || 1); else it.price = Math.max(0, +t.value || 0); }
        $('.qd-scale', B.host).innerHTML = quoteDocHTML(B.q); renderTotals('#pTotals');
    });
 
    /* =========================================================
       Quotation tab (list, view, edit)
    ========================================================= */
    function renderQuoteList() {
        const s = $('#qSearch').value.trim().toLowerCase(), st = $('#qStatusFilter').value;
        const rows = DB.quotes.filter(q => (st === 'all' || q.status === st) && (!s || (q.id + ' ' + q.customer).toLowerCase().includes(s)));
        $('#qTable').innerHTML = '<table><thead><tr><th>QUOTATION</th><th>CUSTOMER</th><th>DATE</th><th>TOTAL</th><th>STATUS</th><th class="text-right">ACTIONS</th></tr></thead><tbody>' +
            (rows.map(q => {
                const editable = q.status === 'Draft' || q.status === 'Pending Superadmin';
                return '<tr data-id="' + q.id + '"><td><b>' + q.id + '</b><small class="cust-sub">' + q.items.length + ' item(s)</small></td><td>' + esc(q.customer) + '</td><td class="date-col">' + fmtDate(q.date) + '</td><td><b>' + peso(qTotal(q)) + '</b></td><td>' + qsPill(q.status) + '</td>' +
                    '<td class="actions-col"><button class="btn-details" data-a="view" style="margin-right:6px">View</button><button class="btn-accept" data-a="edit" style="margin-right:0"' + (editable ? '' : ' disabled title="Only drafts and quotations awaiting superadmin can be edited"') + '>Edit</button></td></tr>';
            }).join('') || '<tr><td colspan="6" class="empty-row">No quotations found.</td></tr>') + '</tbody></table>';
    }
    $('#qSearch').addEventListener('input', renderQuoteList);
    $('#qStatusFilter').addEventListener('change', renderQuoteList);
    $('#qTable').addEventListener('click', e => {
        const b = e.target.closest('button[data-a]'); if (!b || b.disabled) return;
        const q = DB.quotes.find(x => x.id === b.closest('tr').dataset.id);
        if (b.dataset.a === 'view') openQuoteView(q.id); else openBuilder(q, 'quote', false);
    });
 
    let viewQ = null;
    function openQuoteView(id) {
        const q = DB.quotes.find(x => x.id === id); if (!q) return; viewQ = id;
        const t = calc(q.items, q.transport);
        const acts = [];
        if (q.status === 'Draft' || q.status === 'Pending Superadmin') acts.push('<button class="btn-outline full-width" data-q="edit"><i class="fa-solid fa-pen"></i> Edit Quotation</button>');
        if (q.status === 'Draft') acts.push('<button class="btn-primary full-width" data-q="send">Send to Superadmin</button>');
        if (q.status === 'Pending Superadmin') acts.push('<button class="btn-primary full-width" data-q="sa">Superadmin approved: send to customer</button>');
        if (q.status === 'Sent to Customer') acts.push('<button class="btn-primary full-width" data-q="cust">Customer approved: create project</button>');
        if (q.status === 'Pending Superadmin' || q.status === 'Sent to Customer') acts.push('<button class="btn-outline full-width" data-q="decline">Mark as declined</button>');
        if (q.status === 'Draft') acts.push('<button class="btn-outline full-width" data-q="delete" style="color:#f87171">Delete draft</button>');
        $('#qDetail').innerHTML = '<button class="btn-outline back-btn" data-q="back"><i class="fa-solid fa-arrow-left"></i> Back to Quotations</button><div class="b-layout"><div class="qd-wrap"><div class="qd-scale">' + quoteDocHTML(q) + '</div></div><div>' +
            '<div class="section-card"><span class="card-label-top">QUOTATION</span><h3 style="font-size:18px;margin-bottom:10px">' + q.id + '</h3>' + qsPill(q.status) +
            '<div class="sched-detail-row" style="margin-top:14px"><span>Customer</span><strong>' + esc(q.customer) + '</strong></div><div class="sched-detail-row"><span>Date</span><strong>' + fmtDate(q.date) + '</strong></div><div class="sched-detail-row"><span>Total</span><strong class="blue-text">' + peso(t.total) + '</strong></div></div>' +
            '<div class="section-card b-right"><span class="card-label-top">ACTIONS</span><button class="btn-primary full-width" data-q="pdf"><i class="fa-solid fa-file-pdf"></i> Download PDF</button>' + acts.join('') + '</div>' +
            '<div class="section-card"><span class="card-label-top">ACTIVITY</span>' + q.log.map(l => '<div class="b-ci"><div>' + esc(l.t) + '<small>' + esc(l.d) + '</small></div></div>').join('') + '</div></div></div>';
        pane('quotations', 'qDetail');
    }
    function createProject(q) {
        if (DB.projects.some(p => p.quoteId === q.id)) return null;
        const p = { id: nextProjectId(), quoteId: q.id, customer: q.customer, type: q.placeType || 'Residential', title: q.items[0] ? q.items[0].name + (q.items.length > 1 ? ' + ' + (q.items.length - 1) + ' more' : '') : 'New project', status: 'Awaiting Payment', agreement: 'half', method: 'Online', paid: 0, proof: null, receipt: null, checklist: defChecklist() };
        DB.projects.unshift(p); return p;
    }
    $('#qDetail').addEventListener('click', e => {
        const b = e.target.closest('[data-q]'); if (!b) return;
        const q = DB.quotes.find(x => x.id === viewQ);
        switch (b.dataset.q) {
            case 'back': pane('quotations', 'qList'); break;
            case 'pdf': downloadPDF(q); break;
            case 'edit': openBuilder(q, 'quote', false); break;
            case 'send': q.status = 'Pending Superadmin'; logEntry(q, 'Sent to superadmin'); save(); toast(q.id + ' sent to superadmin'); refreshAll(); openQuoteView(q.id); break;
            /* the next two stand in for events your backend will send (superadmin / customer replies) */
            case 'sa': q.status = 'Sent to Customer'; logEntry(q, 'Approved by superadmin. Sent to customer'); save(); toast(q.id + ' sent to customer'); refreshAll(); openQuoteView(q.id); break;
            case 'cust': { q.status = 'Approved'; const p = createProject(q); logEntry(q, 'Approved by customer' + (p ? '. Project ' + p.id + ' created' : '')); save(); toast('Customer approved ' + q.id + (p ? '. Project ' + p.id + ' created' : '')); refreshAll(); openQuoteView(q.id); break; }
            case 'decline': q.status = 'Declined'; logEntry(q, 'Quotation declined'); save(); toast(q.id + ' marked as declined'); refreshAll(); openQuoteView(q.id); break;
            case 'delete': if (confirm('Delete ' + q.id + '? This cannot be undone.')) { DB.quotes = DB.quotes.filter(x => x.id !== q.id); const inq = DB.inquiries.find(i => i.quoteId === q.id); if (inq) delete inq.quoteId; save(); toast(q.id + ' deleted'); refreshAll(); pane('quotations', 'qList'); } break;
        }
    });
 
    /* =========================================================
       Projects
    ========================================================= */
    const PSTAT = { 'Awaiting Payment': 'yellow-pill', 'Payment Under Review': 'yellow-pill', 'Installation In Progress': 'blue-pill', 'Awaiting Final Payment': 'green-pill', 'Done': 'gray-pill' };
    let curProj = null, projView = 'payment';
 
    function renderProjects() {
        const s = $('#projSearch').value.trim().toLowerCase(), ty = $('#projType').value, st = $('#projStatus').value;
        const rows = DB.projects.filter(p => (ty === 'all' || p.type === ty) && (st === 'all' || p.status === st) && (!s || (p.customer + ' ' + p.title + ' ' + p.id).toLowerCase().includes(s)));
        $('#projItems').innerHTML = rows.map(p => '<div class="project-item-card' + (p.status === 'Done' ? ' done-card' : '') + '" data-id="' + p.id + '"><div class="proj-info"><h3>' + esc(p.customer) + '</h3><p>' + esc(p.title) + '</p>' +
            '<span class="proj-next' + (p.status === 'Done' ? ' muted' : '') + '">' + p.id + ' \u00B7 ' + esc(p.type) + ' \u00B7 Total ' + peso(qTotal(projQuote(p))) + '</span></div>' +
            '<div class="proj-status-side"><span class="status-pill ' + PSTAT[p.status] + '">' + p.status.toUpperCase() + '</span><span class="arrow-icon"><i class="fa-solid fa-chevron-right"></i></span></div></div>').join('') || '<p class="empty-note">No projects match these filters.</p>';
    }
    ['#projSearch', '#projType', '#projStatus'].forEach(s => $(s).addEventListener(s === '#projSearch' ? 'input' : 'change', renderProjects));
    $('#projItems').addEventListener('click', e => { const c = e.target.closest('.project-item-card'); if (c) openProject(c.dataset.id); });
 
    function openProject(id) {
        const p = DB.projects.find(x => x.id === id); if (!p) return;
        curProj = id;
        projView = /Payment (Under Review)|Awaiting Payment/.test(p.status) ? 'payment' : 'tracker';
        pane('projects', 'projDetail'); renderProjView();
    }
    function renderProjView() {
        const p = DB.projects.find(x => x.id === curProj);
        $('#projDetail').innerHTML = '<button class="btn-outline back-btn" data-pj="back"><i class="fa-solid fa-arrow-left"></i> Back to Projects</button>' +
            (projView === 'payment' ? viewPayment(p) : projView === 'receipt' ? viewReceipt(p) : viewTracker(p));
    }
    const rcNo = () => 'RC-2026-' + pad(DB.counters.receipt + 1, 3);
 
    function viewPayment(p) {
        const q = projQuote(p), t = qTotal(q), due = dueNow(p), pr = p.proof, locked = !!pr;
        const mismatch = pr && Math.abs(pr.amount - due) > 0.009;
        const note = p.agreement === 'half' ? 'Half Payment \u00B7 50% of ' + peso(t) : p.agreement === 'full' ? 'Full Payment \u00B7 100% of ' + peso(t) : 'Full Payment After Installation \u00B7 ' + peso(t) + ' due on completion';
        let proofCard;
        if (p.agreement === 'after') proofCard = '<p class="next-step-desc" style="margin-bottom:12px">No payment is due now. The full amount is collected after installation.</p><button class="btn-primary" data-pj="start">Start Installation</button>';
        else if (pr) proofCard = '<div class="proof-content"><div class="proof-image-box"><span>TRANSACTION<br>SCREENSHOT<br><small>payment_proof.png</small></span></div><div class="proof-details">' +
            '<div class="proof-row"><span>Reference No.</span><strong>' + esc(pr.ref) + '</strong></div><div class="proof-row"><span>Amount on proof</span><strong>' + peso(pr.amount) + '</strong></div><div class="proof-row"><span>Submitted</span><strong>' + esc(pr.submitted) + '</strong></div>' +
            '<div class="proof-row"><span>Verification</span><span class="status-warning"><span class="dot yellow"></span> ' + (mismatch ? 'Amount differs from amount due' : 'Awaiting confirmation') + '</span></div>' +
            '<div class="proof-actions"><button class="btn-primary" data-pj="confirm">Confirm Payment</button><button class="btn-secondary" data-pj="reupload">Request Re-upload</button></div></div></div>';
        else if (p.method === 'Online') proofCard = '<p class="next-step-desc">Waiting for the customer to upload a payment screenshot and reference number. You will be notified when it arrives.</p>';
        else proofCard = '<p class="next-step-desc" style="margin-bottom:10px">Over the counter: record the cash received. Your confirmation acts as the proof.</p><div class="form-group"><label>AMOUNT RECEIVED</label><input type="number" id="cashAmt" value="' + due + '"></div><button class="btn-primary" data-pj="cash">Record Cash Payment</button>';
        return '<div class="payment-grid"><div class="payment-col-left"><div class="section-card"><span class="card-label-top">AMOUNT DUE \u00B7 ' + esc(p.customer.toUpperCase()) + '</span><div class="amount-display"><h2>' + peso(due) + '</h2><p>' + note + '</p></div>' +
            '<div class="payment-agreement-section"><span class="sub-label">PAYMENT AGREEMENT</span><div class="agreement-tabs">' + [['half', 'HALF PAYMENT'], ['full', 'FULL PAYMENT'], ['after', 'FULL AFTER INSTALLATION']].map(a => '<button class="tab-btn' + (p.agreement === a[0] ? ' active' : '') + '" data-pj="agree" data-v="' + a[0] + '"' + (locked ? ' disabled style="opacity:.6;cursor:not-allowed"' : '') + '>' + a[1] + '</button>').join('') + '</div>' +
            '<p class="agreement-note">' + (locked ? 'Locked: a payment proof has already been submitted.' : 'Full Payment After Installation is available for residential customers only.') + '</p></div>' +
            '<div class="financial-breakdown"><div class="breakdown-row"><span>Quotation total</span><span>' + peso(t) + '</span></div><div class="breakdown-row"><span>Paid to date</span><span>' + peso(p.paid) + '</span></div><div class="breakdown-row highlight"><span>Amount due now</span><span class="blue-text">' + peso(due) + '</span></div><div class="breakdown-row"><span>Balance after this payment</span><span>' + peso(round2(t - p.paid - due)) + '</span></div></div></div>' +
            '<div class="section-card"><span class="card-label-top">PAYMENT METHOD</span><div class="payment-methods-grid">' + [['Online', 'QR code and screenshot upload'], ['Over the Counter', 'Admin confirms cash payment']].map(m => '<div class="method-card' + (p.method === m[0] ? ' active' : '') + '" data-pj="method" data-v="' + m[0] + '"><h4>' + m[0] + '</h4><p>' + m[1] + '</p></div>').join('') + '</div></div>' +
            '<div class="section-card"><span class="card-label-top">PAYMENT PROOF</span>' + proofCard + '</div></div>' +
            '<div class="payment-col-right"><div class="section-card"><span class="card-label-top">RECEIPT</span><div class="form-group"><label>RECEIPT NO.</label><input type="text" value="' + rcNo() + '" readonly></div><div class="form-group"><label>CUSTOMER</label><input type="text" value="' + esc(p.customer) + '" readonly></div><div class="form-group"><label>AMOUNT TO RECEIVE</label><input type="text" value="' + peso(due) + '" readonly></div><p class="helper-text">The receipt is generated once you confirm the payment.</p></div>' +
            '<div class="section-card"><span class="card-label-top">NEXT STEP</span><p class="next-step-desc">After payment is confirmed, the project moves to installation.</p></div></div></div>';
    }
    function receiptData(p) {
        const q = projQuote(p), t = calc(q.items, q.transport), r = p.receipt || { no: rcNo(), amount: dueNow(p), method: p.method, date: TODAY, preview: true };
        return { q, t, r };
    }
    function viewReceipt(p) {
        const { q, t, r } = receiptData(p);
        return '<div class="receipt-preview-grid"><div class="receipt-paper" id="receiptPaper"><div class="receipt-header"><div class="receipt-brand"><h2>Beyond<span>Wires</span></h2><p>SECURITY SYSTEM SERVICES</p></div><div class="receipt-title-box"><h3>OFFICIAL RECEIPT</h3><span>' + r.no + '</span></div></div>' +
            '<div class="receipt-meta-grid"><div><small>RECEIVED FROM</small><strong>' + esc(p.customer) + '</strong></div><div><small>DATE</small><strong>' + fmtDate(r.date) + '</strong></div><div><small>METHOD</small><strong>' + esc(r.method) + '</strong></div><div><small>QUOTATION</small><strong>' + q.id + '</strong></div></div>' +
            '<table class="receipt-table"><thead><tr><th>DESCRIPTION</th><th>QTY</th><th>UNIT PRICE</th><th class="text-right">AMOUNT</th></tr></thead><tbody>' + q.items.map(i => '<tr><td>' + esc(i.name) + '</td><td>' + i.qty + '</td><td>' + peso(i.price) + '</td><td class="text-right">' + peso(i.qty * i.price) + '</td></tr>').join('') + '</tbody></table>' +
            '<div class="receipt-totals"><div class="tot-row"><span>Subtotal</span><span>' + peso(t.sub) + '</span></div><div class="tot-row"><span>Other Expenses (Transport)</span><span>' + peso(t.tr) + '</span></div><div class="tot-row"><span>VAT (' + Math.round(VAT_RATE * 100) + '%)</span><span>' + peso(t.vat) + '</span></div><div class="tot-row total"><span>Total Cost</span><span>' + peso(t.total) + '</span></div>' +
            '<div class="tot-row paid-highlight"><span>Amount Paid</span><span class="green-text">' + peso(r.amount) + '</span></div><div class="tot-row"><span>Remaining Balance</span><span>' + peso(round2(t.total - p.paid - (r.preview ? 0 : 0))) + '</span></div></div>' +
            '<p class="receipt-footer-note">This receipt acknowledges the payment above. Any remaining balance is due upon project completion. Keep this receipt for your records.</p><div class="receipt-signatures"><div class="sig-line">Received by (Admin)</div><div class="sig-line">Customer Copy</div></div></div>' +
            '<div class="receipt-sidebar-controls"><div class="section-card"><span class="card-label-top">RECEIPT DETAILS</span><div class="form-group"><label>RECEIPT NO.</label><input type="text" value="' + r.no + '" readonly></div><div class="form-group"><label>PAYMENT DATE</label><input type="text" value="' + fmtDate(r.date) + '" readonly></div>' +
            '<div class="toggle-group"><span>Auto-send receipt to customer</span><label class="switch"><input type="checkbox" id="autoSend" checked><span class="slider"></span></label></div><p class="helper-text">The receipt is emailed to the customer and saved to Project Documents.</p>' +
            '<button class="btn-primary full-width" data-pj="gen" style="margin-top:12px">Generate &amp; Save as PDF</button><button class="btn-outline full-width" data-pj="print">Download Copy</button></div></div></div>';
    }
    function viewTracker(p) {
        const q = projQuote(p), t = qTotal(q), bal = round2(t - p.paid);
        const idx = { 'Awaiting Payment': 1, 'Payment Under Review': 1, 'Installation In Progress': 2, 'Awaiting Final Payment': 3, 'Done': 5 }[p.status];
        const steps = [['Quotation Approved', 'Approved'], ['Payment', p.agreement === 'after' ? 'Pay after install' : 'Initial payment'], ['Installation', 'On site'], ['Final Payment', bal > 0 ? peso(bal) + ' due' : 'Settled'], ['Done / Successful', 'Completion']];
        const stepper = steps.map((s, i) => { const c = i < idx ? 'completed' : i === idx ? 'active' : ''; return (i ? '<div class="step-line ' + (i <= idx ? (i < idx ? 'completed' : 'active') : '') + '"></div>' : '') + '<div class="step-item ' + c + '"><div class="step-icon">' + (i < idx ? '<i class="fa-solid fa-check"></i>' : i + 1) + '</div><div class="step-text"><strong>' + s[0] + '</strong><span>' + esc(s[1]) + '</span></div></div>'; }).join('');
        const done = p.checklist.filter(c => c.state === 'Done').length, pct = Math.round(done / p.checklist.length * 100);
        const stCls = { 'Done': ['status-green', 'green'], 'In progress': ['status-yellow', 'yellow'], 'Pending': ['status-gray', 'gray'] };
        const editable = p.status === 'Installation In Progress';
        let tab = pct === 100 ? 2 : pct === 0 && !p.checklist.some(c => c.state === 'In progress') ? 0 : 1;
        let action;
        if (p.status === 'Installation In Progress') action = '<div class="returns-banner"><strong>NEXT</strong><p>Marking installation complete moves this project to ' + (bal > 0 ? 'Awaiting Final Payment (' + peso(bal) + ' due).' : 'Done.') + ' Click a checklist row to change its status.</p></div><div class="action-row-buttons"><button class="btn-secondary" data-pj="save">Save Progress</button><button class="btn-primary" data-pj="complete">Mark Installation Complete</button></div>';
        else if (p.status === 'Awaiting Final Payment') action = '<div class="returns-banner"><strong>FINAL PAYMENT</strong><p>Installation is complete. Confirm the remaining ' + peso(bal) + ' to finish this project.</p></div><div class="action-row-buttons"><button class="btn-primary" data-pj="final">Confirm Final Payment (' + peso(bal) + ')</button></div>';
        else action = '<div class="returns-banner"><strong>COMPLETED</strong><p>This project is done and fully paid.</p></div>';
        return '<div class="project-status-top-bar"><div class="proj-header-info"><span class="sub-heading">' + esc(p.customer.toUpperCase()) + ' - ' + esc(p.type.toUpperCase()) + '</span><h2>' + esc(p.title) + '</h2></div><div class="proj-header-meta"><div><small>PAYMENT AGREEMENT</small><strong>' + ({ half: 'Half Payment', full: 'Full Payment', after: 'Full After Installation' }[p.agreement]) + '</strong></div><div><small>BALANCE</small><strong class="blue-text">' + peso(bal) + '</strong></div><span class="status-pill ' + PSTAT[p.status] + '">' + p.status + '</span></div></div>' +
            '<div class="stepper-card">' + stepper + '</div><div class="tracker-main-grid"><div class="tracker-left"><div class="section-card"><span class="card-label-top">INSTALLATION TRACKER</span><div class="status-tabs">' + ['SCHEDULED', 'IN PROGRESS', 'COMPLETED'].map((s, i) => '<button class="s-tab' + (i === tab ? ' active' : '') + '" disabled>' + s + '</button>').join('') + '</div>' +
            '<div class="progress-info-row"><span>Progress</span><strong>' + pct + '%</strong></div><div class="progress-bar-container"><div class="progress-bar-fill" style="width:' + pct + '%"></div></div><div class="checklist-items">' +
            p.checklist.map((c, i) => '<div class="check-row" data-pj="check" data-i="' + i + '" style="' + (editable ? 'cursor:pointer' : '') + '"><span>' + esc(c.label) + '</span><span class="' + stCls[c.state][0] + '"><span class="dot ' + stCls[c.state][1] + '"></span> ' + c.state + '</span></div>').join('') + '</div>' + action + '</div></div>' +
            '<div class="tracker-right"><div class="section-card"><span class="card-label-top">PAYMENT SUMMARY</span><div class="sched-detail-row"><span>Quotation total</span><strong>' + peso(t) + '</strong></div><div class="sched-detail-row"><span>Paid to date</span><strong class="green-text">' + peso(p.paid) + '</strong></div><div class="sched-detail-row"><span>Balance</span><strong>' + peso(bal) + '</strong></div>' + (p.receipt ? '<button class="btn-outline full-width" data-pj="receipt" style="margin-top:8px">View Receipt ' + p.receipt.no + '</button>' : '') + '</div></div></div>';
    }
 
    $('#projDetail').addEventListener('click', e => {
        const el = e.target.closest('[data-pj]'); if (!el || el.disabled) return;
        const p = DB.projects.find(x => x.id === curProj), a = el.dataset.pj, due = dueNow(p);
        const rerender = () => { save(); refreshAll(false); renderProjView(); };
        switch (a) {
            case 'back': pane('projects', 'projList'); break;
            case 'agree':
                if (el.dataset.v === 'after' && p.type !== 'Residential') return toast('Full Payment After Installation is for residential customers only');
                p.agreement = el.dataset.v; rerender(); break;
            case 'method': if (p.proof) return toast('The payment method is locked after a proof is submitted'); p.method = el.dataset.v; rerender(); break;
            case 'reupload': p.proof = null; p.status = 'Awaiting Payment'; toast('Re-upload request sent to ' + p.customer); rerender(); break;
            case 'confirm': {
                const amt = p.proof.amount;
                if (Math.abs(amt - due) > 0.009 && !confirm('The amount on the proof (' + peso(amt) + ') differs from the amount due (' + peso(due) + '). Confirm anyway?')) return;
                payConfirmed(p, amt); break;
            }
            case 'cash': { const amt = +$('#cashAmt').value; if (!(amt > 0)) return toast('Enter the amount received'); payConfirmed(p, amt); break; }
            case 'start': p.status = 'Installation In Progress'; toast('Installation started'); projView = 'tracker'; rerender(); break;
            case 'gen': toast('Receipt ' + p.receipt.no + ' saved to Project Documents' + ($('#autoSend').checked ? ' and emailed to the customer' : '')); projView = 'tracker'; renderProjView(); break;
            case 'print': printHTML($('#receiptPaper').outerHTML); break;
            case 'receipt': projView = 'receipt'; renderProjView(); break;
            case 'check': {
                if (p.status !== 'Installation In Progress') return;
                const c = p.checklist[+el.dataset.i]; c.state = { Pending: 'In progress', 'In progress': 'Done', Done: 'Pending' }[c.state]; rerender(); break;
            }
            case 'save': toast('Progress saved'); save(); break;
            case 'complete': {
                p.checklist.forEach(c => { c.state = 'Done'; });
                const bal = round2(qTotal(projQuote(p)) - p.paid);
                p.status = bal > 0 ? 'Awaiting Final Payment' : 'Done';
                toast(bal > 0 ? 'Installation complete. Final payment of ' + peso(bal) + ' is now due.' : 'Project marked as done'); rerender(); break;
            }
            case 'final': {
                const bal = round2(qTotal(projQuote(p)) - p.paid);
                p.paid = round2(p.paid + bal); DB.counters.receipt++;
                p.receipt = { no: 'RC-2026-' + pad(DB.counters.receipt, 3), amount: bal, method: p.method, date: TODAY };
                p.status = 'Done'; toast('Final payment confirmed. Project is done.'); projView = 'receipt'; rerender(); break;
            }
        }
    });
    function payConfirmed(p, amt) {
        p.paid = round2(p.paid + amt);
        if (p.proof) p.proof.verified = true;
        DB.counters.receipt++;
        p.receipt = { no: 'RC-2026-' + pad(DB.counters.receipt, 3), amount: amt, method: p.method, date: TODAY };
        p.status = 'Installation In Progress';
        toast('Payment of ' + peso(amt) + ' confirmed');
        projView = 'receipt'; save(); refreshAll(false); renderProjView();
    }
 
    /* =========================================================
       Schedules
    ========================================================= */
    let schedDate = DB.bookings.filter(b => b.date >= TODAY).map(b => b.date).sort()[0] || TODAY;
    let schedPicker = null;
 
    function renderSchedule() {
        if (!schedPicker) {
            schedPicker = Picker($('#schedCal'), { date: schedDate, allowAll: true, dots: true, onChange: d => { schedDate = d; renderDay(); } });
        } else schedPicker.refresh();
        renderDay(); renderRequests();
    }
    function renderDay() {
        const list = DB.bookings.filter(b => b.date === schedDate);
        const off = dateStatus(schedDate) === 'off' && toDate(schedDate).getDay() === 0;
        $('#schedDay').innerHTML = '<div class="day-head"><h3>' + fmtLong(schedDate) + '</h3><span>' + list.length + ' booking(s)' + (off ? ' \u00B7 Closed (Sunday)' : '') + '</span></div>' +
            SLOTS.map(t => { const b = list.find(x => x.time === t);
                return '<div class="slot-row"><span class="slot-time">' + t + '</span><div class="slot-body">' + (b ? esc(b.customer) + '<small>' + b.type + '</small>' : '<span class="slot-open">Open</span>') + '</div>' +
                    (b ? '<span class="type-pill ' + typeCls(b.type) + '">' + b.type.toUpperCase() + '</span><button class="btn-xs" data-s="edit" data-id="' + b.id + '"><i class="fa-solid fa-pen"></i> Edit</button>' : '') + '</div>'; }).join('');
    }
    $('#schedDay').addEventListener('click', e => { const b = e.target.closest('[data-s="edit"]'); if (b) editBooking(b.dataset.id); });
 
    function bookingOf(r) { return DB.bookings.find(b => b.id === r.bookingId); }
    function renderRequests() {
        const reqs = DB.requests.filter(r => r.status === 'Pending' || r.status === 'Counter Sent');
        $('#schedReq').innerHTML = '<span class="section-top-label">RESCHEDULE REQUESTS</span>' + (reqs.map(r => {
            const b = bookingOf(r);
            if (r.status === 'Pending') return '<div class="alert-card border-red"><div class="alert-header-row"><span class="alert-title text-red">SCHEDULE CHANGE</span><span class="alert-time">' + r.ago + '</span></div><p class="alert-desc">' + esc(b.customer) + ' requested to move the ' + b.type + ' from <b>' + fmtDate(b.date) + ', ' + b.time + '</b> to <b>' + fmtDate(r.newDate) + ', ' + r.newTime + '</b>.</p>' +
                '<div class="alert-actions"><button class="btn-primary-sm" data-r="approve" data-id="' + r.id + '">Approve</button><button class="btn-outline-sm" data-r="negotiate" data-id="' + r.id + '">Negotiate</button><button class="btn-outline-sm" data-r="details" data-id="' + r.id + '">Details</button></div></div>';
            return '<div class="alert-card border-blue"><div class="alert-header-row"><span class="alert-title text-blue">COUNTER-PROPOSAL SENT</span><span class="alert-time">waiting</span></div><p class="alert-desc">Proposed <b>' + fmtDate(r.proposed.date) + ', ' + r.proposed.time + '</b> to ' + esc(b.customer) + '. Waiting for their reply.</p>' +
                '<div class="alert-actions"><button class="btn-outline-sm" data-r="details" data-id="' + r.id + '">Details</button><button class="btn-link" data-r="accepted" data-id="' + r.id + '" title="Stands in for the customer\'s reply until the backend is connected">Customer accepted</button></div></div>';
        }).join('') || '<div class="alert-card border-green"><p class="alert-desc" style="margin:0">No pending reschedule requests.</p></div>');
    }
    $('#schedReq').addEventListener('click', e => {
        const b = e.target.closest('[data-r]'); if (!b) return;
        const r = DB.requests.find(x => x.id === b.dataset.id);
        if (b.dataset.r === 'approve') approveRequest(r);
        if (b.dataset.r === 'details') requestDetails(r);
        if (b.dataset.r === 'negotiate') negotiate(r);
        if (b.dataset.r === 'accepted') { const bk = bookingOf(r); bk.date = r.proposed.date; bk.time = r.proposed.time; r.status = 'Approved'; save(); toast('Customer accepted the new schedule'); closeModal(); refreshAll(); }
    });
    function approveRequest(r) {
        const b = bookingOf(r);
        if (slotTaken(r.newDate, r.newTime, b.id)) return toast('That slot is already booked. Use Negotiate to propose another time.');
        b.date = r.newDate; b.time = r.newTime; r.status = 'Approved'; schedDate = b.date; save();
        toast('Reschedule approved for ' + b.customer); closeModal(); refreshAll();
    }
    function requestDetails(r) {
        const b = bookingOf(r), f = (l, v, full) => '<div' + (full ? ' class="mc-full"' : '') + '><label>' + l + '</label><b>' + v + '</b></div>';
        openModal('<button class="mc-x" data-close aria-label="Close">&times;</button><h2>Reschedule Details</h2><p class="mc-sub">' + esc(b.customer) + ' \u2022 ' + b.type + ' \u2022 requested ' + r.ago + '</p><div class="mc-grid">' +
            f('CURRENT SCHEDULE', fmtDate(b.date) + ' \u2022 ' + b.time) + f('REQUESTED NEW SCHEDULE', fmtDate(r.newDate) + ' \u2022 ' + r.newTime) +
            f('REASON FOR RESCHEDULING', esc(r.reason), true) + f('STATUS', r.status === 'Counter Sent' ? 'Counter-proposal sent' : r.status) + (r.proposed ? f('YOUR PROPOSAL', fmtDate(r.proposed.date) + ' \u2022 ' + r.proposed.time) : '') + '</div>' +
            (r.status === 'Pending' ? '<div class="mc-actions"><button class="mc-btn" data-m="negotiate">Negotiate</button><button class="mc-btn pri" data-m="approve">Approve</button></div>' : ''),
            e => { const m = e.target.closest('[data-m]'); if (!m) return; if (m.dataset.m === 'approve') approveRequest(r); else negotiate(r); });
    }
    function negotiate(r) {
        const b = bookingOf(r); let sel = { date: '', time: '' };
        const h = openModal('<button class="mc-x" data-close aria-label="Close">&times;</button><h2>Propose a New Schedule</h2><p class="mc-sub">' + esc(b.customer) + ' \u2022 ' + b.type + '</p>' +
            '<div class="mc-note">Customer asked for <b>' + fmtDate(r.newDate) + ', ' + r.newTime + '</b>. Pick the date and time you can offer instead.</div><div id="negCal"></div>' +
            '<div class="mc-actions"><button class="mc-btn" data-close>Cancel</button><button class="mc-btn pri" data-m="send">Send to Customer</button></div>',
            e => {
                if (!e.target.closest('[data-m="send"]')) return;
                if (!sel.date || !sel.time) return toast('Choose a date and a time slot first');
                r.status = 'Counter Sent'; r.proposed = { date: sel.date, time: sel.time }; save();
                toast('Proposal sent to ' + b.customer); closeModal(); refreshAll();
            });
        Picker($('#negCal', h), { date: '', exclude: b.id, times: true, onChange: (d, t) => { sel = { date: d, time: t }; } });
    }
    function editBooking(id) {
        const b = DB.bookings.find(x => x.id === id); let sel = { date: b.date, time: b.time };
        const h = openModal('<button class="mc-x" data-close aria-label="Close">&times;</button><h2>Edit Schedule</h2><p class="mc-sub">' + esc(b.customer) + ' \u2022 ' + b.type + ' \u2022 currently ' + fmtDate(b.date) + ', ' + b.time + '</p><div id="editCal"></div>' +
            '<label style="margin-top:18px">REASON FOR CHANGE (OPTIONAL)</label><textarea id="editReason" placeholder="e.g. Crew unavailable, travel conflict..."></textarea>' +
            '<label class="mc-check"><input type="checkbox" id="editNotify" checked> Notify the customer about this change</label>' +
            '<div class="mc-actions"><button class="mc-btn" data-close>Cancel</button><button class="mc-btn pri" data-m="save">Save Changes</button></div>',
            e => {
                if (!e.target.closest('[data-m="save"]')) return;
                if (!sel.date || !sel.time) return toast('Choose a date and a time slot');
                b.date = sel.date; b.time = sel.time; schedDate = b.date; save();
                toast('Schedule updated' + ($('#editNotify').checked ? ' and customer notified' : '')); closeModal(); refreshAll();
            });
        Picker($('#editCal', h), { date: b.date, time: b.time, exclude: b.id, times: true, onChange: (d, t) => { sel = { date: d, time: t }; } });
    }
 
    /* =========================================================
       Settings (theme / profile / password)
    ========================================================= */
    function setStatus(dirty, text) {
        $('#stStatus').classList.toggle('dirty', dirty);
        $('#stStatus i').className = 'fa-solid ' + (dirty ? 'fa-circle-exclamation' : 'fa-circle-check');
        $('#stStatusText').textContent = text;
    }
    const savedTheme = () => store.get('bw_admin_theme', 'dark') || 'dark';
    let pendingTheme = savedTheme();
    function renderThemeButtons() {
        $$('.st-theme').forEach(b => {
            const t = b.dataset.themeOpt;
            b.classList.toggle('selected', t === pendingTheme); b.classList.toggle('is-active', t === savedTheme());
            b.setAttribute('aria-pressed', t === pendingTheme ? 'true' : 'false');
        });
    }
    $$('.st-theme').forEach(b => b.addEventListener('click', () => {
        pendingTheme = b.dataset.themeOpt; renderThemeButtons();
        const dirty = pendingTheme !== savedTheme(); setStatus(dirty, dirty ? 'Unsaved theme change' : 'All settings up to date');
    }));
    $('#stSaveTheme').addEventListener('click', () => {
        store.set('bw_admin_theme', pendingTheme); document.documentElement.setAttribute('data-theme', pendingTheme);
        renderThemeButtons(); setStatus(false, 'All settings up to date'); toast((pendingTheme === 'light' ? 'Light' : 'Dark') + ' theme saved');
    });
 
    const profile = Object.assign({ name: 'Admin NOC', email: 'admin@beyondwires.com' }, store.get('bw_admin_profile', {}));
    const nameIn = $('#stFullName'), emailIn = $('#stEmail');
    function fieldError(input, errId, msg) { $('#' + errId).textContent = msg || ''; input.closest('.st-input').classList.toggle('invalid', !!msg); return !msg; }
    const validName = () => fieldError(nameIn, 'stFullNameErr', nameIn.value.trim().length < 2 ? 'Please enter your full name.' : '');
    const validEmail = () => fieldError(emailIn, 'stEmailErr', /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(emailIn.value.trim()) ? '' : 'Please enter a valid email address.');
    function saveProfile() {
        const ok = validName() & validEmail(); if (!ok) return;
        const next = { name: nameIn.value.trim(), email: emailIn.value.trim() };
        if (next.name === profile.name && next.email === profile.email) return;
        Object.assign(profile, next); store.set('bw_admin_profile', profile); $('#top-name').textContent = profile.name; toast('Profile saved');
    }
    nameIn.value = profile.name; emailIn.value = profile.email; $('#top-name').textContent = profile.name;
    nameIn.addEventListener('blur', saveProfile); emailIn.addEventListener('blur', saveProfile);
    nameIn.addEventListener('input', () => fieldError(nameIn, 'stFullNameErr', ''));
    emailIn.addEventListener('input', () => fieldError(emailIn, 'stEmailErr', ''));
    $('#stProfileForm').addEventListener('submit', e => { e.preventDefault(); saveProfile(); });
 
    const EYE = '<svg viewBox="0 0 24 24"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>';
    const EYE_OFF = '<svg viewBox="0 0 24 24"><path d="M17.9 17.9A10.9 10.9 0 0112 19c-7 0-11-7-11-7a19.8 19.8 0 015.1-5.9M9.9 5.1A10.4 10.4 0 0112 5c7 0 11 7 11 7a19.8 19.8 0 01-3.2 4.2M1 1l22 22"/></svg>';
    $$('.st-eye').forEach(btn => {
        btn.innerHTML = EYE;
        btn.addEventListener('click', () => {
            const input = document.getElementById(btn.dataset.target), show = input.type === 'password';
            input.type = show ? 'text' : 'password'; btn.innerHTML = show ? EYE_OFF : EYE; btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
        });
    });
    $('#stPwForm').addEventListener('submit', e => {
        e.preventDefault();
        const cur = $('#stCurPw'), nw = $('#stNewPw'), cf = $('#stConfPw'); let ok = true;
        ok = fieldError(cur, 'stCurPwErr', cur.value ? '' : 'Enter your current password.') && ok;
        let m = ''; if (nw.value.length < 8) m = 'Use at least 8 characters.'; else if (!/\d/.test(nw.value)) m = 'Include at least one number.'; else if (nw.value === cur.value) m = 'New password must differ from the current one.';
        ok = fieldError(nw, 'stNewPwErr', m) && ok;
        ok = fieldError(cf, 'stConfPwErr', cf.value === nw.value && cf.value ? '' : 'Passwords do not match.') && ok;
        if (!ok) return;
        /* TODO: send { current: cur.value, next: nw.value } to your backend here */
        e.target.reset(); $$('.st-eye').forEach(b => { document.getElementById(b.dataset.target).type = 'password'; b.innerHTML = EYE; });
        toast('Password changed successfully');
    });
    ['stCurPw', 'stNewPw', 'stConfPw'].forEach(id => document.getElementById(id).addEventListener('input', () => fieldError(document.getElementById(id), id + 'Err', '')));
 
    /* =========================================================
       Refresh + init
    ========================================================= */
    function refreshAll() {
        renderDashboard(); renderInquiries(); renderQuoteList(); renderProjects(); renderSchedule(); updateBadges(); renderNotifs();
    }
    setSidebar(!!store.get('bw_admin_sidebar', false));
    renderThemeButtons();
    activateTab(location.hash.slice(1) || 'dashboard');
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


