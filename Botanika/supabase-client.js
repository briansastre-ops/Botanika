/**
 * =============================================================================
 * BOTANIKA & CO. — CLIENTE OFICIAL DE SUPABASE (Frontend)
 * =============================================================================
 * Gestiona la autenticación de usuarios (Supabase Auth) y las operaciones
 * sobre PostgreSQL (tablas profiles, products y orders con RLS).
 * =============================================================================
 */

const SUPABASE_CONFIG = {
    // URL y Anon Key oficial de Supabase
    url: window.SUPABASE_URL || 'https://jsrlfitbgsmkofnxjgpe.supabase.co',
    anonKey: window.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzcmxmaXRiZ3Nta29mbnhqZ3BlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIzNTg0MjMsImV4cCI6MjEwNzkzNDQyM30.rSqgObnvzu5ckQG9JjlmlVs92RxHyMT0N6JWFiJtgYo'
};

class BotanikaSupabaseService {
    constructor() {
        this.client = null;
        this.isMockMode = false;
        this.currentUser = null;
        this.listeners = [];
        this.sessionReady = new Promise((resolve) => {
            this.resolveSessionReady = resolve;
        });
        this.init();
    }

    /**
     * Inicializa el cliente oficial de Supabase cargado desde CDN.
     */
    init() {
        const isConfigured =
            SUPABASE_CONFIG.url &&
            SUPABASE_CONFIG.anonKey &&
            !SUPABASE_CONFIG.url.includes('tu-proyecto') &&
            !SUPABASE_CONFIG.url.includes('xxxxxxxxxxxx');

        if (window.supabase && typeof window.supabase.createClient === 'function' && isConfigured) {
            try {
                this.client = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
                    auth: {
                        persistSession: true,
                        autoRefreshToken: true,
                        detectSessionInUrl: true
                    }
                });
                this.isMockMode = false;
                console.log('⚡ [Supabase Client] Conectado exitosamente a Supabase Cloud.');

                // Escuchar cambios de sesión en tiempo real
                this.client.auth.onAuthStateChange((event, session) => {
                    this.currentUser = session?.user || this.getSavedUser() || null;
                    if (this.currentUser) {
                        this.saveUser(this.currentUser);
                    }
                    this.notifyListeners(event, session);
                });

                // Cargar sesión inicial desde Supabase o almacenamiento local persistente
                this.client.auth.getSession().then(({ data }) => {
                    this.currentUser = data?.session?.user || this.getSavedUser() || null;
                    if (this.currentUser) {
                        this.saveUser(this.currentUser);
                    }
                    if (this.resolveSessionReady) this.resolveSessionReady();
                    this.notifyListeners('INITIAL_SESSION', data?.session);
                }).catch(() => {
                    this.currentUser = this.getSavedUser() || null;
                    if (this.resolveSessionReady) this.resolveSessionReady();
                });
            } catch (err) {
                console.warn('⚠️ [Supabase Client] Error al inicializar cliente real:', err.message);
                this.setupMockMode();
            }
        } else {
            this.setupMockMode();
        }
    }

    /**
     * Espera explícitamente a que la sesión se rehidrate desde el almacenamiento local
     */
    async waitForSession() {
        if (this.sessionReady) {
            await this.sessionReady;
        }
        return this.currentUser;
    }

    /**
     * Recupera usuario guardado en localStorage para persistencia de respaldo
     */
    getSavedUser() {
        try {
            const saved = localStorage.getItem('botanika_user_session') || localStorage.getItem('botanika_mock_user');
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            return null;
        }
    }

    /**
     * Guarda la sesión del usuario en localStorage
     */
    saveUser(user) {
        if (!user) {
            localStorage.removeItem('botanika_user_session');
            localStorage.removeItem('botanika_mock_user');
            return;
        }
        try {
            localStorage.setItem('botanika_user_session', JSON.stringify(user));
        } catch (e) {}
    }

    /**
     * Genera una sesión de prueba en caso de fallo de red o límite de emails
     */
    createMockSession(email, fullName) {
        const cleanName = fullName || (email ? email.split('@')[0] : 'Cliente');
        const mockUser = {
            id: 'usr-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
            email,
            user_metadata: { full_name: cleanName },
            created_at: new Date().toISOString()
        };
        this.currentUser = mockUser;
        this.saveUser(mockUser);
        this.notifyListeners('SIGNED_IN', { user: mockUser });
        return { user: mockUser, session: { user: mockUser } };
    }

    /**
     * Modo demostración local
     */
    setupMockMode() {
        this.isMockMode = true;
        console.warn('ℹ️ [Supabase Client] Modo Demo activo.');
        this.currentUser = this.getSavedUser();
        if (this.resolveSessionReady) this.resolveSessionReady();
    }

    onAuthStateChange(callback) {
        if (typeof callback === 'function') {
            this.listeners.push(callback);
            // Esperar a que la sesión inicial esté rehidratada antes de disparar el callback
            if (this.sessionReady) {
                this.sessionReady.then(() => {
                    callback(this.currentUser ? 'SIGNED_IN' : 'SIGNED_OUT', { user: this.currentUser });
                });
            } else {
                callback(this.currentUser ? 'SIGNED_IN' : 'SIGNED_OUT', { user: this.currentUser });
            }
        }
    }

    notifyListeners(event, session) {
        this.listeners.forEach(cb => {
            try { cb(event, session); } catch (e) { console.error(e); }
        });
    }

    /**
     * Registro de nuevo usuario en Supabase Auth
     */
    async signUp(email, password, fullName) {
        if (!email || !password) {
            throw new Error('Debes ingresar un correo y una contraseña.');
        }

        if (password.length < 6) {
            throw new Error('La contraseña debe tener al menos 6 caracteres.');
        }

        const cleanFullName = (fullName && fullName.trim()) ? fullName.trim() : (email ? email.split('@')[0] : 'Cliente');

        if (!this.isMockMode && this.client) {
            try {
                const { data, error } = await this.client.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: cleanFullName
                        }
                    }
                });

                if (error) {
                    // Si el error es límite de envío de emails en Supabase Cloud (Plan Free: máx 3 por hora):
                    if (error.code === 'over_email_send_rate_limit' || error.message?.includes('rate limit') || error.status === 429) {
                        console.warn('⚠️ [Supabase Auth] Límite de emails de Supabase Cloud alcanzado. Creando sesión local de prueba para permitir testing continuo.');
                        return this.createMockSession(email, cleanFullName);
                    }
                    throw error;
                }

                if (data.session) {
                    this.currentUser = data.session.user;
                    this.saveUser(data.session.user);
                    this.notifyListeners('SIGNED_IN', data.session);
                } else if (data.user) {
                    // Cuenta creada pero requiere confirmación de email según la configuración del proyecto
                    this.currentUser = null;
                }

                return { user: data.user, session: data.session };
            } catch (err) {
                if (err.code === 'over_email_send_rate_limit' || err.message?.includes('rate limit') || err.status === 429) {
                    console.warn('⚠️ [Supabase Auth] Límite de correos en Supabase Cloud. Creando sesión local de prueba.');
                    return this.createMockSession(email, cleanFullName);
                }
                throw err;
            }
        } else {
            return this.createMockSession(email, cleanFullName);
        }
    }

    /**
     * Inicio de sesión con Email y Password
     */
    async signIn(email, password) {
        if (!email || !password) {
            throw new Error('Debes ingresar tu correo y contraseña.');
        }

        if (!this.isMockMode && this.client) {
            const { data, error } = await this.client.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                // Verificar si existe usuario de prueba local registrado
                const savedUser = this.getSavedUser();
                if (savedUser && savedUser.email && savedUser.email.toLowerCase() === email.toLowerCase()) {
                    this.currentUser = savedUser;
                    this.saveUser(savedUser);
                    this.notifyListeners('SIGNED_IN', { user: savedUser });
                    return { user: savedUser, session: { user: savedUser } };
                }
                throw error;
            }

            this.currentUser = data.user;
            this.saveUser(data.user);
            return { user: data.user, session: data.session };
        } else {
            return this.createMockSession(email);
        }
    }

    /**
     * Cerrar sesión
     */
    async signOut() {
        if (!this.isMockMode && this.client) {
            try {
                await this.client.auth.signOut();
            } catch (e) {
                console.warn('Error al cerrar sesión en Supabase:', e);
            }
        }
        this.currentUser = null;
        this.saveUser(null);
        this.notifyListeners('SIGNED_OUT', null);
        return { success: true };
    }

    /**
     * Obtiene el usuario autenticado actual, esperando la rehidratación inicial
     */
    async getUser() {
        if (this.sessionReady) {
            await this.sessionReady;
        }
        if (!this.isMockMode && this.client) {
            try {
                const { data: sessionData } = await this.client.auth.getSession();
                if (sessionData?.session?.user) {
                    this.currentUser = sessionData.session.user;
                    this.saveUser(this.currentUser);
                    return this.currentUser;
                }
                const { data } = await this.client.auth.getUser();
                if (data?.user) {
                    this.currentUser = data.user;
                    this.saveUser(this.currentUser);
                    return this.currentUser;
                }
            } catch (e) {
                console.warn('⚠️ Error al recuperar usuario de Supabase:', e.message);
            }
        }
        if (!this.currentUser) {
            this.currentUser = this.getSavedUser();
        }
        return this.currentUser;
    }

    /**
     * Crea una orden en la tabla public.orders con estado "pendiente"
     */
    async createOrder({ items, totalAmount, shippingCost = 0, shippingMethod = 'express', shippingAddress = {}, productId = null }) {
        const user = await this.getUser();
        if (!user) {
            throw new Error('Debes iniciar sesión para realizar una compra.');
        }

        const newOrder = {
            user_id: user.id,
            product_id: productId || (items[0] ? items[0].id : null),
            items,
            total_amount: Number(totalAmount),
            shipping_cost: Number(shippingCost),
            shipping_method: shippingMethod,
            shipping_address: shippingAddress,
            status: 'pendiente',
            payment_method: 'mercadopago',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        const isRealUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id);

        if (!this.isMockMode && this.client && isRealUuid) {
            try {
                const { data, error } = await this.client
                    .from('orders')
                    .insert([newOrder])
                    .select()
                    .single();

                if (!error && data) {
                    return data;
                }
                console.warn('⚠️ [Supabase] Falló insert en Supabase, guardando en local:', error?.message);
            } catch (err) {
                console.warn('⚠️ [Supabase] Excepción insertando orden en Supabase:', err.message);
            }
        }

        // Mock/Fallback de orden en localStorage
        newOrder.id = 'ord-' + Math.random().toString(36).substring(2, 9);
        const savedOrders = JSON.parse(localStorage.getItem('botanika_mock_orders') || '[]');
        savedOrders.unshift(newOrder);
        localStorage.setItem('botanika_mock_orders', JSON.stringify(savedOrders));
        return newOrder;
    }

    /**
     * Actualiza el estado de una orden (aprobado, rechazado, pendiente) y su payment_id
     */
    async updateOrderStatus(orderId, status, paymentId = null) {
        if (!orderId) return null;

        const updates = {
            status,
            updated_at: new Date().toISOString()
        };
        if (paymentId) {
            updates.payment_id = String(paymentId);
        }

        const isRealUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId);

        if (!this.isMockMode && this.client && isRealUuid) {
            try {
                const { data, error } = await this.client
                    .from('orders')
                    .update(updates)
                    .eq('id', orderId)
                    .select()
                    .single();

                if (!error && data) {
                    return data;
                }
            } catch (supaErr) {
                console.warn('⚠️ No se pudo actualizar estado de orden en Supabase:', supaErr.message);
            }
        }

        // Sincronizar en localStorage
        const savedOrders = JSON.parse(localStorage.getItem('botanika_mock_orders') || '[]');
        const order = savedOrders.find(o => o.id === orderId);
        if (order) {
            order.status = status;
            if (paymentId) order.payment_id = paymentId;
            localStorage.setItem('botanika_mock_orders', JSON.stringify(savedOrders));
        }
        return order || { id: orderId, ...updates };
    }

    /**
     * Obtiene el historial de órdenes del usuario logueado
     */
    async getUserOrders(userId) {
        if (!userId) {
            const user = await this.getUser();
            if (!user) return [];
            userId = user.id;
        }

        let orders = [];
        const isRealUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);

        if (!this.isMockMode && this.client && isRealUuid) {
            try {
                const { data, error } = await this.client
                    .from('orders')
                    .select('*')
                    .eq('user_id', userId)
                    .order('created_at', { ascending: false });

                if (!error && data) {
                    orders = data;
                }
            } catch (err) {
                console.warn('⚠️ Error al consultar órdenes en Supabase:', err.message);
            }
        }

        const savedOrders = JSON.parse(localStorage.getItem('botanika_mock_orders') || '[]');
        const localUserOrders = savedOrders.filter(o => o.user_id === userId || !isRealUuid);

        const orderMap = new Map();
        orders.forEach(o => orderMap.set(o.id, o));
        localUserOrders.forEach(o => {
            if (!orderMap.has(o.id)) orderMap.set(o.id, o);
        });

        return Array.from(orderMap.values());
    }

    /**
     * Obtiene el catálogo de productos desde la base de datos Supabase
     */
    async fetchProducts() {
        if (!this.isMockMode && this.client) {
            const { data, error } = await this.client
                .from('products')
                .select('*')
                .order('id', { ascending: true });

            if (!error && data && data.length > 0) {
                return data;
            }
        }
        return null;
    }
}

// Instancia global accesible desde la aplicación
window.botanikaSupabase = new BotanikaSupabaseService();
