// Authentication Utilities using Supabase

import { supabase } from './supabase';
import { startSessionKeepAlive, stopSessionKeepAlive } from './sessionKeepAlive';

export const signup = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true, user: data.user };
  } catch (error) {
    return { success: false, message: error.message || 'An error occurred during signup' };
  }
};

export const login = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, message: error.message };
    }

    // Start session keep-alive after successful login
    if (data.user) {
      startSessionKeepAlive();
    }

    return { success: true, user: data.user };
  } catch (error) {
    return { success: false, message: error.message || 'An error occurred during login' };
  }
};

export const logout = async () => {
  try {
    // Stop keep-alive service before logging out
    stopSessionKeepAlive();
    await supabase.auth.signOut();
  } catch (error) {
    console.error('Error logging out:', error);
  }
};

export const isAuthenticated = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
    
    // Check if session is expired
    if (session) {
      const expiresAt = session.expires_at;
      const now = Math.floor(Date.now() / 1000);
      if (expiresAt && expiresAt < now) {
        console.log('Session expired, attempting refresh...');
        // Try to refresh
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError || !refreshData?.session) {
          console.error('Failed to refresh expired session:', refreshError);
          return false;
        }
        return true;
      }
    }
    
    return !!session;
  } catch (error) {
    console.error('Error in isAuthenticated:', error);
    return false;
  }
};

export const getCurrentUser = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      return { email: user.email, id: user.id };
    }
    return null;
  } catch (error) {
    return null;
  }
};

// Helper to get current user email (for backward compatibility)
export const getCurrentUserEmail = async () => {
  const user = await getCurrentUser();
  return user?.email || null;
};

export const resetPassword = async (email) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true };
  } catch (error) {
    return { success: false, message: error.message || 'An error occurred while sending reset email' };
  }
};

export const updatePassword = async (newPassword) => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true };
  } catch (error) {
    return { success: false, message: error.message || 'An error occurred while updating password' };
  }
};

