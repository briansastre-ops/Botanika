const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

let supabase = null;

if (supabaseUrl && supabaseServiceRoleKey && !supabaseUrl.includes('xxxxxxxxxxxx')) {
    try {
        supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
            auth: {
                persistSession: false,
                autoRefreshToken: false
            }
        });
        console.log('⚡ [Supabase Backend] Cliente Supabase inicializado correctamente.');
    } catch (err) {
        console.warn('⚠️ [Supabase Backend] No se pudo inicializar el cliente Supabase:', err.message);
    }
} else {
    console.log('ℹ️ [Supabase Backend] Variables de Supabase no configuradas en .env. Las órdenes se sincronizarán mediante el cliente web.');
}

module.exports = { supabase };
