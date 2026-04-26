// ═══════════════════════════════════════════════════
//  pyTDS Backend Server
//  Запуск: node server.js
//  По умолчанию: http://localhost:3000
// ═══════════════════════════════════════════════════

const express  = require('express');
const bcrypt   = require('bcryptjs');
const cors     = require('cors');
const session  = require('express-session');
const path     = require('path');
const low      = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const app  = express();
const PORT = process.env.PORT || 3000;

// ─── Database setup (db.json файл) ───
const DB_PATH = process.env.RAILWAY_VOLUME_MOUNT_PATH
  ? path.join(process.env.RAILWAY_VOLUME_MOUNT_PATH, 'db.json')
  : path.join(__dirname, 'db.json');
const adapter = new FileSync(DB_PATH);
const db = low(adapter);

db.defaults({
  users:   [],  // { id, username, passwordHash, createdAt }
  runs:    [],  // approved runs (на доске)
  pending: [],  // { id, username, category, time, seconds, video, comment, date, submittedAt, status, rejectReason }
}).write();

// ─── Middleware ───
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // папка со статикой

app.use(session({
  secret: 'pytds-secret-key-change-in-prod',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 }, // 7 дней
}));

// ─── Helpers ───
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}
function requireAuth(req, res, next) {
  if (!req.session.username) return res.status(401).json({ error: 'Not authenticated' });
  next();
}
function requireAdmin(req, res, next) {
  if (!req.session.isAdmin) return res.status(403).json({ error: 'Forbidden' });
  next();
}

// ════════════════════════════════════════
//  AUTH ROUTES
// ════════════════════════════════════════

// POST /api/register
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Fill in all fields.' });
  if (username.length < 3)    return res.status(400).json({ error: 'Username must be 3+ characters.' });
  if (password.length < 6)    return res.status(400).json({ error: 'Password must be 6+ characters.' });

  const exists = db.get('users').find({ username }).value();
  if (exists) return res.status(400).json({ error: 'Username already taken.' });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = { id: generateId(), username, passwordHash, createdAt: Date.now() };
  db.get('users').push(user).write();

  req.session.username = username;
  res.json({ ok: true, username });
});

// POST /api/login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Fill in all fields.' });

  const user = db.get('users').find({ username }).value();
  if (!user) return res.status(400).json({ error: 'User not found.' });

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return res.status(400).json({ error: 'Wrong password.' });

  req.session.username = username;
  res.json({ ok: true, username });
});

// POST /api/logout
app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ ok: true });
});

// GET /api/me
app.get('/api/me', (req, res) => {
  if (req.session.username) return res.json({ username: req.session.username });
  res.status(401).json({ error: 'Not authenticated' });
});

// ════════════════════════════════════════
//  ADMIN AUTH
// ════════════════════════════════════════

// POST /api/admin/login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'moder' && password === 'Dbdbdb67') {
    req.session.isAdmin = true;
    return res.json({ ok: true });
  }
  res.status(403).json({ error: 'Wrong credentials.' });
});

// POST /api/admin/logout
app.post('/api/admin/logout', (req, res) => {
  req.session.isAdmin = false;
  res.json({ ok: true });
});

// GET /api/admin/check
app.get('/api/admin/check', (req, res) => {
  res.json({ ok: !!req.session.isAdmin });
});

// ════════════════════════════════════════
//  RUNS — USER
// ════════════════════════════════════════

// POST /api/runs/submit
app.post('/api/runs/submit', requireAuth, (req, res) => {
  const { category, time, video, comment } = req.body;
  if (!time)  return res.status(400).json({ error: 'Enter your time.' });
  if (!/^\d{1,3}:\d{2}$/.test(time)) return res.status(400).json({ error: 'Time format must be mm:ss.' });
  const [m, s] = time.split(':').map(Number);
  if (s > 59) return res.status(400).json({ error: 'Seconds must be 0–59.' });
  if (!video || !video.startsWith('http')) return res.status(400).json({ error: 'Valid video URL required.' });

  const run = {
    id: generateId(),
    username: req.session.username,
    category: category || 'Any%',
    time,
    seconds: m * 60 + s,
    video,
    comment: comment || '',
    date: new Date().toLocaleDateString('en-GB'),
    submittedAt: Date.now(),
    status: 'pending',
    rejectReason: '',
  };
  db.get('pending').push(run).write();
  res.json({ ok: true, run });
});

// GET /api/runs/pending/mine  — пендинг текущего пользователя
app.get('/api/runs/pending/mine', requireAuth, (req, res) => {
  const runs = db.get('pending')
    .filter(r => r.username === req.session.username && r.status === 'pending')
    .value();
  res.json(runs);
});

// GET /api/runs/approved?category=All
app.get('/api/runs/approved', (req, res) => {
  const { category } = req.query;
  let runs = db.get('runs').value();
  if (category && category !== 'All') runs = runs.filter(r => r.category === category);
  runs.sort((a, b) => a.seconds - b.seconds);
  res.json(runs);
});

// ════════════════════════════════════════
//  RUNS — ADMIN
// ════════════════════════════════════════

// GET /api/admin/pending
app.get('/api/admin/pending', requireAdmin, (req, res) => {
  const runs = db.get('pending').filter({ status: 'pending' }).sortBy(r => -r.submittedAt).value();
  res.json(runs);
});

// GET /api/admin/approved
app.get('/api/admin/approved', requireAdmin, (req, res) => {
  const runs = db.get('runs').sortBy('seconds').value();
  res.json(runs);
});

// GET /api/admin/rejected
app.get('/api/admin/rejected', requireAdmin, (req, res) => {
  const runs = db.get('pending').filter({ status: 'rejected' }).sortBy(r => -r.submittedAt).value();
  res.json(runs);
});

// POST /api/admin/approve/:id
app.post('/api/admin/approve/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const run = db.get('pending').find({ id }).value();
  if (!run) return res.status(404).json({ error: 'Run not found' });

  db.get('pending').find({ id }).assign({ status: 'approved' }).write();
  db.get('runs').push({ ...run, status: 'approved' }).write();
  res.json({ ok: true });
});

// POST /api/admin/reject/:id
app.post('/api/admin/reject/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  const run = db.get('pending').find({ id }).value();
  if (!run) return res.status(404).json({ error: 'Run not found' });

  db.get('pending').find({ id }).assign({ status: 'rejected', rejectReason: reason || '—' }).write();
  res.json({ ok: true });
});

// DELETE /api/admin/pending/:id
app.delete('/api/admin/pending/:id', requireAdmin, (req, res) => {
  db.get('pending').remove({ id: req.params.id }).write();
  res.json({ ok: true });
});

// DELETE /api/admin/approved/:id
app.delete('/api/admin/approved/:id', requireAdmin, (req, res) => {
  db.get('runs').remove({ id: req.params.id }).write();
  res.json({ ok: true });
});

// POST /api/admin/demote/:id  — вернуть approved → pending
app.post('/api/admin/demote/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  db.get('runs').remove({ id }).write();
  db.get('pending').find({ id }).assign({ status: 'pending' }).write();
  res.json({ ok: true });
});

// POST /api/admin/restore/:id  — вернуть rejected → pending
app.post('/api/admin/restore/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  db.get('pending').find({ id }).assign({ status: 'pending', rejectReason: '' }).write();
  res.json({ ok: true });
});

// ════════════════════════════════════════
//  USERS — ADMIN
// ════════════════════════════════════════

// GET /api/admin/users
app.get('/api/admin/users', requireAdmin, (req, res) => {
  const users   = db.get('users').value();
  const runs    = db.get('runs').value();
  const pending = db.get('pending').value();

  const result = users.map(u => ({
    username: u.username,
    createdAt: u.createdAt,
    approved: runs.filter(r => r.username === u.username).length,
    pending:  pending.filter(r => r.username === u.username && r.status === 'pending').length,
    rejected: pending.filter(r => r.username === u.username && r.status === 'rejected').length,
  }));
  res.json(result);
});

// DELETE /api/admin/users/:username
app.delete('/api/admin/users/:username', requireAdmin, (req, res) => {
  const { username } = req.params;
  db.get('users').remove({ username }).write();
  db.get('runs').remove({ username }).write();
  db.get('pending').remove({ username }).write();
  res.json({ ok: true });
});

// GET /api/admin/stats
app.get('/api/admin/stats', requireAdmin, (req, res) => {
  res.json({
    pending:  db.get('pending').filter({ status: 'pending' }).size().value(),
    approved: db.get('runs').size().value(),
    rejected: db.get('pending').filter({ status: 'rejected' }).size().value(),
    users:    db.get('users').size().value(),
  });
});

// ─── Start ───
app.listen(PORT, () => {
  console.log(`\n  🚀 pyTDS server running at http://localhost:${PORT}`);
  console.log(`  📁 Database: ${DB_PATH}`);
  console.log(`  🔑 Admin: moder / Dbdbdb67\n`);
});
