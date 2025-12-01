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
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  } catch (error) {
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

