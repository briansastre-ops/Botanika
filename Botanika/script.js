/**
 * =============================================================================
 * BOTANIKA & CO. — E-COMMERCE SINGLE PAGE APPLICATION (SPA) FULL STACK
 * =============================================================================
 * Arquitectura: Frontend reactivo en Vanilla JS (ES6+) con Supabase Auth/DB
 * y pasarela de pago Checkout Pro de Mercado Pago.
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
 * @property {string} badge - Etiqueta promocional ('Más Vendido' | 'Nuevo' | 'Esencial' | 'Kit' | '').
 * @property {string} description - Resumen botánico.
 */

/**
 * Catálogo base de productos disponibles en la tienda.
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
        description: "La reina del diseño interior. Hojas perforadas imponentes que llenan cualquier rincón de frescura y vitalidad."
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
        description: "Porte escultórico con hojas en forma de violín. Ideal para livings y espacios con excelente luz natural."
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
        badge: "",
        description: "Barro cocido artesanal de alta porosidad que garantiza óptima aireación y salud radicular."
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
        description: "Mezcla aireada con corteza de pino seleccionada, perlita, fibra de coco y humus de lombriz."
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
        description: "La combinación perfecta e indestructible para iniciarte. Tolera baja luz y requiere riego cada 15 días."
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
        description: "La planta del dinero china. Hojas circulares perfectas, fácil de propagar y de rápido crecimiento."
    }
];

/**
 * Estado global del carrito de compras en memoria.
 */
let cart = [
    { id: 1, name: "Monstera Deliciosa", price: 34000, qty: 1, image: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&q=80&w=200", pot: "Terracota Artesanal" },
    { id: 3, name: "Maceta Minimal Terracota 20cm", price: 12500, qty: 1, image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&q=80&w=200", pot: "Estándar" }
];

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

/** @type {number|null} Índice de la FAQ abierta actualmente */
let openFaqIndex = 0;

// =============================================================================
// NAVEGACIÓN Y ENRUTADOR SPA
// =============================================================================

/**
 * Enrutador central de la SPA. Cambia la vista activa y renderiza sin recargar.
 */
function navigateTo(view, param) {
    currentView = view;
    if (param) currentProductId = param;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    renderView();
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

/**
 * Desplaza suavemente hacia una sección de la landing page.
 * Si el usuario se encuentra en otra vista, primero regresa al home.
 */
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
    }, 60);
}

/**
 * Alterna el menú responsive móvil.
 */
function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    if (menu) menu.classList.toggle('hidden');
}

/**
 * Muestra notificación flotante (Toast).
 */
function showToast(msg) {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toast-message');
    if (!toast || !toastMsg) return;
    toastMsg.innerText = msg;
    toast.classList.remove('translate-y-20', 'opacity-0', 'pointer-events-none');
    setTimeout(() => {
        toast.classList.add('translate-y-20', 'opacity-0', 'pointer-events-none');
    }, 3200);
}

/**
 * Actualiza el contador numérico del carrito en el header.
 */
function updateCartBadge() {
    const totalItems = cart.reduce((acc, item) => acc + item.qty, 0);
    const badge = document.getElementById('cart-badge');
    if (badge) badge.innerText = totalItems;
}

/**
 * Añade un producto al carrito de compras.
 */
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
}

// =============================================================================
// AUTENTICACIÓN CON SUPABASE & RUTA PROTEGIDA DE COMPRA
// =============================================================================

/**
 * Sincroniza la barra de navegación del header con el estado de sesión de Supabase.
 */
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
                    <span class="max-w-[120px] truncate hidden sm:inline">${displayName}</span>
                </button>
                <button onclick="handleSignOut()" class="text-xs text-botanika-700 hover:text-botanika-terracota font-medium px-2 py-1.5 rounded transition underline" title="Cerrar sesión">
                    Cerrar sesión
                </button>
            </div>
        `;
        if (headerContainer) headerContainer.innerHTML = authHtml;

        if (mobileContainer) {
            mobileContainer.innerHTML = `
                <div class="flex items-center justify-between py-2 text-sm">
                    <span class="font-medium text-botanika-800">${currentUser.email}</span>
                    <button onclick="handleSignOut(); toggleMobileMenu();" class="text-xs text-botanika-terracota font-semibold underline">Cerrar sesión</button>
                </div>
            `;
        }
    } else {
        const unauthHtml = `
            <button id="btn-header-login" onclick="openAuthModal('login')" class="text-xs font-semibold px-3 py-2 text-botanika-800 hover:text-botanika-600 transition">
                Iniciar sesión
            </button>
            <button id="btn-header-register" onclick="openAuthModal('register')" class="text-xs font-semibold px-3.5 py-2 bg-botanika-600 hover:bg-botanika-700 text-white rounded-xl transition shadow-sm">
                Registrarse
            </button>
        `;
        if (headerContainer) headerContainer.innerHTML = unauthHtml;

        if (mobileContainer) {
            mobileContainer.innerHTML = `
                <div class="grid grid-cols-2 gap-2 pt-2">
                    <button onclick="openAuthModal('login'); toggleMobileMenu();" class="w-full py-2 border border-botanika-600 rounded-xl text-xs font-semibold text-center">Iniciar sesión</button>
                    <button onclick="openAuthModal('register'); toggleMobileMenu();" class="w-full py-2 bg-botanika-600 text-white rounded-xl text-xs font-semibold text-center">Registrarse</button>
                </div>
            `;
        }
    }

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

/**
 * Abre el modal de autenticación (Login o Registro).
 */
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

/**
 * Cierra el modal de autenticación.
 */
function closeAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
        modal.classList.add('opacity-0', 'pointer-events-none');
        const card = document.getElementById('auth-modal-card');
        if (card) {
            card.classList.remove('scale-100');
            card.classList.add('scale-95');
        }
    }
    // Si se cancela el login, podemos limpiar la acción pendiente si se desea
}

/**
 * Alterna pestañas entre Login y Registro dentro del modal.
 */
function switchAuthTab(tab) {
    authModalMode = tab;
    const tabLogin = document.getElementById('auth-tab-login');
    const tabRegister = document.getElementById('auth-tab-register');
    const nameGroup = document.getElementById('auth-name-group');
    const confirmGroup = document.getElementById('auth-confirm-group');
    const modalTitle = document.getElementById('auth-modal-title');
    const submitText = document.getElementById('auth-submit-text');
    const switchPrompt = document.getElementById('auth-switch-prompt');
    const switchLink = document.getElementById('auth-switch-link');
    const errorBox = document.getElementById('auth-error-box');

    if (errorBox) errorBox.classList.add('hidden');

    if (tab === 'register') {
        if (tabRegister) {
            tabRegister.className = 'py-2 rounded-lg bg-white shadow-sm text-botanika-800 transition font-semibold';
        }
        if (tabLogin) {
            tabLogin.className = 'py-2 rounded-lg text-botanika-700 hover:text-botanika-800 transition';
        }
        if (nameGroup) nameGroup.classList.remove('hidden');
        if (confirmGroup) confirmGroup.classList.remove('hidden');
        if (modalTitle) modalTitle.innerText = 'Crear Cuenta en Botanika';
        if (submitText) submitText.innerText = 'Registrarse con Supabase';
        if (switchPrompt) switchPrompt.innerText = '¿Ya tienes una cuenta?';
        if (switchLink) switchLink.innerText = 'Inicia sesión';
    } else {
        if (tabLogin) {
            tabLogin.className = 'py-2 rounded-lg bg-white shadow-sm text-botanika-800 transition font-semibold';
        }
        if (tabRegister) {
            tabRegister.className = 'py-2 rounded-lg text-botanika-700 hover:text-botanika-800 transition';
        }
        if (nameGroup) nameGroup.classList.add('hidden');
        if (confirmGroup) confirmGroup.classList.add('hidden');
        if (modalTitle) modalTitle.innerText = 'Iniciar Sesión';
        if (submitText) submitText.innerText = 'Ingresar a mi cuenta';
        if (switchPrompt) switchPrompt.innerText = '¿No tienes cuenta todavía?';
        if (switchLink) switchLink.innerText = 'Regístrate gratis';
    }
}

/**
 * Alterna el modo del modal al hacer clic en el enlace inferior.
 */
function toggleAuthMode() {
    switchAuthTab(authModalMode === 'login' ? 'register' : 'login');
}

/**
 * Procesa el envío del formulario de autenticación con Supabase Auth.
 */
async function handleAuthSubmit(event) {
    event.preventDefault();
    const email = document.getElementById('auth-email-input')?.value?.trim();
    const password = document.getElementById('auth-password-input')?.value;
    const fullName = document.getElementById('auth-name-input')?.value?.trim();
    const confirmPassword = document.getElementById('auth-confirm-input')?.value;
    const errorBox = document.getElementById('auth-error-box');
    const errorMsg = document.getElementById('auth-error-message');
    const submitBtn = document.getElementById('auth-submit-btn');
    const submitText = document.getElementById('auth-submit-text');

    if (!email || !password) {
        showAuthError('Por favor completa todos los campos requeridos.');
        return;
    }

    if (authModalMode === 'register') {
        if (password.length < 6) {
            showAuthError('La contraseña debe tener un mínimo de 6 caracteres.');
            return;
        }
        if (password !== confirmPassword) {
            showAuthError('Las contraseñas no coinciden.');
            return;
        }
    }

    // Estado visual de carga
    if (submitBtn) submitBtn.disabled = true;
    if (submitText) submitText.innerText = 'Verificando con Supabase...';

    try {
        if (authModalMode === 'register') {
            const result = await window.botanikaSupabase.signUp(email, password, fullName);

            if (result && result.session) {
                currentUser = result.session.user || await window.botanikaSupabase.getUser();
                updateAuthUI();
                closeAuthModal();
                showToast('¡Registro exitoso en Botanika!');

                // Ejecutar acción pendiente tras registro exitoso
                if (pendingAction) {
                    const action = pendingAction;
                    pendingAction = null;
                    if (action.type === 'checkout') {
                        navigateTo('checkout');
                    } else if (action.type === 'pay_mercadopago') {
                        handleMercadoPagoPayment();
                    } else if (action.type === 'direct_buy' && action.productId) {
                        handleDirectBuy(action.productId);
                    }
                }
            } else {
                // Cuenta creada pero requiere confirmación por email (Supabase default)
                const successBox = document.getElementById('auth-success-box');
                const successMsg = document.getElementById('auth-success-message');
                if (successBox && successMsg) {
                    successMsg.innerHTML = `<strong>¡Cuenta creada!</strong> Te enviamos un correo de confirmación a <u>${email}</u>. Por favor revisa tu bandeja para verificarla e iniciar sesión.`;
                    successBox.classList.remove('hidden');
                }
                switchAuthTab('login');
                showToast('Verifica tu correo para activar tu cuenta.');
            }
        } else {
            await window.botanikaSupabase.signIn(email, password);
            showToast('¡Bienvenido de vuelta a Botanika!');

            // Obtener usuario actualizado
            currentUser = await window.botanikaSupabase.getUser();
            updateAuthUI();
            closeAuthModal();

            // Ejecutar acción pendiente tras login exitoso (Ruta Protegida)
            if (pendingAction) {
                const action = pendingAction;
                pendingAction = null;
                if (action.type === 'checkout') {
                    navigateTo('checkout');
                } else if (action.type === 'pay_mercadopago') {
                    handleMercadoPagoPayment();
                } else if (action.type === 'direct_buy' && action.productId) {
                    handleDirectBuy(action.productId);
                }
            }
        }
    } catch (err) {
        console.error('Error de autenticación:', err);
        let readableMessage = err.message || 'Error al autenticar.';
        if (readableMessage.includes('Invalid login credentials')) {
            readableMessage = 'Correo o contraseña incorrectos. Verifica tus datos.';
        } else if (readableMessage.includes('User already registered')) {
            readableMessage = 'Este correo ya tiene una cuenta registrada. Inicia sesión.';
        }
        showAuthError(readableMessage);
    } finally {
        if (submitBtn) submitBtn.disabled = false;
        if (submitText) {
            submitText.innerText = authModalMode === 'register' ? 'Registrarse con Supabase' : 'Ingresar a mi cuenta';
        }
    }
}

function showAuthError(msg) {
    const errorBox = document.getElementById('auth-error-box');
    const errorMsg = document.getElementById('auth-error-message');
    if (errorBox && errorMsg) {
        errorMsg.innerText = msg;
        errorBox.classList.remove('hidden');
    }
}

/**
 * Cierre de sesión de Supabase Auth
 */
async function handleSignOut() {
    try {
        await window.botanikaSupabase.signOut();
        currentUser = null;
        updateAuthUI();
        showToast('Sesión cerrada correctamente');
        if (currentView === 'profile' || currentView === 'checkout') {
            navigateTo('home');
        }
    } catch (err) {
        console.error('Error al cerrar sesión:', err);
    }
}

/**
 * Compra directa desde la Landing Page con ruta protegida.
 * Si el usuario no tiene sesión activa, guarda la intención de compra
 * y le solicita iniciar sesión o registrarse.
 */
function handleDirectBuy(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    // Agregar el producto al carrito si no está
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

    // Ruta protegida: ¿Usuario logueado?
    if (!currentUser) {
        pendingAction = { type: 'checkout', productId };
        openAuthModal('login', true);
        return;
    }

    // Usuario autenticado: ir directo al checkout
    navigateTo('checkout');
}

// =============================================================================
// PROCESO DE PAGO SEGURO CON MERCADO PAGO Y ÓRDENES EN SUPABASE
// =============================================================================

/**
 * Determina dinámicamente la URL base del backend según el entorno de ejecución.
 */
function getApiBaseUrl() {
    if (window.BOTANIKA_API_URL) {
        return window.BOTANIKA_API_URL.replace(/\/+$/, '');
    }
    const isLocal = window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1' || 
                    window.location.protocol === 'file:';
    return isLocal ? 'http://localhost:3000' : '';
}

/**
 * Inicia el flujo de pago con Mercado Pago creando la orden en Supabase.
 */
async function handleMercadoPagoPayment() {
    if (cart.length === 0) {
        showToast('Tu carrito está vacío.');
        return;
    }

    // 1. RUTA PROTEGIDA: Verificar sesión en Supabase
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

        // 2. CREAR ORDEN EN SUPABASE con estado 'pendiente'
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
        console.log('✅ [Supabase] Orden creada exitosamente:', supabaseOrder.id);

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

        // 3. CONECTAR CON BACKEND DE MERCADO PAGO ASOCIANDO orderId
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

        // 4. REDIRECCIÓN A LA PASARELA OFICIAL
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
        showToast(error.message || 'Error de conexión con el backend de pagos.');
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = originalContent;
        }
    }
}

// =============================================================================
// DETECCIÓN DE RETORNO TRAS EL PAGO (Éxito / Fallo / Pendiente)
// =============================================================================

async function handlePaymentReturnAndInit() {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status') || params.get('collection_status');
    const paymentId = params.get('payment_id') || params.get('collection_id');
    const externalRef = params.get('external_reference') || params.get('order_id');

    if (paymentId) lastPaymentId = paymentId;
    if (externalRef) lastOrderId = externalRef;

    // Inicializar usuario desde Supabase
    currentUser = await window.botanikaSupabase.getUser();
    updateAuthUI();

    if (status === 'approved') {
        cart = [];
        updateCartBadge();

        // Actualizar estado de orden en Supabase a 'aprobado'
        if (lastOrderId) {
            try {
                await window.botanikaSupabase.updateOrderStatus(lastOrderId, 'aprobado', paymentId);
                console.log(`✅ [Supabase] Orden ${lastOrderId} actualizada a "aprobado".`);
            } catch (supaErr) {
                console.warn('No se pudo actualizar estado en Supabase:', supaErr);
            }
        }

        navigateTo('success');
        showToast('¡Pago aprobado con éxito vía Mercado Pago!');
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
    } else if (status === 'failure' || status === 'rejected') {
        if (lastOrderId) {
            await window.botanikaSupabase.updateOrderStatus(lastOrderId, 'rechazado', paymentId);
        }
        navigateTo('cart');
        showToast('El pago en Mercado Pago fue cancelado o rechazado.');
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
    } else if (status === 'pending') {
        if (lastOrderId) {
            await window.botanikaSupabase.updateOrderStatus(lastOrderId, 'pendiente', paymentId);
        }
        navigateTo('profile');
        showToast('Tu pago con Mercado Pago se encuentra en proceso.');
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
    }

    renderView();
}

// =============================================================================
// RENDERIZADO DE VISTAS (SPA Switcher)
// =============================================================================

function renderView() {
    const main = document.getElementById('main-content');
    if (!main) return;
    updateCartBadge();
    updateAuthUI();

    switch (currentView) {
        case 'home':
            main.innerHTML = renderHome();
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
            // Cargar órdenes asíncronas
            loadUserOrdersAsync();
            break;
        case 'success':
            main.innerHTML = renderSuccess();
            break;
        default:
            main.innerHTML = renderHome();
    }

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// =============================================================================
// SECCIÓN 1 A 8: LANDING PAGE OFICIAL BOTANIKA
// =============================================================================

function renderHome() {
    return `
        <!-- =================================================================== -->
        <!-- SECCIÓN 2: HERO BANNER CON PROPUESTA DE VALOR                       -->
        <!-- =================================================================== -->
        <section id="landing-hero" class="relative bg-gradient-to-b from-botanika-100 via-botanika-50 to-botanika-50 overflow-hidden py-16 md:py-24 border-b border-botanika-200">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                
                <div class="lg:col-span-7 space-y-6">
                    <div class="inline-flex items-center space-x-2 bg-botanika-200/80 text-botanika-800 text-xs tracking-widest uppercase font-semibold px-3.5 py-1.5 rounded-full border border-botanika-300 shadow-sm">
                        <i data-lucide="sparkles" class="w-3.5 h-3.5 text-botanika-terracota"></i>
                        <span>Studio Botánico & Diseño Sostenible</span>
                    </div>

                    <h1 class="font-serif text-4xl sm:text-5xl lg:text-6xl text-botanika-800 leading-tight">
                        Naturaleza viva, <br>
                        <span class="italic text-botanika-600 font-normal">diseño y calma</span> para tu hogar.
                    </h1>

                    <p class="text-botanika-700 text-base sm:text-lg max-w-xl leading-relaxed">
                        Curamos plantas de interior aclimatadas en vivero y diseñamos macetas artesanales en terracota y cerámica. Envíos climatizados en 48hs con garantía de reposición.
                    </p>

                    <!-- Acciones principales -->
                    <div class="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-3">
                        <button onclick="goToLandingSection('productos')" class="bg-botanika-600 hover:bg-botanika-700 text-white font-semibold px-8 py-4 rounded-xl transition shadow-md flex items-center justify-center space-x-2 text-base">
                            <span>Comprar Ahora</span>
                            <i data-lucide="arrow-right" class="w-4 h-4"></i>
                        </button>
                        <button onclick="goToLandingSection('como-funciona')" class="bg-white border-2 border-botanika-300 text-botanika-800 hover:border-botanika-600 font-medium px-8 py-4 rounded-xl transition text-center shadow-sm">
                            ¿Cómo funciona?
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

                <!-- Imagen Hero con aura difuminada -->
                <div class="lg:col-span-5 relative flex justify-center">
                    <div class="absolute w-80 h-80 sm:w-96 sm:h-96 rounded-full bg-botanika-300/40 -z-10 filter blur-3xl"></div>
                    <div class="relative w-full max-w-md bg-white p-3 rounded-3xl shadow-2xl border border-botanika-200">
                        <img src="https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&q=80&w=700" 
                            alt="Ficus Lyrata en Maceta Artesanal Botanika" 
                            class="rounded-2xl object-cover h-[420px] w-full transform hover:scale-[1.01] transition duration-500">
                        
                        <!-- Floating Pill Badge -->
                        <div class="absolute -bottom-5 -left-4 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-botanika-200 flex items-center space-x-3">
                            <div class="w-10 h-10 rounded-xl bg-botanika-600 text-white flex items-center justify-center font-serif text-lg">🌿</div>
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
        <!-- SECCIÓN 3: BENEFICIOS / CARACTERÍSTICAS                             -->
        <!-- =================================================================== -->
        <section id="landing-beneficios" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div class="text-center max-w-2xl mx-auto mb-16 space-y-3">
                <span class="text-botanika-terracota font-semibold text-xs tracking-widest uppercase">Por qué elegir Botanika</span>
                <h2 class="font-serif text-3xl sm:text-4xl font-medium text-botanika-800">Cuidado botánico en cada detalle</h2>
                <p class="text-botanika-700 text-sm sm:text-base leading-relaxed">
                    No solo vendemos plantas: te brindamos el ecosistema completo para que crezcan felices y transformen la energía de tu entorno.
                </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                
                <div class="bg-white p-8 rounded-3xl border border-botanika-200 shadow-sm hover:shadow-md transition space-y-4">
                    <div class="w-12 h-12 rounded-2xl bg-botanika-100 text-botanika-600 flex items-center justify-center">
                        <i data-lucide="sprout" class="w-6 h-6"></i>
                    </div>
                    <h3 class="font-serif text-xl font-medium text-botanika-800">Curaduría Experta</h3>
                    <p class="text-botanika-700 text-xs sm:text-sm leading-relaxed">
                        Seleccionamos manualmente cada ejemplar en vivero y lo aclimatamos para garantizar raíces vigorosas antes de enviarlo.
                    </p>
                </div>

                <div class="bg-white p-8 rounded-3xl border border-botanika-200 shadow-sm hover:shadow-md transition space-y-4">
                    <div class="w-12 h-12 rounded-2xl bg-botanika-100 text-botanika-600 flex items-center justify-center">
                        <i data-lucide="package-check" class="w-6 h-6"></i>
                    </div>
                    <h3 class="font-serif text-xl font-medium text-botanika-800">Packaging Climatizado</h3>
                    <p class="text-botanika-700 text-xs sm:text-sm leading-relaxed">
                        Empaque ecológico térmico antiestrés que protege el follaje, mantiene la humedad y evita golpes durante el traslado.
                    </p>
                </div>

                <div class="bg-white p-8 rounded-3xl border border-botanika-200 shadow-sm hover:shadow-md transition space-y-4">
                    <div class="w-12 h-12 rounded-2xl bg-botanika-100 text-botanika-terracota flex items-center justify-center">
                        <i data-lucide="shield-check" class="w-6 h-6"></i>
                    </div>
                    <h3 class="font-serif text-xl font-medium text-botanika-800">Garantía Verde 30 Días</h3>
                    <p class="text-botanika-700 text-xs sm:text-sm leading-relaxed">
                        Si tu compañera verde no se adapta a tu espacio en sus primeros 30 días, te asesoramos sin cargo o te la reemplazamos.
                    </p>
                </div>

                <div class="bg-white p-8 rounded-3xl border border-botanika-200 shadow-sm hover:shadow-md transition space-y-4">
                    <div class="w-12 h-12 rounded-2xl bg-botanika-100 text-botanika-600 flex items-center justify-center">
                        <i data-lucide="palette" class="w-6 h-6"></i>
                    </div>
                    <h3 class="font-serif text-xl font-medium text-botanika-800">Macetas de Autor</h3>
                    <p class="text-botanika-700 text-xs sm:text-sm leading-relaxed">
                        Piezas artesanales torneadas a mano con materiales nobles, tonos naturales y orificio de drenaje profesional.
                    </p>
                </div>

            </div>
        </section>

        <!-- =================================================================== -->
        <!-- SECCIÓN 4: CÓMO FUNCIONA (4 PASOS)                                  -->
        <!-- =================================================================== -->
        <section id="landing-como-funciona" class="bg-botanika-100/70 border-y border-botanika-200 py-20">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="text-center max-w-2xl mx-auto mb-16 space-y-3">
                    <span class="text-botanika-terracota font-semibold text-xs tracking-widest uppercase">Paso a paso sencillo</span>
                    <h2 class="font-serif text-3xl sm:text-4xl font-medium text-botanika-800">¿Cómo llega tu selva urbana?</h2>
                    <p class="text-botanika-700 text-sm sm:text-base leading-relaxed">
                        Diseñamos una experiencia de compra fluida y sin fricciones de punta a punta.
                    </p>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    
                    <div class="relative bg-white p-6 rounded-2xl border border-botanika-200 space-y-3 shadow-sm">
                        <div class="w-10 h-10 rounded-full bg-botanika-600 text-white flex items-center justify-center font-serif font-bold text-lg">1</div>
                        <h4 class="font-serif text-lg font-medium text-botanika-800">Elegí tu compañera</h4>
                        <p class="text-xs text-botanika-700 leading-relaxed">
                            Seleccioná la planta o kit según la cantidad de luz de tu ambiente (mucha luz, semisombra o baja luz).
                        </p>
                    </div>

                    <div class="relative bg-white p-6 rounded-2xl border border-botanika-200 space-y-3 shadow-sm">
                        <div class="w-10 h-10 rounded-full bg-botanika-600 text-white flex items-center justify-center font-serif font-bold text-lg">2</div>
                        <h4 class="font-serif text-lg font-medium text-botanika-800">Personalizá tu maceta</h4>
                        <p class="text-xs text-botanika-700 leading-relaxed">
                            Elegí el acabado: terracota artesanal, cerámica blanca o gris cálido con sustrato especial ya armado.
                        </p>
                    </div>

                    <div class="relative bg-white p-6 rounded-2xl border border-botanika-200 space-y-3 shadow-sm">
                        <div class="w-10 h-10 rounded-full bg-botanika-600 text-white flex items-center justify-center font-serif font-bold text-lg">3</div>
                        <h4 class="font-serif text-lg font-medium text-botanika-800">Pagá seguro en cuotas</h4>
                        <p class="text-xs text-botanika-700 leading-relaxed">
                            Pagá con Mercado Pago Checkout Pro (tarjetas, dinero en cuenta o cuotas) con confirmación instantánea.
                        </p>
                    </div>

                    <div class="relative bg-white p-6 rounded-2xl border border-botanika-200 space-y-3 shadow-sm">
                        <div class="w-10 h-10 rounded-full bg-botanika-terracota text-white flex items-center justify-center font-serif font-bold text-lg">4</div>
                        <h4 class="font-serif text-lg font-medium text-botanika-800">Recibí en 48hs</h4>
                        <p class="text-xs text-botanika-700 leading-relaxed">
                            Recibila en tu puerta en óptimo estado y escaneá el QR con tu guía digital de riego personalizada.
                        </p>
                    </div>

                </div>
            </div>
        </section>

        <!-- =================================================================== -->
        <!-- SECCIÓN 5: PRODUCTO O PLANES CON PRECIO Y BOTÓN "COMPRAR"           -->
        <!-- =================================================================== -->
        <section id="landing-productos" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div class="flex flex-col md:flex-row md:items-end justify-between mb-12">
                <div class="space-y-2">
                    <span class="text-botanika-terracota font-semibold text-xs tracking-widest uppercase">Colección Destacada</span>
                    <h2 class="font-serif text-3xl sm:text-4xl font-medium text-botanika-800">Elegí tu planta y comprá online</h2>
                    <p class="text-botanika-700 text-sm">Flujo integrado con registro seguro en Supabase y pago con Mercado Pago.</p>
                </div>
                <button onclick="navigateTo('catalog')" class="mt-4 md:mt-0 inline-flex items-center space-x-1 text-sm font-semibold text-botanika-600 hover:text-botanika-800">
                    <span>Ver catálogo completo (6 productos)</span>
                    <i data-lucide="arrow-right" class="w-4 h-4"></i>
                </button>
            </div>

            <!-- Grilla de Planes / Productos con Botón Directo "Comprar" -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                ${products.slice(0, 4).map(p => `
                    <div class="group bg-white rounded-3xl p-5 shadow-sm hover:shadow-lg transition border border-botanika-200 flex flex-col justify-between">
                        <div>
                            <div class="relative rounded-2xl overflow-hidden bg-botanika-50 h-60 mb-4 cursor-pointer" onclick="navigateTo('product', ${p.id})">
                                <img src="${p.image}" alt="${p.name}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
                                ${p.badge ? `<span class="absolute top-3 left-3 bg-botanika-800/90 text-white text-[10px] uppercase font-semibold px-2.5 py-1 rounded-full">${p.badge}</span>` : ''}
                            </div>
                            
                            <span class="text-[11px] uppercase tracking-wider font-semibold text-botanika-600">${p.category}</span>
                            <h3 onclick="navigateTo('product', ${p.id})" class="font-serif text-lg font-medium text-botanika-800 cursor-pointer hover:text-botanika-600 transition mt-1 line-clamp-1">${p.name}</h3>
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

                            <button id="btn-buy-product-${p.id}" onclick="handleDirectBuy(${p.id})" class="w-full bg-botanika-600 hover:bg-botanika-700 text-white font-semibold py-3 rounded-xl transition text-sm flex items-center justify-center space-x-2 shadow-sm">
                                <i data-lucide="shopping-bag" class="w-4 h-4"></i>
                                <span>Comprar Ahora</span>
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </section>

        <!-- =================================================================== -->
        <!-- SECCIÓN 6: TESTIMONIOS / RESEÑAS DE CLIENTES                        -->
        <!-- =================================================================== -->
        <section id="landing-testimonios" class="bg-botanika-100/60 border-t border-botanika-200 py-20">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="text-center max-w-xl mx-auto mb-16 space-y-3">
                    <span class="text-botanika-terracota font-semibold text-xs tracking-widest uppercase">Comunidad Verde</span>
                    <h2 class="font-serif text-3xl sm:text-4xl font-medium text-botanika-800">Lo que dicen nuestros clientes</h2>
                    <p class="text-botanika-700 text-sm">Más de 2.500 personas ya disfrutan de sus espacios con Botanika.</p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    
                    <div class="bg-white p-8 rounded-3xl border border-botanika-200 space-y-4 shadow-sm">
                        <div class="flex text-amber-500 space-x-1">
                            ★★★★★
                        </div>
                        <p class="text-sm text-botanika-700 leading-relaxed italic">
                            "Compré la Monstera con maceta terracota. Llegó en menos de 48hs en una caja impecable y con las hojas perfectas. El pago con Mercado Pago fue instantáneo."
                        </p>
                        <div class="flex items-center space-x-3 pt-2">
                            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120" class="w-10 h-10 rounded-full object-cover">
                            <div>
                                <h4 class="font-medium text-sm text-botanika-800">Sofía Valenzuela</h4>
                                <span class="text-xs text-botanika-700">Palermo, CABA</span>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white p-8 rounded-3xl border border-botanika-200 space-y-4 shadow-sm">
                        <div class="flex text-amber-500 space-x-1">
                            ★★★★★
                        </div>
                        <p class="text-sm text-botanika-700 leading-relaxed italic">
                            "El Kit Principiante me salvó la vida. Siempre se me morían las plantas, pero con la Sansevieria y los recordatorios de riego por correo ya lleva 3 meses hermosa."
                        </p>
                        <div class="flex items-center space-x-3 pt-2">
                            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120" class="w-10 h-10 rounded-full object-cover">
                            <div>
                                <h4 class="font-medium text-sm text-botanika-800">Martín Benítez</h4>
                                <span class="text-xs text-botanika-700">Vicente López</span>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white p-8 rounded-3xl border border-botanika-200 space-y-4 shadow-sm">
                        <div class="flex text-amber-500 space-x-1">
                            ★★★★★
                        </div>
                        <p class="text-sm text-botanika-700 leading-relaxed italic">
                            "Excelente calidad en las macetas artesanales, tienen el peso y drenaje justo. La integración de la cuenta en la web es súper cómoda para ver mis órdenes."
                        </p>
                        <div class="flex items-center space-x-3 pt-2">
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
        <!-- SECCIÓN 7: PREGUNTAS FRECUENTES (FAQ ACORDEÓN)                      -->
        <!-- =================================================================== -->
        <section id="landing-faq" class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div class="text-center mb-12 space-y-3">
                <span class="text-botanika-terracota font-semibold text-xs tracking-widest uppercase">Despejá tus dudas</span>
                <h2 class="font-serif text-3xl sm:text-4xl font-medium text-botanika-800">Preguntas Frecuentes</h2>
                <p class="text-botanika-700 text-sm">Todo lo que necesitas saber sobre envíos, pagos y cuidados.</p>
            </div>

            <div class="space-y-4">
                ${[
                    {
                        q: "¿Cómo viajan las plantas sin dañarse?",
                        a: "Utilizamos cajas de cartón reforzado con diseño estructural exclusivo de Botanika. El cepellón de la planta va anclado a la base para evitar movimientos, y las hojas cuentan con una camisa térmica protectora que conserva la humedad."
                    },
                    {
                        q: "¿Qué medios de pago aceptan?",
                        a: "Aceptamos todas las opciones disponibles en Mercado Pago: tarjetas de crédito (con promociones bancarias y cuotas), tarjetas de débito, dinero en cuenta de Mercado Pago y transferencias bancarias directas."
                    },
                    {
                        q: "¿Qué pasa si una planta llega marchita o sufre en el viaje?",
                        a: "Tenés nuestra Garantía Verde de 30 días. Si tu planta no llega en óptimas condiciones, nos enviás una foto por WhatsApp o correo en las primeras 48hs y te enviamos un ejemplar de reposición sin ningún costo."
                    },
                    {
                        q: "No tengo experiencia previa, ¿cuál es la mejor opción para arrancar?",
                        a: "Te recomendamos nuestro 'Kit Principiante con Sansevieria' o la 'Monstera Deliciosa'. Son especies muy nobles y resistentes que toleran descuidos de riego y se adaptan a distintas intensidades de luz."
                    },
                    {
                        q: "¿Hacen envíos a todo el país?",
                        a: "Realizamos envíos en 48hs hábiles en CABA y Gran Buenos Aires mediante flete refrigerado propio, y despachos al interior del país con operadores logísticos especializados en botánica viva."
                    }
                ].map((faq, idx) => `
                    <div class="bg-white rounded-2xl border border-botanika-200 overflow-hidden transition">
                        <button onclick="toggleFaq(${idx})" class="w-full p-5 text-left flex justify-between items-center space-x-4 hover:bg-botanika-50/50 transition">
                            <span class="font-serif text-base sm:text-lg font-medium text-botanika-800">${faq.q}</span>
                            <i data-lucide="${openFaqIndex === idx ? 'chevron-up' : 'chevron-down'}" class="w-5 h-5 text-botanika-600 flex-shrink-0"></i>
                        </button>
                        ${openFaqIndex === idx ? `
                            <div class="px-5 pb-5 text-sm text-botanika-700 leading-relaxed border-t border-botanika-100 pt-3">
                                ${faq.a}
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
// OTRAS VISTAS (Catálogo, Ficha Producto, Carrito, Checkout, Perfil, Estilos)
// =============================================================================

function renderProductCard(p) {
    return `
        <div class="group bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition border border-botanika-200 flex flex-col justify-between">
            <div>
                <div class="relative rounded-xl overflow-hidden bg-botanika-50 h-64 mb-4 cursor-pointer" onclick="navigateTo('product', ${p.id})">
                    <img src="${p.image}" alt="${p.name}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
                    ${p.badge ? `<span class="absolute top-3 left-3 bg-botanika-800/90 text-white text-[10px] uppercase font-semibold px-2.5 py-1 rounded-full">${p.badge}</span>` : ''}
                </div>
                <h3 onclick="navigateTo('product', ${p.id})" class="font-medium text-botanika-800 cursor-pointer hover:text-botanika-600 transition line-clamp-1">${p.name}</h3>
                <p class="text-xs text-botanika-700 mt-1">${p.category} • Maceta ${p.pot}</p>
            </div>
            <div class="flex items-center justify-between mt-4 pt-3 border-t border-botanika-100">
                <span class="font-serif font-semibold text-lg">$${p.price.toLocaleString()}</span>
                <div class="flex space-x-1">
                    <button onclick="addToCart(${p.id})" class="bg-botanika-100 hover:bg-botanika-200 text-botanika-800 p-2.5 rounded-xl transition" title="Agregar al carrito">
                        <i data-lucide="plus" class="w-4 h-4"></i>
                    </button>
                    <button onclick="handleDirectBuy(${p.id})" class="bg-botanika-600 hover:bg-botanika-700 text-white px-3 py-2 rounded-xl transition text-xs font-semibold">
                        Comprar
                    </button>
                </div>
            </div>
        </div>
    `;
}

function renderCatalog() {
    return `
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div class="mb-8">
                <h1 class="font-serif text-3xl font-medium">Catálogo de Productos</h1>
                <p class="text-botanika-700 text-sm mt-1">Explora nuestra selección completa de plantas, macetas de diseño y sustratos.</p>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div class="bg-white p-6 rounded-2xl border border-botanika-200 h-fit space-y-6">
                    <div class="flex justify-between items-center border-b border-botanika-200 pb-4">
                        <h3 class="font-medium text-lg flex items-center"><i data-lucide="sliders-horizontal" class="w-4 h-4 mr-2"></i> Filtros</h3>
                        <button onclick="showToast('Filtros restablecidos')" class="text-xs text-botanika-terracota underline font-medium">Limpiar</button>
                    </div>

                    <div>
                        <h4 class="text-xs font-bold tracking-wider uppercase text-botanika-800 mb-3">Categoría</h4>
                        <div class="space-y-2 text-sm">
                            <label class="flex items-center space-x-2 cursor-pointer"><input type="checkbox" checked class="rounded border-botanika-300 text-botanika-600"> <span>Plantas de Interior</span></label>
                            <label class="flex items-center space-x-2 cursor-pointer"><input type="checkbox" checked class="rounded border-botanika-300 text-botanika-600"> <span>Macetas & Soportes</span></label>
                            <label class="flex items-center space-x-2 cursor-pointer"><input type="checkbox" checked class="rounded border-botanika-300 text-botanika-600"> <span>Sustratos & Nutrientes</span></label>
                            <label class="flex items-center space-x-2 cursor-pointer"><input type="checkbox" checked class="rounded border-botanika-300 text-botanika-600"> <span>Kits Completos</span></label>
                        </div>
                    </div>

                    <button onclick="showToast('Filtros aplicados')" class="w-full bg-botanika-600 hover:bg-botanika-700 text-white rounded-xl py-3 text-sm font-medium transition">Aplicar Filtros</button>
                </div>

                <div class="lg:col-span-3 space-y-6">
                    <div class="bg-white p-4 rounded-2xl border border-botanika-200 flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
                        <span class="text-sm text-botanika-700">Mostrando <strong>${products.length}</strong> productos</span>
                        <div class="flex items-center space-x-2 text-sm">
                            <span class="text-botanika-700">Ordenar por:</span>
                            <select class="bg-botanika-50 border border-botanika-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-botanika-600">
                                <option>Relevancia</option>
                                <option>Precio: Menor a Mayor</option>
                                <option>Precio: Mayor a Menor</option>
                            </select>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        ${products.map(p => renderProductCard(p)).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
}

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
                    <div class="rounded-3xl overflow-hidden bg-white border border-botanika-200 h-[450px]">
                        <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover">
                    </div>
                </div>

                <div class="space-y-6">
                    <div>
                        <span class="bg-botanika-200 text-botanika-800 text-xs uppercase font-semibold px-3 py-1 rounded-full">${product.badge || 'Stock Disponible'}</span>
                        <h1 class="font-serif text-4xl text-botanika-800 mt-3">${product.name}</h1>
                        <p class="font-serif text-2xl text-botanika-terracota font-semibold mt-2">$${product.price.toLocaleString()}</p>
                    </div>

                    <p class="text-botanika-700 text-sm leading-relaxed">${product.description}</p>

                    <div class="bg-white p-5 rounded-2xl border border-botanika-200 grid grid-cols-3 gap-4 text-center">
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

                    <div class="flex space-x-4 pt-4">
                        <button onclick="handleDirectBuy(${product.id})" class="flex-grow bg-botanika-600 hover:bg-botanika-700 text-white font-medium py-4 rounded-xl shadow-md transition flex items-center justify-center space-x-2">
                            <i data-lucide="shopping-bag" class="w-5 h-5"></i>
                            <span>Comprar Ahora $${product.price.toLocaleString()}</span>
                        </button>
                        <button onclick="addToCart(${product.id})" class="p-4 border border-botanika-300 rounded-xl hover:bg-botanika-100 transition" title="Agregar al carrito">
                            <i data-lucide="plus" class="w-5 h-5 text-botanika-800"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderCart() {
    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const discount = discountApplied ? subtotal * 0.1 : 0;
    const total = subtotal - discount;

    return `
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 class="font-serif text-3xl font-medium mb-8">Tu Carrito de Compras</h1>

            ${cart.length === 0 ? `
                <div class="text-center py-20 bg-white rounded-3xl border border-botanika-200">
                    <i data-lucide="shopping-bag" class="w-12 h-12 mx-auto text-botanika-300 mb-4"></i>
                    <h3 class="font-serif text-xl font-medium">Tu carrito está vacío</h3>
                    <p class="text-botanika-700 text-sm mt-1 mb-6">Aún no has agregado plantas ni accesorios.</p>
                    <button onclick="navigateTo('catalog')" class="bg-botanika-600 text-white px-6 py-3 rounded-xl font-medium text-sm">Ir al Catálogo</button>
                </div>
            ` : `
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div class="lg:col-span-2 space-y-4">
                        ${cart.map((item, idx) => `
                            <div class="bg-white p-4 sm:p-6 rounded-2xl border border-botanika-200 flex items-center justify-between space-x-4">
                                <img src="${item.image}" alt="${item.name}" class="w-20 h-20 rounded-xl object-cover bg-botanika-50 flex-shrink-0">
                                <div class="flex-grow">
                                    <h3 class="font-medium text-botanika-800">${item.name}</h3>
                                    <p class="text-xs text-botanika-700 mt-0.5">Maceta: ${item.pot}</p>
                                    <p class="font-serif font-semibold text-botanika-800 mt-1">$${item.price.toLocaleString()}</p>
                                </div>
                                <div class="flex items-center space-x-3">
                                    <div class="flex items-center border border-botanika-300 rounded-lg">
                                        <button onclick="updateQty(${idx}, -1)" class="px-2.5 py-1 text-botanika-700 hover:bg-botanika-100">-</button>
                                        <span class="px-3 text-sm font-medium">${item.qty}</span>
                                        <button onclick="updateQty(${idx}, 1)" class="px-2.5 py-1 text-botanika-700 hover:bg-botanika-100">+</button>
                                    </div>
                                    <button onclick="removeItem(${idx})" class="p-2 text-botanika-700 hover:text-botanika-terracota transition">
                                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>

                    <div class="bg-white p-6 rounded-2xl border border-botanika-200 h-fit space-y-6">
                        <h3 class="font-serif text-xl font-medium border-b border-botanika-200 pb-4">Resumen del Pedido</h3>
                        
                        <div class="flex space-x-2">
                            <input type="text" id="discount-input" placeholder="Cupón: BOTANIKA10" class="bg-botanika-50 border border-botanika-300 rounded-xl px-4 py-2.5 text-sm flex-grow focus:outline-none focus:border-botanika-600">
                            <button onclick="applyDiscount()" class="bg-botanika-800 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-botanika-700 transition">Aplicar</button>
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
                                <span>$3,500</span>
                            </div>
                            <div class="flex justify-between font-serif font-semibold text-lg text-botanika-800 pt-3 border-t border-botanika-200">
                                <span>Total</span>
                                <span>$${(total + 3500).toLocaleString()}</span>
                            </div>
                        </div>

                        <button onclick="navigateTo('checkout')" class="w-full bg-botanika-600 hover:bg-botanika-700 text-white rounded-xl py-3.5 text-sm font-semibold transition text-center block shadow-sm">
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
        showToast('Código inválido (usa BOTANIKA10)');
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
                    <div class="bg-white p-6 sm:p-8 rounded-2xl border border-botanika-200 space-y-4">
                        <h3 class="font-serif text-xl font-medium flex items-center"><i data-lucide="map-pin" class="w-5 h-5 mr-2 text-botanika-600"></i> Datos de Entrega</h3>
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
                    <div class="bg-white p-6 sm:p-8 rounded-2xl border border-botanika-200 space-y-4">
                        <h3 class="font-serif text-xl font-medium flex items-center"><i data-lucide="truck" class="w-5 h-5 mr-2 text-botanika-600"></i> Método de Envío</h3>
                        <div class="space-y-3 pt-2">
                            <label onclick="setShippingMethod('express')" class="flex items-center justify-between p-4 rounded-xl border-2 ${selectedShippingMethod === 'express' ? 'border-botanika-600 bg-botanika-50' : 'border-botanika-300 bg-white hover:border-botanika-600'} cursor-pointer transition">
                                <div class="flex items-center space-x-3">
                                    <input type="radio" name="shipping" ${selectedShippingMethod === 'express' ? 'checked' : ''} class="text-botanika-600">
                                    <div>
                                        <p class="font-medium text-sm">Envío Protegido Especial Botanika (Climatizado)</p>
                                        <p class="text-xs text-botanika-700">Entrega en 48hs hábiles con empaque antiestrés</p>
                                    </div>
                                </div>
                                <span class="font-serif font-semibold">$3,500</span>
                            </label>
                            <label onclick="setShippingMethod('free')" class="flex items-center justify-between p-4 rounded-xl border-2 ${selectedShippingMethod === 'free' ? 'border-botanika-600 bg-botanika-50' : 'border-botanika-300 bg-white hover:border-botanika-600'} cursor-pointer transition">
                                <div class="flex items-center space-x-3">
                                    <input type="radio" name="shipping" ${selectedShippingMethod === 'free' ? 'checked' : ''} class="text-botanika-600">
                                    <div>
                                        <p class="font-medium text-sm">Retiro por Studio Palermo</p>
                                        <p class="text-xs text-botanika-700">Listo en 24hs hábiles en showroom</p>
                                    </div>
                                </div>
                                <span class="font-serif font-semibold text-botanika-600">Gratis</span>
                            </label>
                        </div>
                    </div>

                    <!-- Medio de Pago -->
                    <div class="bg-white p-6 sm:p-8 rounded-2xl border border-botanika-200 space-y-4">
                        <h3 class="font-serif text-xl font-medium flex items-center"><i data-lucide="credit-card" class="w-5 h-5 mr-2 text-botanika-600"></i> Medio de Pago</h3>
                        
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

                <!-- Resumen y Confirmación -->
                <div class="bg-white p-6 rounded-2xl border border-botanika-200 h-fit space-y-6">
                    <h3 class="font-serif text-xl font-medium border-b border-botanika-200 pb-4">Resumen de Compra</h3>
                    <div class="space-y-3 text-sm">
                        <div class="flex justify-between text-botanika-700">
                            <span>Subtotal (${cart.reduce((a, b) => a + b.qty, 0)} ítems)</span>
                            <span>$${subtotal.toLocaleString()}</span>
                        </div>
                        ${discountApplied ? `
                            <div class="flex justify-between text-botanika-terracota">
                                <span>Descuento aplicado (10%)</span>
                                <span>-$${discount.toLocaleString()}</span>
                            </div>
                        ` : ''}
                        <div class="flex justify-between text-botanika-700">
                            <span>${selectedShippingMethod === 'free' ? 'Retiro en Studio' : 'Envío Protegido'}</span>
                            <span>${shippingCost === 0 ? 'Gratis' : '$' + shippingCost.toLocaleString()}</span>
                        </div>
                        <div class="flex justify-between font-serif font-semibold text-lg text-botanika-800 pt-3 border-t border-botanika-200">
                            <span>Total a Pagar</span>
                            <span>$${total.toLocaleString()}</span>
                        </div>
                    </div>

                    <button id="checkout-submit-btn" onclick="handleMercadoPagoPayment()" class="w-full bg-[#009EE3] hover:bg-[#0082ba] text-white rounded-xl py-4 text-sm font-semibold transition text-center shadow-md flex items-center justify-center space-x-2">
                        <i data-lucide="wallet" class="w-5 h-5"></i>
                        <span>Pagar con Mercado Pago $${total.toLocaleString()}</span>
                    </button>
                    
                    <p class="text-[11px] text-center text-botanika-700">
                        🔒 Transacción segura conectada a Supabase Postgres & Checkout Pro.
                    </p>
                </div>
            </div>
        </div>
    `;
}

function renderSuccess() {
    const paymentVoucher = lastPaymentId ? `#MP-${lastPaymentId}` : '#MP-TEST-98201';
    const orderVoucher = lastOrderId ? `#ORD-${lastOrderId.substring(0, 8)}` : '#BOT-84920';

    return `
        <div class="max-w-3xl mx-auto px-4 py-20 text-center space-y-6">
            <div class="w-20 h-20 bg-botanika-600 text-white rounded-full flex items-center justify-center mx-auto shadow-xl">
                <i data-lucide="check" class="w-10 h-10"></i>
            </div>
            <span class="text-botanika-terracota font-semibold text-xs tracking-widest uppercase">¡Compra exitosa!</span>
            <h1 class="font-serif text-4xl text-botanika-800">Gracias por tu pedido en Botanika</h1>
            
            <p class="text-botanika-700 text-sm max-w-lg mx-auto leading-relaxed">
                Hemos recibido y acreditado tu pago correctamente a través de Mercado Pago. La orden ha sido registrada en tu cuenta de Supabase.
            </p>

            <!-- Card de comprobantes -->
            <div class="bg-white p-6 rounded-2xl border border-botanika-200 max-w-md mx-auto text-left space-y-3 text-sm shadow-sm">
                <div class="flex justify-between pb-2 border-b border-botanika-100">
                    <span class="text-botanika-700">Comprobante Mercado Pago:</span>
                    <strong class="text-botanika-800">${paymentVoucher}</strong>
                </div>
                <div class="flex justify-between pb-2 border-b border-botanika-100">
                    <span class="text-botanika-700">Identificador de Orden (Supabase):</span>
                    <strong class="text-botanika-600">${orderVoucher}</strong>
                </div>
                <div class="flex justify-between">
                    <span class="text-botanika-700">Estado de acreditación:</span>
                    <span class="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-bold">Aprobado</span>
                </div>
            </div>

            <div class="pt-4 flex justify-center space-x-4">
                <button onclick="navigateTo('profile')" class="bg-white border border-botanika-600 text-botanika-800 px-6 py-3.5 rounded-xl font-medium text-sm transition shadow-sm hover:bg-botanika-100">
                    Ver mis pedidos en Perfil
                </button>
                <button onclick="navigateTo('home')" class="bg-botanika-600 hover:bg-botanika-700 text-white px-6 py-3.5 rounded-xl font-medium text-sm transition shadow-sm">
                    Seguir Comprando
                </button>
            </div>
        </div>
    `;
}

function renderProfile() {
    if (!currentUser) {
        return `
            <div class="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
                <div class="w-16 h-16 bg-botanika-200 text-botanika-700 rounded-full flex items-center justify-center mx-auto">
                    <i data-lucide="lock" class="w-8 h-8"></i>
                </div>
                <h1 class="font-serif text-3xl font-medium">Mi Cuenta & Órdenes</h1>
                <p class="text-botanika-700 text-sm leading-relaxed">
                    Inicia sesión o regístrate para acceder al historial de compras registradas en Supabase, direcciones de entrega y lista de deseos.
                </p>
                <div class="pt-2">
                    <button onclick="openAuthModal('login')" class="bg-botanika-600 hover:bg-botanika-700 text-white px-8 py-3.5 rounded-xl font-semibold text-sm transition shadow-sm">
                        Iniciar Sesión con Supabase
                    </button>
                </div>
            </div>
        `;
    }

    const userName = currentUser.user_metadata?.full_name || currentUser.email.split('@')[0];

    return `
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div class="mb-8 flex flex-col sm:flex-row justify-between sm:items-center space-y-3 sm:space-y-0">
                <div>
                    <h1 class="font-serif text-3xl font-medium">Mi Cuenta</h1>
                    <p class="text-botanika-700 text-sm mt-1">Sesión activa como <strong>${userName}</strong> (${currentUser.email})</p>
                </div>
                <button onclick="handleSignOut()" class="text-xs text-botanika-terracota underline font-medium w-fit">Cerrar Sesión</button>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div class="lg:col-span-2 space-y-6">
                    <!-- Contenedor dinámico de órdenes en Supabase -->
                    <div class="bg-white p-6 rounded-2xl border border-botanika-200 space-y-4">
                        <div class="flex justify-between items-center">
                            <h3 class="font-serif text-xl font-medium flex items-center">
                                <i data-lucide="package" class="w-5 h-5 mr-2 text-botanika-600"></i> Historial de Órdenes en Supabase
                            </h3>
                            <button onclick="loadUserOrdersAsync()" class="text-xs text-botanika-600 font-semibold underline flex items-center space-x-1">
                                <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i>
                                <span>Actualizar</span>
                            </button>
                        </div>

                        <div id="user-orders-list" class="space-y-3 pt-2">
                            <div class="text-center py-6 text-sm text-botanika-700">
                                <p>Cargando tus órdenes desde la base de datos...</p>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white p-6 rounded-2xl border border-botanika-200 space-y-4">
                        <h3 class="font-serif text-xl font-medium flex items-center"><i data-lucide="map-pin" class="w-5 h-5 mr-2 text-botanika-600"></i> Direcciones Guardadas</h3>
                        <div class="border border-botanika-200 rounded-xl p-4 flex justify-between items-center">
                            <div>
                                <p class="font-medium text-sm">Dirección Principal</p>
                                <p class="text-xs text-botanika-700 mt-0.5">Av. Libertador 1450, Piso 4B, Buenos Aires</p>
                            </div>
                            <button onclick="showToast('Dirección editada')" class="text-xs text-botanika-600 font-medium underline">Editar</button>
                        </div>
                    </div>
                </div>

                <div class="bg-white p-6 rounded-2xl border border-botanika-200 space-y-4 h-fit">
                    <h3 class="font-serif text-xl font-medium flex items-center"><i data-lucide="heart" class="w-5 h-5 mr-2 text-botanika-terracota"></i> Mis Favoritos</h3>
                    <div class="space-y-3 pt-2">
                        <div class="flex items-center space-x-3 border-b border-botanika-100 pb-3">
                            <img src="${products[0].image}" class="w-14 h-14 rounded-lg object-cover">
                            <div class="flex-grow">
                                <p class="font-medium text-sm">${products[0].name}</p>
                                <p class="text-xs font-semibold text-botanika-terracota">$${products[0].price.toLocaleString()}</p>
                            </div>
                            <button onclick="handleDirectBuy(${products[0].id})" class="p-2 bg-botanika-600 text-white rounded-lg hover:bg-botanika-700 transition" title="Comprar">
                                <i data-lucide="shopping-bag" class="w-3.5 h-3.5"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Consulta asíncrona de órdenes de compra del usuario autenticado en Supabase.
 */
async function loadUserOrdersAsync() {
    const container = document.getElementById('user-orders-list');
    if (!container || !currentUser) return;

    try {
        const orders = await window.botanikaSupabase.getUserOrders(currentUser.id);
        
        if (!orders || orders.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8 text-botanika-700 space-y-2">
                    <i data-lucide="inbox" class="w-8 h-8 mx-auto text-botanika-300"></i>
                    <p class="text-sm">Aún no registras órdenes de compra en esta cuenta.</p>
                    <button onclick="goToLandingSection('productos')" class="text-xs text-botanika-600 font-semibold underline">Ver productos destacados</button>
                </div>
            `;
            if (typeof lucide !== 'undefined') lucide.createIcons();
            return;
        }

        container.innerHTML = orders.map(ord => {
            const dateStr = ord.created_at ? new Date(ord.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Reciente';
            const statusClass = 
                ord.status === 'aprobado' ? 'bg-emerald-100 text-emerald-800' :
                ord.status === 'rechazado' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-900';
            const statusLabel = 
                ord.status === 'aprobado' ? 'Aprobado' :
                ord.status === 'rechazado' ? 'Rechazado' : 'Pendiente';
            
            const itemsCount = Array.isArray(ord.items) ? ord.items.reduce((acc, i) => acc + (i.qty || 1), 0) : 1;

            return `
                <div class="border border-botanika-200 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
                    <div>
                        <div class="flex items-center space-x-2">
                            <p class="font-medium text-sm text-botanika-800">Orden #${ord.id.toString().substring(0, 8)}</p>
                            <span class="text-xs ${statusClass} font-semibold px-2.5 py-0.5 rounded-full">${statusLabel}</span>
                        </div>
                        <p class="text-xs text-botanika-700 mt-1">${itemsCount} producto(s) • ${dateStr} • Total: <strong>$${Number(ord.total_amount).toLocaleString()}</strong></p>
                        ${ord.payment_id ? `<p class="text-[11px] text-gray-500 mt-0.5">Comprobante MP: #${ord.payment_id}</p>` : ''}
                    </div>
                    <div class="flex items-center space-x-2">
                        <button onclick="showToast('Detalle de orden abierta')" class="text-xs text-botanika-600 font-medium underline">Ver detalle</button>
                    </div>
                </div>
            `;
        }).join('');

        if (typeof lucide !== 'undefined') lucide.createIcons();
    } catch (err) {
        console.error('Error cargando órdenes:', err);
        container.innerHTML = `<p class="text-xs text-red-600 py-3">No se pudieron cargar las órdenes de Supabase: ${err.message}</p>`;
    }
}

// =============================================================================
// INICIALIZACIÓN DE LA APLICACIÓN
// =============================================================================

// Listener para cerrar modal de Auth con tecla ESC o clic en backdrop
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAuthModal();
});

document.addEventListener('click', (e) => {
    const modal = document.getElementById('auth-modal');
    if (e.target === modal) closeAuthModal();
});

// Listener de cambios de autenticación en Supabase
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