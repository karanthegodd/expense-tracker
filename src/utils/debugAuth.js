// Debug utility to check authentication and data access
import { supabase } from './supabase';
import { getCurrentUserId } from './supabase';
import { getIncomes, getExpenses, getBudgets, getSavingsGoals } from './database';

export const debugAuth = async () => {
  console.log('🔍 === AUTH DEBUG START ===');
  
  try {
    // Check session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('1. Session check:', {
      hasSession: !!session,
      error: sessionError,
      expiresAt: session?.expires_at ? new Date(session.expires_at * 1000).toLocaleString() : 'N/A',
      isExpired: session?.expires_at ? session.expires_at < Math.floor(Date.now() / 1000) : 'N/A'
    });
    
    // Check user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log('2. User check:', {
      hasUser: !!user,
      userId: user?.id,
      email: user?.email,
      error: userError
    });
    
    // Check getCurrentUserId
    const userId = await getCurrentUserId();
    console.log('3. getCurrentUserId result:', userId);
    
    // Try to fetch data
    if (userId) {
      console.log('4. Attempting to fetch data...');
      const incomes = await getIncomes();
      const expenses = await getExpenses();
      const budgets = await getBudgets();
      const goals = await getSavingsGoals();
      
      console.log('5. Data fetched:', {
        incomesCount: incomes.length,
        expensesCount: expenses.length,
        budgetsCount: budgets.length,
        goalsCount: goals.length
      });
      
      // Try a direct query
      const { data: directData, error: directError } = await supabase
        .from('incomes')
        .select('*')
        .eq('user_id', userId)
        .limit(5);
      
      console.log('6. Direct query test:', {
        dataCount: directData?.length || 0,
        error: directError,
        sampleData: directData?.[0] || 'none'
      });
    } else {
      console.log('4. Skipping data fetch - no userId');
    }
    
    console.log('🔍 === AUTH DEBUG END ===');
  } catch (error) {
    console.error('❌ Debug error:', error);
  }
};

// Make it available globally for easy access
if (typeof window !== 'undefined') {
  window.debugAuth = debugAuth;
}

