// YusKar Business Hub - Authentication Logic
// This file handles all authentication operations using Supabase Auth

import { supabase } from './supabaseClient.js';
import { getCurrentBackend, isUsingSupabase } from './backendManager.js';

// ===== AUTHENTICATION CLASS =====
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.authListeners = [];
        this.init();
    }

    // Initialize authentication
    init() {
        // Listen for auth state changes
        supabase.auth.onAuthStateChange((event, session) => {
            console.log('Auth state changed:', event, session);
            
            if (event === 'SIGNED_IN' && session) {
                this.currentUser = session.user;
                this.notifyListeners('signedIn', session.user);
            } else if (event === 'SIGNED_OUT') {
                this.currentUser = null;
                this.notifyListeners('signedOut', null);
            } else if (event === 'TOKEN_REFRESHED') {
                this.currentUser = session.user;
                this.notifyListeners('tokenRefreshed', session.user);
            }
        });
    }

    // ===== SIGN UP =====
    async signUp(email, password, userData = {}) {
        try {
            console.log('Attempting to sign up user:', email);
            
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        first_name: userData.firstName || '',
                        last_name: userData.lastName || '',
                        phone: userData.phone || '',
                        role: userData.role || 'user'
                    }
                }
            });

            if (error) {
                console.error('Sign up error:', error);
                throw new Error(this.getErrorMessage(error));
            }

            console.log('Sign up successful:', data);
            
            // If email confirmation is required
            if (data.user && !data.session) {
                return {
                    success: true,
                    message: 'Please check your email to confirm your account.',
                    requiresConfirmation: true,
                    user: data.user
                };
            }

            // User is signed in immediately
            this.currentUser = data.user;
            this.notifyListeners('signedUp', data.user);
            
            return {
                success: true,
                message: 'Account created successfully!',
                user: data.user,
                session: data.session
            };
            
        } catch (error) {
            console.error('Sign up failed:', error);
            return {
                success: false,
                message: error.message || 'Failed to create account'
            };
        }
    }

    // ===== SIGN IN =====
    async signIn(email, password, rememberMe = false) {
        try {
            console.log('Attempting to sign in user:', email);
            
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) {
                console.error('Sign in error:', error);
                throw new Error(this.getErrorMessage(error));
            }

            console.log('Sign in successful:', data);
            
            this.currentUser = data.user;
            this.notifyListeners('signedIn', data.user);
            
            return {
                success: true,
                message: 'Login successful!',
                user: data.user,
                session: data.session
            };
            
        } catch (error) {
            console.error('Sign in failed:', error);
            return {
                success: false,
                message: error.message || 'Failed to sign in'
            };
        }
    }

    // ===== SIGN OUT =====
    async signOut() {
        try {
            console.log('Signing out user...');
            
            const { error } = await supabase.auth.signOut();
            
            if (error) {
                console.error('Sign out error:', error);
                throw new Error(this.getErrorMessage(error));
            }

            this.currentUser = null;
            this.notifyListeners('signedOut', null);
            
            console.log('Sign out successful');
            
            return {
                success: true,
                message: 'Logged out successfully'
            };
            
        } catch (error) {
            console.error('Sign out failed:', error);
            return {
                success: false,
                message: error.message || 'Failed to sign out'
            };
        }
    }

    // ===== GET CURRENT USER =====
    async getCurrentUser() {
        try {
            // Return cached user if available
            if (this.currentUser) {
                return this.currentUser;
            }
            
            // Get current session from Supabase
            const { data: { session }, error } = await supabase.auth.getSession();
            
            if (error) {
                console.error('Get session error:', error);
                return null;
            }
            
            if (session && session.user) {
                this.currentUser = session.user;
                return session.user;
            }
            
            return null;
            
        } catch (error) {
            console.error('Get current user failed:', error);
            return null;
        }
    }

    // ===== HELPER METHODS =====
    // Add event listener
    onAuthChange(callback) {
        this.authListeners.push(callback);
    }

    // Remove event listener
    offAuthChange(callback) {
        this.authListeners = this.authListeners.filter(listener => listener !== callback);
    }

    // Notify all listeners
    notifyListeners(event, data) {
        this.authListeners.forEach(callback => {
            try {
                callback(event, data);
            } catch (error) {
                console.error('Auth listener error:', error);
            }
        });
    }

    // Get user-friendly error messages
    getErrorMessage(error) {
        const errorMessages = {
            'Invalid login credentials': 'Invalid email or password',
            'User not found': 'No account found with this email',
            'Email not confirmed': 'Please confirm your email before signing in',
            'Password should be at least 6 characters': 'Password must be at least 6 characters',
            'User already registered': 'An account with this email already exists',
            'Invalid email': 'Please enter a valid email address',
            'Weak password': 'Password is too weak. Please choose a stronger password.'
        };
        
        return errorMessages[error.message] || error.message || 'An error occurred';
    }

    // Check if user is authenticated
    isAuthenticated() {
        return this.currentUser !== null;
    }

    // Check if user has specific role
    hasRole(role) {
        return this.currentUser && this.currentUser.user_metadata && 
               this.currentUser.user_metadata.role === role;
    }

    // Get user metadata
    getUserMetadata() {
        return this.currentUser ? this.currentUser.user_metadata : null;
    }

    // Get user ID
    getUserId() {
        return this.currentUser ? this.currentUser.id : null;
    }

    // Get user email
    getUserEmail() {
        return this.currentUser ? this.currentUser.email : null;
    }
}

// ===== CREATE GLOBAL AUTH INSTANCE =====
export const auth = new AuthManager();

// ===== EXPORT FUNCTIONS FOR EASY IMPORT =====
export const signUp = (email, password, userData) => auth.signUp(email, password, userData);
export const signIn = (email, password, rememberMe) => auth.signIn(email, password, rememberMe);
export const signOut = () => auth.signOut();
export const getCurrentUser = () => auth.getCurrentUser();
export const isAuthenticated = () => auth.isAuthenticated();
export const hasRole = (role) => auth.hasRole(role);
export const getUserMetadata = () => auth.getUserMetadata();
export const getUserId = () => auth.getUserId();
export const getUserEmail = () => auth.getUserEmail();

// ===== AUTH EVENT LISTENERS =====
export const onAuthChange = (callback) => auth.onAuthChange(callback);
export const offAuthChange = (callback) => auth.offAuthChange(callback);

// ===== INITIALIZATION =====
console.log('Auth module loaded');
console.log('Current user:', auth.currentUser);
