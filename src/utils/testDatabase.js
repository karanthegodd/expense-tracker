// Test database connection and data access
import { supabase } from './supabase';
import { getCurrentUserId } from './supabase';

export const testDatabase = async () => {
  console.log('🧪 === DATABASE TEST START ===');
  
  try {
    // 1. Check session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('1. Session:', {
      exists: !!session,
      userId: session?.user?.id,
      error: sessionError
    });
    
    if (!session) {
      console.error('❌ No session found! Please log in.');
      return;
    }
    
    const userId = session.user.id;
    console.log('2. User ID:', userId);
    
    // 2. Test direct query to incomes table
    console.log('3. Testing incomes table...');
    const { data: incomesData, error: incomesError } = await supabase
      .from('incomes')
      .select('*')
      .eq('user_id', userId);
    
    console.log('   Incomes:', {
      count: incomesData?.length || 0,
      data: incomesData,
      error: incomesError
    });
    
    // 3. Test direct query to expenses table
    console.log('4. Testing expenses table...');
    const { data: expensesData, error: expensesError } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId);
    
    console.log('   Expenses:', {
      count: expensesData?.length || 0,
      data: expensesData,
      error: expensesError
    });
    
    // 4. Test budgets table
    console.log('5. Testing budgets table...');
    const { data: budgetsData, error: budgetsError } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId);
    
    console.log('   Budgets:', {
      count: budgetsData?.length || 0,
      data: budgetsData,
      error: budgetsError
    });
    
    // 5. Test savings_goals table
    console.log('6. Testing savings_goals table...');
    const { data: goalsData, error: goalsError } = await supabase
      .from('savings_goals')
      .select('*')
      .eq('user_id', userId);
    
    console.log('   Savings Goals:', {
      count: goalsData?.length || 0,
      data: goalsData,
      error: goalsError
    });
    
    // 6. Check if tables exist (test with a simple count)
    console.log('7. Testing table access...');
    const { count: incomesCount, error: countError } = await supabase
      .from('incomes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    
    console.log('   Table access test:', {
      incomesCount,
      error: countError
    });
    
    console.log('🧪 === DATABASE TEST END ===');
    
    // Summary
    console.log('\n📊 SUMMARY:');
    console.log(`   Incomes: ${incomesData?.length || 0}`);
    console.log(`   Expenses: ${expensesData?.length || 0}`);
    console.log(`   Budgets: ${budgetsData?.length || 0}`);
    console.log(`   Savings Goals: ${goalsData?.length || 0}`);
    
    if ((incomesData?.length || 0) === 0 && (expensesData?.length || 0) === 0) {
      console.log('\n⚠️  No income or expense data found in database!');
      console.log('   This is why totals show $0.00');
      console.log('   Try adding some income or expenses first.');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
};

// Make it available globally
if (typeof window !== 'undefined') {
  window.testDatabase = testDatabase;
}

