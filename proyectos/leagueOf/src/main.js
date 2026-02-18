/* ===== WILD RIFT HUB — MAIN JS ===== */

// ---------- CONFIG ----------
const CONFIG = {
    // Community Wild Rift champion data (free, no key)
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
let wrItems = [];       // Official Wild Rift items
let customBuilds = {};  // Custom JSON builds
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
        loadDDragonItems(), 
        loadWildRiftChampions(),
        loadCustomBuilds(),
        loadWildRiftItems() // New: Load WR specific items
    ]);

    mergeAndRender();
});

// ---------- NAVBAR ----------
function initNavbar() {
    const navbar = document.getElementById('mainNav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Close mobile menu on click
    document.querySelectorAll('.nav-link').forEach(l => {
        l.addEventListener('click', () => {
            const collapse = document.getElementById('navMenu');
            if (collapse.classList.contains('show')) {
                const bsCollapse = new bootstrap.Collapse(collapse);
                bsCollapse.hide();
            }
        });
    });
}

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

async function loadCustomBuilds() {
    try {
        const res = await fetch('./data/builds.json');
        if (!res.ok) throw new Error('Builds file not found');
        customBuilds = await res.json();
        console.log("Custom builds loaded for", Object.keys(customBuilds).length, "champions.");
    } catch (err) {
        console.warn('Custom builds failed to load:', err);
    }
}

async function loadWildRiftItems() {
    try {
        const res = await fetch('./data/items.json');
        if (!res.ok) throw new Error('WR items file not found');
        wrItems = await res.json();
        console.log("Wild Rift items list loaded:", wrItems.length, "items.");
    } catch (err) {
        console.error('Wild Rift items load failed:', err);
    }
}

// ---------- LOAD DATA DRAGON VERSION & CHAMPIONS ----------
async function loadDDragonVersion() {
    try {
        const res = await fetch(`${CONFIG.DDRAGON}/api/versions.json`);
        const versions = await res.json();
        ddVersion = versions[0];
        document.getElementById('patchVersion').textContent = ddVersion;
    } catch (err) {
        console.error('DDragon version failed:', err);
        ddVersion = '14.1.1'; // Fallback
    }
}

async function loadDDragonChampions() {
    try {
        const res = await fetch(`${CONFIG.DDRAGON}/cdn/${ddVersion}/data/en_US/champion.json`);
        const data = await res.json();
        ddChampions = data.data;
    } catch (err) {
        console.error('DDragon champions failed:', err);
    }
}

async function loadWildRiftChampions() {
    try {
        // Fetch from community repo
        const res = await fetch(CONFIG.WR_API);
        
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        
        const data = await res.json();
        // The API returns an object or array depending on endpoint, 
        // ry2x repo returns object with names as keys
        // Filter: ONLY Wild Rift champions
        wrChampions = Object.values(data)
            .filter(c => c.is_wr === true)
            .map(c => ({
                ...c,
                nameEn: c.id // Map id to nameEn since API uses 'id' for English name
            }));
        console.log(`Loaded ${wrChampions.length} Wild Rift champions`);

        // Update hero count
        document.getElementById('statChamps').textContent = wrChampions.length;
        document.getElementById('heroChampCount').textContent = wrChampions.length;

    } catch (err) {
        console.error('Wild Rift API failed:', err);
        document.getElementById('championGrid').innerHTML = 
            '<p class="error-msg">Failed to load champion data. Please try again later.</p>';
        document.getElementById('statChamps').textContent = 'Error';
    }
}

function mergeAndRender() {
    // We primarily use WR data, but map DD images/names where possible
    // Initial render
    renderChampionGrid(wrChampions);
    renderHeroSplash();
    renderStats();
    renderRoleBars();
}

// ---------- HERO SPLASH ----------
function renderHeroSplash() {
    const randomName = CONFIG.FEATURED[Math.floor(Math.random() * CONFIG.FEATURED.length)];
    // Find ID in DD
    const champ = Object.values(ddChampions).find(c => c.id === randomName || c.name === randomName) 
                  || Object.values(ddChampions)[0];

    if (champ) {
        const splashUrl = `${CONFIG.DDRAGON}/cdn/img/champion/splash/${champ.id}_0.jpg`;
        const heroSplash = document.getElementById('heroSplash');
        heroSplash.innerHTML = `<img src="${splashUrl}" alt="${champ.name}">`;
        
        // Add info overlay for splash
        const info = document.createElement('div');
        info.className = 'splash-info';
        info.innerHTML = `
            <div class="splash-name">${champ.id}</div>
            <div class="splash-title">${champ.title || 'The Champion'}</div>
        `;
        heroSplash.appendChild(info);
    }
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
    // Check if we have custom builds for this champion (case insensitive)
    const champKey = Object.keys(customBuilds).find(k => k.toUpperCase() === champ.id.toUpperCase());
    const itemsToShow = champKey ? customBuilds[champKey] : null;
    
    const primaryRole = roles[0] || 'Fighter';
    document.getElementById('modalBuildRole').textContent = champKey ? 'Pro Build' : primaryRole;

    const buildContainer = document.getElementById('modalBuild');
    let itemPool = [];

    if (itemsToShow) {
        // Use custom build items
        itemPool = itemsToShow;
    } else {
        // Fallback to role-based partials
        itemPool = ROLE_BUILDS[primaryRole] || ROLE_BUILDS['Fighter'];
    }

    buildContainer.innerHTML = itemPool.map(itemName => {
        // 1. Try to find in Wild Rift official list (Best match)
        let item = wrItems.find(i => i.name.toLowerCase() === itemName.toLowerCase());
        
        if (!item) {
            item = wrItems.find(i => i.name.toLowerCase().includes(itemName.toLowerCase()));
        }

        // If found in WR list, we use the WR icon
        if (item) {
            return `
                <div class="item-slot" title="${item.name}">
                    <img src="${item.icon}" alt="${item.name}" onerror="this.src='https://ddragon.leagueoflegends.com/cdn/${ddVersion}/img/item/1001.png'">
                    <span class="item-name-tag">${item.name}</span>
                </div>
            `;
        }

        // 2. Fallback to Data Dragon only if not found in WR list (for older items)
        // Note: The USER requested taking only WR objects, so we should be strict
        let ddItem = ddItems.find(i => i.name.toLowerCase() === itemName.toLowerCase());
        if (!ddItem) {
            ddItem = ddItems.find(i => i.name.toLowerCase().includes(itemName.toLowerCase()));
        }

        if (ddItem) {
            return `
                <div class="item-slot" title="${ddItem.name}">
                    <img src="${CONFIG.DDRAGON}/cdn/${ddVersion}/img/item/${ddItem.image.full}" alt="${ddItem.name}">
                    <span class="item-name-tag">${ddItem.name}</span>
                </div>
            `;
        }

        // 3. Placeholder if not found anywhere
        return `
            <div class="item-slot placeholder" title="${itemName}">
                <span class="item-initial">${itemName[0]}</span>
            </div>
        `;
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
