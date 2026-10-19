/**
 * =============================================================================
 * BOTANIKA & CO. — CLIENTE OFICIAL DE SUPABASE (Frontend)
 * =============================================================================
 * Gestiona la autenticación de usuarios (Supabase Auth) y las operaciones
 * sobre PostgreSQL (tablas profiles, products y orders con RLS).
 * =============================================================================
 */

const SUPABASE_CONFIG = {
    // ⚠️ INGRESA AQUÍ LA URL Y ANON KEY DE TU PROYECTO DE SUPABASE
    // Dashboard: https://supabase.com/dashboard/project/_/settings/api
    url: window.SUPABASE_URL || 'https://jsrlfitbgsmkofnxjgpe.supabase.co',
    anonKey: window.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzcmxmaXRiZ3Nta29mbnhqZ3BlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIzNTg0MjMsImV4cCI6MjEwNzkzNDQyM30.rSqgObnvzu5ckQG9JjlmlVs92RxHyMT0N6JWFiJtgYo'
};

class BotanikaSupabaseService {
    constructor() {
        this.client = null;
        this.isMockMode = false;
        this.currentUser = null;
        this.listeners = [];
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
                    this.currentUser = session?.user || null;
                    this.notifyListeners(event, session);
                });

                // Cargar sesión inicial
                this.client.auth.getSession().then(({ data }) => {
                    this.currentUser = data?.session?.user || null;
                    this.notifyListeners('INITIAL_SESSION', data?.session);
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
     * Modo demostración local en caso de que aún no se hayan pegado las claves de Supabase.
     * Permite probar el flujo de compra y autenticación sin que la UI falle.
     */
    setupMockMode() {
        this.isMockMode = true;
        console.warn('ℹ️ [Supabase Client] Modo Demo activo. Configura SUPABASE_CONFIG en supabase-client.js para conectar con tu base de datos real.');
        const savedUser = localStorage.getItem('botanika_mock_user');
        if (savedUser) {
            try {
                this.currentUser = JSON.parse(savedUser);
            } catch (e) {
                this.currentUser = null;
            }
        }
    }

    onAuthStateChange(callback) {
        if (typeof callback === 'function') {
            this.listeners.push(callback);
            // Ejecutar inmediatamente con el estado actual
            callback(this.currentUser ? 'SIGNED_IN' : 'SIGNED_OUT', { user: this.currentUser });
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

        if (!this.isMockMode && this.client) {
            const { data, error } = await this.client.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName || split_email(email)
                    }
                }
            });

            if (error) throw error;
            this.currentUser = data.user;
            return { user: data.user, session: data.session };
        } else {
            // Mock de registro
            const mockUser = {
                id: 'mock-user-' + Date.now(),
                email,
                user_metadata: { full_name: fullName || email.split('@')[0] },
                created_at: new Date().toISOString()
            };
            this.currentUser = mockUser;
            localStorage.setItem('botanika_mock_user', JSON.stringify(mockUser));
            this.notifyListeners('SIGNED_IN', { user: mockUser });
            return { user: mockUser, session: { user: mockUser } };
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

            if (error) throw error;
            this.currentUser = data.user;
            return { user: data.user, session: data.session };
        } else {
            // Mock de inicio de sesión
            const mockUser = {
                id: 'mock-user-12345',
                email,
                user_metadata: { full_name: email.split('@')[0] },
                created_at: new Date().toISOString()
            };
            this.currentUser = mockUser;
            localStorage.setItem('botanika_mock_user', JSON.stringify(mockUser));
            this.notifyListeners('SIGNED_IN', { user: mockUser });
            return { user: mockUser, session: { user: mockUser } };
        }
    }

    /**
     * Cerrar sesión
     */
    async signOut() {
        if (!this.isMockMode && this.client) {
            await this.client.auth.signOut();
        }
        this.currentUser = null;
        localStorage.removeItem('botanika_mock_user');
        this.notifyListeners('SIGNED_OUT', null);
        return { success: true };
    }

    /**
     * Obtiene el usuario autenticado actual
     */
    async getUser() {
        if (!this.isMockMode && this.client) {
            const { data } = await this.client.auth.getUser();
            return data?.user || null;
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

        if (!this.isMockMode && this.client) {
            const { data, error } = await this.client
                .from('orders')
                .insert([newOrder])
                .select()
                .single();

            if (error) {
                console.error('Error insertando orden en Supabase:', error);
                throw error;
            }
            return data;
        } else {
            // Mock de orden en localStorage
            newOrder.id = 'ord-' + Math.random().toString(36).substring(2, 9);
            const savedOrders = JSON.parse(localStorage.getItem('botanika_mock_orders') || '[]');
            savedOrders.unshift(newOrder);
            localStorage.setItem('botanika_mock_orders', JSON.stringify(savedOrders));
            return newOrder;
        }
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

        if (!this.isMockMode && this.client) {
            const { data, error } = await this.client
                .from('orders')
                .update(updates)
                .eq('id', orderId)
                .select()
                .single();

            if (error) {
                console.warn('⚠️ No se pudo actualizar estado de orden en Supabase:', error.message);
                return null;
            }
            return data;
        } else {
            const savedOrders = JSON.parse(localStorage.getItem('botanika_mock_orders') || '[]');
            const order = savedOrders.find(o => o.id === orderId);
            if (order) {
                order.status = status;
                if (paymentId) order.payment_id = paymentId;
                localStorage.setItem('botanika_mock_orders', JSON.stringify(savedOrders));
            }
            return order;
        }
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

        if (!this.isMockMode && this.client) {
            const { data, error } = await this.client
                .from('orders')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) {
                console.warn('⚠️ Error al consultar órdenes en Supabase:', error.message);
                return [];
            }
            return data || [];
        } else {
            const savedOrders = JSON.parse(localStorage.getItem('botanika_mock_orders') || '[]');
            return savedOrders.filter(o => o.user_id === userId);
        }
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
        return null; // El frontend utilizará su catálogo por defecto si falla o está en mock
    }
}

// Instancia global accesible desde la aplicación
window.botanikaSupabase = new BotanikaSupabaseService();
