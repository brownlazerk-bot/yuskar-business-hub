// YusKar Business Hub - Backend Manager
// This file manages switching between Supabase and Firebase backends

import { supabase, isSupabaseConfigured } from './supabaseClient.js';

// Backend types
export const BACKEND_TYPES = {
    SUPABASE: 'supabase',
    FIREBASE: 'firebase'
};

// Current backend selection
let currentBackend = BACKEND_TYPES.SUPABASE; // Default to Supabase

// Backend Manager Class
class BackendManager {
    constructor() {
        this.backend = this.detectBackend();
        this.init();
    }

    // Auto-detect which backend to use
    detectBackend() {
        const supabaseReady = isSupabaseConfigured();
        
        // Check environment variable for backend preference
        let preferredBackend;
        try {
            preferredBackend = import.meta.env.VITE_PREFERRED_BACKEND;
        } catch (error) {
            console.warn('Backend preference not available, using default');
            preferredBackend = 'supabase';
        }
        
        if (preferredBackend) {
            if (preferredBackend === BACKEND_TYPES.SUPABASE && supabaseReady) {
                return BACKEND_TYPES.SUPABASE;
            }
        }
        
        // Auto-detect based on what's configured
        if (supabaseReady) {
            return BACKEND_TYPES.SUPABASE;
        } else {
            console.warn('No backend configured!');
            return BACKEND_TYPES.SUPABASE; // Fallback
        }
    }

    // Initialize backend
    init() {
        currentBackend = this.backend;
        console.log(`Backend initialized: ${currentBackend}`);
        console.log('Supabase configured:', isSupabaseConfigured());
    }

    // Get current backend
    getCurrentBackend() {
        return currentBackend;
    }

    // Get appropriate client based on current backend
    getClient() {
        switch (currentBackend) {
            case BACKEND_TYPES.SUPABASE:
                return {
                    auth: supabase.auth,
                    database: supabase,
                    storage: supabase.storage,
                    type: BACKEND_TYPES.SUPABASE
                };
            default:
                throw new Error('No backend configured');
        }
    }

    // Get collection/table names based on backend
    getTableNames() {
        switch (currentBackend) {
            case BACKEND_TYPES.SUPABASE:
                return {
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
            default:
                throw new Error('No backend configured');
        }
    }

    // Check backend status
    getStatus() {
        return {
            current: currentBackend,
            supabase: {
                configured: isSupabaseConfigured(),
                available: true
            }
        };
    }
}

// Create global backend manager instance
export const backendManager = new BackendManager();

// Export convenience functions
export const getCurrentBackend = () => backendManager.getCurrentBackend();
export const getBackendClient = () => backendManager.getClient();
export const getTableNames = () => backendManager.getTableNames();
export const getBackendStatus = () => backendManager.getStatus();

// Backend detection for development
export const isUsingSupabase = () => getCurrentBackend() === BACKEND_TYPES.SUPABASE;

// Initialize
console.log('Backend Manager loaded');
console.log('Current backend:', getCurrentBackend());
