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
let ddChampions = {};   // Data Dragon champion data
let ddItems = [];       // Data Dragon item data
let ddVersion = '';
let activeLane = 'all';
let activeRole = 'all';

// ---------- DEFAULT BUILDS (Role Based) ----------
// Using partial names to find PC items that look like WR items
const ROLE_BUILDS = {
    'Fighter': ['Trinity', 'Sterak', 'Death', 'Cleaver', 'Guardian', 'Plated'],
    'Mage': ['Luden', 'Rabadon', 'Zhonya', 'Void', 'Shadowflame', 'Sorcerer'],
    'Assassin': ['Youmuu', 'Collector', 'Edge', 'Serylda', 'Guardian', 'Lucidity'],
    'Marksman': ['Infinity', 'Kraken', 'Phantom', 'Bloodthirster', 'Dominik', 'Berserker'],
    'Support': ['Mandate', 'Ardent', 'Redemption', 'Mikael', 'Staff', 'Lucidity'],
    'Tank': ['Sunfire', 'Thornmail', 'Visage', 'Randuin', 'Warmog', 'Plated']
};

// ---------- INIT ----------
document.addEventListener('DOMContentLoaded', async () => {
    initNavbar();
    initSearch();
    initFilters();

    await loadDDragonVersion();
    await Promise.all([
        loadDDragonChampions(),
        loadDDragonItems(), // New: Load items
        loadWildRiftChampions()
    ]);

    mergeAndRender();
});

// ... (Navbar functions remain the same) ...

// ---------- LOAD DATA DRAGON ITEMS ----------
async function loadDDragonItems() {
    try {
        const res = await fetch(`${CONFIG.DDRAGON}/cdn/${ddVersion}/data/en_US/item.json`);
        const data = await res.json();
        // Convert object to array for easier searching
        ddItems = Object.values(data.data);
    } catch (err) {
        console.error('DDragon items failed:', err);
    }
}

// ... (loadDDragonChampions, loadWildRiftChampions, mergeAndRender remain same) ...

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

        // serialize for click handler
        const safeName = c.nameEn.replace(/'/g, "\\'");

        return `
            <div class="champion-card"
                 onclick="openChampionModal('${c.id}')"
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

// ... (getRoles, getLanes, getLaneIcon, filters remain same) ...

// ---------- CHAMPION MODAL ----------
window.openChampionModal = function(champId) {
    const champ = wrChampions.find(c => c.id === champId);
    if (!champ) return;

    // 1. Populate Header
    document.getElementById('modalName').textContent = champ.nameEn;
    document.getElementById('modalTitle').textContent = champ.titleEn || 'The Champion';
    
    // Splash
    const splashUrl = `${CONFIG.DDRAGON}/cdn/img/champion/splash/${champ.id}_0.jpg`;
    document.getElementById('modalSplash').style.backgroundImage = `url('${splashUrl}')`;

    // Roles
    const roles = getRoles(champ);
    const rolesContainer = document.getElementById('modalRoles');
    rolesContainer.innerHTML = roles.map(r => `<span class="modal-role-badge">${r}</span>`).join('');

    // 2. Determine Build
    // Pick the first role as primary, default to Fighter if none
    const primaryRole = roles[0] || 'Fighter';
    document.getElementById('modalBuildRole').textContent = primaryRole;

    // Find items for this role
    const partialNames = ROLE_BUILDS[primaryRole] || ROLE_BUILDS['Fighter'];
    const buildContainer = document.getElementById('modalBuild');
    
    buildContainer.innerHTML = partialNames.map(partial => {
        // Find item by fuzzy name match
        const item = ddItems.find(i => i.name.includes(partial));
        if (item) {
            return `
                <div class="item-slot" title="${item.name}">
                    <img src="${CONFIG.DDRAGON}/cdn/${ddVersion}/img/item/${item.image.full}" alt="${item.name}">
                </div>
            `;
        } else {
            return `<div class="item-slot"></div>`; // Empty slot if not found
        }
    }).join('');

    // 3. Show Modal
    const modalEl = document.getElementById('championModal');
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
};

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
