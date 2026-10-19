-- =============================================================================
-- 🌿 BOTANIKA & CO. — ESQUEMA DE BASE DE DATOS Y POLÍTICAS RLS EN SUPABASE
-- =============================================================================
-- Copia y pega este script completo en el SQL Editor de tu proyecto de Supabase.
-- Dashboard: https://supabase.com/dashboard/project/_/sql
-- =============================================================================

-- 1. EXTENSIONES REQUERIDAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- 2. TABLA: profiles (Perfiles vinculados a auth.users)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS en profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles:
-- Cada usuario solo puede consultar su propio perfil
DROP POLICY IF EXISTS "Los usuarios pueden ver su propio perfil" ON public.profiles;
CREATE POLICY "Los usuarios pueden ver su propio perfil"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

-- Cada usuario solo puede actualizar su propio perfil
DROP POLICY IF EXISTS "Los usuarios pueden editar su propio perfil" ON public.profiles;
CREATE POLICY "Los usuarios pueden editar su propio perfil"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Trigger automático para crear perfil al registrar usuario en Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        new.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- 3. TABLA: products (Catálogo de plantas, macetas y kits)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.products (
    id BIGINT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price NUMERIC NOT NULL,
    image TEXT NOT NULL,
    light TEXT DEFAULT 'Indirecta',
    size TEXT DEFAULT 'Mediana',
    pot TEXT DEFAULT 'Terracota',
    badge TEXT DEFAULT '',
    description TEXT,
    stock INTEGER DEFAULT 25,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS en products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Lectura pública para cualquier usuario (anónimo o autenticado)
DROP POLICY IF EXISTS "Lectura pública de productos" ON public.products;
CREATE POLICY "Lectura pública de productos"
    ON public.products FOR SELECT
    USING (true);

-- Semillas iniciales (Seeds) del catálogo oficial de Botanika
INSERT INTO public.products (id, name, category, price, image, light, size, pot, badge, description)
VALUES 
    (1, 'Monstera Deliciosa', 'Plantas', 34000, 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&q=80&w=600', 'Indirecta', 'Mediana', 'Terracota', 'Más Vendido', 'La reina del diseño interior. Hojas perforadas imponentes que llenan cualquier rincón de frescura y vitalidad.'),
    (2, 'Ficus Lyrata', 'Plantas', 48000, 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&q=80&w=600', 'Mucha luz', 'Grande', 'Cerámica Beige', 'Nuevo', 'Porte escultórico con hojas en forma de violín. Ideal para living y espacios con excelente iluminación natural.'),
    (3, 'Maceta Minimal Terracota 20cm', 'Macetas', 12500, 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&q=80&w=600', 'N/A', '20cm', 'Terracota', '', 'Hecha a mano en barro cocido de alta porosidad, garantizando aireación óptima de las raíces.'),
    (4, 'Sustrato Premium Monsteras 5L', 'Sustratos', 8900, 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=600', 'N/A', '5L', 'Bolsa Eco', 'Esencial', 'Mezcla aireada con corteza de pino, perlita, fibra de coco y humus de lombriz.'),
    (5, 'Kit Principiante: Sansevieria + Maceta', 'Kits', 29000, 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&q=80&w=600', 'Poca luz', 'Mediana', 'Cerámica Blanca', 'Kit', 'La combinación indestructible para arrancar tu jungla urbana. Tolera baja luz y requiere riego mínimo.'),
    (6, 'Pilea Peperomioides', 'Plantas', 21000, 'https://images.unsplash.com/photo-1637967888100-d83beabf90a1?auto=format&fit=crop&q=80&w=600', 'Indirecta', 'Pequeña', 'Cerámica Gris', 'Nuevo', 'La planta del dinero china. Hojas circulares perfectas, fácil de propagar y de rápido crecimiento.')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    image = EXCLUDED.image,
    light = EXCLUDED.light,
    size = EXCLUDED.size,
    pot = EXCLUDED.pot,
    badge = EXCLUDED.badge,
    description = EXCLUDED.description;

-- =============================================================================
-- 4. TABLA: orders (Órdenes de compra integradas con Mercado Pago)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    product_id BIGINT REFERENCES public.products(id),
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_amount NUMERIC NOT NULL,
    shipping_cost NUMERIC DEFAULT 0,
    shipping_method TEXT DEFAULT 'express',
    shipping_address JSONB DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'pendiente', -- 'pendiente', 'aprobado', 'rechazado', 'cancelado'
    payment_method TEXT DEFAULT 'mercadopago',
    payment_id TEXT,
    preference_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para optimizar consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_id ON public.orders(payment_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- Habilitar RLS en orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para orders:
-- 1. Cada usuario solo puede ver sus propias órdenes
DROP POLICY IF EXISTS "Los usuarios solo pueden consultar sus propias órdenes" ON public.orders;
CREATE POLICY "Los usuarios solo pueden consultar sus propias órdenes"
    ON public.orders FOR SELECT
    USING (auth.uid() = user_id);

-- 2. Cada usuario autenticado solo puede crear órdenes asociadas a su propio user_id
DROP POLICY IF EXISTS "Los usuarios pueden insertar órdenes para sí mismos" ON public.orders;
CREATE POLICY "Los usuarios pueden insertar órdenes para sí mismos"
    ON public.orders FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 3. Cada usuario puede actualizar su propia orden (al retornar del pago con status o payment_id)
DROP POLICY IF EXISTS "Los usuarios pueden actualizar su propia orden" ON public.orders;
CREATE POLICY "Los usuarios pueden actualizar su propia orden"
    ON public.orders FOR UPDATE
    USING (auth.uid() = user_id);

-- Fin del script SQL
