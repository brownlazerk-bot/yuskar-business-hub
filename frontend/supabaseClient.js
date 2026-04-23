// YusKar Business Hub - Supabase Client Configuration
// This file handles the connection to Supabase backend

// Import Supabase client library
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Get environment variables
// These will be set in Netlify environment variables
let supabaseUrl, supabaseAnonKey;

try {
    supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
} catch (error) {
    console.warn('Environment variables not available, using fallbacks');
}

// Fallback values for testing
supabaseUrl = supabaseUrl || 'https://your-project-ref.supabase.co';
supabaseAnonKey = supabaseAnonKey || 'your-supabase-anon-key';

// Create Supabase client instance
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database table names for easy reference
export const TABLES = {
    USERS: 'users',
    BUSINESS_CATEGORIES: 'business_categories',
    BUSINESSES: 'businesses',
    BUSINESS_IMAGES: 'business_images',
    REVIEWS: 'reviews',
    SUBSCRIPTIONS: 'subscriptions',
    NOTIFICATIONS: 'notifications',
    CONTACT_MESSAGES: 'contact_messages',
    SYSTEM_SETTINGS: 'system_settings'
};

// Storage bucket names
export const STORAGE = {
    BUSINESS_IMAGES: 'business-images',
    USER_AVATARS: 'user-avatars',
    BUSINESS_LOGOS: 'business-logos'
};

// Helper function to check if Supabase is configured
export const isSupabaseConfigured = () => {
    return supabaseUrl && supabaseAnonKey && 
           supabaseUrl !== 'https://your-project-ref.supabase.co' && 
           supabaseAnonKey !== 'your-anon-key';
};

// Initialize Supabase connection
console.log('Supabase Client initialized');
console.log('URL:', supabaseUrl);
console.log('Configured:', isSupabaseConfigured());

// Export a test function to verify connection
export const testConnection = async () => {
    try {
        const { data, error } = await supabase
            .from(TABLES.SYSTEM_SETTINGS)
            .select('key_name, value')
            .limit(1);
        
        if (error) {
            console.error('Supabase connection test failed:', error);
            return false;
        }
        
        console.log('Supabase connection test successful');
        return true;
    } catch (err) {
        console.error('Supabase connection test error:', err);
        return false;
    }
};

// Auto-test connection on load
testConnection();
