// ═══════════════════════════════════════
//  pyTDS Speedrun — API version
// ═══════════════════════════════════════

const API = 'https://pytdssite-production-b100.up.railway.app/api';

// ─── Init ───
window.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch(`${API}/me`, { credentials: 'include' });
    if (res.ok) {
      const { username } = await res.json();
      showApp(username);
    }
  } catch (e) {
    console.warn('Server not reachable, running in offline mode');
  }
});

// ─── Panel switch ───
function switchPanel(to) {
  document.getElementById('panelLogin').classList.toggle('hidden', to !== 'login');
  document.getElementById('panelRegister').classList.toggle('hidden', to !== 'register');
  clearErrors();
}
function clearErrors() {
  ['loginError', 'regError', 'submitError'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.textContent = ''; el.style.color = '#f87171'; }
  });
}

// ─── Login ───
async function doLogin() {
  const username = document.getElementById('loginUser').value.trim();
  const password = document.getElementById('loginPass').value;
  const err = document.getElementById('loginError');
  if (!username || !password) { err.textContent = 'Fill in all fields.'; return; }

  try {
    const res = await fetch(`${API}/login`, {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) { err.textContent = data.error; return; }
    showApp(data.username);
  } catch (e) { err.textContent = 'Cannot connect to server. Is it running?'; }
}

// ─── Register ───
async function doRegister() {
  const username = document.getElementById('regUser').value.trim();
  const pass = document.getElementById('regPass').value;
  const pass2 = document.getElementById('regPass2').value;
  const err = document.getElementById('regError');
  if (!username || !pass || !pass2) { err.textContent = 'Fill in all fields.'; return; }
  if (pass !== pass2) { err.textContent = 'Passwords do not match.'; return; }

  try {
    const res = await fetch(`${API}/register`, {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password: pass }),
    });
    const data = await res.json();
    if (!res.ok) { err.textContent = data.error; return; }
    showApp(data.username);
  } catch (e) { err.textContent = 'Cannot connect to server. Is it running?'; }
}

// ─── Logout ───
async function doLogout() {
  await fetch(`${API}/logout`, { method: 'POST', credentials: 'include' });
  location.reload();
}

// ─── Show app ───
function showApp(username) {
  document.getElementById('authOverlay').classList.add('hidden');
  document.getElementById('srApp').classList.remove('hidden');
  document.getElementById('navUser').textContent = username;
  buildCategories();
  renderLeaderboard('All');
  renderPendingMine();
}

// ─── Rules modal ───
function openRules() {
  document.getElementById('rulesModal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}
function closeRules() {
  document.getElementById('rulesModal').classList.add('hidden');
  document.body.style.overflow = '';
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeRules(); });

// ─── Submit run ───
async function submitRun() {
  const category = document.getElementById('runCategory').value;
  const time = document.getElementById('runTime').value.trim();
  const video = document.getElementById('runVideo').value.trim();
  const comment = document.getElementById('runComment').value.trim();
  const err = document.getElementById('submitError');

  if (!time) { err.textContent = 'Enter your time.'; return; }
  if (!/^\d{1,3}:\d{2}$/.test(time)) { err.textContent = 'Time format must be mm:ss (e.g. 12:34).'; return; }
  const [m, s] = time.split(':').map(Number);
  if (s > 59) { err.textContent = 'Seconds must be 0–59.'; return; }
  if (!video || !video.startsWith('http')) { err.textContent = 'Enter a valid URL starting with http(s).'; return; }

  try {
    const res = await fetch(`${API}/runs/submit`, {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, time, video, comment }),
    });
    const data = await res.json();
    if (!res.ok) { err.textContent = data.error; return; }

    document.getElementById('runTime').value = '';
    document.getElementById('runVideo').value = '';
    document.getElementById('runComment').value = '';
    err.style.color = '#4ade80';
    err.textContent = '✓ Run submitted! Waiting for moderator review.';
    setTimeout(() => { err.textContent = ''; err.style.color = '#f87171'; }, 3500);
    renderPendingMine();
  } catch (e) { err.textContent = 'Cannot connect to server.'; }
}

// ─── My pending runs ───
async function renderPendingMine() {
  try {
    const res = await fetch(`${API}/runs/pending/mine`, { credentials: 'include' });
    if (!res.ok) return;
    const runs = await res.json();
    const section = document.getElementById('pendingSection');
    const list = document.getElementById('pendingList');
    if (!runs.length) { section.style.display = 'none'; return; }
    section.style.display = 'block';
    list.innerHTML = runs.map(r => `
      <div class="pending-item">
        <span class="pending-cat">${esc(r.category)}</span>
        <span class="pending-time">${esc(r.time)}</span>
        <a href="${escAttr(r.video)}" target="_blank" class="pending-video">▶ video</a>
        <span class="pending-date">${esc(r.date)}</span>
        <span class="status-badge pending">⏳ Pending review</span>
      </div>
    `).join('');
  } catch (e) { }
}

// ─── Categories ───
const CATEGORIES = ['All', 'Any%', '100%', 'Wave 30', 'No Hit', 'Hardcore', 'Frost'];
function buildCategories() {
  const wrap = document.getElementById('srCategories');
  wrap.innerHTML = '';
  CATEGORIES.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'cat-btn' + (cat === 'All' ? ' active' : '');
    btn.dataset.cat = cat;
    btn.textContent = cat;
    btn.onclick = () => {
      document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderLeaderboard(cat);
    };
    wrap.appendChild(btn);
  });
}

// ─── Leaderboard ───
async function renderLeaderboard(category) {
  try {
    const res = await fetch(`${API}/runs/approved?category=${encodeURIComponent(category)}`);
    const runs = await res.json();
    const tbody = document.getElementById('lbBody');
    const empty = document.getElementById('lbEmpty');
    tbody.innerHTML = '';
    if (!runs.length) { empty.style.display = 'block'; return; }
    empty.style.display = 'none';
    runs.forEach((run, i) => {
      const tr = document.createElement('tr');
      tr.className = i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : '';
      tr.innerHTML = `
        <td>${i + 1}</td>
        <td class="run-user">${esc(run.username)}</td>
        <td class="run-time">${esc(run.time)}</td>
        <td>${esc(run.category)}</td>
        <td><a href="${escAttr(run.video)}" target="_blank" class="run-video-link">▶ Watch</a></td>
        <td>${esc(run.date)}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (e) { }
}

function esc(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function escAttr(str) {
  return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
