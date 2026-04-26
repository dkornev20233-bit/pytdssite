// ─── Download button ───
function downloadBuild() {
  const btn = document.getElementById('dlBtn');
  if (!btn || btn.classList.contains('downloading')) return;
  btn.classList.add('downloading');
  window.location.href = "https://github.com/z1gres/pytds/archive/refs/heads/main.zip";
  setTimeout(() => btn.classList.remove('downloading'), 950);
}

// ─── Scroll reveal ───
document.addEventListener('DOMContentLoaded', () => {
  const els = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), i * 80);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  els.forEach(el => io.observe(el));
});

// ─── Screenshots gallery ───
const SS_TOTAL = 8;
let ssIndex = 0;

function ssGo(idx) {
  const main   = document.getElementById('ssMain');
  const counter = document.getElementById('ssCurrent');
  const thumbs = document.querySelectorAll('.ss-thumb');
  if (!main) return;

  main.classList.add('fade');
  setTimeout(() => {
    ssIndex = (idx + SS_TOTAL) % SS_TOTAL;
    main.src = `assets/screenshot${ssIndex + 1}.png`;
    main.alt = `Screenshot ${ssIndex + 1}`;
    counter.textContent = ssIndex + 1;
    thumbs.forEach((t, i) => t.classList.toggle('active', i === ssIndex));
    main.classList.remove('fade');
  }, 150);
}

function ssNav(dir) { ssGo(ssIndex + dir); }

// Keyboard arrows
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft')  ssNav(-1);
  if (e.key === 'ArrowRight') ssNav(1);
});
