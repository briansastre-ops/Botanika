/**
 * =============================================================================
 * BOTANIKA STUDIO & PLANTAS — E-COMMERCE SPA FULL STACK
 * =============================================================================
 * Arquitectura: Single Page Application reactiva en Vanilla JavaScript (ES6+)
 * Integraciones: Supabase Auth/DB (PostgreSQL con RLS) y Checkout Pro Mercado Pago.
 * Cero dependencias externas 3D.
 * =============================================================================
 */

// =============================================================================
// PUENTE DE RETORNO AUTOMÁTICO (Mercado Pago HTTPS -> Localhost)
// =============================================================================
(function checkReturnToBounce() {
    try {
        const params = new URLSearchParams(window.location.search);
        const returnTo = params.get('return_to');
        if (returnTo) {
            const dest = new URL(returnTo, window.location.origin);
            params.forEach((val, key) => {
                if (key !== 'return_to') {
                    dest.searchParams.set(key, val);
                }
            });
            window.location.replace(dest.toString());
        }
    } catch (e) {
        console.warn('⚠️ Error en puente de retorno:', e);
    }
})();

/**
 * @typedef {Object} Product
 * @property {number} id - Identificador único del producto.
 * @property {string} name - Nombre comercial del producto.
 * @property {string} category - Categoría ('Plantas' | 'Macetas' | 'Sustratos' | 'Kits').
 * @property {number} price - Precio unitario en pesos argentinos (ARS).
 * @property {string} image - URL de la imagen del producto (Unsplash).
 * @property {string} light - Requerimiento de luz solar ('Indirecta' | 'Mucha luz' | 'Poca luz' | 'N/A').
 * @property {string} size - Tamaño físico o volumen ('Pequeña' | 'Mediana' | 'Grande' | '20cm' | '5L').
 * @property {string} pot - Estilo o tipo de maceta/empaque.
 * @property {string} badge - Etiqueta promocional ('Más Vendido' | 'Nuevo' | 'Esencial' | 'Kit' | 'Artesanal' | '').
 * @property {number} rating - Calificación media (1.0 - 5.0).
 * @property {number} reviewsCount - Cantidad de valoraciones de clientes.
 * @property {boolean} petFriendly - Apta para mascotas o no.
 * @property {string} difficulty - Nivel de cuidado requerido ('Fácil' | 'Media' | 'Avanzada' | 'N/A').
 * @property {string} description - Resumen botánico.
 */

/**
 * Catálogo oficial de productos Botanika.
 * @type {Product[]}
 */
const products = [
    { 
        id: 1, 
        name: "Monstera Deliciosa", 
        category: "Plantas", 
        price: 34000, 
        image: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&q=80&w=600", 
        light: "Indirecta", 
        size: "Mediana", 
        pot: "Terracota", 
        badge: "Más Vendido",
        rating: 4.9,
        reviewsCount: 48,
        difficulty: "Fácil",
        petFriendly: false,
        description: "La reina del diseño interior. Hojas perforadas imponentes que llenan cualquier rincón de frescura y vitalidad natural."
    },
    { 
        id: 2, 
        name: "Ficus Lyrata", 
        category: "Plantas", 
        price: 48000, 
        image: "https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&q=80&w=600", 
        light: "Mucha luz", 
        size: "Grande", 
        pot: "Cerámica Beige", 
        badge: "Nuevo",
        rating: 4.8,
        reviewsCount: 32,
        difficulty: "Media",
        petFriendly: false,
        description: "Porte escultórico con hojas en forma de violín. Ideal para livings y espacios con excelente luz natural tamizada."
    },
    { 
        id: 3, 
        name: "Maceta Minimal Terracota 20cm", 
        category: "Macetas", 
        price: 12500, 
        image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&q=80&w=600", 
        light: "N/A", 
        size: "20cm", 
        pot: "Terracota", 
        badge: "Artesanal",
        rating: 5.0,
        reviewsCount: 56,
        difficulty: "N/A",
        petFriendly: true,
        description: "Barro cocido artesanal de alta porosidad torneado a mano. Garantiza óptima aireación y salud radicular."
    },
    { 
        id: 4, 
        name: "Sustrato Premium Monsteras 5L", 
        category: "Sustratos", 
        price: 8900, 
        image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=600", 
        light: "N/A", 
        size: "5L", 
        pot: "Bolsa Eco", 
        badge: "Esencial",
        rating: 4.9,
        reviewsCount: 29,
        difficulty: "N/A",
        petFriendly: true,
        description: "Mezcla aireada con corteza de pino seleccionada, perlita, fibra de coco y humus de lombriz certificado."
    },
    { 
        id: 5, 
        name: "Kit Principiante: Sansevieria + Maceta", 
        category: "Kits", 
        price: 29000, 
        image: "https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&q=80&w=600", 
        light: "Poca luz", 
        size: "Mediana", 
        pot: "Cerámica Blanca", 
        badge: "Kit",
        rating: 5.0,
        reviewsCount: 84,
        difficulty: "Fácil",
        petFriendly: false,
        description: "La combinación perfecta e indestructible para iniciarte. Tolera baja luz, purifica el aire y requiere riego cada 15 días."
    },
    { 
        id: 6, 
        name: "Pilea Peperomioides", 
        category: "Plantas", 
        price: 21000, 
        image: "https://images.unsplash.com/photo-1637967888100-d83beabf90a1?auto=format&fit=crop&q=80&w=600", 
        light: "Indirecta", 
        size: "Pequeña", 
        pot: "Cerámica Gris", 
        badge: "Nuevo",
        rating: 4.7,
        reviewsCount: 23,
        difficulty: "Fácil",
        petFriendly: true,
        description: "La planta del dinero china. Hojas circulares perfectas, 100% pet-friendly, fácil de propagar y de rápido crecimiento."
    }
];

/**
 * Estado global del carrito de compras en memoria.
 */
let cart = [
    { id: 1, name: "Monstera Deliciosa", price: 34000, qty: 1, image: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&q=80&w=200", pot: "Terracota Artesanal" },
    { id: 3, name: "Maceta Minimal Terracota 20cm", price: 12500, qty: 1, image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&q=80&w=200", pot: "Estándar" }
];

/**
 * Lista de Deseos / Favoritos almacenada en localStorage
 * @type {number[]} IDs de productos favoritos
 */
let wishlist = [];
try {
    const savedWish = localStorage.getItem('botanika_wishlist');
    wishlist = savedWish ? JSON.parse(savedWish) : [1, 5];
} catch (e) {
    wishlist = [1, 5];
}

/** @type {'home'|'catalog'|'product'|'cart'|'checkout'|'profile'|'success'} Vista activa en la SPA */
let currentView = 'home';

/** @type {number} ID del producto a renderizar en la vista de detalle */
let currentProductId = 1;

/** @type {boolean} Indicador de validez del cupón de descuento promocional (10% OFF) */
let discountApplied = false;

/** @type {'mercadopago'|'card'|'transfer'} Método de pago seleccionado en el checkout */
let selectedPaymentMethod = 'mercadopago';

/** @type {'express'|'free'} Tipo de logística seleccionada en el checkout */
let selectedShippingMethod = 'express';

/** @type {string|null} Identificador de comprobante retornado por Mercado Pago */
let lastPaymentId = null;

/** @type {string|null} Identificador de orden en Supabase retornado o creado */
let lastOrderId = null;

/** @type {Object|null} Usuario autenticado actual en Supabase */
let currentUser = null;

/** @type {Object|null} Acción pendiente para reanudar tras login/registro (Ruta protegida) */
let pendingAction = null;

/** @type {'login'|'register'} Modalidad actual del modal de Auth */
let authModalMode = 'login';

/** @type {number|null} Índice de la pregunta frecuente abierta en el acordeón */
let openFaqIndex = 0;

// =============================================================================
// ESTADO Y DEFINICIÓN DEL CONFIGURADOR 2D "ARMÁ TU MACETA"
// =============================================================================
const POT_FINISHES = {
    terracota: {
        name: 'Terracota Artesanal',
        basePrice: 12500,
        hex: '#D07A58',
        bodyGradient: 'url(#pot-grad-terracota)',
        rimColor: '#E48B69',
        innerColor: '#4A3428',
        specularOpacity: '0.12',
        textureText: 'Barro cocido poroso tradicional con secado artesanal al sol. Favorece la oxigenación y previene el encharcamiento.'
    },
    blanca: {
        name: 'Cerámica Blanca Esmaltada',
        basePrice: 14900,
        hex: '#F7F6F2',
        bodyGradient: 'url(#pot-grad-blanca)',
        rimColor: '#FFFFFF',
        innerColor: '#3A3A36',
        specularOpacity: '0.28',
        textureText: 'Gres cerámico horneado a 1200°C con esmalte satinado suave. A prueba de rayaduras y fácil de limpiar.'
    },
    gris: {
        name: 'Gris Cálido Mineral',
        basePrice: 15200,
        hex: '#7A827B',
        bodyGradient: 'url(#pot-grad-gris)',
        rimColor: '#9BA39C',
        innerColor: '#2E3330',
        specularOpacity: '0.18',
        textureText: 'Compuesto mineral contemporáneo de tacto sedoso mate. Resistencia térmica y peso equilibrado.'
    }
};

const POT_SIZES = {
    s: { label: 'S — Pequeña (Ø15cm)', short: 'S', priceDelta: -2000, scaleClass: 'pot-scale-s' },
    m: { label: 'M — Mediana (Ø20cm)', short: 'M', priceDelta: 0, scaleClass: 'pot-scale-m' },
    l: { label: 'L — Grande (Ø26cm)', short: 'L', priceDelta: 3500, scaleClass: 'pot-scale-l' }
};

const POT_PLANTS = {
    monstera: {
        id: 'monstera',
        name: 'Monstera Deliciosa',
        desc: 'Hojas costilladas tropicales de rápido desarrollo.',
        svgPath: `
            <g transform="translate(10, 0)">
                <!-- Tallos -->
                <path d="M 120 180 Q 115 110 100 40" stroke="#3D5A45" stroke-width="6" fill="none" stroke-linecap="round"/>
                <path d="M 120 180 Q 80 130 50 85" stroke="#3D5A45" stroke-width="5" fill="none" stroke-linecap="round"/>
                <path d="M 120 180 Q 155 125 180 80" stroke="#3D5A45" stroke-width="5" fill="none" stroke-linecap="round"/>
                <!-- Hoja Central Monstera -->
                <path d="M 100 40 C 70 30 65 70 85 95 C 60 85 55 115 80 135 C 90 145 110 140 120 125 C 130 140 150 145 160 135 C 185 115 180 85 155 95 C 175 70 170 30 140 40 C 120 20 110 20 100 40 Z" fill="#526E5D"/>
                <!-- Perforaciones Monstera -->
                <ellipse cx="105" cy="70" rx="4" ry="12" transform="rotate(-20 105 70)" fill="#FAF8F5"/>
                <ellipse cx="135" cy="70" rx="4" ry="12" transform="rotate(20 135 70)" fill="#FAF8F5"/>
                <ellipse cx="95" cy="105" rx="5" ry="15" transform="rotate(-35 95 105)" fill="#FAF8F5"/>
                <ellipse cx="145" cy="105" rx="5" ry="15" transform="rotate(35 145 105)" fill="#FAF8F5"/>
                <!-- Hoja Izquierda -->
                <path d="M 50 85 C 25 75 25 110 45 130 C 65 145 80 130 75 110 C 80 90 65 75 50 85 Z" fill="#435B4C"/>
                <ellipse cx="48" cy="105" rx="3" ry="10" transform="rotate(-25 48 105)" fill="#FAF8F5"/>
                <!-- Hoja Derecha -->
                <path d="M 180 80 C 205 70 205 105 185 125 C 165 140 150 125 155 105 C 150 85 165 70 180 80 Z" fill="#435B4C"/>
                <ellipse cx="182" cy="100" rx="3" ry="10" transform="rotate(25 182 100)" fill="#FAF8F5"/>
            </g>
        `
    },
    ficus: {
        id: 'ficus',
        name: 'Ficus Lyrata',
        desc: 'Porte escultórico con hojas en forma de violín.',
        svgPath: `
            <g transform="translate(10, 0)">
                <!-- Tronco leñoso -->
                <path d="M 120 190 Q 120 120 120 40" stroke="#5C4535" stroke-width="7" fill="none" stroke-linecap="round"/>
                <!-- Hoja 1 Superior -->
                <path d="M 120 30 C 80 10 75 60 95 80 C 80 95 85 120 115 125 C 120 125 125 125 125 125 C 155 120 160 95 145 80 C 165 60 160 10 120 30 Z" fill="#4B6655"/>
                <path d="M 120 35 L 120 120" stroke="#728F7D" stroke-width="2" fill="none"/>
                <!-- Hoja 2 Media Izq -->
                <path d="M 115 80 C 75 70 70 110 85 125 C 70 140 75 160 105 165 L 115 130 Z" fill="#3D5345"/>
                <!-- Hoja 3 Media Der -->
                <path d="M 125 80 C 165 70 170 110 155 125 C 170 140 165 160 135 165 L 125 130 Z" fill="#3D5345"/>
            </g>
        `
    },
    haworthia: {
        id: 'haworthia',
        name: 'Haworthia Cebra',
        desc: 'Suculenta compacta con estrías blancas de mínimo riego.',
        svgPath: `
            <g transform="translate(10, 40)">
                <!-- Roseta de suculenta -->
                <path d="M 120 140 L 120 30 L 110 140 Z" fill="#2E4034"/>
                <path d="M 120 140 L 90 45 L 105 140 Z" fill="#384E3F"/>
                <path d="M 120 140 L 150 45 L 135 140 Z" fill="#384E3F"/>
                <path d="M 120 140 L 65 70 L 95 140 Z" fill="#45604E"/>
                <path d="M 120 140 L 175 70 L 145 140 Z" fill="#45604E"/>
                <path d="M 120 140 L 50 110 L 90 140 Z" fill="#526E5D"/>
                <path d="M 120 140 L 190 110 L 150 140 Z" fill="#526E5D"/>
                <!-- Rayas Cebra blancas -->
                <path d="M 116 55 L 124 55 M 115 75 L 125 75 M 114 95 L 126 95" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round"/>
                <path d="M 92 65 L 100 68 M 89 85 L 98 90 M 85 105 L 96 110" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round"/>
                <path d="M 148 65 L 140 68 M 151 85 L 142 90 M 155 105 L 144 110" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round"/>
            </g>
        `
    }
};

let configuratorState = {
    finish: 'terracota',
    size: 'm',
    plant: 'monstera'
};

// Estado de Filtros del Catálogo
let catalogFilter = {
    search: '',
    category: 'Todas',
    light: 'Todas',
    maxPrice: 60000,
    sortBy: 'default'
};

// Estado del Quiz Botánico
let quizState = {
    step: 0,
    answers: {},
    recommendedProduct: null
};

// =============================================================================
// ENRUTAMIENTO SPA & NAVEGACIÓN
// =============================================================================

function navigateTo(view, param) {
    currentView = view;
    if (param) currentProductId = param;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    renderView();
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    initScrollReveal();
    if (view === 'home') {
        initHeroParallax();
    }
}

function goToLandingSection(sectionId) {
    if (currentView !== 'home') {
        currentView = 'home';
        renderView();
    }
    setTimeout(() => {
        const el = document.getElementById('landing-' + sectionId);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 80);
}

/**
 * Control del Menú Móvil accesible con Drawer
 */
function toggleMobileMenu(forceState) {
    const menu = document.getElementById('mobile-menu');
    const backdrop = document.getElementById('mobile-menu-backdrop');
    const btn = document.getElementById('mobile-menu-btn');
    if (!menu) return;

    const isOpen = typeof forceState === 'boolean' ? !forceState : menu.classList.contains('active');

    if (isOpen) {
        menu.classList.remove('active');
        if (backdrop) backdrop.classList.remove('active');
        if (btn) btn.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('menu-open');
    } else {
        menu.classList.add('active');
        if (backdrop) backdrop.classList.add('active');
        if (btn) btn.setAttribute('aria-expanded', 'true');
        document.body.classList.add('menu-open');
    }
}

/**
 * Toast con Iconografía Dinámica
 */
function showToast(msg, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toast-message');
    const toastIcon = document.getElementById('toast-icon');
    if (!toast || !toastMsg) return;

    toastMsg.innerText = msg;
    if (toastIcon) {
        if (type === 'error') {
            toastIcon.className = 'w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center flex-shrink-0';
            toastIcon.innerHTML = `<i data-lucide="alert-triangle" class="w-3.5 h-3.5"></i>`;
        } else if (type === 'info') {
            toastIcon.className = 'w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0';
            toastIcon.innerHTML = `<i data-lucide="info" class="w-3.5 h-3.5"></i>`;
        } else {
            toastIcon.className = 'w-6 h-6 rounded-full bg-botanika-600 text-white flex items-center justify-center flex-shrink-0';
            toastIcon.innerHTML = `<i data-lucide="check" class="w-3.5 h-3.5"></i>`;
        }
    }

    toast.classList.remove('translate-y-20', 'opacity-0', 'pointer-events-none');
    if (typeof lucide !== 'undefined') lucide.createIcons();

    setTimeout(() => {
        toast.classList.add('translate-y-20', 'opacity-0', 'pointer-events-none');
    }, 3200);
}

// =============================================================================
// CARRITO DE COMPRAS & MINI-CARRITO DRAWER
// =============================================================================

function updateCartBadge() {
    const totalItems = cart.reduce((acc, item) => acc + item.qty, 0);
    const badge = document.getElementById('cart-badge');
    if (badge) {
        badge.innerText = totalItems;
        badge.classList.remove('badge-bounce');
        void badge.offsetWidth;
        badge.classList.add('badge-bounce');
    }

    const drawerCount = document.getElementById('cart-drawer-count');
    if (drawerCount) drawerCount.innerText = totalItems;

    updateCartDrawer();
}

function addToCart(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;
    const existing = cart.find(item => item.id === id);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ 
            id: product.id, 
            name: product.name, 
            price: product.price, 
            qty: 1, 
            image: product.image, 
            pot: product.pot 
        });
    }
    updateCartBadge();
    showToast(`"${product.name}" agregado al carrito`);
    openCartDrawer();
}

function openCartDrawer() {
    const drawer = document.getElementById('cart-drawer');
    const backdrop = document.getElementById('cart-drawer-backdrop');
    if (drawer && backdrop) {
        drawer.classList.add('active');
        backdrop.classList.add('active');
    }
    updateCartDrawer();
}

function closeCartDrawer() {
    const drawer = document.getElementById('cart-drawer');
    const backdrop = document.getElementById('cart-drawer-backdrop');
    if (drawer && backdrop) {
        drawer.classList.remove('active');
        backdrop.classList.remove('active');
    }
}

function updateCartDrawer() {
    const container = document.getElementById('cart-drawer-items');
    const subtotalEl = document.getElementById('cart-drawer-subtotal');
    const freeShippingBar = document.getElementById('free-shipping-bar');
    const freeShippingText = document.getElementById('free-shipping-text');
    const freeShippingPercent = document.getElementById('free-shipping-percent');
    if (!container) return;

    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
    if (subtotalEl) subtotalEl.innerText = `$${subtotal.toLocaleString()}`;

    const threshold = 60000;
    const percent = Math.min(100, Math.round((subtotal / threshold) * 100));
    if (freeShippingBar) freeShippingBar.style.width = `${percent}%`;
    if (freeShippingPercent) freeShippingPercent.innerText = `${percent}%`;
    if (freeShippingText) {
        if (percent >= 100) {
            freeShippingText.innerHTML = `🎉 <strong>¡Tenés envío gratis bonificado!</strong>`;
        } else {
            const missing = threshold - subtotal;
            freeShippingText.innerText = `Sumá $${missing.toLocaleString()} más para envío gratis`;
        }
    }

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="text-center py-16 space-y-3">
                <div class="w-16 h-16 rounded-full bg-botanika-100 text-botanika-400 mx-auto flex items-center justify-center">
                    <i data-lucide="shopping-bag" class="w-8 h-8"></i>
                </div>
                <h4 class="font-serif text-lg font-medium text-botanika-800">Tu carrito está vacío</h4>
                <p class="text-xs text-botanika-700 max-w-xs mx-auto">Explorá nuestras plantas aclimatadas y encontrá tu compañera verde ideal.</p>
                <button onclick="closeCartDrawer(); navigateTo('catalog');" class="btn-primary text-xs py-2.5 px-5 mt-2">
                    Ir al Catálogo
                </button>
            </div>
        `;
    } else {
        container.innerHTML = cart.map((item, idx) => `
            <div class="flex items-center space-x-3 p-3 rounded-2xl bg-botanika-50 border border-botanika-200">
                <img src="${item.image}" alt="${item.name}" class="w-16 h-16 rounded-xl object-cover bg-white flex-shrink-0">
                <div class="flex-grow min-w-0">
                    <h5 class="text-xs font-semibold text-botanika-800 truncate">${item.name}</h5>
                    <p class="text-[11px] text-botanika-700 truncate">${item.pot}</p>
                    <span class="font-serif font-bold text-sm text-botanika-800 block mt-0.5">$${item.price.toLocaleString()}</span>
                </div>
                <div class="flex flex-col items-end space-y-2">
                    <button onclick="removeFromCart(${idx})" class="text-botanika-600 hover:text-botanika-terracota transition" title="Eliminar">
                        <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                    </button>
                    <div class="flex items-center border border-botanika-300 rounded-lg bg-white shadow-2xs">
                        <button onclick="updateCartItemQty(${idx}, -1)" class="px-2 py-0.5 text-xs text-botanika-700 hover:bg-botanika-100 rounded-l">-</button>
                        <span class="px-2 text-xs font-semibold text-botanika-800">${item.qty}</span>
                        <button onclick="updateCartItemQty(${idx}, 1)" class="px-2 py-0.5 text-xs text-botanika-700 hover:bg-botanika-100 rounded-r">+</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function updateCartItemQty(index, change) {
    if (!cart[index]) return;
    cart[index].qty += change;
    if (cart[index].qty <= 0) {
        cart.splice(index, 1);
    }
    updateCartBadge();
    if (currentView === 'cart') renderView();
}

function removeFromCart(index) {
    if (!cart[index]) return;
    const removedName = cart[index].name;
    cart.splice(index, 1);
    updateCartBadge();
    showToast(`"${removedName}" eliminado`);
    if (currentView === 'cart') renderView();
}

// =============================================================================
// WISHLIST / FAVORITOS
// =============================================================================

function saveWishlist() {
    try {
        localStorage.setItem('botanika_wishlist', JSON.stringify(wishlist));
    } catch (e) {}
    updateWishlistBadge();
}

function updateWishlistBadge() {
    const badge = document.getElementById('wishlist-badge');
    if (badge) badge.innerText = wishlist.length;
    const drawerBadge = document.getElementById('wishlist-drawer-count');
    if (drawerBadge) drawerBadge.innerText = wishlist.length;
    renderWishlistDrawer();
}

function isInWishlist(productId) {
    return wishlist.includes(productId);
}

function toggleWishlist(productId) {
    const p = products.find(prod => prod.id === productId);
    if (!p) return;

    const idx = wishlist.indexOf(productId);
    if (idx > -1) {
        wishlist.splice(idx, 1);
        showToast(`"${p.name}" removido de favoritos`, 'info');
    } else {
        wishlist.push(productId);
        showToast(`"${p.name}" guardado en tus favoritos ❤️`);
    }
    saveWishlist();
    if (currentView === 'home' || currentView === 'catalog') {
        renderView();
    }
}

function toggleWishlistDrawer() {
    const drawer = document.getElementById('wishlist-drawer');
    const backdrop = document.getElementById('wishlist-drawer-backdrop');
    if (drawer && backdrop) {
        const isActive = drawer.classList.contains('active');
        if (isActive) {
            closeWishlistDrawer();
        } else {
            drawer.classList.add('active');
            backdrop.classList.add('active');
            renderWishlistDrawer();
        }
    }
}

function closeWishlistDrawer() {
    const drawer = document.getElementById('wishlist-drawer');
    const backdrop = document.getElementById('wishlist-drawer-backdrop');
    if (drawer && backdrop) {
        drawer.classList.remove('active');
        backdrop.classList.remove('active');
    }
}

function renderWishlistDrawer() {
    const container = document.getElementById('wishlist-drawer-items');
    if (!container) return;

    const wishProducts = products.filter(p => wishlist.includes(p.id));

    if (wishProducts.length === 0) {
        container.innerHTML = `
            <div class="text-center py-16 space-y-3">
                <div class="w-16 h-16 rounded-full bg-botanika-100 text-botanika-terracota mx-auto flex items-center justify-center">
                    <i data-lucide="heart" class="w-8 h-8"></i>
                </div>
                <h4 class="font-serif text-lg font-medium text-botanika-800">No tienes favoritos aún</h4>
                <p class="text-xs text-botanika-700 max-w-xs mx-auto">Toca el corazón en cualquier producto para guardarlo y revisarlo cuando quieras.</p>
            </div>
        `;
    } else {
        container.innerHTML = wishProducts.map(p => `
            <div class="flex items-center space-x-3 p-3 rounded-2xl bg-botanika-50 border border-botanika-200">
                <img src="${p.image}" alt="${p.name}" class="w-16 h-16 rounded-xl object-cover bg-white flex-shrink-0 cursor-pointer" onclick="closeWishlistDrawer(); navigateTo('product', ${p.id});">
                <div class="flex-grow min-w-0">
                    <h5 class="text-xs font-semibold text-botanika-800 truncate cursor-pointer hover:text-botanika-600" onclick="closeWishlistDrawer(); navigateTo('product', ${p.id});">${p.name}</h5>
                    <p class="text-[11px] text-botanika-700">${p.category}</p>
                    <span class="font-serif font-bold text-sm text-botanika-800 block mt-0.5">$${p.price.toLocaleString()}</span>
                </div>
                <div class="flex flex-col items-end space-y-2">
                    <button onclick="toggleWishlist(${p.id})" class="text-botanika-terracota hover:opacity-80 transition" title="Remover">
                        <i data-lucide="x" class="w-4 h-4"></i>
                    </button>
                    <button onclick="addToCart(${p.id}); closeWishlistDrawer();" class="btn-primary text-[10px] py-1.5 px-3 rounded-lg">
                        Mover al Carrito
                    </button>
                </div>
            </div>
        `).join('');
    }

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// =============================================================================
// QUICK VIEW (VISTA RÁPIDA DE PRODUCTO)
// =============================================================================

function openQuickView(id) {
    const p = products.find(prod => prod.id === id);
    if (!p) return;

    const modal = document.getElementById('quick-view-modal');
    const card = document.getElementById('quick-view-card');
    if (!modal || !card) return;

    card.innerHTML = `
        <button onclick="closeQuickView()" class="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md border border-botanika-200 flex items-center justify-center text-botanika-800 hover:bg-botanika-100 transition" aria-label="Cerrar">
            <i data-lucide="x" class="w-5 h-5"></i>
        </button>
        <div class="grid grid-cols-1 md:grid-cols-2">
            <div class="relative bg-botanika-100 h-72 md:h-full">
                <img src="${p.image}" alt="${p.name}" class="w-full h-full object-cover">
                ${p.badge ? `<span class="absolute top-4 left-4 bg-botanika-800/90 text-white text-[11px] uppercase tracking-wider font-semibold px-3 py-1 rounded-full shadow-sm">${p.badge}</span>` : ''}
            </div>
            <div class="p-6 md:p-8 flex flex-col justify-between space-y-5">
                <div class="space-y-2">
                    <span class="text-xs font-semibold uppercase tracking-widest text-botanika-600">${p.category}</span>
                    <h3 class="font-serif text-2xl font-medium text-botanika-800">${p.name}</h3>
                    <div class="flex items-center space-x-2 text-xs text-botanika-700">
                        <span class="text-amber-500 font-bold">★ ${p.rating}</span>
                        <span>(${p.reviewsCount} reseñas verificadas)</span>
                    </div>
                    <p class="font-serif text-2xl font-bold text-botanika-800 pt-1">$${p.price.toLocaleString()}</p>
                    <p class="text-xs text-botanika-700 leading-relaxed pt-2">${p.description}</p>
                </div>

                <div class="grid grid-cols-3 gap-2 py-3 border-y border-botanika-100 text-center text-xs text-botanika-700">
                    <div>
                        <span class="block font-bold text-[10px] uppercase text-botanika-600">Luz</span>
                        <span>${p.light}</span>
                    </div>
                    <div>
                        <span class="block font-bold text-[10px] uppercase text-botanika-600">Maceta</span>
                        <span>${p.pot}</span>
                    </div>
                    <div>
                        <span class="block font-bold text-[10px] uppercase text-botanika-600">Mascotas</span>
                        <span>${p.petFriendly ? 'Pet Friendly 🐾' : 'No pet-friendly'}</span>
                    </div>
                </div>

                <div class="space-y-2 pt-2">
                    <button onclick="addToCart(${p.id}); closeQuickView();" class="btn-primary w-full py-3.5 text-xs font-semibold">
                        <i data-lucide="shopping-bag" class="w-4 h-4"></i>
                        <span>Agregar al Carrito</span>
                    </button>
                    <button onclick="closeQuickView(); navigateTo('product', ${p.id});" class="btn-secondary w-full py-3 text-xs">
                        Ver Detalles Completos
                    </button>
                </div>
            </div>
        </div>
    `;

    modal.classList.remove('opacity-0', 'pointer-events-none');
    card.classList.remove('scale-95');
    card.classList.add('scale-100');
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function closeQuickView() {
    const modal = document.getElementById('quick-view-modal');
    const card = document.getElementById('quick-view-card');
    if (!modal || !card) return;
    modal.classList.add('opacity-0', 'pointer-events-none');
    card.classList.remove('scale-100');
    card.classList.add('scale-95');
}

// =============================================================================
// QUIZ BOTÁNICO: "¿QUÉ PLANTA ES PARA VOS?"
// =============================================================================

const QUIZ_QUESTIONS = [
    {
        title: "¿Cuánta luz natural recibe tu espacio?",
        desc: "Mirá la habitación donde querés colocar tu planta a las 2 de la tarde.",
        options: [
            { label: "Mucha luz directa o sol de mañana", value: "high_light", hint: "Cerca de ventana norte o balcón soleado" },
            { label: "Luz indirecta brillante / semisombra", value: "medium_light", hint: "Habitación luminosa pero sin sol abrasador" },
            { label: "Poca luz o ventana a pulmón de edificio", value: "low_light", hint: "Espacios interiores más resguardados" }
        ]
    },
    {
        title: "¿Compartís el hogar con mascotas curiosas?",
        desc: "Perros o gatos que tengan la costumbre de masticar hojas.",
        options: [
            { label: "Sí, necesito que sea 100% segura (Pet Friendly)", value: "pet_yes", hint: "Priorizamos variedades no tóxicas" },
            { label: "No tengo mascotas o están fuera de su alcance", value: "pet_no", hint: "Podés elegir cualquier variedad botánica" }
        ]
    },
    {
        title: "¿Cuál es tu nivel de experiencia cuidando plantas?",
        desc: "Sé honesto para que te recomendemos una compañera que disfrutes.",
        options: [
            { label: "Principiante total (a veces me olvido de regar)", value: "beginner", hint: "Variedades resistentes y de bajo mantenimiento" },
            { label: "Intermedio (disfruto podar, abonar y ver brotes)", value: "intermediate", hint: "Crecimiento continuo y belleza escultural" },
            { label: "Avanzado (busco una pieza de diseño botánico)", value: "advanced", hint: "Ejemplares imponentes con presencia" }
        ]
    }
];

function openQuizModal() {
    quizState = { step: 0, answers: {}, recommendedProduct: null };
    const modal = document.getElementById('quiz-modal');
    const card = document.getElementById('quiz-modal-card');
    if (modal && card) {
        modal.classList.remove('opacity-0', 'pointer-events-none');
        card.classList.remove('scale-95');
        card.classList.add('scale-100');
        renderQuizStep();
    }
}

function closeQuizModal() {
    const modal = document.getElementById('quiz-modal');
    const card = document.getElementById('quiz-modal-card');
    if (modal && card) {
        modal.classList.add('opacity-0', 'pointer-events-none');
        card.classList.remove('scale-100');
        card.classList.add('scale-95');
    }
}

function renderQuizStep() {
    const body = document.getElementById('quiz-body');
    if (!body) return;

    if (quizState.step < QUIZ_QUESTIONS.length) {
        const q = QUIZ_QUESTIONS[quizState.step];
        const progress = Math.round(((quizState.step + 1) / QUIZ_QUESTIONS.length) * 100);

        body.innerHTML = `
            <div class="space-y-2">
                <div class="flex justify-between text-xs text-botanika-700 font-medium">
                    <span>Pregunta ${quizState.step + 1} de ${QUIZ_QUESTIONS.length}</span>
                    <span>${progress}%</span>
                </div>
                <div class="w-full bg-botanika-200 h-1.5 rounded-full overflow-hidden">
                    <div class="bg-botanika-600 h-full transition-all duration-300" style="width: ${progress}%;"></div>
                </div>
                <h4 class="font-serif text-xl font-medium text-botanika-800 pt-3">${q.title}</h4>
                <p class="text-xs text-botanika-700">${q.desc}</p>
            </div>

            <div class="space-y-3 pt-2">
                ${q.options.map((opt, i) => `
                    <button onclick="selectQuizAnswer('${opt.value}')" class="w-full text-left p-4 rounded-2xl border-2 border-botanika-200 hover:border-botanika-600 hover:bg-botanika-50 transition flex items-start space-x-3 group">
                        <span class="w-6 h-6 rounded-full bg-botanika-200 text-botanika-800 group-hover:bg-botanika-600 group-hover:text-white flex items-center justify-center font-bold text-xs flex-shrink-0 transition">
                            ${i + 1}
                        </span>
                        <div>
                            <p class="font-medium text-sm text-botanika-800 group-hover:text-botanika-600 transition">${opt.label}</p>
                            <p class="text-xs text-botanika-700 mt-0.5">${opt.hint}</p>
                        </div>
                    </button>
                `).join('')}
            </div>
        `;
    } else {
        let recId = 1;
        if (quizState.answers[0] === 'low_light' || quizState.answers[2] === 'beginner') {
            recId = 5; // Kit Sansevieria
        } else if (quizState.answers[1] === 'pet_yes') {
            recId = 6; // Pilea (pet friendly)
        } else if (quizState.answers[0] === 'high_light') {
            recId = 2; // Ficus Lyrata
        } else {
            recId = 1; // Monstera Deliciosa
        }

        const rec = products.find(p => p.id === recId) || products[0];

        body.innerHTML = `
            <div class="text-center space-y-4">
                <div class="inline-flex items-center space-x-2 bg-botanika-100 text-botanika-800 px-3.5 py-1.5 rounded-full text-xs font-semibold border border-botanika-300">
                    <i data-lucide="sparkles" class="w-3.5 h-3.5 text-botanika-terracota"></i>
                    <span>Tu Compañera Ideal Según Tus Respuestas</span>
                </div>

                <h4 class="font-serif text-2xl font-medium text-botanika-800">¡Encontramos tu match verde!</h4>

                <div class="bg-botanika-50 p-4 rounded-3xl border border-botanika-200 text-left flex items-center space-x-4">
                    <img src="${rec.image}" alt="${rec.name}" class="w-24 h-24 rounded-2xl object-cover bg-white flex-shrink-0 shadow-sm">
                    <div class="min-w-0">
                        <span class="text-[10px] uppercase font-bold tracking-wider text-botanika-600">${rec.category}</span>
                        <h5 class="font-serif text-lg font-medium text-botanika-800 truncate">${rec.name}</h5>
                        <p class="text-xs text-botanika-700 line-clamp-2 mt-0.5">${rec.description}</p>
                        <span class="font-serif font-bold text-base text-botanika-800 block mt-1">$${rec.price.toLocaleString()}</span>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-2 pt-2">
                    <button onclick="addToCart(${rec.id}); closeQuizModal();" class="btn-primary text-xs py-3 w-full">
                        <i data-lucide="shopping-bag" class="w-4 h-4"></i>
                        <span>Agregar al Carrito</span>
                    </button>
                    <button onclick="closeQuizModal(); handleDirectBuy(${rec.id});" class="btn-terracota text-xs py-3 w-full">
                        Comprar Ahora
                    </button>
                </div>

                <button onclick="openQuizModal()" class="text-xs text-botanika-700 underline hover:text-botanika-800 block mx-auto pt-1">
                    Volver a hacer el quiz
                </button>
            </div>
        `;
    }

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function selectQuizAnswer(val) {
    quizState.answers[quizState.step] = val;
    quizState.step += 1;
    renderQuizStep();
}

// =============================================================================
// CONFIGURADOR 2D "ARMÁ TU MACETA" (ACABADO, TAMAÑO Y PLANTA)
// =============================================================================

function calculateConfigPrice() {
    const finish = POT_FINISHES[configuratorState.finish];
    const size = POT_SIZES[configuratorState.size];
    return finish.basePrice + size.priceDelta;
}

function updateConfiguratorPreview() {
    const finish = POT_FINISHES[configuratorState.finish];
    const size = POT_SIZES[configuratorState.size];
    const plant = POT_PLANTS[configuratorState.plant];
    const total = calculateConfigPrice();

    // Actualizar elementos de texto
    const priceEl = document.getElementById('config-price');
    const nameEl = document.getElementById('config-name');
    const descEl = document.getElementById('config-desc');
    const sizeBadge = document.getElementById('config-size-badge');

    if (priceEl) priceEl.innerText = `$${total.toLocaleString()}`;
    if (nameEl) nameEl.innerText = `${finish.name} (${size.short})`;
    if (descEl) descEl.innerText = finish.textureText;
    if (sizeBadge) sizeBadge.innerText = `${size.label} • ${plant.name}`;

    // Actualizar SVG de la Maceta
    const potBody = document.getElementById('pot-svg-body');
    const potRim = document.getElementById('pot-svg-rim');
    const potInner = document.getElementById('pot-svg-inner');
    const potHighlight = document.getElementById('pot-svg-highlight');
    const potWrap = document.getElementById('pot-preview-wrap');
    const plantLayer = document.getElementById('pot-plant-container');

    if (potBody) potBody.setAttribute('fill', finish.bodyGradient);
    if (potRim) potRim.setAttribute('fill', finish.rimColor);
    if (potInner) potInner.setAttribute('fill', finish.innerColor);
    if (potHighlight) potHighlight.setAttribute('opacity', finish.specularOpacity);

    // Escalar según tamaño S / M / L
    if (potWrap) {
        potWrap.className = `pot-preview-wrap ${size.scaleClass}`;
    }

    // Cambiar la planta interior
    if (plantLayer) {
        plantLayer.innerHTML = `
            <svg viewBox="0 0 240 200" class="w-full h-full">
                ${plant.svgPath}
            </svg>
        `;
    }

    // Actualizar botones de acabado
    Object.keys(POT_FINISHES).forEach(k => {
        const btn = document.getElementById(`finish-btn-${k}`);
        if (btn) {
            btn.className = k === configuratorState.finish 
                ? 'w-full flex items-center justify-between p-3.5 rounded-2xl border-2 border-botanika-600 bg-botanika-50 text-left transition'
                : 'w-full flex items-center justify-between p-3.5 rounded-2xl border border-botanika-300 hover:border-botanika-600 bg-white text-left transition';
        }
    });

    // Actualizar botones de tamaño
    Object.keys(POT_SIZES).forEach(s => {
        const btn = document.getElementById(`size-btn-${s}`);
        if (btn) {
            btn.className = s === configuratorState.size
                ? 'py-2 px-3.5 rounded-xl border-2 border-botanika-600 bg-botanika-600 text-white font-semibold text-xs transition shadow-2xs'
                : 'py-2 px-3.5 rounded-xl border border-botanika-300 hover:border-botanika-600 bg-white text-botanika-800 text-xs font-medium transition';
        }
    });

    // Actualizar botones de planta
    Object.keys(POT_PLANTS).forEach(p => {
        const btn = document.getElementById(`plant-btn-${p}`);
        if (btn) {
            btn.className = p === configuratorState.plant
                ? 'p-2.5 rounded-xl border-2 border-botanika-600 bg-botanika-50 text-xs font-semibold text-botanika-800 transition flex items-center space-x-2'
                : 'p-2.5 rounded-xl border border-botanika-300 hover:border-botanika-600 bg-white text-xs font-medium text-botanika-700 transition flex items-center space-x-2';
        }
    });
}

function selectPotFinish(finishKey) {
    if (!POT_FINISHES[finishKey]) return;
    configuratorState.finish = finishKey;
    updateConfiguratorPreview();
    showToast(`Acabado: ${POT_FINISHES[finishKey].name}`);
}

function selectPotSize(sizeKey) {
    if (!POT_SIZES[sizeKey]) return;
    configuratorState.size = sizeKey;
    updateConfiguratorPreview();
    showToast(`Tamaño seleccionado: ${POT_SIZES[sizeKey].label}`);
}

function selectPotPlant(plantKey) {
    if (!POT_PLANTS[plantKey]) return;
    configuratorState.plant = plantKey;
    updateConfiguratorPreview();
    showToast(`Planta elegida: ${POT_PLANTS[plantKey].name}`);
}

function addCustomPotToCart() {
    const finish = POT_FINISHES[configuratorState.finish];
    const size = POT_SIZES[configuratorState.size];
    const plant = POT_PLANTS[configuratorState.plant];
    const totalPrice = calculateConfigPrice();

    const customItem = {
        id: 400 + (configuratorState.finish === 'terracota' ? 10 : configuratorState.finish === 'blanca' ? 20 : 30) + (configuratorState.size === 's' ? 1 : configuratorState.size === 'm' ? 2 : 3),
        name: `Maceta de Autor (${finish.name}) + ${plant.name}`,
        price: totalPrice,
        qty: 1,
        image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&q=80&w=300",
        pot: `${finish.name} (${size.short}) con ${plant.name}`
    };

    const existing = cart.find(item => item.id === customItem.id);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push(customItem);
    }

    updateCartBadge();
    showToast(`"${customItem.name}" agregada al carrito`);
    openCartDrawer();
}

// =============================================================================
// PARALLAX DEL HERO 2D CON EL MOUSE (CSS TRANSFORM + REQUESTANIMATIONFRAME)
// =============================================================================

function initHeroParallax() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || window.innerWidth < 1024) {
        return;
    }
    const stage = document.getElementById('hero-plant-stage');
    const card = document.getElementById('hero-parallax-card');
    if (!stage || !card) return;

    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;
    let isTicking = false;

    function renderParallax() {
        currentX += (targetX - currentX) * 0.08;
        currentY += (targetY - currentY) * 0.08;
        card.style.transform = `perspective(1000px) rotateY(${currentX * 7}deg) rotateX(${-currentY * 7}deg) translate3d(${currentX * 12}px, ${currentY * 12}px, 0)`;

        if (Math.abs(targetX - currentX) > 0.001 || Math.abs(targetY - currentY) > 0.001) {
            requestAnimationFrame(renderParallax);
        } else {
            isTicking = false;
        }
    }

    stage.addEventListener('mousemove', (e) => {
        const rect = stage.getBoundingClientRect();
        targetX = (e.clientX - rect.left) / rect.width - 0.5;
        targetY = (e.clientY - rect.top) / rect.height - 0.5;
        if (!isTicking) {
            isTicking = true;
            requestAnimationFrame(renderParallax);
        }
    });

    stage.addEventListener('mouseleave', () => {
        targetX = 0;
        targetY = 0;
        if (!isTicking) {
            isTicking = true;
            requestAnimationFrame(renderParallax);
        }
    });
}

// =============================================================================
// SCROLL REVEAL CON INTERSECTION OBSERVER (SINGLE-SHOT A 60FPS)
// =============================================================================

function initScrollReveal() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.querySelectorAll('.reveal-on-scroll').forEach(el => el.classList.add('revealed'));
        return;
    }
    const elements = document.querySelectorAll('.reveal-on-scroll:not(.revealed)');
    if (!elements.length) return;

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        elements.forEach(el => observer.observe(el));
    } else {
        elements.forEach(el => el.classList.add('revealed'));
    }
}

// =============================================================================
// AUTENTICACIÓN CON SUPABASE & RUTA PROTEGIDA DE COMPRA
// =============================================================================

function updateAuthUI() {
    const headerContainer = document.getElementById('auth-header-container');
    const mobileContainer = document.getElementById('auth-mobile-container');

    if (currentUser) {
        const displayName = currentUser.user_metadata?.full_name || currentUser.email.split('@')[0];
        const userInitial = displayName.charAt(0).toUpperCase();

        const authHtml = `
            <div class="flex items-center space-x-2">
                <button onclick="navigateTo('profile')" class="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-botanika-100 hover:bg-botanika-200 text-botanika-800 text-xs font-medium transition border border-botanika-300 shadow-sm" title="Ver mi cuenta y órdenes">
                    <span class="w-6 h-6 rounded-full bg-botanika-600 text-white flex items-center justify-center font-bold text-xs">${userInitial}</span>
                    <span class="max-w-[110px] truncate hidden sm:inline">${displayName}</span>
                </button>
                <button onclick="handleSignOut()" class="text-xs text-botanika-700 hover:text-botanika-terracota font-medium px-2 py-1.5 rounded transition underline whitespace-nowrap" title="Cerrar sesión">
                    Cerrar sesión
                </button>
            </div>
        `;
        if (headerContainer) headerContainer.innerHTML = authHtml;

        if (mobileContainer) {
            mobileContainer.innerHTML = `
                <div class="flex items-center justify-between py-2 text-sm">
                    <span class="font-medium text-botanika-800">${currentUser.email}</span>
                    <button onclick="handleSignOut(); toggleMobileMenu(false);" class="text-xs text-botanika-terracota font-semibold underline">Cerrar sesión</button>
                </div>
            `;
        }
    } else {
        const unauthHtml = `
            <button id="btn-header-login" onclick="openAuthModal('login')" class="text-xs font-semibold px-2.5 py-2 text-botanika-800 hover:text-botanika-600 transition whitespace-nowrap">
                Iniciar sesión
            </button>
            <button id="btn-header-register" onclick="openAuthModal('register')" class="btn-primary text-xs py-2 px-3 rounded-xl whitespace-nowrap hidden sm:inline-flex">
                Registrarse
            </button>
        `;
        if (headerContainer) headerContainer.innerHTML = unauthHtml;

        if (mobileContainer) {
            mobileContainer.innerHTML = `
                <div class="grid grid-cols-2 gap-2 pt-2">
                    <button onclick="openAuthModal('login'); toggleMobileMenu(false);" class="w-full py-2 border border-botanika-600 rounded-xl text-xs font-semibold text-center">Iniciar sesión</button>
                    <button onclick="openAuthModal('register'); toggleMobileMenu(false);" class="w-full btn-primary py-2 text-xs text-center">Registrarse</button>
                </div>
            `;
        }
    }

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function openAuthModal(mode = 'login', isProtectedNotice = false) {
    authModalMode = mode;
    const modal = document.getElementById('auth-modal');
    const modalNotice = document.getElementById('auth-prompt-notice');
    const errorBox = document.getElementById('auth-error-box');
    const successBox = document.getElementById('auth-success-box');

    if (errorBox) errorBox.classList.add('hidden');
    if (successBox) successBox.classList.add('hidden');

    if (modalNotice) {
        if (isProtectedNotice) {
            modalNotice.classList.remove('hidden');
        } else {
            modalNotice.classList.add('hidden');
        }
    }

    switchAuthTab(mode);

    if (modal) {
        modal.classList.remove('opacity-0', 'pointer-events-none');
        const card = document.getElementById('auth-modal-card');
        if (card) {
            card.classList.remove('scale-95');
            card.classList.add('scale-100');
        }
    }
}

function closeAuthModal() {
    const modal = document.getElementById('auth-modal');
    const card = document.getElementById('auth-modal-card');
    if (modal) {
        modal.classList.add('opacity-0', 'pointer-events-none');
        if (card) {
            card.classList.remove('scale-100');
            card.classList.add('scale-95');
        }
    }
    const form = document.getElementById('auth-form');
    if (form) form.reset();
}

function switchAuthTab(mode) {
    authModalMode = mode;
    const tabLogin = document.getElementById('auth-tab-login');
    const tabRegister = document.getElementById('auth-tab-register');
    const title = document.getElementById('auth-modal-title');
    const nameGroup = document.getElementById('auth-name-group');
    const nameInput = document.getElementById('auth-name-input');
    const confirmGroup = document.getElementById('auth-confirm-group');
    const confirmInput = document.getElementById('auth-confirm-input');
    const submitText = document.getElementById('auth-submit-text');
    const switchPrompt = document.getElementById('auth-switch-prompt');
    const switchLink = document.getElementById('auth-switch-link');

    if (mode === 'login') {
        if (tabLogin) tabLogin.className = 'py-2 rounded-lg bg-white shadow-sm text-botanika-800 transition font-semibold';
        if (tabRegister) tabRegister.className = 'py-2 rounded-lg text-botanika-700 hover:text-botanika-800 transition';
        if (title) title.innerText = 'Iniciar Sesión';
        if (nameGroup) nameGroup.classList.add('hidden');
        if (nameInput) nameInput.removeAttribute('required');
        if (confirmGroup) confirmGroup.classList.add('hidden');
        if (confirmInput) confirmInput.removeAttribute('required');
        if (submitText) submitText.innerText = 'Iniciar Sesión';
        if (switchPrompt) switchPrompt.innerText = '¿No tienes cuenta todavía?';
        if (switchLink) switchLink.innerText = 'Regístrate gratis';
    } else {
        if (tabRegister) tabRegister.className = 'py-2 rounded-lg bg-white shadow-sm text-botanika-800 transition font-semibold';
        if (tabLogin) tabLogin.className = 'py-2 rounded-lg text-botanika-700 hover:text-botanika-800 transition';
        if (title) title.innerText = 'Crear Cuenta';
        if (nameGroup) nameGroup.classList.remove('hidden');
        if (nameInput) nameInput.setAttribute('required', 'true');
        if (confirmGroup) confirmGroup.classList.remove('hidden');
        if (confirmInput) confirmInput.setAttribute('required', 'true');
        if (submitText) submitText.innerText = 'Crear mi Cuenta';
        if (switchPrompt) switchPrompt.innerText = '¿Ya tienes una cuenta registrada?';
        if (switchLink) switchLink.innerText = 'Ingresar ahora';
    }
}

function toggleAuthMode() {
    switchAuthTab(authModalMode === 'login' ? 'register' : 'login');
}

async function handleAuthSubmit(event) {
    event.preventDefault();

    const email = document.getElementById('auth-email-input')?.value?.trim();
    const password = document.getElementById('auth-password-input')?.value;
    const fullName = document.getElementById('auth-name-input')?.value?.trim();
    const confirmPassword = document.getElementById('auth-confirm-input')?.value;

    const errorBox = document.getElementById('auth-error-box');
    const errorMsg = document.getElementById('auth-error-message');
    const successBox = document.getElementById('auth-success-box');
    const successMsg = document.getElementById('auth-success-message');
    const submitBtn = document.getElementById('auth-submit-btn');
    const submitText = document.getElementById('auth-submit-text');

    if (errorBox) errorBox.classList.add('hidden');
    if (successBox) successBox.classList.add('hidden');

    if (authModalMode === 'register' && password !== confirmPassword) {
        if (errorBox && errorMsg) {
            errorMsg.innerText = 'Las contraseñas no coinciden.';
            errorBox.classList.remove('hidden');
        }
        return;
    }

    if (submitBtn) submitBtn.disabled = true;
    if (submitText) submitText.innerText = 'Conectando con Supabase...';

    try {
        if (authModalMode === 'register') {
            const { user, session } = await window.botanikaSupabase.signUp(email, password, fullName);
            currentUser = session?.user || user;
            if (successBox && successMsg) {
                successMsg.innerText = '¡Cuenta creada con éxito en Supabase!';
                successBox.classList.remove('hidden');
            }
            showToast('¡Registro exitoso! Bienvenido a Botanika.');
        } else {
            const { user } = await window.botanikaSupabase.signIn(email, password);
            currentUser = user;
            if (successBox && successMsg) {
                successMsg.innerText = '¡Sesión iniciada correctamente!';
                successBox.classList.remove('hidden');
            }
            showToast('¡Sesión iniciada con éxito!');
        }

        updateAuthUI();

        setTimeout(() => {
            closeAuthModal();
            if (submitBtn) submitBtn.disabled = false;
            if (pendingAction) {
                const action = pendingAction;
                pendingAction = null;
                if (action.type === 'checkout') {
                    navigateTo('checkout');
                } else if (action.type === 'pay_mercadopago') {
                    handleMercadoPagoPayment();
                }
            } else if (currentView === 'checkout') {
                renderView();
            }
        }, 650);

    } catch (err) {
        console.error('Error de autenticación con Supabase:', err);
        if (errorBox && errorMsg) {
            errorMsg.innerText = err.message || 'Error de autenticación. Verifica tus credenciales.';
            errorBox.classList.remove('hidden');
        }
        if (submitBtn) submitBtn.disabled = false;
        if (submitText) submitText.innerText = authModalMode === 'login' ? 'Iniciar Sesión' : 'Crear mi Cuenta';
    }
}

async function handleSignOut() {
    try {
        await window.botanikaSupabase.signOut();
        currentUser = null;
        updateAuthUI();
        showToast('Sesión cerrada correctamente');
        if (currentView === 'profile' || currentView === 'checkout') {
            navigateTo('home');
        }
    } catch (e) {
        console.warn('Error al cerrar sesión:', e);
    }
}

function handleDirectBuy(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existing = cart.find(item => item.id === productId);
    if (!existing) {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            qty: 1,
            image: product.image,
            pot: product.pot
        });
        updateCartBadge();
    }

    if (!currentUser) {
        pendingAction = { type: 'checkout', productId };
        openAuthModal('login', true);
        return;
    }

    navigateTo('checkout');
}

// =============================================================================
// MERCADO PAGO Y ÓRDENES EN SUPABASE
// =============================================================================

function getApiBaseUrl() {
    if (window.BOTANIKA_API_URL) {
        return window.BOTANIKA_API_URL.replace(/\/+$/, '');
    }
    const isLocal = window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1' || 
                    window.location.protocol === 'file:';
    return isLocal ? 'http://localhost:3000' : '';
}

async function handleMercadoPagoPayment() {
    if (cart.length === 0) {
        showToast('Tu carrito está vacío.', 'error');
        return;
    }

    if (!currentUser) {
        pendingAction = { type: 'pay_mercadopago' };
        openAuthModal('login', true);
        return;
    }

    const btn = document.getElementById('checkout-submit-btn');
    const originalContent = btn ? btn.innerHTML : '';
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `
            <span class="inline-flex items-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                Registrando orden en Supabase...
            </span>
        `;
    }

    try {
        const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
        const discount = discountApplied ? subtotal * 0.1 : 0;
        const shippingCost = selectedShippingMethod === 'free' ? 0 : 3500;
        const total = Math.max(0, subtotal - discount + shippingCost);

        const buyerName = document.getElementById('buyer-name')?.value?.trim() || currentUser.user_metadata?.full_name || 'Cliente';
        const buyerSurname = document.getElementById('buyer-surname')?.value?.trim() || 'Botanika';
        const buyerEmail = document.getElementById('buyer-email')?.value?.trim() || currentUser.email;
        const buyerAddress = document.getElementById('buyer-address')?.value?.trim() || 'Av. Libertador 1450';
        const buyerCity = document.getElementById('buyer-city')?.value?.trim() || 'Buenos Aires';
        const buyerZip = document.getElementById('buyer-zip')?.value?.trim() || '1425';

        showToast('Creando orden de compra en Supabase...');
        const supabaseOrder = await window.botanikaSupabase.createOrder({
            items: cart,
            totalAmount: total,
            shippingCost,
            shippingMethod: selectedShippingMethod,
            shippingAddress: {
                name: `${buyerName} ${buyerSurname}`,
                address: buyerAddress,
                city: buyerCity,
                zip: buyerZip,
                email: buyerEmail
            },
            productId: cart[0]?.id || 1
        });

        lastOrderId = supabaseOrder.id;

        if (btn) {
            btn.innerHTML = `
                <span class="inline-flex items-center">
                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    Conectando con Mercado Pago Checkout Pro...
                </span>
            `;
        }

        const apiBaseUrl = getApiBaseUrl();
        let currentFullUrl = '';
        try {
            if (window.location.href && !window.location.href.startsWith('file:') && !window.location.href.includes('about:blank')) {
                currentFullUrl = window.location.href.split('?')[0].split('#')[0];
            }
        } catch (e) {}

        const clientOrigin = currentFullUrl || ((window.location.origin && window.location.origin !== 'null')
            ? window.location.origin
            : 'https://bugsbasters-cuartosemestre.vercel.app');

        const response = await fetch(`${apiBaseUrl}/api/payments/create-preference`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                items: cart,
                shippingCost,
                clientUrl: clientOrigin,
                orderId: supabaseOrder.id,
                payer: {
                    name: buyerName,
                    surname: buyerSurname,
                    email: buyerEmail
                }
            })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || 'No se pudo generar la preferencia en Mercado Pago.');
        }

        const checkoutUrl = data.checkoutUrl || data.initPoint || data.sandboxInitPoint;
        if (checkoutUrl) {
            const redirectMsg = data.isSandbox 
                ? 'Redirigiendo a pasarela segura Mercado Pago (Sandbox)...' 
                : 'Redirigiendo a pasarela segura Mercado Pago...';
            showToast(redirectMsg);
            setTimeout(() => {
                window.location.href = checkoutUrl;
            }, 300);
        } else {
            throw new Error('No se recibió enlace de pago de Mercado Pago.');
        }
    } catch (error) {
        console.error('Error al procesar compra con Mercado Pago:', error);
        showToast(error.message || 'Error de conexión con el backend de pagos.', 'error');
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = originalContent;
        }
    }
}

async function handlePaymentReturnAndInit() {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status') || params.get('collection_status');
    const paymentId = params.get('payment_id') || params.get('collection_id');
    const externalRef = params.get('external_reference') || params.get('order_id');

    if (paymentId) lastPaymentId = paymentId;
    if (externalRef) lastOrderId = externalRef;

    currentUser = await window.botanikaSupabase.getUser();
    updateAuthUI();
    updateWishlistBadge();

    if (status === 'approved') {
        cart = [];
        updateCartBadge();

        if (lastOrderId) {
            try {
                await window.botanikaSupabase.updateOrderStatus(lastOrderId, 'aprobado', paymentId);
            } catch (e) {}
        }
        navigateTo('success');
    } else if (status === 'failure' || status === 'rejected') {
        if (lastOrderId) {
            try {
                await window.botanikaSupabase.updateOrderStatus(lastOrderId, 'rechazado', paymentId);
            } catch (e) {}
        }
        showToast('El pago no pudo procesarse. Por favor reintenta con otro medio.', 'error');
        navigateTo('cart');
    } else if (status === 'pending' || status === 'in_process') {
        showToast('Tu pago está pendiente de acreditación en Mercado Pago.', 'info');
        navigateTo('profile');
    } else {
        renderView();
    }
}

// =============================================================================
// RENDERIZADO CENTRAL DE VISTAS (SPA)
// =============================================================================

function renderView() {
    const main = document.getElementById('main-content');
    if (!main) return;
    updateCartBadge();
    updateAuthUI();

    switch (currentView) {
        case 'home':
            main.innerHTML = renderHome();
            initHeroParallax();
            break;
        case 'catalog':
            main.innerHTML = renderCatalog();
            break;
        case 'product':
            main.innerHTML = renderProductDetail();
            break;
        case 'cart':
            main.innerHTML = renderCart();
            break;
        case 'checkout':
            main.innerHTML = renderCheckout();
            break;
        case 'profile':
            main.innerHTML = renderProfile();
            loadUserOrdersAsync();
            break;
        case 'success':
            main.innerHTML = renderSuccess();
            break;
        default:
            main.innerHTML = renderHome();
            initHeroParallax();
    }

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    initScrollReveal();
}

// =============================================================================
// LANDING PAGE CON HERO 2D ELEGANTE Y CONFIGURADOR 2D
// =============================================================================

function renderHome() {
    const activeFinish = POT_FINISHES[configuratorState.finish];
    const activePlant = POT_PLANTS[configuratorState.plant];
    const activeSize = POT_SIZES[configuratorState.size];
    const currentConfigPrice = calculateConfigPrice();

    return `
        <!-- =================================================================== -->
        <!-- SECCIÓN 2: HERO 2D CON COMPOSICIÓN EDITORIAL Y PARALLAX SUAVE       -->
        <!-- =================================================================== -->
        <section id="landing-hero" class="relative bg-gradient-to-b from-botanika-100 via-botanika-50 to-botanika-50 overflow-hidden py-14 md:py-24 border-b border-botanika-200">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                
                <div class="lg:col-span-6 space-y-6 reveal-on-scroll">
                    <div class="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-md text-botanika-800 text-xs tracking-widest uppercase font-semibold px-4 py-2 rounded-full border border-botanika-200 shadow-subtle">
                        <i data-lucide="sparkles" class="w-3.5 h-3.5 text-botanika-terracota"></i>
                        <span>Studio Botánico & Diseño Sustentable</span>
                    </div>

                    <h1 class="font-serif text-4xl sm:text-5xl lg:text-6xl text-botanika-800 leading-[1.12] tracking-tight">
                        Naturaleza viva, <br>
                        <span class="italic text-botanika-600 font-normal">diseño y calma</span> para tu hogar.
                    </h1>

                    <p class="text-botanika-700 text-base sm:text-lg max-w-xl leading-relaxed">
                        Curamos plantas de interior aclimatadas en vivero y torneamos macetas artesanales en barro y gres cerámico. Envíos climatizados en 48hs con garantía de reposición.
                    </p>

                    <!-- Acciones principales -->
                    <div class="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-2">
                        <button onclick="goToLandingSection('productos')" class="btn-primary py-4 px-8 text-base">
                            <span>Comprar Ahora</span>
                            <i data-lucide="arrow-right" class="w-4 h-4"></i>
                        </button>
                        <button onclick="goToLandingSection('configurador')" class="btn-secondary py-4 px-8 text-base flex items-center justify-center space-x-2">
                            <i data-lucide="palette" class="w-4 h-4 text-botanika-terracota"></i>
                            <span>Armá tu Maceta</span>
                        </button>
                    </div>

                    <!-- Métricas de confianza -->
                    <div class="grid grid-cols-3 gap-4 pt-6 border-t border-botanika-200 max-w-lg">
                        <div>
                            <span class="font-serif text-2xl font-bold text-botanika-800 block">48hs</span>
                            <span class="text-xs text-botanika-700">Entrega cuidada</span>
                        </div>
                        <div>
                            <span class="font-serif text-2xl font-bold text-botanika-800 block">+2.500</span>
                            <span class="text-xs text-botanika-700">Hogares verdes</span>
                        </div>
                        <div>
                            <span class="font-serif text-2xl font-bold text-botanika-terracota block">30 Días</span>
                            <span class="text-xs text-botanika-700">Garantía verde</span>
                        </div>
                    </div>
                </div>

                <!-- Composición 2D con Sombras Suaves y Parallax al Mouse -->
                <div class="lg:col-span-6 relative flex justify-center reveal-on-scroll stagger-2">
                    <div class="hero-plant-stage" id="hero-plant-stage">
                        
                        <!-- Aura de luz difuminada orgánica -->
                        <div class="hero-aura-glow"></div>

                        <!-- Hojas botánicas decorativas en SVG -->
                        <svg class="floating-leaf leaf-top-right" viewBox="0 0 100 100" fill="none">
                            <path d="M 10 90 C 10 40 40 10 90 10 C 90 60 60 90 10 90 Z" fill="#526E5D"/>
                            <path d="M 10 90 Q 50 50 90 10" stroke="#FAF8F5" stroke-width="2" stroke-linecap="round"/>
                        </svg>

                        <svg class="floating-leaf leaf-bottom-left" viewBox="0 0 100 100" fill="none">
                            <path d="M 90 90 C 90 35 55 10 10 10 C 10 65 45 90 90 90 Z" fill="#D07A58"/>
                            <path d="M 90 90 Q 50 50 10 10" stroke="#FAF8F5" stroke-width="2" stroke-linecap="round"/>
                        </svg>

                        <!-- Tarjeta principal con Parallax fluido -->
                        <div class="hero-main-card" id="hero-parallax-card">
                            <img src="https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&q=80&w=800" 
                                alt="Ficus Lyrata en Maceta Artesanal Botanika" 
                                loading="eager">
                        </div>

                        <!-- Tarjeta flotante "100% Climatizadas" -->
                        <div class="hero-floating-pill">
                            <div class="w-10 h-10 rounded-2xl bg-botanika-600 text-white flex items-center justify-center font-serif text-lg shadow-sm">
                                🌿
                            </div>
                            <div>
                                <p class="text-xs font-bold text-botanika-800">100% Climatizadas</p>
                                <p class="text-[11px] text-botanika-700">Listas para iluminar tu espacio</p>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </section>

        <!-- =================================================================== -->
        <!-- SECCIÓN 3: BENEFICIOS EN LAYOUT TIPO "BENTO GRID"                   -->
        <!-- =================================================================== -->
        <section id="landing-beneficios" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div class="text-center max-w-2xl mx-auto mb-16 space-y-3 reveal-on-scroll">
                <span class="text-botanika-terracota font-semibold text-xs tracking-widest uppercase">Por qué elegir Botanika</span>
                <h2 class="font-serif text-3xl sm:text-4xl font-medium text-botanika-800">Cuidado botánico en cada detalle</h2>
                <p class="text-botanika-700 text-sm sm:text-base leading-relaxed">
                    Ecosistema integral para que tus plantas prosperen, con diseño biofílico y logística especializada antiestrés.
                </p>
            </div>

            <div class="bento-grid">
                
                <!-- Bento 1 (Grande horizontal) -->
                <div class="bento-card md:col-span-8 bg-gradient-to-br from-white via-white to-botanika-50 reveal-on-scroll stagger-1">
                    <div class="bento-glow bg-botanika-200 top-0 right-0"></div>
                    <div class="space-y-4 max-w-lg z-10">
                        <div class="w-12 h-12 rounded-2xl bg-botanika-100 text-botanika-600 flex items-center justify-center shadow-subtle">
                            <i data-lucide="sprout" class="w-6 h-6"></i>
                        </div>
                        <span class="text-xs font-semibold uppercase tracking-wider text-botanika-600">Curaduría Botánica</span>
                        <h3 class="font-serif text-2xl font-medium text-botanika-800">Seleccionadas a mano y aclimatadas en vivero</h3>
                        <p class="text-botanika-700 text-sm leading-relaxed">
                            No intermediamos plantas frágiles. Cada ejemplar pasa por un proceso de aclimatación de 3 semanas en nuestro invernáculo para garantizar raíces fuertes antes de llegar a tus manos.
                        </p>
                    </div>
                    <div class="pt-6 z-10 flex items-center space-x-4 text-xs font-semibold text-botanika-800">
                        <span class="flex items-center space-x-1.5"><i data-lucide="check-circle" class="w-4 h-4 text-botanika-600"></i> Raíces inspeccionadas</span>
                        <span class="flex items-center space-x-1.5"><i data-lucide="check-circle" class="w-4 h-4 text-botanika-600"></i> Cero plagas</span>
                    </div>
                </div>

                <!-- Bento 2 (Vertical) -->
                <div class="bento-card md:col-span-4 bg-white reveal-on-scroll stagger-2">
                    <div class="bento-glow bg-botanika-terracota/20 bottom-0 left-0"></div>
                    <div class="space-y-4 z-10">
                        <div class="w-12 h-12 rounded-2xl bg-botanika-100 text-botanika-terracota flex items-center justify-center shadow-subtle">
                            <i data-lucide="shield-check" class="w-6 h-6"></i>
                        </div>
                        <span class="text-xs font-semibold uppercase tracking-wider text-botanika-terracota">Compromiso Total</span>
                        <h3 class="font-serif text-xl font-medium text-botanika-800">Garantía Verde 30 Días</h3>
                        <p class="text-botanika-700 text-xs sm:text-sm leading-relaxed">
                            Si tu compañera verde no se adapta a la luminosidad de tu hogar en el primer mes, nuestro equipo botánico te asesora o te enviamos un reemplazo sin costo.
                        </p>
                    </div>
                    <div class="pt-6 z-10">
                        <span class="inline-flex items-center space-x-1 text-xs font-semibold text-botanika-terracota">
                            <span>Reposición 100% asegurada</span>
                            <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
                        </span>
                    </div>
                </div>

                <!-- Bento 3 -->
                <div class="bento-card md:col-span-4 bg-white reveal-on-scroll stagger-3">
                    <div class="space-y-4 z-10">
                        <div class="w-12 h-12 rounded-2xl bg-botanika-100 text-botanika-600 flex items-center justify-center shadow-subtle">
                            <i data-lucide="package-check" class="w-6 h-6"></i>
                        </div>
                        <h3 class="font-serif text-xl font-medium text-botanika-800">Packaging Térmico Antiestrés</h3>
                        <p class="text-botanika-700 text-xs sm:text-sm leading-relaxed">
                            Caja de cartón reciclable reforzada con fijación de cepellón y aislante térmico. El follaje viaja intacto sin sufrir oscilaciones de temperatura.
                        </p>
                    </div>
                </div>

                <!-- Bento 4 (Grande horizontal complementario) -->
                <div class="bento-card md:col-span-8 bg-gradient-to-r from-botanika-50 to-white reveal-on-scroll stagger-4">
                    <div class="bento-glow bg-botanika-200/50 top-0 left-1/2"></div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-center z-10">
                        <div class="space-y-3">
                            <div class="w-12 h-12 rounded-2xl bg-botanika-100 text-botanika-600 flex items-center justify-center shadow-subtle">
                                <i data-lucide="palette" class="w-6 h-6"></i>
                            </div>
                            <span class="text-xs font-semibold uppercase tracking-wider text-botanika-600">Artesanía de Autor</span>
                            <h3 class="font-serif text-2xl font-medium text-botanika-800">Macetas con drenaje biofílico</h3>
                            <p class="text-botanika-700 text-xs sm:text-sm leading-relaxed">
                                Diseños exclusivos moldeados en barro de alta porosidad y gres esmaltado. Cuentan con orificio de drenaje y plato a medida para proteger tus muebles.
                            </p>
                        </div>
                        <div class="rounded-2xl overflow-hidden h-40 bg-white border border-botanika-200 shadow-sm">
                            <img src="https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&q=80&w=400" 
                                alt="Macetas de autor" class="w-full h-full object-cover">
                        </div>
                    </div>
                </div>

            </div>
        </section>

        <!-- =================================================================== -->
        <!-- SECCIÓN 4: CÓMO FUNCIONA (4 PASOS)                                  -->
        <!-- =================================================================== -->
        <section id="landing-como-funciona" class="bg-botanika-100/70 border-y border-botanika-200 py-20">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="text-center max-w-2xl mx-auto mb-16 space-y-3 reveal-on-scroll">
                    <span class="text-botanika-terracota font-semibold text-xs tracking-widest uppercase">Experiencia sin fricciones</span>
                    <h2 class="font-serif text-3xl sm:text-4xl font-medium text-botanika-800">¿Cómo llega tu selva urbana?</h2>
                    <p class="text-botanika-700 text-sm sm:text-base leading-relaxed">
                        Flujo ágil con pago seguro en cuotas y seguimiento en tiempo real.
                    </p>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    
                    <div class="bg-white p-6 rounded-3xl border border-botanika-200 space-y-3 shadow-subtle hover:shadow-card transition reveal-on-scroll stagger-1">
                        <div class="w-10 h-10 rounded-2xl bg-botanika-600 text-white flex items-center justify-center font-serif font-bold text-lg">1</div>
                        <h4 class="font-serif text-lg font-medium text-botanika-800">Elegí tu compañera</h4>
                        <p class="text-xs text-botanika-700 leading-relaxed">
                            Seleccioná la planta según la luz de tu espacio o hacé nuestro quiz interactivo para una sugerencia a medida.
                        </p>
                    </div>

                    <div class="bg-white p-6 rounded-3xl border border-botanika-200 space-y-3 shadow-subtle hover:shadow-card transition reveal-on-scroll stagger-2">
                        <div class="w-10 h-10 rounded-2xl bg-botanika-600 text-white flex items-center justify-center font-serif font-bold text-lg">2</div>
                        <h4 class="font-serif text-lg font-medium text-botanika-800">Personalizá tu maceta</h4>
                        <p class="text-xs text-botanika-700 leading-relaxed">
                            Elegí el acabado: terracota artesanal, cerámica blanca o gris cálido con sustrato aireado ya preparado.
                        </p>
                    </div>

                    <div class="bg-white p-6 rounded-3xl border border-botanika-200 space-y-3 shadow-subtle hover:shadow-card transition reveal-on-scroll stagger-3">
                        <div class="w-10 h-10 rounded-2xl bg-botanika-600 text-white flex items-center justify-center font-serif font-bold text-lg">3</div>
                        <h4 class="font-serif text-lg font-medium text-botanika-800">Pagá con Mercado Pago</h4>
                        <p class="text-xs text-botanika-700 leading-relaxed">
                            Checkout Pro con tarjetas, dinero en cuenta o cuotas sin interés y registro protegido en tu perfil de Supabase.
                        </p>
                    </div>

                    <div class="bg-white p-6 rounded-3xl border border-botanika-200 space-y-3 shadow-subtle hover:shadow-card transition reveal-on-scroll stagger-4">
                        <div class="w-10 h-10 rounded-2xl bg-botanika-terracota text-white flex items-center justify-center font-serif font-bold text-lg">4</div>
                        <h4 class="font-serif text-lg font-medium text-botanika-800">Recibí en 48hs</h4>
                        <p class="text-xs text-botanika-700 leading-relaxed">
                            Entrega refrigerada en tu puerta con código QR a tu guía digital personalizada de cuidados y riego.
                        </p>
                    </div>

                </div>
            </div>
        </section>

        <!-- =================================================================== -->
        <!-- SECCIÓN: CONFIGURADOR 2D "ARMÁ TU MACETA" (INTERACTIVO & VECTORIAL) -->
        <!-- =================================================================== -->
        <section id="landing-configurador" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div class="text-center max-w-2xl mx-auto mb-16 space-y-3 reveal-on-scroll">
                <span class="text-botanika-terracota font-semibold text-xs tracking-widest uppercase">Estudio de Personalización</span>
                <h2 class="font-serif text-3xl sm:text-4xl font-medium text-botanika-800">Armá tu Maceta de Autor</h2>
                <p class="text-botanika-700 text-sm sm:text-base leading-relaxed">
                    Elegí el acabado artesanal, la escala ideal para tu rincón y la planta que le dará vida. Previsualizá el resultado al instante.
                </p>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                
                <!-- Escenario de previsualización 2D (Sin negro, sin ejes, con sombra suave) -->
                <div class="lg:col-span-7 pot-stage-2d reveal-on-scroll">
                    <div class="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold text-botanika-800 border border-botanika-200 shadow-sm flex items-center space-x-1.5 z-10">
                        <i data-lucide="check-circle-2" class="w-3.5 h-3.5 text-botanika-600"></i>
                        <span id="config-size-badge">${activeSize.label} • ${activePlant.name}</span>
                    </div>

                    <!-- Contenedor animado de maceta + planta -->
                    <div class="pot-preview-wrap ${activeSize.scaleClass}" id="pot-preview-wrap">
                        
                        <!-- Capa Ilustración de Planta -->
                        <div class="pot-plant-layer" id="pot-plant-container">
                            <svg viewBox="0 0 240 200" class="w-full h-full">
                                ${activePlant.svgPath}
                            </svg>
                        </div>

                        <!-- Maceta Vectorial SVG Dinámica -->
                        <div class="pot-vessel-layer">
                            <svg viewBox="0 0 200 150" class="w-full h-full">
                                <defs>
                                    <linearGradient id="pot-grad-terracota" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stop-color="#E48B69"/>
                                        <stop offset="45%" stop-color="#D07A58"/>
                                        <stop offset="100%" stop-color="#9C4C2E"/>
                                    </linearGradient>
                                    <linearGradient id="pot-grad-blanca" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stop-color="#FFFFFF"/>
                                        <stop offset="50%" stop-color="#F2EFE9"/>
                                        <stop offset="100%" stop-color="#DCD6C9"/>
                                    </linearGradient>
                                    <linearGradient id="pot-grad-gris" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stop-color="#9BA39C"/>
                                        <stop offset="50%" stop-color="#7A827B"/>
                                        <stop offset="100%" stop-color="#555C56"/>
                                    </linearGradient>
                                </defs>
                                <path id="pot-svg-body" d="M 25 15 L 45 135 C 47 142 55 146 65 146 L 135 146 C 145 146 153 142 155 135 L 175 15 Z" fill="${activeFinish.bodyGradient}" />
                                <ellipse id="pot-svg-rim" cx="100" cy="15" rx="76" ry="12" fill="${activeFinish.rimColor}" />
                                <ellipse id="pot-svg-inner" cx="100" cy="15" rx="68" ry="9" fill="${activeFinish.innerColor}" />
                                <path id="pot-svg-highlight" d="M 40 25 L 55 130 C 56 132 58 134 60 134 L 75 134 L 60 25 Z" fill="white" opacity="${activeFinish.specularOpacity}" />
                            </svg>
                        </div>

                        <!-- Sombra de contacto suave -->
                        <div class="pot-contact-shadow"></div>
                    </div>
                </div>

                <!-- Panel de Configuración & Acciones -->
                <div class="lg:col-span-5 bg-white p-7 sm:p-8 rounded-3xl border border-botanika-200 shadow-card space-y-6 reveal-on-scroll stagger-2">
                    
                    <!-- 1. Acabado -->
                    <div>
                        <div class="flex justify-between items-baseline mb-2">
                            <span class="text-xs font-semibold text-botanika-600 uppercase tracking-widest">1. Material & Acabado</span>
                            <span id="config-name" class="font-serif font-semibold text-sm text-botanika-800">${activeFinish.name}</span>
                        </div>
                        <div class="space-y-2">
                            ${Object.keys(POT_FINISHES).map(k => {
                                const f = POT_FINISHES[k];
                                const isSelected = k === configuratorState.finish;
                                return `
                                    <button id="finish-btn-${k}" onclick="selectPotFinish('${k}')" class="w-full flex items-center justify-between p-3 rounded-2xl ${isSelected ? 'border-2 border-botanika-600 bg-botanika-50' : 'border border-botanika-300 hover:border-botanika-600 bg-white'} text-left transition">
                                        <div class="flex items-center space-x-3">
                                            <span class="w-6 h-6 rounded-full border border-black/10 flex-shrink-0" style="background-color: ${f.hex};"></span>
                                            <div>
                                                <p class="font-medium text-xs text-botanika-800">${f.name}</p>
                                                <p class="text-[10px] text-botanika-700">${k === 'terracota' ? 'Porosa natural' : k === 'blanca' ? 'Esmalte satinado' : 'Tacto mineral mate'}</p>
                                            </div>
                                        </div>
                                        <span class="font-serif font-bold text-xs text-botanika-800">$${f.basePrice.toLocaleString()}</span>
                                    </button>
                                `;
                            }).join('')}
                        </div>
                    </div>

                    <!-- 2. Tamaño -->
                    <div>
                        <div class="flex justify-between items-baseline mb-2">
                            <span class="text-xs font-semibold text-botanika-600 uppercase tracking-widest">2. Tamaño de Maceta</span>
                            <span class="text-[11px] text-botanika-700">Ajuste de precio incluido</span>
                        </div>
                        <div class="grid grid-cols-3 gap-2">
                            ${Object.keys(POT_SIZES).map(s => {
                                const sz = POT_SIZES[s];
                                const isSelected = s === configuratorState.size;
                                const deltaLabel = sz.priceDelta === 0 ? 'Estándar' : sz.priceDelta > 0 ? `+$${sz.priceDelta.toLocaleString()}` : `-$${Math.abs(sz.priceDelta).toLocaleString()}`;
                                return `
                                    <button id="size-btn-${s}" onclick="selectPotSize('${s}')" class="py-2.5 px-3 rounded-xl ${isSelected ? 'border-2 border-botanika-600 bg-botanika-600 text-white font-semibold' : 'border border-botanika-300 hover:border-botanika-600 bg-white text-botanika-800'} text-xs text-center transition">
                                        <div class="font-bold">${sz.short}</div>
                                        <div class="text-[10px] opacity-80">${deltaLabel}</div>
                                    </button>
                                `;
                            }).join('')}
                        </div>
                    </div>

                    <!-- 3. Planta Interior Acompañante -->
                    <div>
                        <span class="text-xs font-semibold text-botanika-600 uppercase tracking-widest block mb-2">3. Planta Incluida</span>
                        <div class="grid grid-cols-3 gap-2">
                            ${Object.keys(POT_PLANTS).map(p => {
                                const pl = POT_PLANTS[p];
                                const isSelected = p === configuratorState.plant;
                                return `
                                    <button id="plant-btn-${p}" onclick="selectPotPlant('${p}')" class="p-2.5 rounded-xl ${isSelected ? 'border-2 border-botanika-600 bg-botanika-50 font-semibold text-botanika-800' : 'border border-botanika-300 hover:border-botanika-600 bg-white text-botanika-700'} text-xs text-left transition flex flex-col justify-between">
                                        <span class="truncate">${pl.name.split(' ')[0]}</span>
                                        <span class="text-[10px] text-botanika-600 mt-1">✓ Incluida</span>
                                    </button>
                                `;
                            }).join('')}
                        </div>
                    </div>

                    <!-- Precio y Botón al Carrito Existente -->
                    <div class="pt-4 border-t border-botanika-200 space-y-4">
                        <div class="flex items-baseline justify-between">
                            <div>
                                <span class="text-xs text-botanika-700 block">Precio final configurado:</span>
                                <span class="text-[11px] text-emerald-700 font-medium">Maceta + Planta + Sustrato listo</span>
                            </div>
                            <span id="config-price" class="font-serif text-3xl font-bold text-botanika-800">$${currentConfigPrice.toLocaleString()}</span>
                        </div>
                        <button onclick="addCustomPotToCart()" class="btn-primary w-full py-4 text-sm font-semibold flex items-center justify-center space-x-2">
                            <i data-lucide="shopping-bag" class="w-4 h-4"></i>
                            <span>Agregar al Carrito</span>
                        </button>
                    </div>

                </div>

            </div>
        </section>

        <!-- =================================================================== -->
        <!-- SECCIÓN 5: COLECCIÓN DESTACADA (CARDS ENRIQUECIDAS)                 -->
        <!-- =================================================================== -->
        <section id="landing-productos" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div class="flex flex-col md:flex-row md:items-end justify-between mb-12 reveal-on-scroll">
                <div class="space-y-2">
                    <span class="text-botanika-terracota font-semibold text-xs tracking-widest uppercase">Colección Destacada</span>
                    <h2 class="font-serif text-3xl sm:text-4xl font-medium text-botanika-800">Elegí tu planta y comprá online</h2>
                    <p class="text-botanika-700 text-sm">Flujo integrado con sesión segura en Supabase y pago con Mercado Pago.</p>
                </div>
                <button onclick="navigateTo('catalog')" class="mt-4 md:mt-0 inline-flex items-center space-x-2 text-sm font-semibold text-botanika-600 hover:text-botanika-800 transition">
                    <span>Ver catálogo completo (${products.length} productos)</span>
                    <i data-lucide="arrow-right" class="w-4 h-4"></i>
                </button>
            </div>

            <!-- Grilla de Productos Destacados -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                ${products.slice(0, 4).map((p, i) => `
                    <div class="product-card reveal-on-scroll stagger-${i + 1}">
                        <div>
                            <div class="product-image-container cursor-pointer" onclick="navigateTo('product', ${p.id})">
                                <img src="${p.image}" alt="${p.name}" loading="lazy">
                                ${p.badge ? `<span class="absolute top-3 left-3 bg-botanika-800/90 backdrop-blur-md text-white text-[10px] uppercase font-semibold px-2.5 py-1 rounded-full shadow-sm">${p.badge}</span>` : ''}
                                
                                <div class="product-actions-overlay" onclick="event.stopPropagation();">
                                    <button onclick="toggleWishlist(${p.id})" class="btn-action-round ${isInWishlist(p.id) ? 'active' : ''}" title="Guardar en favoritos" aria-label="Favorito">
                                        <i data-lucide="heart" class="w-4 h-4 ${isInWishlist(p.id) ? 'fill-botanika-terracota text-botanika-terracota' : ''}"></i>
                                    </button>
                                    <button onclick="openQuickView(${p.id})" class="btn-action-round" title="Vista rápida" aria-label="Vista rápida">
                                        <i data-lucide="eye" class="w-4 h-4"></i>
                                    </button>
                                </div>
                            </div>
                            
                            <div class="flex items-center justify-between text-[11px] text-botanika-600 font-semibold mb-1">
                                <span class="uppercase tracking-wider">${p.category}</span>
                                <span class="text-amber-500 font-bold flex items-center space-x-1">
                                    ★ ${p.rating}
                                </span>
                            </div>

                            <h3 onclick="navigateTo('product', ${p.id})" class="font-serif text-lg font-medium text-botanika-800 cursor-pointer hover:text-botanika-600 transition line-clamp-1">${p.name}</h3>
                            <p class="text-xs text-botanika-700 mt-1 line-clamp-2">${p.description}</p>
                            
                            <div class="mt-3 py-2 border-y border-botanika-100 flex items-center justify-between text-xs text-botanika-700">
                                <span>Luz: <strong>${p.light}</strong></span>
                                <span>Maceta: <strong>${p.pot}</strong></span>
                            </div>
                        </div>

                        <div class="mt-5 space-y-3">
                            <div class="flex items-baseline justify-between">
                                <span class="text-xs text-botanika-700">Precio final:</span>
                                <span class="font-serif font-bold text-2xl text-botanika-800">$${p.price.toLocaleString()}</span>
                            </div>

                            <div class="grid grid-cols-2 gap-2">
                                <button onclick="addToCart(${p.id})" class="btn-secondary text-xs py-3 w-full" title="Agregar al carrito">
                                    <i data-lucide="shopping-bag" class="w-4 h-4"></i>
                                    <span>Al Carrito</span>
                                </button>
                                <button id="btn-buy-product-${p.id}" onclick="handleDirectBuy(${p.id})" class="btn-primary text-xs py-3 w-full">
                                    <span>Comprar</span>
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </section>

        <!-- =================================================================== -->
        <!-- BANNER INTERACTIVO DEL QUIZ                                         -->
        <!-- =================================================================== -->
        <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 reveal-on-scroll">
            <div class="bg-gradient-to-r from-botanika-700 to-botanika-800 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-card">
                <div class="relative z-10 max-w-xl space-y-4">
                    <span class="bg-botanika-600/60 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase text-botanika-200">Recomendador Inteligente</span>
                    <h3 class="font-serif text-3xl sm:text-4xl font-medium leading-tight">¿No estás seguro de cuál es la planta ideal para tu casa?</h3>
                    <p class="text-sm text-botanika-100 leading-relaxed">
                        Respondé 3 preguntas rápidas sobre luz, mascotas y tiempo disponible para descubrir tu compañera perfecta.
                    </p>
                    <button onclick="openQuizModal()" class="btn-terracota py-3.5 px-6 text-sm font-semibold mt-2">
                        <span>Iniciar Quiz de Plantas</span>
                        <i data-lucide="sparkles" class="w-4 h-4"></i>
                    </button>
                </div>
            </div>
        </section>

        <!-- =================================================================== -->
        <!-- SECCIÓN 6: RESEÑAS Y TESTIMONIOS VERIFICADOS                        -->
        <!-- =================================================================== -->
        <section id="landing-testimonios" class="bg-botanika-100/60 border-t border-botanika-200 py-20">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="text-center max-w-xl mx-auto mb-16 space-y-3 reveal-on-scroll">
                    <span class="text-botanika-terracota font-semibold text-xs tracking-widest uppercase">Comunidad Verde</span>
                    <h2 class="font-serif text-3xl sm:text-4xl font-medium text-botanika-800">Lo que dicen nuestros clientes</h2>
                    <p class="text-botanika-700 text-sm">Más de 2.500 hogares ya disfrutan de sus espacios transformados con Botanika.</p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    
                    <div class="bg-white p-8 rounded-3xl border border-botanika-200 space-y-4 shadow-subtle hover:shadow-card transition reveal-on-scroll stagger-1">
                        <div class="flex text-amber-500 space-x-1">
                            ★★★★★
                        </div>
                        <p class="text-sm text-botanika-700 leading-relaxed italic">
                            "Compré la Monstera con maceta terracota. Llegó en menos de 48hs en una caja impecable y con las hojas perfectas. El pago con Mercado Pago fue instantáneo."
                        </p>
                        <div class="flex items-center space-x-3 pt-2 border-t border-botanika-100">
                            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120" class="w-10 h-10 rounded-full object-cover">
                            <div>
                                <h4 class="font-medium text-sm text-botanika-800">Sofía Valenzuela</h4>
                                <span class="text-xs text-botanika-700">Palermo, CABA</span>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white p-8 rounded-3xl border border-botanika-200 space-y-4 shadow-subtle hover:shadow-card transition reveal-on-scroll stagger-2">
                        <div class="flex text-amber-500 space-x-1">
                            ★★★★★
                        </div>
                        <p class="text-sm text-botanika-700 leading-relaxed italic">
                            "El Kit Principiante me salvó la vida. Siempre se me morían las plantas, pero con la Sansevieria y los recordatorios de riego por correo ya lleva 3 meses hermosa."
                        </p>
                        <div class="flex items-center space-x-3 pt-2 border-t border-botanika-100">
                            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120" class="w-10 h-10 rounded-full object-cover">
                            <div>
                                <h4 class="font-medium text-sm text-botanika-800">Martín Benítez</h4>
                                <span class="text-xs text-botanika-700">Vicente López</span>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white p-8 rounded-3xl border border-botanika-200 space-y-4 shadow-subtle hover:shadow-card transition reveal-on-scroll stagger-3">
                        <div class="flex text-amber-500 space-x-1">
                            ★★★★★
                        </div>
                        <p class="text-sm text-botanika-700 leading-relaxed italic">
                            "Excelente calidad en las macetas artesanales, tienen el peso y drenaje justo. La integración de la cuenta en la web es súper cómoda para ver mis órdenes."
                        </p>
                        <div class="flex items-center space-x-3 pt-2 border-t border-botanika-100">
                            <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=120" class="w-10 h-10 rounded-full object-cover">
                            <div>
                                <h4 class="font-medium text-sm text-botanika-800">Camila Morales</h4>
                                <span class="text-xs text-botanika-700">Belgrano, CABA</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>

        <!-- =================================================================== -->
        <!-- SECCIÓN 7: PREGUNTAS FRECUENTES (FAQ ACORDEÓN ACCESIBLE)            -->
        <!-- =================================================================== -->
        <section id="landing-faq" class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div class="text-center mb-12 space-y-3 reveal-on-scroll">
                <span class="text-botanika-terracota font-semibold text-xs tracking-widest uppercase">Despejá tus dudas</span>
                <h2 class="font-serif text-3xl sm:text-4xl font-medium text-botanika-800">Preguntas Frecuentes</h2>
                <p class="text-botanika-700 text-sm">Todo lo que necesitás saber sobre envíos, pagos con Mercado Pago y cuidados.</p>
            </div>

            <div class="space-y-4">
                ${[
                    {
                        q: "¿Cómo garantizan que la planta llegue en óptimo estado?",
                        a: "Utilizamos cajas de cartón corrugado reforzado diseñadas a medida que inmovilizan la maceta y protegen el follaje. Si tu planta sufre algún percance durante el transporte, la Garantía Verde de 30 días te envía un reemplazo sin costo."
                    },
                    {
                        q: "¿Qué medios de pago aceptan?",
                        a: "Procesamos todos los pagos a través de Mercado Pago Checkout Pro. Podés abonar con dinero en cuenta, tarjetas de crédito (con promociones bancarias y cuotas sin interés), tarjetas de débito o transferencia bancaria."
                    },
                    {
                        q: "¿Cuánto demora la entrega?",
                        a: "En CABA y Gran Buenos Aires entregamos en un plazo de 48 horas hábiles con nuestra logística refrigerada propia. Para el interior del país, el despacho se realiza en 48/72hs con seguimiento online."
                    },
                    {
                        q: "¿Qué pasa si no sé cómo cuidarla?",
                        a: "Todas las compras incluyen un código QR en la etiqueta de la maceta que te da acceso a la ficha botánica digital: frecuencias de riego según la estación, temperatura recomendada y señales de alerta."
                    }
                ].map((item, idx) => `
                    <div class="bg-white rounded-2xl border border-botanika-200 overflow-hidden shadow-subtle transition">
                        <button onclick="toggleFaq(${idx})" class="w-full p-5 text-left flex justify-between items-center font-medium text-botanika-800 hover:text-botanika-600 focus-visible:outline-none" aria-expanded="${openFaqIndex === idx}">
                            <span class="font-serif text-lg">${item.q}</span>
                            <i data-lucide="${openFaqIndex === idx ? 'chevron-up' : 'chevron-down'}" class="w-5 h-5 text-botanika-600 transition-transform flex-shrink-0 ml-4"></i>
                        </button>
                        ${openFaqIndex === idx ? `
                            <div class="px-5 pb-5 text-sm text-botanika-700 leading-relaxed border-t border-botanika-100 pt-3">
                                ${item.a}
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        </section>
    `;
}

function toggleFaq(idx) {
    openFaqIndex = openFaqIndex === idx ? null : idx;
    renderView();
}

// =============================================================================
// CATÁLOGO DE PRODUCTOS CON BÚSQUEDA, FILTROS Y ORDENAMIENTO
// =============================================================================

function renderProductCard(p) {
    return `
        <div class="product-card">
            <div>
                <div class="product-image-container cursor-pointer" onclick="navigateTo('product', ${p.id})">
                    <img src="${p.image}" alt="${p.name}" loading="lazy">
                    ${p.badge ? `<span class="absolute top-3 left-3 bg-botanika-800/90 text-white text-[10px] uppercase font-semibold px-2.5 py-1 rounded-full shadow-sm">${p.badge}</span>` : ''}
                    
                    <div class="product-actions-overlay" onclick="event.stopPropagation();">
                        <button onclick="toggleWishlist(${p.id})" class="btn-action-round ${isInWishlist(p.id) ? 'active' : ''}" title="Guardar en favoritos" aria-label="Favorito">
                            <i data-lucide="heart" class="w-4 h-4 ${isInWishlist(p.id) ? 'fill-botanika-terracota text-botanika-terracota' : ''}"></i>
                        </button>
                        <button onclick="openQuickView(${p.id})" class="btn-action-round" title="Vista rápida" aria-label="Vista rápida">
                            <i data-lucide="eye" class="w-4 h-4"></i>
                        </button>
                    </div>
                </div>

                <div class="flex items-center justify-between text-[11px] text-botanika-600 font-semibold mb-1">
                    <span class="uppercase tracking-wider">${p.category}</span>
                    <span class="text-amber-500 font-bold flex items-center space-x-1">
                        ★ ${p.rating}
                    </span>
                </div>

                <h3 onclick="navigateTo('product', ${p.id})" class="font-serif text-lg font-medium text-botanika-800 cursor-pointer hover:text-botanika-600 transition line-clamp-1">${p.name}</h3>
                <p class="text-xs text-botanika-700 mt-1 line-clamp-2">${p.description}</p>
                <div class="mt-2 text-[11px] text-botanika-700">Luz: <strong>${p.light}</strong> • Maceta: <strong>${p.pot}</strong></div>
            </div>

            <div class="mt-4 pt-3 border-t border-botanika-100 flex items-center justify-between">
                <span class="font-serif font-bold text-lg text-botanika-800">$${p.price.toLocaleString()}</span>
                <div class="flex space-x-1.5">
                    <button onclick="addToCart(${p.id})" class="btn-secondary p-2.5 rounded-xl" title="Agregar al carrito">
                        <i data-lucide="shopping-bag" class="w-4 h-4"></i>
                    </button>
                    <button onclick="handleDirectBuy(${p.id})" class="btn-primary px-3.5 py-2 rounded-xl text-xs font-semibold">
                        Comprar
                    </button>
                </div>
            </div>
        </div>
    `;
}

function getFilteredProducts() {
    return products.filter(p => {
        if (catalogFilter.search) {
            const query = catalogFilter.search.toLowerCase();
            const matchesName = p.name.toLowerCase().includes(query);
            const matchesDesc = p.description.toLowerCase().includes(query);
            const matchesCat = p.category.toLowerCase().includes(query);
            if (!matchesName && !matchesDesc && !matchesCat) return false;
        }

        if (catalogFilter.category !== 'Todas' && p.category !== catalogFilter.category) {
            return false;
        }

        if (catalogFilter.light !== 'Todas' && p.light !== catalogFilter.light) {
            return false;
        }

        if (p.price > catalogFilter.maxPrice) {
            return false;
        }

        return true;
    }).sort((a, b) => {
        if (catalogFilter.sortBy === 'price_asc') return a.price - b.price;
        if (catalogFilter.sortBy === 'price_desc') return b.price - a.price;
        if (catalogFilter.sortBy === 'name_asc') return a.name.localeCompare(b.name);
        if (catalogFilter.sortBy === 'rating_desc') return b.rating - a.rating;
        return a.id - b.id;
    });
}

function renderCatalog() {
    const filtered = getFilteredProducts();

    return `
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div class="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 class="font-serif text-3xl sm:text-4xl font-medium text-botanika-800">Catálogo de Productos</h1>
                    <p class="text-botanika-700 text-sm mt-1">Explorá nuestra colección completa de plantas de interior, macetas de diseño y sustratos.</p>
                </div>

                <!-- Barra de búsqueda rápida -->
                <div class="relative w-full md:w-80">
                    <input type="text" id="catalog-search-input" value="${catalogFilter.search}" oninput="handleCatalogSearch(event)" placeholder="Buscar planta, maceta o sustrato..." class="w-full bg-white border border-botanika-300 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-botanika-600 shadow-2xs">
                    <i data-lucide="search" class="w-4 h-4 text-botanika-400 absolute left-3.5 top-3"></i>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
                
                <!-- Sidebar de Filtros -->
                <div class="bg-white p-6 rounded-3xl border border-botanika-200 h-fit space-y-6 shadow-subtle">
                    <div class="flex justify-between items-center border-b border-botanika-200 pb-4">
                        <h3 class="font-medium text-lg flex items-center text-botanika-800">
                            <i data-lucide="sliders-horizontal" class="w-4 h-4 mr-2 text-botanika-600"></i>
                            Filtros
                        </h3>
                        <button onclick="resetCatalogFilters()" class="text-xs text-botanika-terracota underline font-medium hover:text-botanika-800 transition">
                            Limpiar todo
                        </button>
                    </div>

                    <!-- Filtro Categoría -->
                    <div>
                        <h4 class="text-xs font-bold tracking-wider uppercase text-botanika-800 mb-3">Categoría</h4>
                        <div class="space-y-2 text-sm">
                            ${['Todas', 'Plantas', 'Macetas', 'Sustratos', 'Kits'].map(cat => `
                                <label class="flex items-center space-x-2.5 cursor-pointer">
                                    <input type="radio" name="cat_filter" ${catalogFilter.category === cat ? 'checked' : ''} onchange="setCatalogCategory('${cat}')" class="text-botanika-600">
                                    <span class="text-xs ${catalogFilter.category === cat ? 'font-semibold text-botanika-800' : 'text-botanika-700'}">${cat}</span>
                                </label>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Filtro Luz -->
                    <div class="border-t border-botanika-100 pt-4">
                        <h4 class="text-xs font-bold tracking-wider uppercase text-botanika-800 mb-3">Requerimiento de Luz</h4>
                        <div class="space-y-2 text-sm">
                            ${['Todas', 'Indirecta', 'Mucha luz', 'Poca luz'].map(light => `
                                <label class="flex items-center space-x-2.5 cursor-pointer">
                                    <input type="radio" name="light_filter" ${catalogFilter.light === light ? 'checked' : ''} onchange="setCatalogLight('${light}')" class="text-botanika-600">
                                    <span class="text-xs ${catalogFilter.light === light ? 'font-semibold text-botanika-800' : 'text-botanika-700'}">${light}</span>
                                </label>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Filtro Precio Máximo -->
                    <div class="border-t border-botanika-100 pt-4 space-y-2">
                        <div class="flex justify-between items-baseline text-xs text-botanika-800">
                            <span class="font-bold uppercase tracking-wider">Precio Máximo</span>
                            <span class="font-serif font-bold text-botanika-600">$${catalogFilter.maxPrice.toLocaleString()}</span>
                        </div>
                        <input type="range" min="8000" max="60000" step="2000" value="${catalogFilter.maxPrice}" oninput="setCatalogMaxPrice(this.value)" class="w-full accent-botanika-600">
                    </div>
                </div>

                <!-- Grilla de Resultados -->
                <div class="lg:col-span-3 space-y-6">
                    <div class="bg-white p-4 rounded-2xl border border-botanika-200 flex flex-col sm:flex-row justify-between items-center gap-3 shadow-subtle">
                        <span class="text-xs sm:text-sm text-botanika-700">
                            Mostrando <strong>${filtered.length}</strong> de <strong>${products.length}</strong> productos
                        </span>
                        <div class="flex items-center space-x-2 text-xs sm:text-sm">
                            <span class="text-botanika-700">Ordenar por:</span>
                            <select onchange="setCatalogSort(this.value)" class="bg-botanika-50 border border-botanika-300 rounded-xl px-3 py-1.5 focus:outline-none focus:border-botanika-600 text-xs">
                                <option value="default" ${catalogFilter.sortBy === 'default' ? 'selected' : ''}>Relevancia</option>
                                <option value="price_asc" ${catalogFilter.sortBy === 'price_asc' ? 'selected' : ''}>Precio: Menor a Mayor</option>
                                <option value="price_desc" ${catalogFilter.sortBy === 'price_desc' ? 'selected' : ''}>Precio: Mayor a Menor</option>
                                <option value="name_asc" ${catalogFilter.sortBy === 'name_asc' ? 'selected' : ''}>Nombre (A - Z)</option>
                                <option value="rating_desc" ${catalogFilter.sortBy === 'rating_desc' ? 'selected' : ''}>Mejor Calificados</option>
                            </select>
                        </div>
                    </div>

                    ${filtered.length === 0 ? `
                        <div class="text-center py-20 bg-white rounded-3xl border border-botanika-200 space-y-3">
                            <i data-lucide="search-x" class="w-12 h-12 mx-auto text-botanika-300"></i>
                            <h3 class="font-serif text-xl font-medium text-botanika-800">No encontramos resultados</h3>
                            <p class="text-botanika-700 text-xs sm:text-sm max-w-sm mx-auto">Probá ajustando los filtros de categoría, nivel de luz o el término de búsqueda.</p>
                            <button onclick="resetCatalogFilters()" class="btn-primary text-xs py-2.5 px-6 mt-2">
                                Restablecer Filtros
                            </button>
                        </div>
                    ` : `
                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            ${filtered.map(p => renderProductCard(p)).join('')}
                        </div>
                    `}
                </div>

            </div>
        </div>
    `;
}

function handleCatalogSearch(e) {
    catalogFilter.search = e.target.value;
    renderView();
}

function setCatalogCategory(cat) {
    catalogFilter.category = cat;
    renderView();
}

function setCatalogLight(light) {
    catalogFilter.light = light;
    renderView();
}

function setCatalogMaxPrice(val) {
    catalogFilter.maxPrice = Number(val);
    renderView();
}

function setCatalogSort(val) {
    catalogFilter.sortBy = val;
    renderView();
}

function resetCatalogFilters() {
    catalogFilter = {
        search: '',
        category: 'Todas',
        light: 'Todas',
        maxPrice: 60000,
        sortBy: 'default'
    };
    renderView();
    showToast('Filtros restablecidos');
}

// =============================================================================
// FICHA DE DETALLE DE PRODUCTO
// =============================================================================

function renderProductDetail() {
    const product = products.find(p => p.id === currentProductId) || products[0];
    return `
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div class="text-xs text-botanika-700 mb-6 flex items-center space-x-2">
                <button onclick="navigateTo('home')" class="hover:underline">Home</button>
                <span>/</span>
                <button onclick="navigateTo('catalog')" class="hover:underline">Catálogo</button>
                <span>/</span>
                <span class="text-botanika-800 font-medium">${product.name}</span>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                <div class="space-y-4">
                    <div class="rounded-3xl overflow-hidden bg-white border border-botanika-200 h-[450px] shadow-card relative">
                        <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover">
                        <button onclick="toggleWishlist(${product.id})" class="btn-action-round absolute top-4 right-4 ${isInWishlist(product.id) ? 'active' : ''}">
                            <i data-lucide="heart" class="w-4 h-4 ${isInWishlist(product.id) ? 'fill-botanika-terracota text-botanika-terracota' : ''}"></i>
                        </button>
                    </div>
                </div>

                <div class="space-y-6">
                    <div>
                        <span class="bg-botanika-200 text-botanika-800 text-xs uppercase font-semibold px-3 py-1 rounded-full">${product.badge || 'Stock Disponible'}</span>
                        <h1 class="font-serif text-4xl text-botanika-800 mt-3">${product.name}</h1>
                        <div class="flex items-center space-x-2 text-xs text-botanika-700 mt-2">
                            <span class="text-amber-500 font-bold">★ ${product.rating}</span>
                            <span>(${product.reviewsCount} reseñas verificadas de compradores)</span>
                        </div>
                        <p class="font-serif text-3xl text-botanika-terracota font-semibold mt-3">$${product.price.toLocaleString()}</p>
                    </div>

                    <p class="text-botanika-700 text-sm leading-relaxed">${product.description}</p>

                    <div class="bg-white p-5 rounded-3xl border border-botanika-200 grid grid-cols-3 gap-4 text-center shadow-subtle">
                        <div class="space-y-1">
                            <i data-lucide="sun" class="w-5 h-5 mx-auto text-botanika-terracota"></i>
                            <span class="text-[11px] uppercase tracking-wider text-botanika-700 block font-bold">Luz</span>
                            <span class="text-xs font-medium">${product.light}</span>
                        </div>
                        <div class="space-y-1 border-x border-botanika-200">
                            <i data-lucide="droplet" class="w-5 h-5 mx-auto text-botanika-600"></i>
                            <span class="text-[11px] uppercase tracking-wider text-botanika-700 block font-bold">Riego</span>
                            <span class="text-xs font-medium">Cada 7-10 días</span>
                        </div>
                        <div class="space-y-1">
                            <i data-lucide="home" class="w-5 h-5 mx-auto text-botanika-600"></i>
                            <span class="text-[11px] uppercase tracking-wider text-botanika-700 block font-bold">Ubicación</span>
                            <span class="text-xs font-medium">Interior</span>
                        </div>
                    </div>

                    <div class="flex space-x-3 pt-4">
                        <button onclick="handleDirectBuy(${product.id})" class="flex-grow btn-primary py-4 text-sm font-semibold flex items-center justify-center space-x-2">
                            <i data-lucide="shopping-bag" class="w-5 h-5"></i>
                            <span>Comprar Ahora $${product.price.toLocaleString()}</span>
                        </button>
                        <button onclick="addToCart(${product.id})" class="btn-secondary p-4 rounded-2xl" title="Agregar al carrito">
                            <i data-lucide="plus" class="w-5 h-5 text-botanika-800"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// =============================================================================
// VISTA DE CARRITO COMPLETO
// =============================================================================

function renderCart() {
    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const discount = discountApplied ? subtotal * 0.1 : 0;
    const shippingCost = subtotal >= 60000 ? 0 : 3500;
    const total = subtotal - discount + shippingCost;

    return `
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 class="font-serif text-3xl font-medium mb-8">Tu Carrito de Compras</h1>

            ${cart.length === 0 ? `
                <div class="text-center py-20 bg-white rounded-3xl border border-botanika-200 space-y-4 shadow-subtle">
                    <i data-lucide="shopping-bag" class="w-12 h-12 mx-auto text-botanika-300"></i>
                    <h3 class="font-serif text-xl font-medium text-botanika-800">Tu carrito está vacío</h3>
                    <p class="text-botanika-700 text-sm max-w-sm mx-auto">Aún no has agregado plantas ni accesorios a tu orden.</p>
                    <button onclick="navigateTo('catalog')" class="btn-primary text-xs py-3 px-6">Ir al Catálogo</button>
                </div>
            ` : `
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div class="lg:col-span-2 space-y-4">
                        ${cart.map((item, idx) => `
                            <div class="bg-white p-4 sm:p-6 rounded-3xl border border-botanika-200 flex items-center justify-between space-x-4 shadow-subtle">
                                <img src="${item.image}" alt="${item.name}" class="w-20 h-20 rounded-2xl object-cover bg-botanika-50 flex-shrink-0">
                                <div class="flex-grow">
                                    <h3 class="font-medium text-botanika-800">${item.name}</h3>
                                    <p class="text-xs text-botanika-700 mt-0.5">Maceta: ${item.pot}</p>
                                    <p class="font-serif font-semibold text-botanika-800 mt-1">$${item.price.toLocaleString()}</p>
                                </div>
                                <div class="flex items-center space-x-3">
                                    <div class="flex items-center border border-botanika-300 rounded-xl bg-white shadow-2xs">
                                        <button onclick="updateQty(${idx}, -1)" class="px-3 py-1 text-botanika-700 hover:bg-botanika-100 rounded-l">-</button>
                                        <span class="px-3 text-sm font-medium">${item.qty}</span>
                                        <button onclick="updateQty(${idx}, 1)" class="px-3 py-1 text-botanika-700 hover:bg-botanika-100 rounded-r">+</button>
                                    </div>
                                    <button onclick="removeItem(${idx})" class="p-2 text-botanika-700 hover:text-botanika-terracota transition">
                                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>

                    <div class="bg-white p-6 rounded-3xl border border-botanika-200 h-fit space-y-6 shadow-subtle">
                        <h3 class="font-serif text-xl font-medium border-b border-botanika-200 pb-4">Resumen del Pedido</h3>
                        
                        <div class="flex space-x-2">
                            <input type="text" id="discount-input" placeholder="Cupón: BOTANIKA10" class="bg-botanika-50 border border-botanika-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm flex-grow focus:outline-none focus:border-botanika-600">
                            <button onclick="applyDiscount()" class="btn-primary text-xs py-2.5 px-4">Aplicar</button>
                        </div>

                        <div class="space-y-3 text-sm pt-2">
                            <div class="flex justify-between text-botanika-700">
                                <span>Subtotal</span>
                                <span>$${subtotal.toLocaleString()}</span>
                            </div>
                            ${discountApplied ? `
                                <div class="flex justify-between text-botanika-terracota">
                                    <span>Descuento (10%)</span>
                                    <span>-$${discount.toLocaleString()}</span>
                                </div>
                            ` : ''}
                            <div class="flex justify-between text-botanika-700">
                                <span>Envío estimado</span>
                                <span>${shippingCost === 0 ? '<strong class="text-emerald-700">Gratis (Superó $60.000)</strong>' : '$3,500'}</span>
                            </div>
                            <div class="flex justify-between font-serif font-semibold text-xl text-botanika-800 pt-3 border-t border-botanika-200">
                                <span>Total</span>
                                <span>$${total.toLocaleString()}</span>
                            </div>
                        </div>

                        <button onclick="navigateTo('checkout')" class="btn-primary w-full py-4 text-sm font-semibold">
                            Continuar a Finalizar Compra
                        </button>
                    </div>
                </div>
            `}
        </div>
    `;
}

function updateQty(index, change) {
    cart[index].qty += change;
    if (cart[index].qty <= 0) {
        cart.splice(index, 1);
    }
    renderView();
}

function removeItem(index) {
    cart.splice(index, 1);
    renderView();
    showToast('Producto eliminado del carrito');
}

function applyDiscount() {
    const val = document.getElementById('discount-input').value.trim();
    if (val.toUpperCase() === 'BOTANIKA10') {
        discountApplied = true;
        showToast('¡Descuento del 10% aplicado!');
        renderView();
    } else {
        showToast('Código inválido (usa BOTANIKA10)', 'error');
    }
}

function setPaymentMethod(method) {
    selectedPaymentMethod = method;
    renderView();
}

function setShippingMethod(method) {
    selectedShippingMethod = method;
    renderView();
}

// =============================================================================
// CHECKOUT & MERCADO PAGO INTEGRATION
// =============================================================================

function renderCheckout() {
    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const discount = discountApplied ? subtotal * 0.1 : 0;
    const shippingCost = selectedShippingMethod === 'free' ? 0 : 3500;
    const total = Math.max(0, subtotal - discount + shippingCost);

    const defaultName = currentUser?.user_metadata?.full_name?.split(' ')[0] || 'Lucía';
    const defaultSurname = currentUser?.user_metadata?.full_name?.split(' ').slice(1).join(' ') || 'Fernández';
    const defaultEmail = currentUser?.email || 'lucia.fernandez@example.com';

    return `
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div class="mb-8 flex justify-between items-end">
                <div>
                    <h1 class="font-serif text-3xl font-medium">Finalizar Compra</h1>
                    <p class="text-botanika-700 text-sm mt-1">Completa tus datos para coordinar el envío seguro y abonar con Mercado Pago.</p>
                </div>
                ${currentUser ? `
                    <div class="text-xs text-botanika-700 bg-botanika-100 px-3 py-1.5 rounded-full border border-botanika-300">
                        Sesión: <strong>${currentUser.email}</strong>
                    </div>
                ` : `
                    <button onclick="openAuthModal('login', true)" class="text-xs text-botanika-terracota font-semibold underline">
                        ¿Ya tienes cuenta? Inicia sesión
                    </button>
                `}
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div class="lg:col-span-2 space-y-8">
                    <!-- Datos de Envío -->
                    <div class="bg-white p-6 sm:p-8 rounded-3xl border border-botanika-200 space-y-4 shadow-subtle">
                        <h3 class="font-serif text-xl font-medium flex items-center text-botanika-800"><i data-lucide="map-pin" class="w-5 h-5 mr-2 text-botanika-600"></i> Datos de Entrega</h3>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                            <div>
                                <label class="text-xs font-bold uppercase tracking-wider text-botanika-700 block mb-1">Nombre</label>
                                <input type="text" id="buyer-name" value="${defaultName}" class="w-full bg-botanika-50 border border-botanika-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-botanika-600">
                            </div>
                            <div>
                                <label class="text-xs font-bold uppercase tracking-wider text-botanika-700 block mb-1">Apellido</label>
                                <input type="text" id="buyer-surname" value="${defaultSurname}" class="w-full bg-botanika-50 border border-botanika-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-botanika-600">
                            </div>
                            <div class="sm:col-span-2">
                                <label class="text-xs font-bold uppercase tracking-wider text-botanika-700 block mb-1">Email (Confirmación de compra)</label>
                                <input type="email" id="buyer-email" value="${defaultEmail}" class="w-full bg-botanika-50 border border-botanika-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-botanika-600">
                            </div>
                            <div class="sm:col-span-2">
                                <label class="text-xs font-bold uppercase tracking-wider text-botanika-700 block mb-1">Dirección de entrega</label>
                                <input type="text" id="buyer-address" value="Av. Libertador 1450, Piso 4B" class="w-full bg-botanika-50 border border-botanika-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-botanika-600">
                            </div>
                            <div>
                                <label class="text-xs font-bold uppercase tracking-wider text-botanika-700 block mb-1">Ciudad</label>
                                <input type="text" id="buyer-city" value="Buenos Aires" class="w-full bg-botanika-50 border border-botanika-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-botanika-600">
                            </div>
                            <div>
                                <label class="text-xs font-bold uppercase tracking-wider text-botanika-700 block mb-1">Código Postal</label>
                                <input type="text" id="buyer-zip" value="1425" class="w-full bg-botanika-50 border border-botanika-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-botanika-600">
                            </div>
                        </div>
                    </div>

                    <!-- Método de Envío -->
                    <div class="bg-white p-6 sm:p-8 rounded-3xl border border-botanika-200 space-y-4 shadow-subtle">
                        <h3 class="font-serif text-xl font-medium flex items-center text-botanika-800"><i data-lucide="truck" class="w-5 h-5 mr-2 text-botanika-600"></i> Método de Envío</h3>
                        <div class="space-y-3 pt-2">
                            <label onclick="setShippingMethod('express')" class="flex items-center justify-between p-4 rounded-2xl border-2 ${selectedShippingMethod === 'express' ? 'border-botanika-600 bg-botanika-50' : 'border-botanika-300 bg-white hover:border-botanika-600'} cursor-pointer transition">
                                <div class="flex items-center space-x-3">
                                    <input type="radio" name="shipping" ${selectedShippingMethod === 'express' ? 'checked' : ''} class="text-botanika-600">
                                    <div>
                                        <p class="font-medium text-sm text-botanika-800">Envío Protegido Especial Botanika (Climatizado)</p>
                                        <p class="text-xs text-botanika-700">Entrega en 48hs hábiles con empaque antiestrés</p>
                                    </div>
                                </div>
                                <span class="font-serif font-semibold">$3,500</span>
                            </label>
                            <label onclick="setShippingMethod('free')" class="flex items-center justify-between p-4 rounded-2xl border-2 ${selectedShippingMethod === 'free' ? 'border-botanika-600 bg-botanika-50' : 'border-botanika-300 bg-white hover:border-botanika-600'} cursor-pointer transition">
                                <div class="flex items-center space-x-3">
                                    <input type="radio" name="shipping" ${selectedShippingMethod === 'free' ? 'checked' : ''} class="text-botanika-600">
                                    <div>
                                        <p class="font-medium text-sm text-botanika-800">Retiro por Studio Palermo</p>
                                        <p class="text-xs text-botanika-700">Listo en 24hs hábiles en showroom</p>
                                    </div>
                                </div>
                                <span class="font-serif font-semibold text-botanika-600">Gratis</span>
                            </label>
                        </div>
                    </div>

                    <!-- Medio de Pago -->
                    <div class="bg-white p-6 sm:p-8 rounded-3xl border border-botanika-200 space-y-4 shadow-subtle">
                        <h3 class="font-serif text-xl font-medium flex items-center text-botanika-800"><i data-lucide="credit-card" class="w-5 h-5 mr-2 text-botanika-600"></i> Medio de Pago</h3>
                        
                        <div class="bg-[#F5F9FD] border border-[#D0E6F9] rounded-2xl p-5 space-y-3">
                            <div class="flex items-center space-x-3">
                                <div class="bg-[#009EE3] text-white px-3 py-1 rounded-lg text-xs font-bold tracking-wider uppercase">Recomendado</div>
                                <span class="text-sm font-semibold text-gray-800">Mercado Pago Checkout Pro</span>
                            </div>
                            <p class="text-xs text-gray-600 leading-relaxed">
                                Serás redirigido a la pasarela cifrada de Mercado Pago. Podrás abonar con dinero en cuenta, tarjetas de crédito/débito y cuotas con todas las promociones bancarias vigentes. La orden quedará registrada y protegida en tu cuenta de Supabase.
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Resumen Lateral -->
                <div class="bg-white p-6 sm:p-8 rounded-3xl border border-botanika-200 h-fit space-y-6 shadow-subtle">
                    <h3 class="font-serif text-xl font-medium border-b border-botanika-200 pb-4 text-botanika-800">Resumen de Compra</h3>

                    <div class="space-y-3 max-h-60 overflow-y-auto pr-1">
                        ${cart.map(item => `
                            <div class="flex justify-between items-center text-xs">
                                <div class="flex items-center space-x-2 truncate">
                                    <span class="font-semibold text-botanika-800">${item.qty}x</span>
                                    <span class="text-botanika-700 truncate">${item.name}</span>
                                </div>
                                <span class="font-serif font-semibold text-botanika-800 ml-2">$${(item.price * item.qty).toLocaleString()}</span>
                            </div>
                        `).join('')}
                    </div>

                    <div class="space-y-2.5 text-sm pt-4 border-t border-botanika-200">
                        <div class="flex justify-between text-botanika-700">
                            <span>Subtotal</span>
                            <span>$${subtotal.toLocaleString()}</span>
                        </div>
                        ${discountApplied ? `
                            <div class="flex justify-between text-botanika-terracota">
                                <span>Descuento (10%)</span>
                                <span>-$${discount.toLocaleString()}</span>
                            </div>
                        ` : ''}
                        <div class="flex justify-between text-botanika-700">
                            <span>Logística</span>
                            <span>${shippingCost === 0 ? 'Gratis' : `$${shippingCost.toLocaleString()}`}</span>
                        </div>
                        <div class="flex justify-between font-serif font-semibold text-2xl text-botanika-800 pt-3 border-t border-botanika-200">
                            <span>Total a pagar</span>
                            <span>$${total.toLocaleString()}</span>
                        </div>
                    </div>

                    <button id="checkout-submit-btn" onclick="handleMercadoPagoPayment()" class="btn-primary w-full py-4 text-sm font-semibold flex items-center justify-center space-x-2">
                        <i data-lucide="lock" class="w-4 h-4"></i>
                        <span>Pagar con Mercado Pago $${total.toLocaleString()}</span>
                    </button>

                    <div class="text-[11px] text-center text-botanika-700 space-y-1">
                        <p class="flex items-center justify-center space-x-1">
                            <i data-lucide="shield-check" class="w-3.5 h-3.5 text-botanika-600"></i>
                            <span>Conexión cifrada SSL 256 bits</span>
                        </p>
                        <p>Orden sincronizada con Supabase Cloud</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// =============================================================================
// VISTA DE ÉXITO TRAS PAGO EN MERCADO PAGO
// =============================================================================

function renderSuccess() {
    return `
        <div class="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
            <div class="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-subtle">
                <i data-lucide="check-circle" class="w-10 h-10"></i>
            </div>

            <div class="space-y-2">
                <span class="text-xs font-semibold text-emerald-700 uppercase tracking-widest">¡Pago Aprobado con Éxito!</span>
                <h1 class="font-serif text-3xl sm:text-4xl font-medium text-botanika-800">Gracias por tu compra en Botanika</h1>
                <p class="text-botanika-700 text-sm max-w-md mx-auto">
                    Tu orden ya está siendo preparada en nuestro vivero. Te enviamos la confirmación y guía de entrega a tu correo.
                </p>
            </div>

            <div class="bg-white p-6 rounded-3xl border border-botanika-200 shadow-subtle text-left space-y-3 text-xs sm:text-sm">
                <div class="flex justify-between py-1 border-b border-botanika-100">
                    <span class="text-botanika-700">Comprobante Mercado Pago:</span>
                    <strong class="text-botanika-800 font-mono">${lastPaymentId || 'MP-' + Math.random().toString(36).substring(2, 9).toUpperCase()}</strong>
                </div>
                <div class="flex justify-between py-1 border-b border-botanika-100">
                    <span class="text-botanika-700">Identificador Supabase:</span>
                    <strong class="text-botanika-800 font-mono">${lastOrderId || 'En proceso'}</strong>
                </div>
                <div class="flex justify-between py-1 border-b border-botanika-100">
                    <span class="text-botanika-700">Tiempo de entrega:</span>
                    <strong class="text-botanika-600">48hs hábiles (Climatizado)</strong>
                </div>
                <div class="flex justify-between py-1">
                    <span class="text-botanika-700">Garantía:</span>
                    <span class="text-botanika-800">30 días de reposición botánica</span>
                </div>
            </div>

            <div class="flex flex-col sm:flex-row justify-center gap-3 pt-4">
                <button onclick="navigateTo('profile')" class="btn-secondary py-3.5 px-6 text-sm">
                    Ver en Mi Cuenta
                </button>
                <button onclick="navigateTo('home')" class="btn-primary py-3.5 px-6 text-sm">
                    Volver a la Tienda
                </button>
            </div>
        </div>
    `;
}

// =============================================================================
// VISTA DE PERFIL DE USUARIO Y HISTORIAL DE ÓRDENES EN SUPABASE
// =============================================================================

function renderProfile() {
    const userEmail = currentUser?.email || 'Sin sesión';
    const userName = currentUser?.user_metadata?.full_name || userEmail.split('@')[0];

    return `
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
            <div class="bg-white p-6 sm:p-8 rounded-3xl border border-botanika-200 shadow-subtle flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div class="flex items-center space-x-4">
                    <div class="w-16 h-16 rounded-full bg-botanika-600 text-white font-serif font-bold text-2xl flex items-center justify-center shadow-sm">
                        ${userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h1 class="font-serif text-2xl font-medium text-botanika-800">${userName}</h1>
                        <p class="text-xs text-botanika-700">${userEmail}</p>
                        <span class="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-semibold border border-emerald-200">
                            Cliente Supabase Auth
                        </span>
                    </div>
                </div>

                <div class="flex space-x-3">
                    <button onclick="handleSignOut()" class="btn-secondary text-xs py-2.5 px-4">
                        Cerrar Sesión
                    </button>
                </div>
            </div>

            <div class="bg-white p-6 sm:p-8 rounded-3xl border border-botanika-200 shadow-subtle space-y-6">
                <div class="flex justify-between items-center border-b border-botanika-200 pb-4">
                    <h2 class="font-serif text-xl font-medium text-botanika-800 flex items-center">
                        <i data-lucide="package" class="w-5 h-5 mr-2 text-botanika-600"></i>
                        Mis Órdenes en Supabase
                    </h2>
                    <button onclick="loadUserOrdersAsync()" class="text-xs text-botanika-600 hover:text-botanika-800 underline font-medium">
                        Actualizar
                    </button>
                </div>

                <div id="user-orders-container" class="space-y-4">
                    <div class="text-center py-8">
                        <svg class="animate-spin h-6 w-6 text-botanika-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                        </svg>
                        <p class="text-xs text-botanika-700">Cargando órdenes desde Supabase...</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

async function loadUserOrdersAsync() {
    const container = document.getElementById('user-orders-container');
    if (!container) return;

    try {
        const orders = await window.botanikaSupabase.getUserOrders();
        if (!orders || orders.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8 text-botanika-700 text-xs">
                    <p>Aún no registras compras con tu cuenta.</p>
                    <button onclick="navigateTo('catalog')" class="btn-primary text-xs py-2 px-4 mt-3">Ir a Comprar</button>
                </div>
            `;
            return;
        }

        container.innerHTML = orders.map(ord => {
            const isApproved = ord.status === 'aprobado';
            const statusClass = isApproved 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                : ord.status === 'pendiente' 
                ? 'bg-amber-50 text-amber-800 border-amber-200' 
                : 'bg-red-50 text-red-800 border-red-200';

            const itemsCount = Array.isArray(ord.items) ? ord.items.reduce((acc, it) => acc + (it.qty || 1), 0) : 1;
            const dateStr = ord.created_at ? new Date(ord.created_at).toLocaleDateString() : 'Reciente';

            return `
                <div class="p-4 rounded-2xl bg-botanika-50 border border-botanika-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                        <div class="flex items-center space-x-2">
                            <span class="font-mono text-xs font-bold text-botanika-800">Orden #${String(ord.id).substring(0, 8)}...</span>
                            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${statusClass}">
                                ${ord.status}
                            </span>
                        </div>
                        <p class="text-xs text-botanika-700 mt-1">${itemsCount} ítem(s) • Fecha: ${dateStr}</p>
                    </div>
                    <div class="flex items-center space-x-4">
                        <span class="font-serif font-bold text-base text-botanika-800">$${Number(ord.total_amount).toLocaleString()}</span>
                    </div>
                </div>
            `;
        }).join('');
    } catch (err) {
        console.error('Error al cargar órdenes de Supabase:', err);
        container.innerHTML = `<p class="text-xs text-red-600 py-3">No se pudieron cargar las órdenes de Supabase: ${err.message}</p>`;
    }

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function handleNewsletterSubmit(e) {
    e.preventDefault();
    const input = document.getElementById('newsletter-email');
    if (!input || !input.value) return;
    showToast('¡Gracias por unirte! Usá el código BOTANIKA10 para 10% OFF 🌿');
    input.value = '';
}

// =============================================================================
// INICIALIZACIÓN DE LA APLICACIÓN
// =============================================================================

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeAuthModal();
        closeCartDrawer();
        closeWishlistDrawer();
        closeQuickView();
        closeQuizModal();
        toggleMobileMenu(false);
    }
});

document.addEventListener('click', (e) => {
    const authModal = document.getElementById('auth-modal');
    if (e.target === authModal) closeAuthModal();

    const quickModal = document.getElementById('quick-view-modal');
    if (e.target === quickModal) closeQuickView();

    const quizModal = document.getElementById('quiz-modal');
    if (e.target === quizModal) closeQuizModal();
});

if (window.botanikaSupabase) {
    window.botanikaSupabase.onAuthStateChange((event, session) => {
        currentUser = session?.user || null;
        updateAuthUI();
        if (currentView === 'profile') {
            loadUserOrdersAsync();
        }
    });
}

async function startApp() {
    if (window.botanikaSupabase && typeof window.botanikaSupabase.waitForSession === 'function') {
        await window.botanikaSupabase.waitForSession();
    }
    await handlePaymentReturnAndInit();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startApp);
} else {
    startApp();
}