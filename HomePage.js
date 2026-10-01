
  {
    const sidebar = document.getElementById('sidebar');
  const toggle = document.getElementById('sidebarToggle');
  const navItems = [...document.querySelectorAll('.nav-item[data-section]')];
  const views = [...document.querySelectorAll('.section-view')];
  const inquireBtn = document.getElementById('inquireBtn');

  // Sidebar can be minimized to icons only.
  toggle.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    toggle.title = sidebar.classList.contains('collapsed')
      ? 'Expand sidebar'
      : 'Minimize sidebar';
  });

  // Active highlight is driven by the section that is currently open.
  // This makes the sidebar state dynamic instead of hard-coded to Dashboard.
  function openSection(sectionName) {
    navItems.forEach(item => {
      const isActive = item.dataset.section === sectionName;
      item.classList.toggle('active', isActive);
      if (isActive) item.setAttribute('aria-current', 'page');
      else item.removeAttribute('aria-current');
    });

    views.forEach(view => view.classList.toggle('active', view.id === sectionName));
    history.replaceState(null, '', '#' + sectionName);
  }

  navItems.forEach(item => {
    item.addEventListener('click', () => openSection(item.dataset.section));
  });

  // Restore the active section from the URL when the page is loaded.
  const initial = location.hash.replace('#', '');
  if (initial && document.getElementById(initial) && navItems.some(n => n.dataset.section === initial)) {
    openSection(initial);
  }

  // Only the Inquire button has a hover interaction.
  inquireBtn.addEventListener('click', () => openSection('inquiries'));

  document.getElementById('exportCsv').addEventListener('click', () => {
    const rows = [
      ['Activity / Device','Location','Timestamp','Status'],
      ['Site Inspection Requested: Biometric Upgrade','HQ Zone B','Today, 10:45 AM','CONFIRMED'],
      ['NVR Storage Upgrade - Hard Drive Calibration','Server Room','Yesterday, 4:12 PM','COMPLETED'],
      ['Alarm Signal Triggered: Vault Entry Door','Gated Comp.','Jan 15, 2:30 AM','RESOLVED']
    ];
    const csv = rows.map(row => row.map(cell => '"' + cell.replaceAll('"','""') + '"').join(',')).join('\\n');
    const blob = new Blob([csv], {type:'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'beyondwires-activity.csv'; a.click();
    URL.revokeObjectURL(url);
  });
  }





// Dropdown Toggle Selectors
const notifBtn = document.getElementById('notifBtn');
const notifMenu = document.getElementById('notifMenu');
const accountBtn = document.getElementById('accountBtn');
const accountMenu = document.getElementById('accountMenu');

// Action Selectors
const markAllRead = document.getElementById('markAllRead');
const notifBadge = document.getElementById('notifBadge');
const notifItems = document.querySelectorAll('.notif-item');
const viewAllNotifs = document.getElementById('viewAllNotifs');
const myAccountLink = document.getElementById('myAccountLink');
const logoutBtn = document.getElementById('logoutBtn');

// Toggle Notification Menu
notifBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  accountMenu.classList.remove('show');
  notifMenu.classList.toggle('show');
});

// Toggle Account Menu
accountBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  notifMenu.classList.remove('show');
  accountMenu.classList.toggle('show');
});

// Close active dropdowns on click outside
document.addEventListener('click', (e) => {
  if (!notifMenu.contains(e.target) && !notifBtn.contains(e.target)) {
    notifMenu.classList.remove('show');
  }
  if (!accountMenu.contains(e.target) && !accountBtn.contains(e.target)) {
    accountMenu.classList.remove('show');
  }
});

// "Mark all as read" Functionality
markAllRead.addEventListener('click', () => {
  notifItems.forEach(item => item.classList.remove('unread'));
  if (notifBadge) {
    notifBadge.style.display = 'none';
  }
});

// Individual notification item click (marks individual item as read)
notifItems.forEach(item => {
  item.addEventListener('click', () => {
    if (item.classList.contains('unread')) {
      item.classList.remove('unread');
      const currentCount = parseInt(notifBadge.textContent) - 1;
      if (currentCount > 0) {
        notifBadge.textContent = currentCount;
      } else {
        notifBadge.style.display = 'none';
      }
    }
  });
});

// "View All Notifications" Functionality
viewAllNotifs.addEventListener('click', () => {
  notifMenu.classList.remove('show');
  if (typeof openSection === 'function') {
    openSection('inquiries'); // Navigates to inquiries view section
  }
});

// Account Menu Actions
myAccountLink.addEventListener('click', (e) => {
  e.preventDefault();
  accountMenu.classList.remove('show');
  // Clicking the real sidebar button opens System Settings and highlights it
  document.querySelector('.nav-item[data-section="settings"]').click();
});

logoutBtn.addEventListener('click', () => {
  accountMenu.classList.remove('show');
  try { sessionStorage.clear(); } catch (e) {}
  window.location.replace('LandingPage.html');   // replace() stops the Back button returning to the dashboard
});

/* ===== My Inquiries ===== */
(function () {
  const PAGE_SIZE = 6;
  const MIN_DATE = '2022-01-01';

  const inquiries = [
    { id:'INQ-2026-001', date:'2026-01-12', type:'Both',    site:'Yes', status:'Acknowledged', notes:'' },
    { id:'INQ-2026-002', date:'2026-01-10', type:'Service', site:'No',  status:'Pending',      notes:'' },
    { id:'INQ-2026-003', date:'2026-01-08', type:'Product', site:'No',  status:'Acknowledged', notes:'' },
    { id:'INQ-2026-004', date:'2026-01-05', type:'Both',    site:'Yes', status:'Acknowledged', notes:'' },
    { id:'INQ-2026-005', date:'2026-01-03', type:'Service', site:'Yes', status:'Pending',      notes:'' },
    { id:'INQ-2026-006', date:'2025-12-28', type:'Product', site:'No',  status:'Failed',       notes:'' },
    { id:'INQ-2026-007', date:'2025-12-22', type:'Service', site:'Yes', status:'Acknowledged', notes:'' },
    { id:'INQ-2026-008', date:'2025-12-18', type:'Product', site:'No',  status:'Pending',      notes:'' },
    { id:'INQ-2026-009', date:'2025-12-12', type:'Both',    site:'Yes', status:'Acknowledged', notes:'' },
    { id:'INQ-2026-010', date:'2025-12-05', type:'Service', site:'No',  status:'Failed',       notes:'' },
    { id:'INQ-2026-011', date:'2025-11-28', type:'Product', site:'No',  status:'Acknowledged', notes:'' },
    { id:'INQ-2026-012', date:'2025-11-20', type:'Both',    site:'Yes', status:'Pending',      notes:'' }
  ];

  const state = { search:'', status:'all', from:'', to:'', page:1 };

  const $ = id => document.getElementById(id);
  const body = $('inqBody'), countEl = $('inqCount'), pager = $('inqPager');
  const searchEl = $('inqSearch'), statusEl = $('inqStatus');
  const dateBtn = $('inqDateBtn'), dateLabel = $('inqDateLabel'), datePop = $('inqDatePop');
  const fromEl = $('inqFrom'), toEl = $('inqTo'), dateErr = $('inqDateErr');
  const viewModal = $('inqViewModal'), newModal = $('inqNewModal'), newForm = $('inqNewForm');
  const toast = $('inqToast');

  const slug = s => s.toLowerCase().replace(/\s+/g, '-');
  const fmt = iso => {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-US', { month:'short', day:'2-digit', year:'numeric' });
  };
  const pill = text => `<span class="pill ${slug(text)}">${text}</span>`;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function getFiltered() {
    const q = state.search.trim().toLowerCase();
    return inquiries.filter(i => {
      if (state.status !== 'all' && i.status !== state.status) return false;
      if (state.from && i.date < state.from) return false;
      if (state.to && i.date > state.to) return false;
      if (q) {
        const hay = [i.id, fmt(i.date), i.type, i.site, i.status].join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }

  function render() {
    const list = getFiltered();
    const total = list.length;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    state.page = Math.min(Math.max(state.page, 1), totalPages);

    const startIdx = (state.page - 1) * PAGE_SIZE;
    const rows = list.slice(startIdx, startIdx + PAGE_SIZE);

    body.innerHTML = rows.length
      ? rows.map(i => `
        <tr>
          <td class="inq-id">${i.id}</td>
          <td>${fmt(i.date)}</td>
          <td>${pill(i.type)}</td>
          <td>${i.site}</td>
          <td>${pill(i.status)}</td>
          <td class="inq-right"><button type="button" class="inq-view" data-id="${i.id}">View</button></td>
        </tr>`).join('')
      : `<tr><td colspan="6" class="inq-empty">No inquiries found.</td></tr>`;

    const from = total ? startIdx + 1 : 0;
    const to = Math.min(startIdx + PAGE_SIZE, total);
    countEl.textContent = `Showing ${from}–${to} of ${total} results`;

    let pagerHtml = `<button type="button" class="pg-btn" data-nav="prev" ${state.page === 1 ? 'disabled' : ''}>Previous</button>`;
    for (let p = 1; p <= totalPages; p++) {
      pagerHtml += `<button type="button" class="pg-btn ${p === state.page ? 'active' : ''}" data-page="${p}">${p}</button>`;
    }
    pagerHtml += `<button type="button" class="pg-btn" data-nav="next" ${state.page === totalPages ? 'disabled' : ''}>Next</button>`;
    pager.innerHTML = pagerHtml;
  }

  /* Search + status filter */
  searchEl.addEventListener('input', () => { state.search = searchEl.value; state.page = 1; render(); });
  statusEl.addEventListener('change', () => { state.status = statusEl.value; state.page = 1; render(); });

  /* Date range */
  function updateDateLabel() {
    if (state.from && state.to) dateLabel.textContent = `${fmt(state.from)} – ${fmt(state.to)}`;
    else if (state.from) dateLabel.textContent = `From ${fmt(state.from)}`;
    else if (state.to) dateLabel.textContent = `Until ${fmt(state.to)}`;
    else dateLabel.textContent = 'Choose Date Range';
  }

  dateBtn.addEventListener('click', e => { e.stopPropagation(); datePop.classList.toggle('show'); });
  datePop.addEventListener('click', e => e.stopPropagation());
  document.addEventListener('click', () => datePop.classList.remove('show'));

  $('inqDateApply').addEventListener('click', () => {
    let f = fromEl.value, t = toEl.value;
    if ((f && f < MIN_DATE) || (t && t < MIN_DATE)) {
      dateErr.textContent = 'Dates must be January 1, 2022 or later.';
      dateErr.hidden = false;
      return;
    }
    dateErr.hidden = true;
    if (f && t && f > t) [f, t] = [t, f];
    state.from = f; state.to = t; state.page = 1;
    fromEl.value = f; toEl.value = t;
    updateDateLabel(); datePop.classList.remove('show'); render();
  });
  $('inqDateClear').addEventListener('click', () => {
    dateErr.hidden = true;
    fromEl.value = toEl.value = ''; state.from = state.to = ''; state.page = 1;
    updateDateLabel(); datePop.classList.remove('show'); render();
  });

  /* Pagination */
  pager.addEventListener('click', e => {
    const btn = e.target.closest('.pg-btn');
    if (!btn || btn.disabled) return;
    if (btn.dataset.nav === 'prev') state.page--;
    else if (btn.dataset.nav === 'next') state.page++;
    else state.page = Number(btn.dataset.page);
    render();
  });

  /* Modals */
  const openModal = m => { m.classList.add('show'); m.setAttribute('aria-hidden', 'false'); };
  const closeModals = () => [viewModal, newModal].forEach(m => { m.classList.remove('show'); m.setAttribute('aria-hidden', 'true'); });

  [viewModal, newModal].forEach(m => {
    m.addEventListener('click', e => { if (e.target === m || e.target.hasAttribute('data-close')) closeModals(); });
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModals(); });

/* View button */
body.addEventListener('click', e => {
  const btn = e.target.closest('.inq-view');
  if (!btn) return;
  const i = inquiries.find(x => x.id === btn.dataset.id);
  if (!i) return;

  /* Older sample rows have no saved details, so fall back to what they do have */
  const d = i.details || {
    name:'Juan Dela Cruz', email:'juan@email.com',
    blocks:[{ address:'', place:'', option:i.type, site:i.site, visit:'', items:[], budget:'' }]
  };
  const cell = (label, value) => `<div><span>${label}</span><b>${esc(value) || '\u2014'}</b></div>`;

  $('vSub').textContent = `${i.id} \u2022 ${fmt(i.date)}`;
  $('vName').textContent = d.name || '\u2014';
  $('vEmail').textContent = d.email || '\u2014';
  $('vBlocks').innerHTML = d.blocks.map((b, n) => `
    <div class="inq-view-block">
      ${d.blocks.length > 1 ? `<div class="inq-view-title">Inquiry ${n + 1}</div>` : ''}
      <div class="inq-view-grid">
        ${cell('Address', b.address)}
        ${cell('Type of Place', b.place)}
        ${cell('Customer Purchase Option', b.option)}
        ${cell('Site Visit', b.site)}
        ${b.site === 'Yes'
          ? cell('Preferred Date & Time', b.visit)
          : cell('Selected', (b.items || []).join(', ')) + cell('Budget', b.budget)}
      </div>
    </div>`).join('');
  openModal(viewModal);
});

  /* New Inquiry (the button is redirected to the Service Inquiry page by the later script) */
  $('newInquiryBtn').addEventListener('click', () => { newForm.reset(); openModal(newModal); });

  newForm.addEventListener('submit', e => {
    e.preventDefault();
    const t = new Date();
    const iso = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
    const next = Math.max(...inquiries.map(i => parseInt(i.id.split('-')[2], 10))) + 1;
    const id = `INQ-${t.getFullYear()}-${String(next).padStart(3, '0')}`;

      inquiries.unshift({
      id, date: iso,
      type: $('nType').value, site: $('nSite').value,
      status: 'Pending', notes: $('nNotes').value.trim(),
      details: window.__inqDetails || null
    });
window.__inqDetails = null;

    // Clear filters so the new entry is visible at the top of page 1
    state.search = ''; state.status = 'all'; state.from = state.to = ''; state.page = 1;
    searchEl.value = ''; statusEl.value = 'all'; fromEl.value = toEl.value = '';
    updateDateLabel();

    closeModals(); render();
    toast.textContent = `Inquiry ${id} submitted`;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
  });

  render();
})();

/* ===== Quotations ===== */
(function () {
  const PAGE_SIZE = 6;

  const quotations = [
    { id:'QUO-2026-001', date:'2026-01-12', status:'Pending',   payment:'Pending'   },
    { id:'QUO-2026-002', date:'2026-01-10', status:'Completed', payment:'Completed' },
    { id:'QUO-2026-003', date:'2026-01-08', status:'Completed', payment:'Completed' },
    { id:'QUO-2026-004', date:'2026-01-05', status:'Approved',  payment:'Approved'  },
    { id:'QUO-2026-005', date:'2026-01-03', status:'Pending',   payment:'Pending'   },
    { id:'QUO-2026-006', date:'2025-12-28', status:'Declined',  payment:'Declined'  },
    { id:'QUO-2026-007', date:'2025-12-22', status:'Completed', payment:'Completed' },
    { id:'QUO-2026-008', date:'2025-12-18', status:'Approved',  payment:'Pending'   },
    { id:'QUO-2026-009', date:'2025-12-12', status:'Completed', payment:'Completed' },
    { id:'QUO-2026-010', date:'2025-12-05', status:'Declined',  payment:'Declined'  },
    { id:'QUO-2026-011', date:'2025-11-28', status:'Pending',   payment:'Pending'   },
    { id:'QUO-2026-012', date:'2025-11-20', status:'Approved',  payment:'Approved'  }
  ];

  const state = { search:'', status:'all', from:'', to:'', page:1 };

  const $ = id => document.getElementById(id);
  const body = $('quoBody'), countEl = $('quoCount'), pager = $('quoPager');
  const searchEl = $('quoSearch'), statusEl = $('quoStatus');
  const dateBtn = $('quoDateBtn'), dateLabel = $('quoDateLabel'), datePop = $('quoDatePop');
  const fromEl = $('quoFrom'), toEl = $('quoTo');
  const viewModal = $('quoViewModal');

  const slug = s => s.toLowerCase().replace(/\s+/g, '-');
  const fmt = iso => {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-US', { month:'short', day:'2-digit', year:'numeric' });
  };

  const pill = t => `<span class="pill ${slug(t)}">${t}</span>`;

  function getFiltered() {
    const q = state.search.trim().toLowerCase();
    return quotations.filter(i => {
      if (state.status !== 'all' && i.status !== state.status) return false;
      if (state.from && i.date < state.from) return false;
      if (state.to && i.date > state.to) return false;
      if (q && ![i.id, fmt(i.date), i.status, i.payment].join(' ').toLowerCase().includes(q)) return false;
      return true;
    });
  }

  function render() {
    const list = getFiltered();
    const total = list.length;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    state.page = Math.min(Math.max(state.page, 1), totalPages);
    const startIdx = (state.page - 1) * PAGE_SIZE;
    const rows = list.slice(startIdx, startIdx + PAGE_SIZE);

    body.innerHTML = rows.length
      ? rows.map(i => `
        <tr>
          <td class="inq-id">${i.id}</td>
          <td>${fmt(i.date)}</td>
          <td>${pill(i.status)}</td>
          <td>${pill(i.payment)}</td>
          <td class="inq-right"><button type="button" class="inq-view" data-id="${i.id}">View</button></td>
        </tr>`).join('')
      : `<tr><td colspan="5" class="inq-empty">No quotations found.</td></tr>`;

    countEl.textContent = `Showing ${total ? startIdx + 1 : 0}–${Math.min(startIdx + PAGE_SIZE, total)} of ${total} results`;

    let html = `<button type="button" class="pg-btn" data-nav="prev" ${state.page === 1 ? 'disabled' : ''}>Previous</button>`;
    for (let p = 1; p <= totalPages; p++) {
      html += `<button type="button" class="pg-btn ${p === state.page ? 'active' : ''}" data-page="${p}">${p}</button>`;
    }
    html += `<button type="button" class="pg-btn" data-nav="next" ${state.page === totalPages ? 'disabled' : ''}>Next</button>`;
    pager.innerHTML = html;
  }

  /* Search + status */
  searchEl.addEventListener('input', () => { state.search = searchEl.value; state.page = 1; render(); });
  statusEl.addEventListener('change', () => { state.status = statusEl.value; state.page = 1; render(); });

  /* Date range */
  function updateDateLabel() {
    if (state.from && state.to) dateLabel.textContent = `${fmt(state.from)} – ${fmt(state.to)}`;
    else if (state.from) dateLabel.textContent = `From ${fmt(state.from)}`;
    else if (state.to) dateLabel.textContent = `Until ${fmt(state.to)}`;
    else dateLabel.textContent = 'Choose Date Range';
  }
  dateBtn.addEventListener('click', e => { e.stopPropagation(); datePop.classList.toggle('show'); });
  datePop.addEventListener('click', e => e.stopPropagation());
  document.addEventListener('click', () => datePop.classList.remove('show'));

  $('quoDateApply').addEventListener('click', () => {
    let f = fromEl.value, t = toEl.value;
    if (f && t && f > t) [f, t] = [t, f];
    state.from = f; state.to = t; state.page = 1;
    fromEl.value = f; toEl.value = t;
    updateDateLabel(); datePop.classList.remove('show'); render();
  });
  $('quoDateClear').addEventListener('click', () => {
    fromEl.value = toEl.value = ''; state.from = state.to = ''; state.page = 1;
    updateDateLabel(); datePop.classList.remove('show'); render();
  });

  /* Pagination */
  pager.addEventListener('click', e => {
    const btn = e.target.closest('.pg-btn');
    if (!btn || btn.disabled) return;
    if (btn.dataset.nav === 'prev') state.page--;
    else if (btn.dataset.nav === 'next') state.page++;
    else state.page = Number(btn.dataset.page);
    render();
  });

  /* View modal */
  const closeModal = () => { viewModal.classList.remove('show'); viewModal.setAttribute('aria-hidden', 'true'); };
  viewModal.addEventListener('click', e => { if (e.target === viewModal || e.target.hasAttribute('data-close')) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

/* View -> opens the Quotation Approval page */
let current = null;
const peso = n => '\u20B1' + n.toLocaleString('en-US');
const ITEMS = [   // sample items; replace with the real quotation items
  ['16-Channel DVR', 1, 12500],
  ['IP Camera (Dome)', 8, 4200],
  ['Power Adapter & Connectors', 8, 350],
  ['Cabling & Installation', 1, 6500]
];

function detailsPage(q) {
  const e = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const row = (a, b) => `<div class="qa-row"><span>${a}</span><b>${e(b) || '\u2014'}</b></div>`;
  return `<div class="qa-page">
    <h4>Schedule &amp; Payment</h4>
    ${row('Installation', fmt(q.schedule.date) + ' \u2022 ' + q.schedule.time)}
    ${row('Agreement', q.agreement)}
    ${row('Method', q.method)}
    ${row('Amount', peso(q.proof.amount))}
    ${row('Reference No.', q.proof.ref)}
    ${row('Payment Date', fmt(q.proof.date))}
    ${row('Proof', q.proof.name)}
    ${q.proof.dataUrl ? `<img src="${q.proof.dataUrl}" alt="Payment proof" style="max-width:100%;margin-top:10px;border-radius:6px;border:1px solid #e5eaf1">` : ''}
    <div class="qa-foot">Page 4 of 4</div>
  </div>`;
}

function pagesHtml(q) {
  const total = ITEMS.reduce((s, it) => s + it[1] * it[2], 0);
  const foot = n => `<div class="qa-foot">Page ${n} of ${q.proof ? 4 : 3}</div>`;;
  return [
    `<div class="qa-page">
      <div class="qa-brand">BEYONDWIRES</div>
      <h4>Quotation ${q.id}</h4>
      <div class="qa-row"><span>Date</span><b>${fmt(q.date)}</b></div>
      <div class="qa-row"><span>Prepared for</span><b>Juan Dela Cruz</b></div>
      <p>Scope of work: supply and installation of CCTV and related accessories, including testing and commissioning.</p>
      ${foot(1)}
    </div>`,
    `<div class="qa-page">
      <h4>List of Accessories</h4>
      ${ITEMS.map(it => `<div class="qa-row"><span>${it[0]} x ${it[1]}</span><b>${peso(it[1] * it[2])}</b></div>`).join('')}
      ${foot(2)}
    </div>`,
    `<div class="qa-page">
      <h4>Terms and Total</h4>
      <div class="qa-row total"><span>Total</span><span>${peso(total)}</span></div>
      <p>This quotation is valid for 15 days from the date above. Installation starts after approval and payment.</p>
      ${foot(3)}
    </div>`
  ].concat(q.proof ? [detailsPage(q)] : []).join('');
}

/* Approve / Reject only work while the quotation is still Pending */
function paintActions() {
  const pending = current.status === 'Pending';
  $('qaApprove').disabled = !pending;
  $('qaReject').disabled = !pending;
  const res = $('qaResult');
  res.hidden = pending;
  res.className = 'qa-result ' + current.status.toLowerCase();
  res.textContent = pending ? '' : `${current.id} is ${current.status.toLowerCase()}.`;
}

/* Approve -> Step 2, Reject -> declined card.
   The flow itself lives in the Payment Flow script (end of HomePage.js). */
$('qaApprove').addEventListener('click', () => {
  if (!current || current.status !== 'Pending') return;
  document.dispatchEvent(new CustomEvent('quo:approve', { detail: current }));
});

$('qaReject').addEventListener('click', () => {
  if (!current || current.status !== 'Pending') return;
  document.dispatchEvent(new CustomEvent('quo:reject', { detail: current }));
});

/* Download: uses q.file if you add one to a quotation, otherwise builds a summary PDF */
$('qaDownload').addEventListener('click', () => {
  if (!current) return;
  const a = document.createElement('a');
  let url = '';
  if (current.file) {
    a.href = current.file;
  } else {
    const blob = window.bwBuildPdf('BeyondWires - Quotation ' + current.id, [
      'Quotation ID: ' + current.id, 'Date: ' + fmt(current.date),
      'Status: ' + current.status, 'Payment: ' + current.payment
    ]);
    url = URL.createObjectURL(blob);
    a.href = url;
  }
  a.download = current.id + '.pdf';
  document.body.appendChild(a); a.click(); a.remove();
  if (url) setTimeout(() => URL.revokeObjectURL(url), 1000);
});

/* Mouse wheel scrolls the files sideways (until the first or last page is reached) */
$('qaDocs').addEventListener('wheel', e => {
  const el = e.currentTarget;
  if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
  const max = el.scrollWidth - el.clientWidth;
  if ((e.deltaY > 0 && el.scrollLeft >= max) || (e.deltaY < 0 && el.scrollLeft <= 0)) return;
  e.preventDefault();
  el.scrollLeft += e.deltaY;
}, { passive: false });

body.addEventListener('click', e => {
  const btn = e.target.closest('.inq-view');
  if (!btn) return;
  const q = quotations.find(x => x.id === btn.dataset.id);
  if (!q) return;
  current = q;
  $('qaDocs').innerHTML = pagesHtml(q);
  $('qaDocs').scrollLeft = 0;
  paintActions();
  document.querySelectorAll('.section-view').forEach(v => v.classList.toggle('active', v.id === 'quotation-view'));
  const content = document.querySelector('.content');
  if (content) content.scrollTop = 0;
});

window.bwQuo = {
  render,
  repaint: paintActions,
  total: () => ITEMS.reduce((s, it) => s + it[1] * it[2], 0),
  add() {
    const t = new Date();
    const iso = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`;
    const next = Math.max(...quotations.map(x => parseInt(x.id.split('-')[2], 10))) + 1;
    const n = { id:`QUO-${t.getFullYear()}-${String(next).padStart(3,'0')}`, date:iso, status:'Pending', payment:'Pending' };
    quotations.unshift(n);
    state.search = ''; state.status = 'all'; state.from = state.to = ''; state.page = 1;
    searchEl.value = ''; statusEl.value = 'all'; fromEl.value = toEl.value = '';
    updateDateLabel(); render();
    return n;
  }
};
  render();
})();

/* ===== Documents ===== */
(function () {
  const documents = [
    { id:'DOC-001', title:'Quotation - CCTV Installation',     type:'Quotation',   date:'2026-01-14', status:'Approved'  },
    { id:'DOC-002', title:'Receipt - Payment #1042',           type:'Receipt',     date:'2026-01-12', status:'Completed' },
    { id:'DOC-003', title:'Installation Certificate - Warehouse', type:'Certificate', date:'2026-01-10', status:'Completed' },
    { id:'DOC-004', title:'Service Agreement Contract - 2026', type:'Contract',    date:'2026-01-05', status:'Approved'  },
    { id:'DOC-005', title:'Quotation - Perimeter Fence',       type:'Quotation',   date:'2026-01-02', status:'Pending'   },
    { id:'DOC-006', title:'Annual Fire Security Warranty',     type:'Certificate', date:'2025-12-20', status:'Completed' }
  ];

  const state = { search:'', type:'all', view:'grid' };

  const $ = id => document.getElementById(id);
  const grid = $('docGrid'), emptyEl = $('docEmpty');
  const searchEl = $('docSearch'), typeEl = $('docType');
  const tabs = [...document.querySelectorAll('#docTabs .doc-tab')];
  const gridBtn = $('docGridBtn'), listBtn = $('docListBtn');
  const viewModal = $('docViewModal');
  let currentDoc = null;

  const slug = s => s.toLowerCase().replace(/\s+/g, '-');
  const fmt = iso => {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-US', { month:'short', day:'2-digit', year:'numeric' });
  };

  const ICON_DOC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4M10 13h5M10 17h5"/></svg>';
  const ICON_AWARD = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="9" r="5"/><path d="m9 13-1 8 4-2 4 2-1-8"/></svg>';
  const ICON_DL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 4v11m0 0-4-4m4 4 4-4M5 20h14"/></svg>';

  function getFiltered() {
    const q = state.search.trim().toLowerCase();
    return documents.filter(d => {
      if (state.type !== 'all' && d.type !== state.type) return false;
      if (q && ![d.title, d.type, fmt(d.date), d.status].join(' ').toLowerCase().includes(q)) return false;
      return true;
    });
  }

  function render() {
    const list = getFiltered();
    grid.className = 'doc-grid' + (state.view === 'list' ? ' list' : '');
    emptyEl.style.display = list.length ? 'none' : 'block';

    grid.innerHTML = list.map(d => `
      <div class="doc-card">
        <div class="doc-top">
          <span class="doc-icon ${slug(d.type)}">${d.type === 'Certificate' ? ICON_AWARD : ICON_DOC}</span>
          <span class="pill ${slug(d.status)}">${d.status}</span>
        </div>
        <div class="doc-info">
          <div class="doc-kind">${d.type}</div>
          <div class="doc-title">${d.title}</div>
          <div class="doc-date">${fmt(d.date)}</div>
        </div>
        <div class="doc-actions">
          <button type="button" class="doc-btn-view" data-act="view" data-id="${d.id}">View</button>
          <button type="button" class="doc-btn-pdf" data-act="pdf" data-id="${d.id}">${ICON_DL} PDF</button>
        </div>
      </div>`).join('');
  }

  /* Search */
  searchEl.addEventListener('input', () => { state.search = searchEl.value; render(); });

  /* All Types dropdown and sub-tabs stay in sync */
  function setType(type) {
    state.type = type;
    typeEl.value = type;
    tabs.forEach(t => t.classList.toggle('active', t.dataset.type === type));
    render();
  }
  typeEl.addEventListener('change', () => setType(typeEl.value));
  tabs.forEach(t => t.addEventListener('click', () => setType(t.dataset.type)));

  /* Grid / list toggle */
  function setView(view) {
    state.view = view;
    gridBtn.classList.toggle('active', view === 'grid');
    listBtn.classList.toggle('active', view === 'list');
    render();
  }
  gridBtn.addEventListener('click', () => setView('grid'));
  listBtn.addEventListener('click', () => setView('list'));

  /* Banner */
  $('docBannerClose').addEventListener('click', () => { $('docBanner').hidden = true; });

  /* PDF download: builds a simple one-page PDF in the browser */
  function buildPdf(title, lines) {
    const clean = s => String(s).replace(/[^\x20-\x7E]/g, '-').replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
    let content = `BT /F1 18 Tf 72 730 Td (${clean(title)}) Tj ET\n`;
    let y = 690;
    lines.forEach(l => { content += `BT /F1 12 Tf 72 ${y} Td (${clean(l)}) Tj ET\n`; y -= 22; });

    const objs = [
      '<< /Type /Catalog /Pages 2 0 R >>',
      '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
      '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
      `<< /Length ${content.length} >>\nstream\n${content}endstream`,
      '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'
    ];
    let pdf = '%PDF-1.4\n';
    const offsets = [];
    objs.forEach((o, i) => { offsets.push(pdf.length); pdf += `${i + 1} 0 obj\n${o}\nendobj\n`; });
    const xref = pdf.length;
    pdf += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n` +
           offsets.map(o => String(o).padStart(10, '0') + ' 00000 n \n').join('') +
           `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
    return new Blob([pdf], { type:'application/pdf' });
  }

  window.bwBuildPdf = buildPdf;

  function downloadPdf(d) {
    const blob = buildPdf('BeyondWires - ' + d.title, [
      'Document ID: ' + d.id,
      'Type: ' + d.type,
      'Date: ' + fmt(d.date),
      'Status: ' + d.status
    ]);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = d.title.replace(/[^\w\-]+/g, '_') + '.pdf';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  /* View modal */
  const openModal = () => { viewModal.classList.add('show'); viewModal.setAttribute('aria-hidden', 'false'); };
  const closeModal = () => { viewModal.classList.remove('show'); viewModal.setAttribute('aria-hidden', 'true'); };
  viewModal.addEventListener('click', e => { if (e.target === viewModal || e.target.hasAttribute('data-close')) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
  $('dvDownload').addEventListener('click', () => { if (currentDoc) downloadPdf(currentDoc); });

  /* View + PDF buttons on each card */
  grid.addEventListener('click', e => {
    const btn = e.target.closest('button[data-act]');
    if (!btn) return;
    const d = documents.find(x => x.id === btn.dataset.id);
    if (!d) return;
    if (btn.dataset.act === 'pdf') { downloadPdf(d); return; }
    currentDoc = d;
    $('dvTitle').textContent = d.title;
    $('dvType').textContent = d.type;
    $('dvDate').textContent = fmt(d.date);
    $('dvStatus').textContent = d.status;
    openModal();
  });

  render();
})();

/* ===== Service Inquiry form ===== */
(function () {
  const $ = id => document.getElementById(id);
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const pad = n => String(n).padStart(2, '0');
  const toIso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const fmtDate = iso => {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-US', { month:'short', day:'2-digit', year:'numeric' });
  };
  const MAX_BLOCKS = 5;

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const form = $('siForm'), wrap = $('siBlocks'), errorEl = $('siError');
  let blocks = [];   // one entry per inquiry: { el, site, year, month, date, time, items, more }

  /* Sample catalog. If you edited names/prices earlier, paste your version here. */
  const CATALOG = {
    'Buying a Package': { label:'Package Selection', multi:false, items:[
      { name:'Starter Home Package', desc:'Essential setup for small homes with standard installation.', price:'\u20B112,500' },
      { name:'Premium Home Package', desc:'Advanced configuration with priority support and faster rollout.', price:'\u20B124,000' },
      { name:'Enterprise Package',   desc:'Customized solution with dedicated account management.', price:'Custom quote' }
    ]},
    'Buying a Service': { label:'Service Selection', multi:true, items:[
      { name:'CCTV Installation',  desc:'Camera mounting, cabling and configuration.', price:'\u20B13,500' },
      { name:'Alarm System Setup', desc:'Sensors, siren and control panel setup.', price:'\u20B14,000' },
      { name:'Network Cabling',    desc:'Structured cabling for cameras and devices.', price:'\u20B12,500' }
    ]},
    'Buying a Product': { label:'Product Selection', multi:true, items:[
      { name:'IP Camera',           desc:'Weatherproof HD network camera.', price:'\u20B14,200' },
      { name:'NVR Recorder (8-ch)', desc:'Network video recorder with storage bay.', price:'\u20B16,800' },
      { name:'Smoke Detector',      desc:'Photoelectric smoke detector.', price:'\u20B1950' }
    ]}
  };
  const COMBINED = {
    label:'Service & Product Selection', multi:true,
    items:[...CATALOG['Buying a Service'].items, ...CATALOG['Buying a Product'].items]
  };
  const getCat = opt => CATALOG[opt] || (opt ? COMBINED : null);   // Custom -> both lists

  /* Show a section without touching the existing openSection code */
  function show(name, navName) {
    document.querySelectorAll('.section-view').forEach(v => v.classList.toggle('active', v.id === name));
    document.querySelectorAll('.nav-item[data-section]').forEach(n => {
      const on = n.dataset.section === navName;
      n.classList.toggle('active', on);
      if (on) n.setAttribute('aria-current', 'page'); else n.removeAttribute('aria-current');
    });
    history.replaceState(null, '', '#' + name);
    const content = document.querySelector('.content');
    if (content) content.scrollTop = 0;
  }

  /* Sample availability rule: past days and Sundays are unavailable, every 6th day is limited. */
  function availability(d) {
    if (d < today || d.getDay() === 0) return 'unavailable';
    return d.getDate() % 6 === 0 ? 'limited' : 'available';
  }

  function setError(msg) { errorEl.textContent = msg || ''; errorEl.hidden = !msg; }

  /* ---------- one inquiry block ---------- */
  function blockHtml(n) {
    return `
    <div class="si-block">
      ${n > 1 ? `<div class="si-block-title">Inquiry ${n}</div>` : ''}
      <label class="si-field">Address
        <input type="text" class="b-address" placeholder="Enter your full installation address">
      </label>
      <label class="si-field">Type of Place
        <select class="b-place">
          <option value="" selected disabled>Select type...</option>
          <option>Residential</option>
          <option>Commercial</option>
        </select>
      </label>
      <label class="si-field">Customer Purchase Options
        <select class="b-option">
          <option value="" selected disabled>Select option...</option>
          <option>Buying a Package</option>
          <option>Buying a Service</option>
          <option>Buying a Product</option>
          <option>Custom</option>
        </select>
      </label>

      <div class="si-field">Would you like a site visit?
        <div class="si-toggle">
          <button type="button" class="b-yes" data-site="Yes">Yes</button>
          <button type="button" class="b-no" data-site="No">No</button>
        </div>
      </div>

      <div class="si-schedule b-schedule" hidden>
        <div class="si-sched-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 10h16"/></svg>
          Select Preferred Schedule
        </div>
        <div class="si-cal">
          <div class="si-cal-head">
            <button type="button" class="b-prev" aria-label="Previous month">&lsaquo;</button>
            <b class="b-month"></b>
            <button type="button" class="b-next" aria-label="Next month">&rsaquo;</button>
          </div>
          <div class="si-days b-days"></div>
          <div class="si-legend">
            <span><i style="background:var(--blue)"></i>Available</span>
            <span><i style="background:var(--orange)"></i>Limited Slots</span>
            <span><i style="background:#b5bfcd"></i>Unavailable</span>
          </div>
        </div>
        <div class="si-label">Available Time Slots</div>
        <div class="si-slots b-slots">
          <button type="button" data-time="9:00 AM">9:00 AM</button>
          <button type="button" data-time="10:30 AM">10:30 AM</button>
          <button type="button" data-time="1:00 PM">1:00 PM</button>
          <button type="button" data-time="3:30 PM">3:30 PM</button>
        </div>
      </div>

      <div class="si-novisit b-novisit" hidden>
        <div class="si-label b-catalog-label">Selection</div>
        <div class="si-packages b-catalog"></div>
        <label class="si-field">Budget Range
          <select class="b-budget">
            <option value="" selected disabled>Select budget range...</option>
            <option>\u20B110,000 - \u20B125,000</option>
            <option>\u20B125,000 - \u20B150,000</option>
            <option>\u20B150,000 - \u20B1100,000</option>
            <option>\u20B1100,000 and above</option>
            <option value="custom">Custom amount</option>
          </select>
        </label>
        <label class="si-field b-budget-custom-wrap" hidden>Custom Budget (\u20B1)
          <input type="number" class="b-budget-custom" min="1" step="1" placeholder="Enter your budget">
        </label>
      </div>

      <div class="si-field">Add more Inquiry
        <div class="si-toggle">
          <button type="button" class="b-more-yes" data-more="Yes">Yes</button>
          <button type="button" class="b-more-no" data-more="No">No</button>
        </div>
      </div>
    </div>`;
  }

  function newBlock() {
    const holder = document.createElement('div');
    holder.innerHTML = blockHtml(blocks.length + 1).trim();
    const el = holder.firstElementChild;
    wrap.appendChild(el);
    const b = { el, site:'', year:today.getFullYear(), month:today.getMonth(), date:'', time:'', items:[], more:'' };    blocks.push(b);
    renderCalendar(b);
    renderCatalog(b);
    return b;
  }

  function renderCalendar(b) {
    const q = s => b.el.querySelector(s);
    q('.b-month').textContent = `${MONTHS[b.month]} ${b.year}`;
    q('.b-prev').disabled = b.year === today.getFullYear() && b.month === today.getMonth();

    const firstDow = new Date(b.year, b.month, 1).getDay();
    const daysInMonth = new Date(b.year, b.month + 1, 0).getDate();
    let html = ['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => `<span class="si-dow">${d}</span>`).join('');
    for (let i = 0; i < firstDow; i++) html += '<span></span>';
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(b.year, b.month, day);
      const a = availability(d);
      const iso = toIso(d);
      html += `<button type="button" class="si-day ${a}${iso === b.date ? ' selected' : ''}" data-iso="${iso}" ${a === 'unavailable' ? 'disabled' : ''}>${day}</button>`;
    }
    q('.b-days').innerHTML = html;
  }

  function renderCatalog(b) {
    const cat = getCat(b.el.querySelector('.b-option').value);
    b.el.querySelector('.b-catalog-label').textContent = cat ? cat.label : 'Selection';
    b.el.querySelector('.b-catalog').innerHTML = cat
      ? cat.items.map(it => `
        <button type="button" class="si-pkg${b.items.includes(it.name) ? ' selected' : ''}" data-name="${it.name}">
          <span class="si-pkg-mark ${cat.multi ? 'check' : 'radio'}"></span>
          <span class="si-pkg-info"><b>${it.name}</b><small>${it.desc}</small></span>
          <span class="si-pkg-price">${it.price}</span>
        </button>`).join('')
      : '<p class="si-hint">Choose a purchase option above to see what is available.</p>';
  }

  function setSite(b, v) {
    b.site = v;
    b.el.querySelector('.b-yes').classList.toggle('active', v === 'Yes');
    b.el.querySelector('.b-no').classList.toggle('active', v === 'No');
    b.el.querySelector('.b-schedule').hidden = v !== 'Yes';
    b.el.querySelector('.b-novisit').hidden = v !== 'No';
    if (v === 'No') renderCatalog(b);
  }

  function paintMore(b) {
    b.el.querySelector('.b-more-yes').classList.toggle('active', b.more === 'Yes');
    b.el.querySelector('.b-more-no').classList.toggle('active', b.more === 'No');
  }

  /* Yes adds another inquiry block below; No removes every block after this one */
  function setMore(b, v) {
    const idx = blocks.indexOf(b);
    if (v === 'Yes') {
      if (idx === blocks.length - 1 && blocks.length >= MAX_BLOCKS) {
        return setError(`You can add up to ${MAX_BLOCKS} inquiries in one submission.`);
      }
      b.more = 'Yes'; paintMore(b);
      if (idx === blocks.length - 1) newBlock().el.scrollIntoView({ behavior:'smooth', block:'start' });
    } else {
      b.more = 'No'; paintMore(b);
      blocks.splice(idx + 1).forEach(x => x.el.remove());
    }
  }

  /* ---------- events (delegated, so they work for every block) ---------- */
  const blockOf = target => {
    const el = target.closest('.si-block');
    return el ? blocks.find(x => x.el === el) : null;
  };

  wrap.addEventListener('click', e => {
    const b = blockOf(e.target);
    if (!b) return;
    setError('');

    const siteBtn = e.target.closest('[data-site]');
    if (siteBtn) return setSite(b, siteBtn.dataset.site);

    const moreBtn = e.target.closest('[data-more]');
    if (moreBtn) return setMore(b, moreBtn.dataset.more);

    if (e.target.closest('.b-prev')) {
      if (b.month === 0) { b.month = 11; b.year--; } else b.month--;
      return renderCalendar(b);
    }
    if (e.target.closest('.b-next')) {
      if (b.month === 11) { b.month = 0; b.year++; } else b.month++;
      return renderCalendar(b);
    }

    const day = e.target.closest('.si-day');
    if (day && !day.disabled) { b.date = day.dataset.iso; return renderCalendar(b); }

    const slot = e.target.closest('.b-slots button');
    if (slot) {
      b.time = slot.dataset.time;
      b.el.querySelectorAll('.b-slots button').forEach(x => x.classList.toggle('selected', x === slot));
      return;
    }

    const pkg = e.target.closest('.si-pkg');
    if (pkg) {
      const cat = getCat(b.el.querySelector('.b-option').value);
      if (!cat) return;
      const name = pkg.dataset.name;
      if (cat.multi) b.items = b.items.includes(name) ? b.items.filter(n => n !== name) : [...b.items, name];
      else b.items = [name];
      renderCatalog(b);
    }
  });

  wrap.addEventListener('change', e => {
    const b = blockOf(e.target);
    if (!b) return;
    setError('');
    if (e.target.matches('.b-option')) { b.items = []; renderCatalog(b); }
    if (e.target.matches('.b-budget')) {
      const custom = e.target.value === 'custom';
      b.el.querySelector('.b-budget-custom-wrap').hidden = !custom;
      if (custom) b.el.querySelector('.b-budget-custom').focus();
    }
  });

  /* ---------- validate + submit ---------- */
function validate(b) {
  const q = s => b.el.querySelector(s);
  const errs = [];
  if (!q('.b-address').value.trim()) errs.push('Please enter your installation address.');
  if (!q('.b-place').value) errs.push('Please select the type of place.');
  if (!q('.b-option').value) errs.push('Please select a purchase option.');
  if (!b.site) errs.push('Please choose whether you would like a site visit.');
  if (b.site === 'Yes') {
    if (!b.date) errs.push('Please select a preferred date.');
    if (!b.time) errs.push('Please select a preferred time slot.');
  }
  if (b.site === 'No') {
    if (!b.items.length) errs.push('Please select at least one item from the list.');
    const budget = q('.b-budget').value;
    if (!budget) errs.push('Please select a budget range.');
    else if (budget === 'custom' && !(Number(q('.b-budget-custom').value) > 0)) errs.push('Please enter a valid custom budget.');
  }
  return errs;
}

  function describe(b, i) {
    const q = s => b.el.querySelector(s);
    const parts = [`Address: ${q('.b-address').value.trim()}`, `Place: ${q('.b-place').value}`, `Purchase: ${q('.b-option').value}`];
    if (b.site === 'Yes') {
      parts.push(`Preferred visit: ${fmtDate(b.date)}, ${b.time}`);
    } else {
      const budget = q('.b-budget').value === 'custom'
        ? '\u20B1' + Number(q('.b-budget-custom').value).toLocaleString('en-US')
        : q('.b-budget').value;
      parts.push(`Selected: ${b.items.join(', ')}`, `Budget: ${budget}`);
    }
    return (blocks.length > 1 ? `#${i + 1} ` : '') + parts.join(' | ');
  }

  /* Structured copy of one inquiry block, used by the View popup */
function collect(b) {
  const q = s => b.el.querySelector(s);
  const budget = q('.b-budget').value === 'custom'
    ? '\u20B1' + Number(q('.b-budget-custom').value).toLocaleString('en-US')
    : q('.b-budget').value;
  return {
    address: q('.b-address').value.trim(),
    place: q('.b-place').value,
    option: q('.b-option').value,
    site: b.site,
    visit: b.site === 'Yes' ? `${fmtDate(b.date)} \u2022 ${b.time}` : '',
    items: b.site === 'No' ? [...b.items] : [],
    budget: b.site === 'No' ? budget : ''
  };
}

  function resetForm() {
    form.reset();
    wrap.innerHTML = '';
    blocks = [];
    newBlock();
    setError('');
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    const all = [];
    blocks.forEach((b, i) => {
      const errs = validate(b);
      if (!errs.length) return;
      if (blocks.length > 1) all.push(`Inquiry ${i + 1}:`);
      errs.forEach(m => all.push('\u2022 ' + m));
    });
    if (all.length) return setError(all.join('\n'));

    /* All blocks go in as ONE inquiry; each block's details are listed in its Notes */
    const typeMap = { 'Buying a Package':'Package', 'Buying a Service':'Service', 'Buying a Product':'Product' };
    const types = blocks.map(b => typeMap[b.el.querySelector('.b-option').value] || 'Custom');
    $('nType').value = new Set(types).size === 1 ? types[0] : 'Custom';
    $('nSite').value = blocks.some(b => b.site === 'Yes') ? 'Yes' : 'No';
    $('nNotes').value = blocks.map(describe).join('\n');
    const ro = form.querySelectorAll('input[readonly]');
    window.__inqDetails = {
    name: ro[0] ? ro[0].value : '',
    email: ro[1] ? ro[1].value : '',
    blocks: blocks.map(collect)
};
    $('inqNewForm').requestSubmit();

    resetForm();
    show('inquiries', 'inquiries');
  });

  /* Send both buttons to this form instead of the old page/modal.
     Capture phase runs first, so the old handlers never fire. */
  document.addEventListener('click', e => {
    if (!e.target.closest('#inquireBtn, #newInquiryBtn')) return;
    e.stopPropagation();
    document.querySelectorAll('.dropdown-panel.show,.dropdown-card.show,.inq-date-pop.show')
      .forEach(el => el.classList.remove('show'));
    resetForm();
    show('service-inquiry', 'dashboard');
  }, true);

  resetForm();
})();

/* ===== Global search bar ===== */
(function () {
  const input = document.getElementById('globalSearch');
  const targets = [
    { section:'inquiries',  input:'inqSearch', hasResults:() => !document.querySelector('#inqBody .inq-empty') },
    { section:'quotations', input:'quoSearch', hasResults:() => !document.querySelector('#quoBody .inq-empty') },
    { section:'documents',  input:'docSearch', hasResults:() => document.getElementById('docEmpty').style.display === 'none' }
  ];

  input.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    const q = input.value.trim();
    targets.forEach(t => {
      const el = document.getElementById(t.input);
      el.value = q;
      el.dispatchEvent(new Event('input', { bubbles:true }));
    });
    const hit = targets.find(t => t.hasResults()) || targets[0];
    document.querySelector(`.nav-item[data-section="${hit.section}"]`).click();
  });
})();

/* ===== Quotation Payment Flow (steps 2 & 3 + declined card) ===== */
(function () {
  const $ = id => document.getElementById(id);
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const pad = n => String(n).padStart(2, '0');
  const toIso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const fmtDate = iso => {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-US', { month:'short', day:'2-digit', year:'numeric' });
  };
  const peso = n => '\u20B1' + n.toLocaleString('en-US', { minimumFractionDigits:2, maximumFractionDigits:2 });
  const today = new Date(); today.setHours(0, 0, 0, 0);

  /* Replace img with your real QR image paths, e.g. img:'../IMG/gcash-qr.png' */
  const CHANNELS = [
    { name:'GCash',      acct:'BeyondWires Inc. \u2022 0917 000 0000', img:'' },
    { name:'Maya',       acct:'BeyondWires Inc. \u2022 0918 000 0000', img:'' },
    { name:'BPI Online', acct:'BeyondWires Inc. \u2022 1234-5678-90',  img:'' },
    { name:'UnionBank',  acct:'BeyondWires Inc. \u2022 0987-6543-21',  img:'' }
  ];

  let q = null;           // quotation currently going through the flow
  let plan = null;        // step 2 answers, saved to the quotation only after step 3
  let channelIdx = 0;
  let proofFile = null, proofData = '';
  const s = { year:today.getFullYear(), month:today.getMonth(), date:'', time:'' };

  /* Same availability rule as the site-inspection calendar */
  function availability(d) {
    if (d < today || d.getDay() === 0) return 'unavailable';
    return d.getDate() % 6 === 0 ? 'limited' : 'available';
  }

  function go(name) {
    document.querySelectorAll('.section-view').forEach(v => v.classList.toggle('active', v.id === name));
    document.querySelectorAll('.nav-item[data-section]').forEach(n => {
      const on = n.dataset.section === 'quotations';
      n.classList.toggle('active', on);
      if (on) n.setAttribute('aria-current', 'page'); else n.removeAttribute('aria-current');
    });
    history.replaceState(null, '', '#' + name);
    const c = document.querySelector('.content'); if (c) c.scrollTop = 0;
  }
  function toast(msg) {
    const t = $('qpToast'); t.textContent = msg; t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2800);
  }
  function setErr(el, msg) { el.textContent = msg || ''; el.hidden = !msg; }

  /* ---------- Declined card ---------- */
  const decl = $('quoDeclineModal');
  const openDecl = () => { decl.classList.add('show'); decl.setAttribute('aria-hidden', 'false'); };
  const closeDecl = () => { decl.classList.remove('show'); decl.setAttribute('aria-hidden', 'true'); };
  decl.addEventListener('click', e => { if (e.target === decl) closeDecl(); });   // click outside = nothing changes
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDecl(); });

  document.addEventListener('quo:reject', e => { q = e.detail; openDecl(); });

  $('qdRequest').addEventListener('click', () => {
    if (!q) return;
    q.status = 'Declined'; q.payment = 'Declined';
    closeDecl();
    const n = window.bwQuo.add();            // new Pending quotation at the top of the list
    go('quotations');
    toast(`New quotation ${n.id} requested`);
  });
  $('qdCancel').addEventListener('click', () => {
    if (!q) return;
    q.status = 'Declined'; q.payment = 'Declined'; q.cancelled = true;
    closeDecl(); window.bwQuo.render();
    go('quotations');
    toast(`Negotiation for ${q.id} cancelled`);
  });

  /* ---------- Step 2 ---------- */
  document.addEventListener('quo:approve', e => {
    q = e.detail; plan = null;
    s.year = today.getFullYear(); s.month = today.getMonth(); s.date = ''; s.time = '';
    $('qpForm').reset();
    $('qpSlots').querySelectorAll('button').forEach(b => b.classList.remove('selected'));
    setErr($('qpError'), '');
    renderCal();
    go('quotation-schedule');
  });

  function renderCal() {
    $('qpMonth').textContent = `${MONTHS[s.month]} ${s.year}`;
    $('qpPrev').disabled = s.year === today.getFullYear() && s.month === today.getMonth();
    const firstDow = new Date(s.year, s.month, 1).getDay();
    const dim = new Date(s.year, s.month + 1, 0).getDate();
    let html = ['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => `<span class="si-dow">${d}</span>`).join('');
    for (let i = 0; i < firstDow; i++) html += '<span></span>';
    for (let day = 1; day <= dim; day++) {
      const d = new Date(s.year, s.month, day), a = availability(d), iso = toIso(d);
      html += `<button type="button" class="si-day ${a}${iso === s.date ? ' selected' : ''}" data-iso="${iso}" ${a === 'unavailable' ? 'disabled' : ''}>${day}</button>`;
    }
    $('qpDays').innerHTML = html;
  }
  $('qpPrev').addEventListener('click', () => { if (s.month === 0) { s.month = 11; s.year--; } else s.month--; renderCal(); });
  $('qpNext').addEventListener('click', () => { if (s.month === 11) { s.month = 0; s.year++; } else s.month++; renderCal(); });
  $('qpDays').addEventListener('click', e => {
    const d = e.target.closest('.si-day');
    if (d && !d.disabled) { s.date = d.dataset.iso; setErr($('qpError'), ''); renderCal(); }
  });
  $('qpSlots').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    s.time = b.dataset.time; setErr($('qpError'), '');
    $('qpSlots').querySelectorAll('button').forEach(x => x.classList.toggle('selected', x === b));
  });

  $('qpBack').addEventListener('click', () => go('quotation-view'));

  $('qpForm').addEventListener('submit', e => {
    e.preventDefault();
    const errs = [];
    if (!s.date) errs.push('\u2022 Please select an installation date.');
    if (!s.time) errs.push('\u2022 Please select a time slot.');
    if (!$('qpAgreement').value) errs.push('\u2022 Please select a payment agreement.');
    if (!$('qpMethod').value) errs.push('\u2022 Please select a payment method.');
    if (errs.length) return setErr($('qpError'), errs.join('\n'));
    plan = { date:s.date, time:s.time, agreement:$('qpAgreement').value, method:$('qpMethod').value };
    preparePayment();
    go('quotation-payment');
  });

  /* ---------- Step 3 ---------- */
  function qrSvg(seed) {   // placeholder QR, replaced by CHANNELS[i].img when provided
    const N = 25; let x = seed * 9301 + 49297;
    const rnd = () => { x = (x * 9301 + 49297) % 233280; return x / 233280; };
    const inF = (i, j) => (i < 8 && j < 8) || (i >= N - 8 && j < 8) || (i < 8 && j >= N - 8);
    const finder = (ox, oy) => `<rect x="${ox}" y="${oy}" width="7" height="7"/><rect x="${ox+1}" y="${oy+1}" width="5" height="5" fill="#fff"/><rect x="${ox+2}" y="${oy+2}" width="3" height="3"/>`;
    let r = '';
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) if (!inF(i, j) && rnd() > .52) r += `<rect x="${i}" y="${j}" width="1" height="1"/>`;
    return `<svg class="qr-img" viewBox="-1 -1 27 27" shape-rendering="crispEdges" fill="#0d2143">${r}${finder(0,0)}${finder(N-7,0)}${finder(0,N-7)}</svg>`;
  }

  const strip = $('qpQrStrip');
  function buildQr() {
    strip.innerHTML = CHANNELS.map((c, i) => `
      <div class="qp-qr">
        ${c.img ? `<img class="qr-img" src="${c.img}" alt="${c.name} QR">` : qrSvg(i + 3)}
        <b>${c.name}</b><small>${c.acct}</small>
      </div>`).join('');
    $('qpDots').innerHTML = CHANNELS.map((_, i) => `<i class="${i === 0 ? 'on' : ''}"></i>`).join('');
    strip.scrollLeft = 0; channelIdx = 0;
  }
  strip.addEventListener('scroll', () => {
    const i = Math.round(strip.scrollLeft / (strip.clientWidth + 12));
    if (i === channelIdx) return;
    channelIdx = Math.min(Math.max(i, 0), CHANNELS.length - 1);
    $('qpDots').querySelectorAll('i').forEach((d, n) => d.classList.toggle('on', n === channelIdx));
    updateMethodView();
  });
  const step = dir => strip.scrollBy({ left: dir * (strip.clientWidth + 12), behavior:'smooth' });
  $('qpQrPrev').addEventListener('click', () => step(-1));
  $('qpQrNext').addEventListener('click', () => step(1));
  strip.addEventListener('wheel', e => {      // mouse wheel scrolls the QR list sideways
    if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
    e.preventDefault(); strip.scrollLeft += e.deltaY;
  }, { passive:false });

  const isOnline = () => plan && plan.method === 'Online Payment';
  function updateMethodView() {
    $('qpMethodView').value = isOnline() ? `Online Payment \u2022 ${CHANNELS[channelIdx].name}` : 'Over the counter';
  }
  function amountDue() {
    const total = window.bwQuo.total();
    return plan.agreement.startsWith('Half') ? total / 2 : total;
  }

  function preparePayment() {
    const total = window.bwQuo.total(), due = amountDue();
    $('qpAmount').textContent = peso(due);
    $('qpAgreeNote').textContent = due < total
      ? `50% of ${peso(total)}. Balance of ${peso(total - due)} is due after installation.`
      : `Full payment of ${peso(total)}.`;
    $('qpOnline').hidden = !isOnline();
    $('qpOtc').hidden = isOnline();
    if (isOnline()) buildQr();
    updateMethodView();
    clearProof();
    $('qpRef').value = ''; $('qpNote').value = ''; $('qpPayDate').value = '';
    $('qpPayDate').max = toIso(today);
    setErr($('qpProofError'), '');
  }

  /* ---------- Photo / proof upload ---------- */
  const fileEl = $('qpFile'), drop = $('qpDrop');
  function clearProof() {
    proofFile = null; proofData = ''; fileEl.value = '';
    $('qpPreview').hidden = true; $('qpDropIdle').hidden = false; $('qpThumb').hidden = true;
  }
  function setFile(f) {
    if (!f) return;
    const okType = f.type.startsWith('image/') || f.type === 'application/pdf';
    if (!okType) return setErr($('qpProofError'), 'Please upload a JPG, PNG or PDF file.');
    if (f.size > 5 * 1024 * 1024) return setErr($('qpProofError'), 'File is too large. Maximum size is 5MB.');
    setErr($('qpProofError'), '');
    proofFile = f; proofData = '';
    $('qpFileName').textContent = f.name;
    $('qpDropIdle').hidden = true; $('qpPreview').hidden = false;
    const thumb = $('qpThumb');
    if (f.type.startsWith('image/')) {
      const r = new FileReader();
      r.onload = () => { proofData = r.result; thumb.src = r.result; thumb.hidden = false; };
      r.readAsDataURL(f);
    } else thumb.hidden = true;
  }
  fileEl.addEventListener('change', () => setFile(fileEl.files[0]));
  $('qpRemove').addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); clearProof(); });
  ['dragenter','dragover'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('over'); }));
  ['dragleave','drop'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove('over'); }));
  drop.addEventListener('drop', e => setFile(e.dataTransfer.files[0]));

  /* ---------- Submit proof -> save into the quotation -> exit ---------- */
  $('qpProofForm').addEventListener('submit', e => {
    e.preventDefault();
    const errs = [];
    if (!proofFile) errs.push('\u2022 Please upload your proof of payment.');
    if (!$('qpRef').value.trim()) errs.push('\u2022 Please enter the reference number.');
    const pd = $('qpPayDate').value;
    if (!pd) errs.push('\u2022 Please select the payment date.');
    else if (pd > toIso(today)) errs.push('\u2022 Payment date cannot be in the future.');
    if (errs.length) return setErr($('qpProofError'), errs.join('\n'));

    q.schedule  = { date:plan.date, time:plan.time };
    q.agreement = plan.agreement;
    q.method    = isOnline() ? `Online Payment (${CHANNELS[channelIdx].name})` : 'Over the counter';
    q.proof = {
      name:proofFile.name, size:proofFile.size, type:proofFile.type, dataUrl:proofData,
      ref:$('qpRef').value.trim(), date:pd, note:$('qpNote').value.trim(), amount:amountDue()
    };
    q.status = 'Approved';
    q.payment = 'Submitted';

    window.bwQuo.render();
    const id = q.id;
    q = null; plan = null; clearProof();
    go('quotations');
    toast(`Payment proof for ${id} submitted`);
  });
})();

/* ===== System Settings ===== */
(function () {
  const $ = id => document.getElementById(id);
  const THEME_KEY = 'bw_theme', PROFILE_KEY = 'bw_profile', CONTACT_KEY = 'bw_contact';
  const load = (k, fb) => { try { const v = JSON.parse(localStorage.getItem(k)); return v || fb; } catch (e) { return fb; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const readText = sel => ((document.querySelector(sel) || {}).textContent || '').trim();

  /* ---------- Validation ---------- */
  // Names: letters and spaces only. Numbers and symbols are not allowed.
  const validName = v => /^[\p{L}]+(?:\s+[\p{L}]+)*$/u.test(v);

  // Gmail: 6-30 letters, numbers or periods; no leading/trailing/double periods; @gmail.com only.
  function validGmail(value) {
    const m = value.toLowerCase().match(/^([a-z0-9.]+)@gmail\.com$/);
    if (!m) return false;
    const u = m[1];
    if (u.length < 6 || u.length > 30) return false;
    if (u.startsWith('.') || u.endsWith('.')) return false;
    if (u.includes('..')) return false;
    return true;
  }
  const validEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);          // any email (contacts)
  const validRole  = v => /^\p{L}[\p{L}\s.\-/&]{1,49}$/u.test(v);           // letters, spaces, . - / &

  // PH mobile: +63 9XX XXX XXXX, 09XXXXXXXXX or 9XXXXXXXXX. Returns the formatted number, or null.
  function normPhone(v) {
    const m = v.replace(/[\s\-().]/g, '').match(/^(?:\+?63|0)?(9\d{9})$/);
    if (!m) return null;
    const n = m[1];
    return `+63 ${n.slice(0, 3)} ${n.slice(3, 6)} ${n.slice(6)}`;
  }

  /* ---------- Saved data ---------- */
  const profile = load(PROFILE_KEY, {
    name: readText('.profile-name'), email: readText('.user-email'), phone: '+63 917 824 6310'
  });
  const contact = load(CONTACT_KEY, {
    name: profile.name, role: 'Facilities Manager', email: profile.email, phone: profile.phone
  });
  let savedTheme = load(THEME_KEY, 'light');
  let selectedTheme = savedTheme;

  /* ---------- Helpers ---------- */
  let toastTimer;
  function toast(msg) {
    const t = $('stToast');
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
  }
  function setErr(id, msg) {
    $(id).closest('.st-input').classList.toggle('invalid', !!msg);
    $(id + 'Err').textContent = msg || '';
  }

  const dirty = new Set();
  function paintStatus() {
    const d = dirty.size > 0 || selectedTheme !== savedTheme;
    $('stStatus').classList.toggle('dirty', d);
    $('stStatusText').textContent = d ? 'Unsaved changes' : 'All settings up to date';
  }

  /* Push the saved profile into the top bar, account menu and welcome heading */
  function syncTopbar() {
    const parts = profile.name.split(/\s+/).filter(Boolean);
    const initials = ((parts[0] || '')[0] || '') + (parts.length > 1 ? parts[parts.length - 1][0] : '');
    const set = (sel, text) => { const el = document.querySelector(sel); if (el) el.textContent = text; };
    set('.avatar', initials.toUpperCase());
    set('.profile-name', profile.name);
    set('.user-name', profile.name);
    set('.user-email', profile.email);
    set('.welcome h1', `Welcome back, ${parts[0] || ''}!`);
  }

  function fillForms() {
    $('stFullName').value = profile.name;
    $('stEmail').value = profile.email;
    $('stPhone').value = profile.phone;
    $('stCName').value = contact.name;
    $('stCRole').value = contact.role;
    $('stCEmail').value = contact.email;
    $('stCPhone').value = contact.phone;
  }

  /* Typing clears that field's error and flags the form as unsaved */
  document.querySelectorAll('#settings .st-input input').forEach(inp => {
    inp.addEventListener('input', () => {
      setErr(inp.id, '');
      const form = inp.closest('form');
      if (form) dirty.add(form.id);
      paintStatus();
    });
  });

  /* ---------- Theme ---------- */
  function applyTheme(t) { document.documentElement.setAttribute('data-theme', t); }
  function paintTheme() {
    document.querySelectorAll('.st-theme').forEach(b => {
      const t = b.dataset.themeOpt;
      b.classList.toggle('selected', t === selectedTheme);
      b.classList.toggle('is-active', t === savedTheme);
      b.setAttribute('aria-pressed', String(t === selectedTheme));
    });
    paintStatus();
  }
  document.querySelectorAll('.st-theme').forEach(b => {
    b.addEventListener('click', () => { selectedTheme = b.dataset.themeOpt; paintTheme(); });
  });
  $('stSaveTheme').addEventListener('click', () => {
    savedTheme = selectedTheme;
    save(THEME_KEY, savedTheme);
    applyTheme(savedTheme);
    paintTheme();
    toast(`${savedTheme === 'dark' ? 'Dark' : 'Light'} mode applied`);
  });

  /* ---------- Account: personal information ---------- */
  $('stProfileForm').addEventListener('submit', e => {
    e.preventDefault();
    const name = $('stFullName').value.trim().replace(/\s+/g, ' ');
    const email = $('stEmail').value.trim().toLowerCase();
    const phone = normPhone($('stPhone').value.trim());
    let ok = true;

    if (!name) { setErr('stFullName', 'Please enter your full name.'); ok = false; }
    else if (!validName(name)) { setErr('stFullName', 'Full name can contain letters and spaces only.'); ok = false; }

    if (!validGmail(email)) {
      setErr('stEmail', 'Enter a valid Gmail address. Use 6\u201330 letters, numbers, or periods before @gmail.com.');
      ok = false;
    }
    if (!phone) { setErr('stPhone', 'Enter a valid PH mobile number, e.g. +63 917 824 6310.'); ok = false; }
    if (!ok) return;

    Object.assign(profile, { name, email, phone });
    save(PROFILE_KEY, profile);
    fillForms();
    syncTopbar();
    dirty.delete('stProfileForm'); paintStatus();
    toast('Account details updated');
  });

  /* ---------- Account: change password ---------- */
  const EYE_ON = '<svg viewBox="0 0 24 24"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>';
  const EYE_OFF = '<svg viewBox="0 0 24 24"><path d="M3 3l18 18"/><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8"/><path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.1 4.1"/><path d="M6.2 6.2C3.5 8 2 12 2 12s3.6 7 10 7c1.2 0 2.3-.2 3.3-.6"/></svg>';

  document.querySelectorAll('.st-eye').forEach(btn => {
    btn.innerHTML = EYE_ON;
    btn.addEventListener('click', () => {
      const input = $(btn.dataset.target);
      const reveal = input.type === 'password';
      input.type = reveal ? 'text' : 'password';
      btn.innerHTML = reveal ? EYE_OFF : EYE_ON;
      btn.setAttribute('aria-label', reveal ? 'Hide password' : 'Show password');
    });
  });

  $('stPwForm').addEventListener('submit', e => {
    e.preventDefault();
    const cur = $('stCurPw').value, nw = $('stNewPw').value, cf = $('stConfPw').value;
    let ok = true;

    // NOTE: the current password can only be truly verified by a server.
    if (!cur) { setErr('stCurPw', 'Please enter your current password.'); ok = false; }

    if (nw.length < 8 || !/\d/.test(nw)) { setErr('stNewPw', 'Use at least 8 characters and include a number.'); ok = false; }
    else if (nw === cur) { setErr('stNewPw', 'New password must be different from the current one.'); ok = false; }

    if (!cf) { setErr('stConfPw', 'Please confirm your new password.'); ok = false; }
    else if (cf !== nw) { setErr('stConfPw', 'Passwords do not match.'); ok = false; }
    if (!ok) return;

    $('stPwForm').reset();
    document.querySelectorAll('.st-eye').forEach(b => { $(b.dataset.target).type = 'password'; b.innerHTML = EYE_ON; });
    dirty.delete('stPwForm'); paintStatus();
    toast('Password changed successfully');
  });

  /* ---------- Contacts ---------- */
  $('stContactForm').addEventListener('submit', e => {
    e.preventDefault();
    const name = $('stCName').value.trim().replace(/\s+/g, ' ');
    const role = $('stCRole').value.trim().replace(/\s+/g, ' ');
    const email = $('stCEmail').value.trim().toLowerCase();
    const phone = normPhone($('stCPhone').value.trim());
    let ok = true;

    if (!name) { setErr('stCName', 'Please enter the contact name.'); ok = false; }
    else if (!validName(name)) { setErr('stCName', 'Contact name can contain letters and spaces only.'); ok = false; }

    if (!role) { setErr('stCRole', 'Please enter the role or position.'); ok = false; }
    else if (!validRole(role)) { setErr('stCRole', 'Role can contain letters, spaces and . - / & only.'); ok = false; }

    if (!validEmail(email)) { setErr('stCEmail', 'Enter a valid email address.'); ok = false; }
    if (!phone) { setErr('stCPhone', 'Enter a valid PH mobile number, e.g. +63 917 824 6310.'); ok = false; }
    if (!ok) return;

    Object.assign(contact, { name, role, email, phone });
    save(CONTACT_KEY, contact);
    fillForms();
    dirty.delete('stContactForm'); paintStatus();
    toast('Primary contact saved');
  });

  /* ---------- Support + breadcrumb ---------- */
  $('stChat').addEventListener('click', () => toast('Live chat will be available soon. Please email or call us for now.'));
  $('stCrumbHome').addEventListener('click', e => {
    e.preventDefault();
    document.querySelector('.nav-item[data-section="dashboard"]').click();
  });

  /* ---------- Init ---------- */
  fillForms();
  syncTopbar();
  applyTheme(savedTheme);
  paintTheme();
})();
