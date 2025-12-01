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
    // First try to get the session (this will auto-refresh if needed)
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('Error getting session:', sessionError)
      return null
    }
    
    // If we have a session, get the user
    if (session) {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) {
        console.error('Error getting user:', userError)
        return null
      }
      return user?.id || null
    }
    
    return null
  } catch (error) {
    console.error('Error in getCurrentUserId:', error)
    return null
  }
}

