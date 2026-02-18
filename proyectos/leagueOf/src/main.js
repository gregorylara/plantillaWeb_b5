/* ===== LEAGUE HUB — MAIN JS ===== */

// ---------- CONFIG ----------
const CONFIG = {
    // Cloudflare Worker proxy URL — replace with your deployed worker URL
    // The worker holds your Riot API key securely on the server side
    PROXY_URL: 'https://your-riot-proxy.workers.dev',

    // Data Dragon CDN (free, no API key)
    DDRAGON_BASE: 'https://ddragon.leagueoflegends.com',
    
    // Default region for leaderboard
    DEFAULT_REGION: 'na1',

    // Featured champions for hero splash (random pick)
    FEATURED_CHAMPIONS: [
        'Ahri', 'Jinx', 'Yasuo', 'Lux', 'LeeSin', 'Thresh',
        'Zed', 'MissFortune', 'Darius', 'Katarina', 'Ekko', 'KaiSa'
    ]
};

// ---------- STATE ----------
let allChampions = {};
let currentVersion = '';
let activeRole = 'all';

// ---------- INIT ----------
document.addEventListener('DOMContentLoaded', async () => {
    initNavbar();
    initSearch();
    initRoleFilters();
    initRegionTabs();

    // Load data
    await loadVersion();
    await loadChampions();
    loadFreeRotation();
    loadLeaderboard(CONFIG.DEFAULT_REGION);
});

// ---------- NAVBAR SCROLL ----------
function initNavbar() {
    const nav = document.getElementById('mainNav');
    window.addEventListener('scroll', () => {
        nav.classList.toggle('scrolled', window.scrollY > 50);
    });

    // Smooth scroll for nav links
    document.querySelectorAll('.nav-link[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute('href'));
            if (target) target.scrollIntoView({ behavior: 'smooth' });
            
            // Close mobile menu
            const collapse = document.getElementById('navMenu');
            const bsCollapse = bootstrap.Collapse.getInstance(collapse);
            if (bsCollapse) bsCollapse.hide();
        });
    });
}

// ---------- LOAD PATCH VERSION ----------
async function loadVersion() {
    try {
        const res = await fetch(`${CONFIG.DDRAGON_BASE}/api/versions.json`);
        const versions = await res.json();
        currentVersion = versions[0];

        // Update UI
        document.getElementById('heroPatchVersion').textContent = currentVersion;
        document.getElementById('patchVersion').textContent = currentVersion;
    } catch (err) {
        console.error('Failed to load version:', err);
        document.getElementById('heroPatchVersion').textContent = '—';
        document.getElementById('patchVersion').textContent = '—';
    }
}

// ---------- LOAD ALL CHAMPIONS ----------
async function loadChampions() {
    try {
        const res = await fetch(`${CONFIG.DDRAGON_BASE}/cdn/${currentVersion}/data/en_US/champion.json`);
        const data = await res.json();
        allChampions = data.data;

        const count = Object.keys(allChampions).length;
        document.getElementById('statChamps').textContent = count;
        document.getElementById('heroChampCount').textContent = count;

        renderChampionGrid(allChampions);
        renderFeaturedSplash();
    } catch (err) {
        console.error('Failed to load champions:', err);
        document.getElementById('championGrid').innerHTML = '<p class="no-results">Failed to load champions. Please try again later.</p>';
    }
}

// ---------- RENDER FEATURED HERO SPLASH ----------
function renderFeaturedSplash() {
    const keys = CONFIG.FEATURED_CHAMPIONS;
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    const champ = allChampions[randomKey];

    if (!champ) return;

    const container = document.getElementById('featuredSplash');
    container.innerHTML = `
        <img src="${CONFIG.DDRAGON_BASE}/cdn/img/champion/splash/${randomKey}_0.jpg"
             alt="${champ.name} Splash Art"
             loading="lazy">
        <div class="splash-overlay">
            <div class="splash-champion-name">${champ.name}</div>
            <div class="splash-champion-title">${champ.title}</div>
        </div>
    `;
}

// ---------- RENDER CHAMPION GRID ----------
function renderChampionGrid(champions) {
    const grid = document.getElementById('championGrid');
    const champArray = Object.values(champions);

    if (champArray.length === 0) {
        grid.innerHTML = '<p class="no-results"><i class="bi bi-emoji-frown"></i> No champions found</p>';
        return;
    }

    // Sort alphabetically
    champArray.sort((a, b) => a.name.localeCompare(b.name));

    grid.innerHTML = champArray.map(champ => `
        <div class="champion-card" data-tags="${champ.tags.join(',')}" data-name="${champ.name.toLowerCase()}">
            <img src="${CONFIG.DDRAGON_BASE}/cdn/${currentVersion}/img/champion/${champ.id}.png"
                 alt="${champ.name}"
                 loading="lazy">
            <div class="card-info">
                <span class="name">${champ.name}</span>
                <span class="title">${champ.title}</span>
            </div>
        </div>
    `).join('');
}

// ---------- SEARCH ----------
function initSearch() {
    const input = document.getElementById('championSearch');
    let debounceTimer;

    input.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            filterChampions();
        }, 200);
    });
}

function filterChampions() {
    const query = document.getElementById('championSearch').value.toLowerCase().trim();
    
    let filtered = Object.values(allChampions);

    // Filter by role
    if (activeRole !== 'all') {
        filtered = filtered.filter(c => c.tags.includes(activeRole));
    }

    // Filter by search query
    if (query) {
        filtered = filtered.filter(c => c.name.toLowerCase().includes(query));
    }

    // Convert back to object format for rendering
    const obj = {};
    filtered.forEach(c => { obj[c.id] = c; });
    renderChampionGrid(obj);
}

// ---------- ROLE FILTERS ----------
function initRoleFilters() {
    document.getElementById('roleFilters').addEventListener('click', (e) => {
        const btn = e.target.closest('.role-btn');
        if (!btn) return;

        document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        activeRole = btn.dataset.role;
        filterChampions();
    });
}

// ---------- FREE ROTATION ----------
async function loadFreeRotation() {
    const grid = document.getElementById('rotationGrid');

    try {
        const res = await fetch(`${CONFIG.PROXY_URL}/rotation`);

        if (!res.ok) throw new Error('Proxy not available');

        const data = await res.json();
        const freeIds = data.freeChampionIds || [];

        document.getElementById('statRotation').textContent = freeIds.length;

        // Map champion IDs to champion data
        const champEntries = Object.values(allChampions);
        const freeChamps = freeIds.map(id => {
            return champEntries.find(c => parseInt(c.key) === id);
        }).filter(Boolean);

        grid.innerHTML = freeChamps.map(champ => `
            <div class="rotation-card">
                <img src="${CONFIG.DDRAGON_BASE}/cdn/${currentVersion}/img/champion/${champ.id}.png"
                     alt="${champ.name}"
                     loading="lazy">
                <span class="champ-name">${champ.name}</span>
            </div>
        `).join('');
    } catch (err) {
        console.warn('Free rotation unavailable (proxy not configured):', err.message);
        // Fallback: show random champions as "featured"
        const champArray = Object.values(allChampions);
        const shuffled = champArray.sort(() => 0.5 - Math.random()).slice(0, 20);
        
        document.getElementById('statRotation').textContent = shuffled.length;

        grid.innerHTML = `
            <p class="no-results" style="grid-column:1/-1; font-size:0.85rem; opacity:0.6;">
                <i class="bi bi-info-circle"></i> Free rotation requires the proxy server. Showing featured champions instead.
            </p>
        ` + shuffled.map(champ => `
            <div class="rotation-card">
                <img src="${CONFIG.DDRAGON_BASE}/cdn/${currentVersion}/img/champion/${champ.id}.png"
                     alt="${champ.name}"
                     loading="lazy">
                <span class="champ-name">${champ.name}</span>
            </div>
        `).join('');
    }
}

// ---------- REGION TABS ----------
function initRegionTabs() {
    document.getElementById('regionTabs').addEventListener('click', (e) => {
        const tab = e.target.closest('.region-tab');
        if (!tab) return;

        document.querySelectorAll('.region-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        loadLeaderboard(tab.dataset.region);
    });
}

// ---------- LEADERBOARD ----------
async function loadLeaderboard(region) {
    const tbody = document.getElementById('leaderboardBody');

    // Show skeleton
    tbody.innerHTML = Array(10).fill('<tr><td colspan="5"><div class="skeleton skeleton-row"></div></td></tr>').join('');

    try {
        const res = await fetch(`${CONFIG.PROXY_URL}/challenger/${region}`);

        if (!res.ok) throw new Error('Proxy not available');

        const data = await res.json();
        const entries = (data.entries || [])
            .sort((a, b) => b.leaguePoints - a.leaguePoints)
            .slice(0, 50);

        tbody.innerHTML = entries.map((entry, i) => {
            const rank = i + 1;
            const games = entry.wins + entry.losses;
            const wr = games > 0 ? ((entry.wins / games) * 100).toFixed(1) : '0.0';
            const wrClass = wr >= 60 ? 'high' : wr >= 50 ? 'medium' : 'low';
            const rankClass = rank <= 3 ? `rank-${rank}` : '';

            return `
                <tr>
                    <td><span class="rank-number ${rankClass}">${rank}</span></td>
                    <td class="summoner-name">${entry.summonerName || 'Hidden'}</td>
                    <td class="lp-value">${entry.leaguePoints.toLocaleString()} LP</td>
                    <td>${games}</td>
                    <td><span class="win-rate ${wrClass}">${wr}%</span></td>
                </tr>
            `;
        }).join('');

        if (entries.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4" style="color: var(--lol-text);">No data available for this region</td></tr>';
        }
    } catch (err) {
        console.warn('Leaderboard unavailable (proxy not configured):', err.message);
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-4" style="color: var(--lol-text);">
                    <i class="bi bi-info-circle"></i> Leaderboard requires the proxy server to be deployed.
                    <br><small style="opacity:0.5;">Deploy the Cloudflare Worker and update PROXY_URL in main.js</small>
                </td>
            </tr>
        `;
    }
}
