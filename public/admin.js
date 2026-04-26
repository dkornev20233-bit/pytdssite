// ═══════════════════════════════════════
//  pyTDS Admin Panel — API version
// ═══════════════════════════════════════

const API = 'https://pytdssite-production-b100.up.railway.app/api';
let currentRejectId = null;

// ─── Init ───
window.addEventListener('DOMContentLoaded', async () => {
  // Check if already logged in as admin
  try {
    const res = await fetch(`${API}/admin/check`, { credentials: 'include' });
    const data = await res.json();
    if (data.ok) showPanel();
  } catch(e) {}

  document.getElementById('adminPass').addEventListener('keydown', e => {
    if (e.key === 'Enter') doAdminLogin();
  });
  document.getElementById('adminLogin').addEventListener('keydown', e => {
    if (e.key === 'Enter') doAdminLogin();
  });
});

// ─── Admin Login ───
async function doAdminLogin() {
  const username = document.getElementById('adminLogin').value.trim();
  const password = document.getElementById('adminPass').value;
  const err = document.getElementById('adminLoginError');
  if (!username || !password) { err.textContent = 'Enter login and password.'; return; }

  try {
    const res = await fetch(`${API}/admin/login`, {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      err.textContent = data.error;
      document.getElementById('adminLogin').value = '';
      document.getElementById('adminPass').value  = '';
      return;
    }
    showPanel();
  } catch(e) { err.textContent = 'Cannot connect to server. Is it running?'; }
}

async function doAdminLogout() {
  await fetch(`${API}/admin/logout`, { method: 'POST', credentials: 'include' });
  location.reload();
}

function showPanel() {
  document.getElementById('adminLoginOverlay').classList.add('hidden');
  document.getElementById('adminApp').classList.remove('hidden');
  refreshAll();
}

// ─── Tab switching ───
const TAB_TITLES = {
  pending:  ['Pending Runs',  'Runs waiting for review'],
  approved: ['Approved Runs', 'Verified runs on the leaderboard'],
  rejected: ['Rejected Runs', 'Runs that were denied'],
  users:    ['Users',         'All registered accounts'],
};
function switchTab(tab, btn) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'));
  document.querySelectorAll('.sidebar-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + tab).classList.remove('hidden');
  btn.classList.add('active');
  const [title, sub] = TAB_TITLES[tab];
  document.getElementById('tabTitle').textContent = title;
  document.getElementById('tabSub').textContent   = sub;
  refreshAll();
}

// ─── Refresh ───
function refreshAll() {
  renderStats();
  renderPending();
  renderApproved();
  renderRejected();
  renderUsers();
}

// ─── Stats ───
async function renderStats() {
  try {
    const res  = await fetch(`${API}/admin/stats`, { credentials: 'include' });
    const data = await res.json();
    document.getElementById('pendingCount').textContent = data.pending;
    document.getElementById('adminStats').innerHTML = `
      <div class="stat-pill"><strong>${data.pending}</strong> pending</div>
      <div class="stat-pill"><strong>${data.approved}</strong> approved</div>
      <div class="stat-pill"><strong>${data.rejected}</strong> rejected</div>
      <div class="stat-pill"><strong>${data.users}</strong> users</div>
    `;
  } catch(e) {}
}

// ─── Pending ───
async function renderPending() {
  try {
    const res  = await fetch(`${API}/admin/pending`, { credentials: 'include' });
    const runs = await res.json();
    const list  = document.getElementById('pendingList');
    const empty = document.getElementById('pendingEmpty');
    list.innerHTML = '';
    if (!runs.length) { empty.classList.remove('hidden'); return; }
    empty.classList.add('hidden');

    runs.forEach(run => {
      const card = document.createElement('div');
      card.className = 'run-card';
      card.id = 'card-' + run.id;
      card.innerHTML = `
        <div class="run-card-top">
          <div class="run-card-meta">
            <span class="run-card-user">👤 ${esc(run.username)}</span>
            <span class="run-card-cat">${esc(run.category)}</span>
            <span class="run-card-time">${esc(run.time)}</span>
            <span class="run-card-date">${esc(run.date)}</span>
          </div>
        </div>
        <div class="run-card-video-row">
          <span class="run-video-label">🎬 Video</span>
          <a href="${escAttr(run.video)}" class="run-video-url" target="_blank">${esc(run.video)}</a>
          <a href="${escAttr(run.video)}" class="run-video-open" target="_blank">Open ↗</a>
        </div>
        ${run.comment ? `<div class="run-card-comment">"${esc(run.comment)}"</div>` : ''}
        <div class="run-card-actions">
          <button class="action-approve" onclick="approveRun('${run.id}')">✓ Approve</button>
          <button class="action-reject"  onclick="openRejectModal('${run.id}')">✕ Reject</button>
          <button class="action-del"     onclick="deleteRun('${run.id}','pending')">🗑 Delete</button>
        </div>
      `;
      list.appendChild(card);
    });
  } catch(e) {}
}

// ─── Approve ───
async function approveRun(id) {
  const card = document.getElementById('card-' + id);
  if (card) {
    card.style.transition = 'all .3s';
    card.style.background = 'rgba(74,222,128,.08)';
    card.style.borderColor = 'rgba(74,222,128,.3)';
  }
  await fetch(`${API}/admin/approve/${id}`, { method: 'POST', credentials: 'include' });
  setTimeout(() => {
    if (card) { card.style.opacity = '0'; card.style.transform = 'translateX(20px)'; }
    setTimeout(() => refreshAll(), 350);
  }, 400);
}

// ─── Reject modal ───
function openRejectModal(id) {
  currentRejectId = id;
  document.getElementById('rejectReason').value = '';
  document.getElementById('rejectModal').classList.remove('hidden');
}
function closeRejectModal() {
  document.getElementById('rejectModal').classList.add('hidden');
  currentRejectId = null;
}
async function confirmReject() {
  if (!currentRejectId) return;
  const reason = document.getElementById('rejectReason').value.trim();
  const id = currentRejectId;
  closeRejectModal();

  const card = document.getElementById('card-' + id);
  if (card) {
    card.style.transition = 'all .3s';
    card.style.background = 'rgba(239,68,68,.06)';
    card.style.borderColor = 'rgba(239,68,68,.25)';
  }
  await fetch(`${API}/admin/reject/${id}`, {
    method: 'POST', credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason }),
  });
  setTimeout(() => {
    if (card) { card.style.opacity = '0'; }
    setTimeout(() => refreshAll(), 300);
  }, 400);
}

// ─── Delete ───
async function deleteRun(id, source) {
  if (!confirm('Delete this run permanently?')) return;
  const endpoint = source === 'approved'
    ? `${API}/admin/approved/${id}`
    : `${API}/admin/pending/${id}`;
  await fetch(endpoint, { method: 'DELETE', credentials: 'include' });
  refreshAll();
}

// ─── Demote approved → pending ───
async function demoteApproved(id) {
  await fetch(`${API}/admin/demote/${id}`, { method: 'POST', credentials: 'include' });
  refreshAll();
}

// ─── Restore rejected → pending ───
async function restoreRun(id) {
  await fetch(`${API}/admin/restore/${id}`, { method: 'POST', credentials: 'include' });
  refreshAll();
}

// ─── Approved table ───
async function renderApproved() {
  try {
    const res  = await fetch(`${API}/admin/approved`, { credentials: 'include' });
    const runs = await res.json();
    const tbody = document.getElementById('approvedBody');
    const empty = document.getElementById('approvedEmpty');
    tbody.innerHTML = '';
    if (!runs.length) { empty.classList.remove('hidden'); return; }
    empty.classList.add('hidden');
    runs.forEach((run, i) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${i + 1}</td>
        <td class="tbl-user">${esc(run.username)}</td>
        <td>${esc(run.category)}</td>
        <td class="tbl-time">${esc(run.time)}</td>
        <td>${esc(run.date)}</td>
        <td><a href="${escAttr(run.video)}" target="_blank" class="tbl-video">▶ Watch</a></td>
        <td>
          <div class="tbl-actions">
            <button class="tbl-btn tbl-btn-restore" onclick="demoteApproved('${run.id}')">↩ Re-review</button>
            <button class="tbl-btn tbl-btn-del" onclick="deleteRun('${run.id}','approved')">🗑</button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch(e) {}
}

// ─── Rejected table ───
async function renderRejected() {
  try {
    const res  = await fetch(`${API}/admin/rejected`, { credentials: 'include' });
    const runs = await res.json();
    const tbody = document.getElementById('rejectedBody');
    const empty = document.getElementById('rejectedEmpty');
    tbody.innerHTML = '';
    if (!runs.length) { empty.classList.remove('hidden'); return; }
    empty.classList.add('hidden');
    runs.forEach((run, i) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${i + 1}</td>
        <td class="tbl-user">${esc(run.username)}</td>
        <td>${esc(run.category)}</td>
        <td class="tbl-time">${esc(run.time)}</td>
        <td>${esc(run.date)}</td>
        <td class="tbl-reason">${esc(run.rejectReason || '—')}</td>
        <td>
          <div class="tbl-actions">
            <button class="tbl-btn tbl-btn-restore" onclick="restoreRun('${run.id}')">↩ Restore</button>
            <button class="tbl-btn tbl-btn-del" onclick="deleteRun('${run.id}','rejected')">🗑</button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch(e) {}
}

// ─── Users table ───
async function renderUsers() {
  try {
    const res   = await fetch(`${API}/admin/users`, { credentials: 'include' });
    const users = await res.json();
    const tbody = document.getElementById('usersBody');
    const empty = document.getElementById('usersEmpty');
    tbody.innerHTML = '';
    if (!users.length) { empty.classList.remove('hidden'); return; }
    empty.classList.add('hidden');
    users.forEach(u => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="tbl-user">${esc(u.username)}</td>
        <td>${u.approved + u.pending + u.rejected}</td>
        <td><span class="u-stat approved">${u.approved}</span></td>
        <td><span class="u-stat pending">${u.pending}</span></td>
        <td><span class="u-stat rejected">${u.rejected}</span></td>
        <td>
          <div class="tbl-actions">
            <button class="tbl-btn tbl-btn-del" onclick="deleteUser('${esc(u.username)}')">🗑 Delete user</button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch(e) {}
}

// ─── Delete user ───
async function deleteUser(username) {
  if (!confirm(`Delete user "${username}" and all their runs?`)) return;
  await fetch(`${API}/admin/users/${encodeURIComponent(username)}`, {
    method: 'DELETE', credentials: 'include'
  });
  refreshAll();
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeRejectModal(); });

function esc(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function escAttr(str) {
  return String(str).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
