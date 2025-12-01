import { createClient } from '@supabase/supabase-js'

// Get Supabase URL and key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase credentials not found!')
  console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables')
  console.error('Current values:', { 
    url: supabaseUrl ? '✅ Set' : '❌ Missing', 
    key: supabaseAnonKey ? '✅ Set' : '❌ Missing' 
  })
}

// Create Supabase client with auto-refresh enabled
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
)

// Set up auth state change listener to handle session refresh
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
    console.log('Auth state changed:', event, session ? 'Session active' : 'No session')
  }
})

// Helper to get current user ID with automatic session refresh
export const getCurrentUserId = async () => {
  try {
    console.log('🔍 getCurrentUserId: Checking session...');
    
    // First try to get the session (this will auto-refresh if needed)
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('❌ Error getting session:', sessionError)
      // Try to refresh the session
      try {
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        if (!refreshError && refreshData?.session?.user) {
          console.log('✅ Session refreshed after error, user ID:', refreshData.session.user.id);
          return refreshData.session.user.id;
        }
      } catch (refreshErr) {
        console.error('❌ Error refreshing session:', refreshErr);
      }
      return null
    }
    
    console.log('getCurrentUserId: Session exists?', !!session);
    
    // If we have a session, check if it's expired
    if (session) {
      const expiresAt = session.expires_at;
      const now = Math.floor(Date.now() / 1000);
      const isExpired = expiresAt && expiresAt < now;
      
      if (isExpired) {
        console.log('⚠️ Session expired, attempting refresh...');
        try {
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
          if (refreshError) {
            console.error('❌ Error refreshing expired session:', refreshError);
            return null;
          }
          if (refreshData?.session?.user) {
            console.log('✅ Expired session refreshed, user ID:', refreshData.session.user.id);
            return refreshData.session.user.id;
          }
        } catch (refreshErr) {
          console.error('❌ Error refreshing expired session:', refreshErr);
          return null;
        }
      }
      
      console.log('getCurrentUserId: Session found, getting user...');
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        console.error('❌ Error getting user:', userError)
        // Try to refresh the session if there's an error
        console.log('Attempting to refresh session...');
        try {
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
          if (refreshError) {
            console.error('❌ Error refreshing session:', refreshError);
            return null;
          }
          if (refreshData?.session?.user) {
            console.log('✅ Session refreshed, user ID:', refreshData.session.user.id);
            return refreshData.session.user.id;
          }
        } catch (refreshErr) {
          console.error('❌ Error refreshing session:', refreshErr);
        }
        return null
      }
      
      if (user?.id) {
        console.log('✅ getCurrentUserId: User ID found:', user.id);
        return user.id;
      }
      
      console.warn('⚠️ getCurrentUserId: Session exists but no user ID');
      return null;
    }
    
    console.warn('⚠️ getCurrentUserId: No session found');
    return null
  } catch (error) {
    console.error('❌ Error in getCurrentUserId:', error)
    return null
  }
}

