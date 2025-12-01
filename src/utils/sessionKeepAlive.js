// Session Keep-Alive Service
// Ensures the user session stays active 24/7 by periodically refreshing tokens

import { supabase } from './supabase';

let keepAliveInterval = null;
let isRunning = false;

/**
 * Refreshes the current session token
 */
const refreshSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error getting session for refresh:', error);
      return false;
    }
    
    if (!session) {
      console.log('No active session to refresh');
      return false;
    }
    
    // Check if token is about to expire (within 5 minutes)
    const expiresAt = session.expires_at;
    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = expiresAt - now;
    
    // If token expires in less than 5 minutes, refresh it
    if (timeUntilExpiry < 300) {
      console.log('Token expiring soon, refreshing...');
      const { data, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError) {
        console.error('Error refreshing session:', refreshError);
        return false;
      }
      
      if (data.session) {
        console.log('✅ Session refreshed successfully');
        return true;
      }
    } else {
      console.log(`Session still valid for ${Math.floor(timeUntilExpiry / 60)} more minutes`);
    }
    
    return true;
  } catch (error) {
    console.error('Error in refreshSession:', error);
    return false;
  }
};

/**
 * Starts the keep-alive service
 * Checks and refreshes session every 30 minutes
 */
export const startSessionKeepAlive = () => {
  if (isRunning) {
    console.log('Session keep-alive is already running');
    return;
  }
  
  console.log('🔄 Starting session keep-alive service...');
  isRunning = true;
  
  // Refresh immediately on start
  refreshSession();
  
  // Then refresh every 30 minutes (1800000 ms)
  // This ensures the token is refreshed well before it expires (default expiry is 1 hour)
  keepAliveInterval = setInterval(() => {
    refreshSession();
  }, 30 * 60 * 1000); // 30 minutes
  
  // Also refresh when the page becomes visible (user comes back to tab)
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      console.log('Page visible, checking session...');
      refreshSession();
    }
  });
  
  // Refresh when the window regains focus
  window.addEventListener('focus', () => {
    console.log('Window focused, checking session...');
    refreshSession();
  });
};

/**
 * Stops the keep-alive service
 */
export const stopSessionKeepAlive = () => {
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
    keepAliveInterval = null;
    isRunning = false;
    console.log('🛑 Stopped session keep-alive service');
  }
};

/**
 * Manually refresh the session (can be called from UI)
 */
export const manualRefreshSession = async () => {
  return await refreshSession();
};

