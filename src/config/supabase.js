require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
	throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Regular client for normal operations
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Service role client for admin operations (bypasses RLS)
const supabaseAdmin = supabaseServiceRoleKey 
	? createClient(supabaseUrl, supabaseServiceRoleKey)
	: supabase; // Fallback to regular client if service key not provided

module.exports = { supabase, supabaseAdmin }; 