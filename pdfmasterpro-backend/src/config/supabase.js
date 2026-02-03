const { createClient } = require('@supabase/supabase-js');

let supabase = null;

const getSupabase = () => {
    if (supabase) return supabase;

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY in environment variables');
        console.error('SUPABASE_URL:', supabaseUrl ? 'Set' : 'Not set');
        console.error('SUPABASE_ANON_KEY:', supabaseKey ? 'Set' : 'Not set');
        throw new Error('Missing Supabase URL or Anon Key in environment variables');
    }

    supabase = createClient(supabaseUrl, supabaseKey);
    return supabase;
};

// Initialize immediately if env vars are available
try {
    if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
        supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
    }
} catch (error) {
    console.error('Failed to initialize Supabase client:', error.message);
}

module.exports = { getSupabase };
