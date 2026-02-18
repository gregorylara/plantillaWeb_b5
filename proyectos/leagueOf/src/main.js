/* ===== WILD RIFT HUB — MAIN JS ===== */

// ---------- CONFIG ----------
const CONFIG = {
    // Community Wild Rift champion data (free, no key)
    WR_API: 'https://ry2x.github.io/WildRift-Champs/hero.json',

    // Data Dragon CDN for images and English names (free, no key)
    DDRAGON: 'https://ddragon.leagueoflegends.com',

    // Featured champions for hero splash
    FEATURED: ['Jinx', 'Yasuo', 'Ahri', 'Zed', 'KaiSa', 'Lux', 'LeeSin', 'Thresh', 'Katarina', 'Ekko', 'Darius', 'MissFortune']
};

// ---------- STATE ----------
let wrChampions = [];   // Wild Rift champion data
let ddChampions = {};   // Data Dragon champion data (English names, titles)
let ddVersion = '';
let activeLane = 'all';
let activeRole = 'all';

// ---------- INIT ----------
document.addEventListener('DOMContentLoaded', async () => {
    initNavbar();
    initSearch();
    initFilters();

    await loadDDragonVersion();
    await Promise.all([loadDDragonChampions(), loadWildRiftChampions()]);

    mergeAndRender();
});

// ---------- NAVBAR ----------
function initNavbar() {
    const nav = document.getElementById('mainNav');
    window.addEventListener('scroll', () => {
        nav.classList.toggle('scrolled', window.scrollY > 50);
    });

    document.querySelectorAll('.nav-link[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute('href'));
            if (target) target.scrollIntoView({ behavior: 'smooth' });
            const collapse = document.getElementById('navMenu');
            const bsCollapse = bootstrap.Collapse.getInstance(collapse);
            if (bsCollapse) bsCollapse.hide();
        });
    });
}

// ---------- LOAD DATA DRAGON VERSION ----------
async function loadDDragonVersion() {
    try {
        const res = await fetch(`${CONFIG.DDRAGON}/api/versions.json`);
        const versions = await res.json();
        ddVersion = versions[0];
        document.getElementById('patchVersion').textContent = ddVersion;
    } catch (err) {
        console.error('Version load failed:', err);
        document.getElementById('patchVersion').textContent = '—';
    }
}

// ---------- LOAD DATA DRAGON CHAMPIONS ----------
async function loadDDragonChampions() {
    try {
        const res = await fetch(`${CONFIG.DDRAGON}/cdn/${ddVersion}/data/en_US/champion.json`);
        const data = await res.json();
        ddChampions = data.data;
    } catch (err) {
        console.error('DDragon champions failed:', err);
    }
}

// ---------- LOAD WILD RIFT CHAMPIONS ----------
async function loadWildRiftChampions() {
    try {
        const res = await fetch(CONFIG.WR_API);
        wrChampions = await res.json();
        // Filter only champions in Wild Rift
        wrChampions = wrChampions.filter(c => c.is_wr === true);
    } catch (err) {
        console.error('WR champions failed:', err);
    }
}

// ---------- MERGE DATA & RENDER ----------
function mergeAndRender() {
    // Enrich WR data with English names/titles from DDragon
    wrChampions.forEach(wr => {
        const dd = ddChampions[wr.id];
        if (dd) {
            wr.nameEn = dd.name;
            wr.titleEn = dd.title;
        } else {
            wr.nameEn = wr.id;
            wr.titleEn = '';
        }
    });

    // Sort alphabetically
    wrChampions.sort((a, b) => a.nameEn.localeCompare(b.nameEn));

    // Update stats
    const count = wrChampions.length;
    document.getElementById('statChamps').textContent = count;
    document.getElementById('heroChampCount').textContent = count;

    renderHeroSplash();
    renderChampionGrid(wrChampions);
    renderStats();
    renderRoleBars();
}

// ---------- HERO SPLASH ----------
function renderHeroSplash() {
    const randomId = CONFIG.FEATURED[Math.floor(Math.random() * CONFIG.FEATURED.length)];
    const dd = ddChampions[randomId];
    if (!dd) return;

    document.getElementById('heroSplash').innerHTML = `
        <img src="${CONFIG.DDRAGON}/cdn/img/champion/splash/${randomId}_0.jpg"
             alt="${dd.name}" loading="lazy">
        <div class="splash-info">
            <div class="splash-name">${dd.name}</div>
            <div class="splash-title">${dd.title}</div>
        </div>
    `;
}

// ---------- CHAMPION GRID ----------
function renderChampionGrid(champs) {
    const grid = document.getElementById('championGrid');

    if (champs.length === 0) {
        grid.innerHTML = '<p class="no-results"><i class="bi bi-emoji-frown"></i> No champions found</p>';
        return;
    }

    grid.innerHTML = champs.map(c => {
        const roles = getRoles(c);
        const lanes = getLanes(c);

        return `
            <div class="champion-card"
                 data-name="${c.nameEn.toLowerCase()}"
                 data-roles="${roles.join(',').toLowerCase()}"
                 data-lanes="${lanes.join(',').toLowerCase()}">
                <img src="${CONFIG.DDRAGON}/cdn/${ddVersion}/img/champion/${c.id}.png"
                     alt="${c.nameEn}" loading="lazy">
                <div class="lane-dots">
                    ${lanes.map(l => `<span class="lane-dot" title="${l}">${getLaneIcon(l)}</span>`).join('')}
                </div>
                <div class="card-info">
                    <span class="name">${c.nameEn}</span>
                    <span class="role-tag">${roles[0] || ''}</span>
                </div>
            </div>
        `;
    }).join('');
}

function getRoles(c) {
    const roles = [];
    if (c.is_fighter) roles.push('Fighter');
    if (c.is_mage) roles.push('Mage');
    if (c.is_assassin) roles.push('Assassin');
    if (c.is_marksman) roles.push('Marksman');
    if (c.is_support) roles.push('Support');
    if (c.is_tank) roles.push('Tank');
    return roles;
}

function getLanes(c) {
    const lanes = [];
    if (c.is_top) lanes.push('top');
    if (c.is_jg) lanes.push('jg');
    if (c.is_mid) lanes.push('mid');
    if (c.is_ad) lanes.push('ad');
    if (c.is_sup) lanes.push('sup');
    return lanes;
}

function getLaneIcon(lane) {
    const icons = { top: 'B', jg: 'J', mid: 'M', ad: 'D', sup: 'S' };
    return icons[lane] || lane[0].toUpperCase();
}

// ---------- SEARCH & FILTERS ----------
function initSearch() {
    const input = document.getElementById('championSearch');
    let timer;
    input.addEventListener('input', () => {
        clearTimeout(timer);
        timer = setTimeout(applyFilters, 200);
    });
}

function initFilters() {
    document.getElementById('laneFilters').addEventListener('click', (e) => {
        const btn = e.target.closest('.filter-btn');
        if (!btn) return;
        document.querySelectorAll('#laneFilters .filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeLane = btn.dataset.filter;
        applyFilters();
    });

    document.getElementById('roleFilters').addEventListener('click', (e) => {
        const btn = e.target.closest('.filter-btn');
        if (!btn) return;
        document.querySelectorAll('#roleFilters .filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeRole = btn.dataset.filter;
        applyFilters();
    });
}

function applyFilters() {
    const query = document.getElementById('championSearch').value.toLowerCase().trim();

    let filtered = wrChampions;

    // Lane filter
    if (activeLane !== 'all') {
        const key = `is_${activeLane}`;
        filtered = filtered.filter(c => c[key] === true);
    }

    // Role filter
    if (activeRole !== 'all') {
        const key = `is_${activeRole}`;
        filtered = filtered.filter(c => c[key] === true);
    }

    // Search
    if (query) {
        filtered = filtered.filter(c => c.nameEn.toLowerCase().includes(query));
    }

    renderChampionGrid(filtered);
}

// ---------- STATS OVERVIEW ----------
function renderStats() {
    const total = wrChampions.length;
    const fighters = wrChampions.filter(c => c.is_fighter).length;
    const mages = wrChampions.filter(c => c.is_mage).length;
    const assassins = wrChampions.filter(c => c.is_assassin).length;
    const marksmen = wrChampions.filter(c => c.is_marksman).length;
    const supports = wrChampions.filter(c => c.is_support).length;
    const tanks = wrChampions.filter(c => c.is_tank).length;

    const hardChamps = wrChampions.filter(c => c.difficult === 3).length;
    const avgDmg = (wrChampions.reduce((s, c) => s + (c.damage || 0), 0) / total).toFixed(1);

    const stats = [
        { icon: 'bi-people-fill', label: 'Total Champions', value: total, desc: 'Available in Wild Rift' },
        { icon: 'bi-lightning-fill', label: 'High Difficulty', value: hardChamps, desc: 'Rating 3/3 difficulty' },
        { icon: 'bi-fire', label: 'Avg. Damage', value: avgDmg, desc: 'Average damage rating' },
        { icon: 'bi-shield-fill', label: 'Tanks', value: tanks, desc: 'Frontline champions' },
    ];

    document.getElementById('statsGrid').innerHTML = stats.map(s => `
        <div class="col-6 col-md-3">
            <div class="stat-card">
                <div class="stat-icon"><i class="bi ${s.icon}"></i></div>
                <h5>${s.label}</h5>
                <div class="stat-value">${s.value}</div>
                <p>${s.desc}</p>
            </div>
        </div>
    `).join('');
}

// ---------- ROLE BREAKDOWN BARS ----------
function renderRoleBars() {
    const total = wrChampions.length;
    const roles = [
        { name: 'Fighter', key: 'is_fighter', css: 'fighter' },
        { name: 'Mage', key: 'is_mage', css: 'mage' },
        { name: 'Assassin', key: 'is_assassin', css: 'assassin' },
        { name: 'Marksman', key: 'is_marksman', css: 'marksman' },
        { name: 'Support', key: 'is_support', css: 'support' },
        { name: 'Tank', key: 'is_tank', css: 'tank' },
    ];

    document.getElementById('roleBars').innerHTML = roles.map(r => {
        const count = wrChampions.filter(c => c[r.key]).length;
        const pct = Math.round((count / total) * 100);
        return `
            <div class="role-bar-item">
                <div class="role-bar-label">${r.name}</div>
                <div class="role-bar-track">
                    <div class="role-bar-fill ${r.css}" style="width:${pct}%">${count}</div>
                </div>
            </div>
        `;
    }).join('');
}
