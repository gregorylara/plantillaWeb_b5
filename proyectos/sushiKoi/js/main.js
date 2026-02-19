/* ===== SUSHIKOI — MAIN JS ===== */

// Default Data (Fallback for local files/CORS)
const DEFAULT_MENU = {
  "signatureRolls": [
    { 
      "id": "emperador_koi", 
      "name": "Emperador Koi", 
      "price": 14.50, 
      "description": "Atún picante y pepino, cubierto con láminas de salmón flameado, aguacate, perlas de trufa y reducción de anguila.", 
      "image": "img/emperador_koi.png" 
    },
    { 
      "id": "salmon_picon", 
      "name": "Salmón Picón", 
      "price": 13.50, 
      "description": "Salmón fresco con salsa kimuchi, coronado con crujiente de tempura dorado, rodaja de jalapeño y toque de lima.", 
      "image": "img/salmon_picon.png" 
    },
    { 
      "id": "el_crujiente", 
      "name": "El Crujiente", 
      "price": 12.95, 
      "description": "Langostino tempura y queso crema, envuelto en panko dorado con salsa teriyaki y sésamo tostado.", 
      "image": "img/crujiente.png" 
    },
    { 
      "id": "volcan_tuna", 
      "name": "Volcán Tuna", 
      "price": 13.95, 
      "description": "Roll California cubierto con tartar de atún rojo picante, cebollino y masago, gratinado ligeramente.", 
      // Placeholder or generic if image unavailable
      "image": "img/emperador_koi.png" 
    },
    { 
      "id": "dragon_dorado", 
      "name": "Dragón Dorado", 
      "price": 14.00, 
      "description": "Anguila kabayaki y pepino, cubierto completamente de aguacate con salsa unagi y huevas de salmón.", 
      "image": "img/crujiente.png" 
    },
    { 
      "id": "arcoiris_tropico", 
      "name": "Arcoíris Trópico", 
      "price": 13.50, 
      "description": "Cangrejo real y pepino, cubierto de atún, salmón, pez mantequilla y aguacate con salsa de mango.", 
      "image": "img/salmon_picon.png" 
    }
  ],
  "classicRolls": [
    { "id": "california_vip", "name": "California VIP", "price": 8.50, "description": "Cangrejo de las nieves, aguacate, pepino y masago naranja." },
    { "id": "atun_picante", "name": "Atún Picante", "price": 9.00, "description": "Tartar de atún con salsa sriracha, aceite de sésamo y pepino crujiente." },
    { "id": "filadelfia", "name": "Filadelfia Clásico", "price": 8.50, "description": "Salmón ahumado noruego, queso crema crema y aguacate." },
    { "id": "ebi_fry", "name": "Ebi Fry", "price": 9.50, "description": "Langostino empanizado, lechuga fresca y mayonesa japonesa." },
    { "id": "vegetariano_zen", "name": "Vegetariano Zen", "price": 7.50, "description": "Espárragos trigueros, aguacate, pepino y zanahoria encurtida." },
    { "id": "salmon_avocado", "name": "Salmón & Avocado", "price": 8.00, "description": "Lomo de salmón fresco y aguacate hass en su punto." },
    { "id": "pollo_teriyaki", "name": "Pollo Teriyaki", "price": 8.50, "description": "Pollo crujiente, pepino y salsa teriyaki dulce." },
    { "id": "pez_mantequilla", "name": "Pez Mantequilla", "price": 9.00, "description": "Pez mantequilla con trufa negra y cebollino." },
    { "id": "futomaki_tokio", "name": "Futomaki Tokio", "price": 10.50, "description": "Roll grueso con tamago, cangrejo, pepino y seta shiitake." },
    { "id": "foie_gras", "name": "Roll de Foie", "price": 11.50, "description": "Foie gras mi-cuit caramelizado con reducción de Pedro Ximénez y manzana." }
  ],
  "trays": [
    { 
      "id": "tray_s", 
      "name": "Bandeja Koi Pequeña", 
      "size": "Pequeña",
      "pieces": 32, 
      "price": 45.00, 
      "rollCount": 4,
      "description": "Ideal para 2-3 personas. Elige 4 Rolls.",
      "image": "img/tray_premium.png"
    },
    { 
      "id": "tray_m", 
      "name": "Bandeja Koi Mediana", 
      "size": "Mediana",
      "pieces": 56, 
      "price": 75.00, 
      "rollCount": 7,
      "description": "Perfecta para 4-6 personas. Elige 7 Rolls.",
      "image": "img/tray_premium.png"
    },
    { 
      "id": "tray_l", 
      "name": "Bandeja Koi Grande", 
      "size": "Grande",
      "pieces": 80, 
      "price": 99.00, 
      "rollCount": 10,
      "description": "La fiesta completa (8-10 personas). Elige 10 Rolls.",
      "image": "img/tray_premium.png"
    },
    { 
      "id": "tray_xl", 
      "name": "Bandeja Emperador", 
      "size": "XXL",
      "pieces": 120, 
      "price": 140.00, 
      "rollCount": 15,
      "description": "Evento corporativo o boda. Elige 15 Rolls.",
      "image": "img/tray_premium.png"
    }
  ]
};

// State
let menuData = {};
let currentTraySize = null;
let currentTray = []; // Array of selected roll objects
let maxPieces = 0;

// DOM Elements
const signatureGrid = document.getElementById('signatureGrid');
const trayOptions = document.getElementById('trayOptions');
const selectionGrid = document.getElementById('selectionGrid');
const trayVisual = document.getElementById('trayVisual');
const totalPriceEl = document.getElementById('totalPrice');
const basePriceEl = document.getElementById('basePrice');
const limitBadge = document.getElementById('limitBadge');
const btnOrder = document.getElementById('btnOrder');
const menuTabs = document.querySelectorAll('#menuTabs .nav-link');

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await loadMenu();
    renderFeaturedMenu();
    renderTrayOptions();
    renderSelectionMenu('signatureRolls'); // Default tab

    // Tab Event Listeners
    menuTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            menuTabs.forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            renderSelectionMenu(e.target.dataset.category);
        });
    });
});

// Load Data
async function loadMenu() {
    try {
        const res = await fetch('data/menu.json');
        if (!res.ok) throw new Error('Fetch failed');
        menuData = await res.json();
    } catch (err) {
        console.warn('Error loading menu (likely local file), using fallback:', err);
        menuData = DEFAULT_MENU;
    }
}

// Render Featured (Signature Rolls)
function renderFeaturedMenu() {
    if (!menuData.signatureRolls) return;

    signatureGrid.innerHTML = menuData.signatureRolls.map(roll => {
        // Use placeholder if image is "placeholder" or undefined
        // Ideally we check if it exists, for now assuming generated imgs exist
        let imgTag = `<i class="bi bi-image fs-1 text-secondary"></i>`;
        
        if (roll.image && roll.image.includes('img/')) {
             imgTag = `<img src="${roll.image}" alt="${roll.name}" loading="lazy" style="width:100%; height:100%; object-fit:cover;">`;
        } else if (roll.image === 'placeholder') {
             // Quick reuse of one of the generated images for demo purposes if needed, or stick to nice placeholder icon
             // Let's use a nice icon/color background
             imgTag = `<div class="d-flex flex-column align-items-center justify-content-center h-100 bg-light text-secondary"><i class="bi bi-camera fs-1"></i></div>`;
        }

        return `
        <div class="col-md-6 col-lg-4">
            <div class="menu-card h-100">
                <div class="menu-img-wrapper" style="height: 220px; overflow:hidden;">
                    ${imgTag}
                </div>
                <div class="menu-card-body">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <h4 class="mb-0 overflow-hidden text-truncate">${roll.name}</h4>
                        <span class="menu-price">€${roll.price.toFixed(2)}</span>
                    </div>
                    <p class="text-muted small mb-0">${roll.description}</p>
                </div>
            </div>
        </div>
    `}).join('');
}

// Render Tray Options (Step 1)
function renderTrayOptions() {
    if (!menuData.trays) return;

    trayOptions.innerHTML = menuData.trays.map(tray => {
        let imgContent = `<div class="mb-2"><i class="bi bi-box-seam fs-2 text-white-50"></i></div>`;
        if (tray.image && tray.image !== 'placeholder_tray') {
            imgContent = `<div class="mb-3" style="height: 120px; overflow: hidden; border-radius: 8px;">
                            <img src="${tray.image}" alt="${tray.name}" style="width: 100%; height: 100%; object-fit: cover;">
                          </div>`;
        }
        
        return `
        <div class="col-6 col-md-6 col-lg-3">
            <div class="builder-option text-center h-100" onclick="selectTraySize('${tray.id}')" id="opt-${tray.id}">
                ${imgContent}
                <h5 class="mb-1" style="font-size: 1rem;">${tray.name}</h5>
                <p class="text-orange fw-bold mb-1">${tray.pieces} Piezas</p>
                <small class="text-white-50 d-block mb-2">Elije ${tray.rollCount} Rolls</small>
                <span class="badge bg-secondary">€${tray.price}</span>
            </div>
        </div>
    `}).join('');
}

// Select Tray Size
window.selectTraySize = function(trayId) {
    // UI Update
    document.querySelectorAll('.builder-option').forEach(el => el.classList.remove('selected'));
    document.getElementById(`opt-${trayId}`).classList.add('selected');

    // Logic Update
    const tray = menuData.trays.find(t => t.id === trayId);
    currentTraySize = tray;
    maxPieces = tray.rollCount; // Using roll count as the limit unit for simplicity
    
    // Reset current tray if size changes (optional strategy)
    currentTray = [];
    
    updateTrayVisual();
    updateSummary();
}

// Render Selection Menu (Step 2)
function renderSelectionMenu(category) {
    const items = menuData[category] || [];
    
    selectionGrid.innerHTML = items.map(item => `
        <div class="col-6 col-md-4">
            <div class="selectable-item h-100" onclick="addToTray('${item.id}', '${category}')">
                <div class="d-flex justify-content-between">
                    <strong class="text-white small text-truncate d-block" style="max-width: 80%;">${item.name}</strong>
                    <i class="bi bi-plus-circle text-orange"></i>
                </div>
                <small class="text-white-50" style="font-size: 0.7rem; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">${item.description}</small>
            </div>
        </div>
    `).join('');
}

// Add Item to Tray
window.addToTray = function(itemId, category) {
    if (!currentTraySize) {
        alert('Por favor selecciona un tamaño de bandeja primero.');
        // Scroll to step 1
        return;
    }

    if (currentTray.length >= maxPieces) {
        alert('¡Tu bandeja está llena!');
        return;
    }

    const item = menuData[category].find(i => i.id === itemId);
    if (item) {
        currentTray.push(item);
        updateTrayVisual();
        updateSummary();
    }
}

// Remove Item from Tray
window.removeFromTray = function(index) {
    currentTray.splice(index, 1);
    updateTrayVisual();
    updateSummary();
}

window.clearTray = function() {
    currentTray = [];
    updateTrayVisual();
    updateSummary();
}

// Update Visuals and Totals
function updateTrayVisual() {
    // limit badge
    const limit = currentTraySize ? currentTraySize.rollCount : 0;
    limitBadge.textContent = `${currentTray.length}/${limit} Rolls`;

    // Visual grid
    if (!currentTraySize) {
        trayVisual.innerHTML = `<div class="empty-state text-white-50 w-100 text-center py-5"><i class="bi bi-basket fs-1 mb-2"></i><p>Selecciona un tamaño primero</p></div>`;
        return;
    }

    // Render slots
    let slotsHtml = '';
    // Fill with selected items
    currentTray.forEach((item, index) => {
        slotsHtml += `
            <div class="tray-slot filled" onclick="removeFromTray(${index})" title="Eliminar ${item.name}">
                 <div style="padding:5px; text-align:center; line-height:1.1;">
                    <i class="bi bi-sushi text-orange"></i><br>
                    <span style="font-size:0.5rem; color:#000; font-weight:bold;">${item.name.substring(0, 10)}</span>
                 </div>
            </div>
        `;
    });

    // Fill remaining empty slots
    const remaining = currentTraySize.rollCount - currentTray.length;
    for (let i = 0; i < remaining; i++) {
        slotsHtml += `<div class="tray-slot border-secondary"><span class="text-white-50 op-2" style="font-size:0.8rem">+</span></div>`;
    }

    trayVisual.innerHTML = slotsHtml;
}

function updateSummary() {
    let base = currentTraySize ? currentTraySize.price : 0;
    
    // In this simplified model, price is fixed per tray size regardless of rolls chosen
    // But we could add upgrades for premium rolls if needed.
    // For now: Custom Tray Price = Fixed Size Price.
    
    basePriceEl.textContent = `€${base.toFixed(2)}`;
    totalPriceEl.textContent = `€${base.toFixed(2)}`;

    // Enable order button if full
    if (currentTraySize && currentTray.length === currentTraySize.rollCount) {
        btnOrder.removeAttribute('disabled');
        btnOrder.innerHTML = `<i class="bi bi-whatsapp"></i> Finalizar Pedido`;
        btnOrder.classList.remove('btn-secondary');
        btnOrder.classList.add('btn-orange');
    } else {
        btnOrder.setAttribute('disabled', 'true');
        const remaining = currentTraySize ? (currentTraySize.rollCount - currentTray.length) : 0;
        btnOrder.innerHTML = currentTraySize ? `Faltan ${remaining} Rolls` : `Selecciona Tamaño`;
        btnOrder.classList.add('btn-secondary');
        btnOrder.classList.remove('btn-orange');
    }
}

// Finalize Order (WhatsApp)
window.finalizeOrder = function() {
    if (!currentTraySize || currentTray.length !== currentTraySize.rollCount) return;

    const phoneNumber = "34642941630"; // Greg's number
    
    let message = `Hola SushiKoi! 👋\nQuiero ordenar un catering:\n\n`;
    message += `🍱 *${currentTraySize.name}* (${currentTraySize.pieces} piezas) - €${currentTraySize.price}\n`;
    message += `------------------\n`;
    message += `*Selección de Rolls:*\n`;
    
    // Group items for cleaner list
    const counts = {};
    currentTray.forEach(item => { counts[item.name] = (counts[item.name] || 0) + 1; });
    
    for (const [name, count] of Object.entries(counts)) {
        message += `• ${count}x ${name}\n`;
    }
    
    message += `\n💰 *Total: €${currentTraySize.price}*\n`;
    message += `📍 *Dirección de entrega:*\n[Escribe tu dirección aquí]`;

    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}
