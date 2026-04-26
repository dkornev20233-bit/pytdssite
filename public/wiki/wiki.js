// ─── Sidebar toggle ───
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

// ─── Search index ───
const SEARCH_INDEX = [
  // Towers
  { title: 'Assassin', cat: 'Tower', url: 'tower-assassin.html', keywords: 'assassin sword whirlwind melee 300 hidden detection' },
  { title: 'Accelerator', cat: 'Tower', url: 'tower-accelerator.html', keywords: 'accelerator laser purple 5000 dual' },
  { title: 'Frostcelerator', cat: 'Tower', url: 'tower-frostcelerator.html', keywords: 'frostcelerator frost ice laser slow freeze 3500' },
  { title: 'Archer', cat: 'Tower', url: 'tower-archer.html', keywords: 'archer arrow pierce flame ice 400' },
  { title: 'Lifestealer', cat: 'Tower', url: 'tower-lifestealer.html', keywords: 'lifestealer blood money coins 400' },
  { title: 'Red Ball', cat: 'Tower', url: 'tower-redball.html', keywords: 'red ball jump leap 1000' },
  { title: 'Freezer', cat: 'Tower', url: 'tower-freezer.html', keywords: 'freezer ice bullet slow 400' },
  { title: 'Frost Blaster', cat: 'Tower', url: 'tower-frostblaster.html', keywords: 'frost blaster piercing ice bullet 800 armor shred' },
  { title: 'Sledger', cat: 'Tower', url: 'tower-sledger.html', keywords: 'sledger hammer AoE swing slow freeze 950' },
  { title: 'Gladiator', cat: 'Tower', url: 'tower-gladiator.html', keywords: 'gladiator sword arc AoE 500' },
  { title: 'Toxic Gunner', cat: 'Tower', url: 'tower-toxicgunner.html', keywords: 'toxic gunner poison slow 525' },
  { title: 'Slasher', cat: 'Tower', url: 'tower-slasher.html', keywords: 'slasher crit bleed blood 1700' },
  { title: 'Farm', cat: 'Tower', url: 'tower-farm.html', keywords: 'farm money income coins 250' },
  { title: 'xw5yt', cat: 'Tower (Exclusive)', url: 'tower-xw5yt.html', keywords: 'xw5yt exclusive green laser 5000 hixw5yt chiter' },
  { title: 'All Towers', cat: 'Page', url: 'towers.html', keywords: 'towers list overview' },
  // Enemies
  { title: 'Easy Enemies', cat: 'Enemies', url: 'enemies-easy.html', keywords: 'normal fast slow hidden armored breaker necromancer grave digger' },
  { title: 'Fallen Enemies', cat: 'Enemies', url: 'enemies-fallen.html', keywords: 'fallen dreg squire soul giant hazmat king true honor guard necromancer' },
  { title: 'Frosty Enemies', cat: 'Enemies', url: 'enemies-frosty.html', keywords: 'frozen snowy frostmite cold mist frost hunter acolyte spirit ravager' },
  // Game
  { title: 'Game Modes', cat: 'Page', url: 'modes.html', keywords: 'easy fallen frosty sandbox modes waves' },
  { title: 'Maps', cat: 'Page', url: 'maps.html', keywords: 'straight zigzag frosty map path layout' },
  { title: 'Achievements', cat: 'Page', url: 'achievements.html', keywords: 'achievements unlock first path fallen angel glitch rich' },
  { title: 'Multiplayer', cat: 'Page', url: 'multiplayer.html', keywords: 'multiplayer co-op host join ngrok lan port 7777' },
  { title: 'Console Commands', cat: 'Page', url: 'console.html', keywords: 'console F1 cash hp skip spawn upgrade cheat commands' },
];

function doSearch(q) {
  const box = document.getElementById('searchResults');
  if (!q.trim()) { box.classList.add('hidden'); return; }
  const lower = q.toLowerCase();
  const results = SEARCH_INDEX.filter(item =>
    item.title.toLowerCase().includes(lower) ||
    item.keywords.toLowerCase().includes(lower)
  ).slice(0, 8);

  if (!results.length) {
    box.innerHTML = '<div class="search-result-item" style="color:var(--muted)">No results found</div>';
  } else {
    box.innerHTML = results.map(r => `
      <a href="${r.url}" class="search-result-item">
        ${r.title}
        <div class="search-result-cat">${r.cat}</div>
      </a>
    `).join('');
  }
  box.classList.remove('hidden');
}

function clearSearch() {
  document.getElementById('searchInput').value = '';
  document.getElementById('searchResults').classList.add('hidden');
}

document.addEventListener('click', (e) => {
  const wrap = document.querySelector('.search-wrap');
  if (wrap && !wrap.contains(e.target)) {
    document.getElementById('searchResults').classList.add('hidden');
  }
});
