// Database Helper Functions using Supabase - Per-User Storage

import { supabase, getCurrentUserId } from './supabase';
import { getCurrentUser } from './auth';

// Helper to get current user email (for backward compatibility)
export const getCurrentUserEmail = async () => {
  const user = await getCurrentUser();
  return user?.email || null;
};

// Income Management - Per User
export const getIncomes = async (email = null) => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return [];

    const { data, error } = await supabase
      .from('incomes')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching incomes:', error);
      return [];
    }

    // Transform data to match expected format
    return (data || []).map(item => ({
      id: item.id,
      source: item.description || item.category || '',
      amount: parseFloat(item.amount),
      category: item.category || '',
      description: item.description || '',
      date: item.date,
      isRefund: item.is_refund || false,
    }));
  } catch (error) {
    console.error('Error in getIncomes:', error);
    return [];
  }
};

export const addIncome = async (income, email = null) => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return null;

    const { data, error } = await supabase
      .from('incomes')
      .insert({
        user_id: userId,
        amount: parseFloat(income.amount),
        category: income.category || income.source || '',
        description: income.description || income.source || '',
        date: income.date,
        is_refund: income.isRefund || false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding income:', error);
      return null;
    }

    return {
      id: data.id,
      source: data.description || data.category || '',
      amount: parseFloat(data.amount),
      category: data.category || '',
      description: data.description || '',
      date: data.date,
      isRefund: data.is_refund || false,
    };
  } catch (error) {
    console.error('Error in addIncome:', error);
    return null;
  }
};

export const updateIncome = async (id, updatedIncome, email = null) => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return null;

    const updateData = {};
    if (updatedIncome.amount !== undefined) updateData.amount = parseFloat(updatedIncome.amount);
    if (updatedIncome.category !== undefined) updateData.category = updatedIncome.category;
    if (updatedIncome.description !== undefined) updateData.description = updatedIncome.description;
    if (updatedIncome.source !== undefined) {
      updateData.description = updatedIncome.source;
      updateData.category = updatedIncome.source;
    }
    if (updatedIncome.date !== undefined) updateData.date = updatedIncome.date;
    if (updatedIncome.isRefund !== undefined) updateData.is_refund = updatedIncome.isRefund;

    const { data, error } = await supabase
      .from('incomes')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating income:', error);
      return null;
    }

    return {
      id: data.id,
      source: data.description || data.category || '',
      amount: parseFloat(data.amount),
      category: data.category || '',
      description: data.description || '',
      date: data.date,
      isRefund: data.is_refund || false,
    };
  } catch (error) {
    console.error('Error in updateIncome:', error);
    return null;
  }
};

export const deleteIncome = async (id, email = null) => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return [];

    const { error } = await supabase
      .from('incomes')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting income:', error);
      return [];
    }

    return await getIncomes();
  } catch (error) {
    console.error('Error in deleteIncome:', error);
    return [];
  }
};

// Expense Management - Per User
export const getExpenses = async (email = null) => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return [];

    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching expenses:', error);
      return [];
    }

    return (data || []).map(item => ({
      id: item.id,
      name: item.description || item.category || '',
      amount: parseFloat(item.amount),
      category: item.category || '',
      description: item.description || '',
      date: item.date,
    }));
  } catch (error) {
    console.error('Error in getExpenses:', error);
    return [];
  }
};

export const addExpense = async (expense, email = null) => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return null;

    const { data, error } = await supabase
      .from('expenses')
      .insert({
        user_id: userId,
        amount: parseFloat(expense.amount),
        category: expense.category || '',
        description: expense.description || expense.name || '',
        date: expense.date,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding expense:', error);
      return null;
    }

    return {
      id: data.id,
      name: data.description || data.category || '',
      amount: parseFloat(data.amount),
      category: data.category || '',
      description: data.description || '',
      date: data.date,
    };
  } catch (error) {
    console.error('Error in addExpense:', error);
    return null;
  }
};

export const updateExpense = async (id, updatedExpense, email = null) => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return null;

    const updateData = {};
    if (updatedExpense.amount !== undefined) updateData.amount = parseFloat(updatedExpense.amount);
    if (updatedExpense.category !== undefined) updateData.category = updatedExpense.category;
    if (updatedExpense.description !== undefined) updateData.description = updatedExpense.description;
    if (updatedExpense.name !== undefined) updateData.description = updatedExpense.name;
    if (updatedExpense.date !== undefined) updateData.date = updatedExpense.date;

    const { data, error } = await supabase
      .from('expenses')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating expense:', error);
      return null;
    }

    return {
      id: data.id,
      name: data.description || data.category || '',
      amount: parseFloat(data.amount),
      category: data.category || '',
      description: data.description || '',
      date: data.date,
    };
  } catch (error) {
    console.error('Error in updateExpense:', error);
    return null;
  }
};

export const deleteExpense = async (id, email = null) => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return [];

    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting expense:', error);
      return [];
    }

    return await getExpenses();
  } catch (error) {
    console.error('Error in deleteExpense:', error);
    return [];
  }
};

// Budget Management - Per User
export const getBudgets = async (email = null) => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return [];

    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching budgets:', error);
      return [];
    }

    return (data || []).map(item => ({
      id: item.id,
      category: item.category || '',
      amount: parseFloat(item.amount),
    }));
  } catch (error) {
    console.error('Error in getBudgets:', error);
    return [];
  }
};

export const addBudget = async (budget, email = null) => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return null;

    const { data, error } = await supabase
      .from('budgets')
      .insert({
        user_id: userId,
        category: budget.category || '',
        amount: parseFloat(budget.amount),
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding budget:', error);
      return null;
    }

    return {
      id: data.id,
      category: data.category || '',
      amount: parseFloat(data.amount),
    };
  } catch (error) {
    console.error('Error in addBudget:', error);
    return null;
  }
};

export const updateBudget = async (id, updatedBudget, email = null) => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return null;

    const updateData = {};
    if (updatedBudget.category !== undefined) updateData.category = updatedBudget.category;
    if (updatedBudget.amount !== undefined) updateData.amount = parseFloat(updatedBudget.amount);

    const { data, error } = await supabase
      .from('budgets')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating budget:', error);
      return null;
    }

    return {
      id: data.id,
      category: data.category || '',
      amount: parseFloat(data.amount),
    };
  } catch (error) {
    console.error('Error in updateBudget:', error);
    return null;
  }
};

export const deleteBudget = async (id, email = null) => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return [];

    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting budget:', error);
      return [];
    }

    return await getBudgets();
  } catch (error) {
    console.error('Error in deleteBudget:', error);
    return [];
  }
};

// Savings Goals Management - Per User
export const getSavingsGoals = async (email = null) => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return [];

    const { data, error } = await supabase
      .from('savings_goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching savings goals:', error);
      return [];
    }

    return (data || []).map(item => ({
      id: item.id,
      name: item.name || '',
      targetAmount: parseFloat(item.target_amount),
      savedAmount: parseFloat(item.saved_amount || 0),
      dueDate: item.due_date || '',
    }));
  } catch (error) {
    console.error('Error in getSavingsGoals:', error);
    return [];
  }
};

export const addSavingsGoal = async (goal, email = null) => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return null;

    const { data, error } = await supabase
      .from('savings_goals')
      .insert({
        user_id: userId,
        name: goal.name || '',
        target_amount: parseFloat(goal.targetAmount || goal.target_amount || 0),
        saved_amount: parseFloat(goal.savedAmount || 0),
        due_date: goal.dueDate || goal.due_date || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding savings goal:', error);
      return null;
    }

    return {
      id: data.id,
      name: data.name || '',
      targetAmount: parseFloat(data.target_amount),
      savedAmount: parseFloat(data.saved_amount || 0),
      dueDate: data.due_date || '',
    };
  } catch (error) {
    console.error('Error in addSavingsGoal:', error);
    return null;
  }
};

export const updateSavingsGoal = async (id, updatedGoal, email = null) => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return null;

    const updateData = {};
    if (updatedGoal.name !== undefined) updateData.name = updatedGoal.name;
    if (updatedGoal.targetAmount !== undefined) updateData.target_amount = parseFloat(updatedGoal.targetAmount);
    if (updatedGoal.target_amount !== undefined) updateData.target_amount = parseFloat(updatedGoal.target_amount);
    if (updatedGoal.savedAmount !== undefined) updateData.saved_amount = parseFloat(updatedGoal.savedAmount);
    if (updatedGoal.saved_amount !== undefined) updateData.saved_amount = parseFloat(updatedGoal.saved_amount);
    if (updatedGoal.dueDate !== undefined) updateData.due_date = updatedGoal.dueDate || null;
    if (updatedGoal.due_date !== undefined) updateData.due_date = updatedGoal.due_date || null;

    const { data, error } = await supabase
      .from('savings_goals')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating savings goal:', error);
      return null;
    }

    return {
      id: data.id,
      name: data.name || '',
      targetAmount: parseFloat(data.target_amount),
      savedAmount: parseFloat(data.saved_amount || 0),
      dueDate: data.due_date || '',
    };
  } catch (error) {
    console.error('Error in updateSavingsGoal:', error);
    return null;
  }
};

export const deleteSavingsGoal = async (id, email = null) => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return [];

    const { error } = await supabase
      .from('savings_goals')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting savings goal:', error);
      return [];
    }

    return await getSavingsGoals();
  } catch (error) {
    console.error('Error in deleteSavingsGoal:', error);
    return [];
  }
};

export const addContributionToGoal = async (id, amount, email = null) => {
  try {
    const goals = await getSavingsGoals(email);
    const goal = goals.find(g => g.id === id);
  if (!goal) return null;
    
  const newSavedAmount = parseFloat(goal.savedAmount || 0) + parseFloat(amount);
    return await updateSavingsGoal(id, { savedAmount: newSavedAmount }, email);
  } catch (error) {
    console.error('Error in addContributionToGoal:', error);
    return null;
  }
};

export const withdrawFromGoal = async (id, amount, email = null) => {
  try {
    const goals = await getSavingsGoals(email);
    const goal = goals.find(g => g.id === id);
  if (!goal) return null;
    
  const currentSaved = parseFloat(goal.savedAmount || 0);
  const withdrawAmount = parseFloat(amount);
  if (withdrawAmount > currentSaved) {
      return null;
    }
    
    const newSavedAmount = Math.max(0, currentSaved - withdrawAmount);
    return await updateSavingsGoal(id, { savedAmount: newSavedAmount }, email);
  } catch (error) {
    console.error('Error in withdrawFromGoal:', error);
    return null;
  }
};

// Upcoming Expenses Management - Per User
export const getUpcomingExpenses = async (email = null) => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return [];

    const { data, error } = await supabase
      .from('upcoming_expenses')
      .select('*')
      .eq('user_id', userId)
      .order('due_date', { ascending: true });

    if (error) {
      console.error('Error fetching upcoming expenses:', error);
      return [];
    }

    return (data || []).map(item => ({
      id: item.id,
      name: item.name || '',
      amount: parseFloat(item.amount),
      category: item.category || '',
      dueDate: item.due_date || '',
      description: item.description || '',
    }));
  } catch (error) {
    console.error('Error in getUpcomingExpenses:', error);
    return [];
  }
};

export const addUpcomingExpense = async (expense, email = null) => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return null;

    const { data, error } = await supabase
      .from('upcoming_expenses')
      .insert({
        user_id: userId,
        name: expense.name || '',
        amount: parseFloat(expense.amount),
        category: expense.category || '',
        due_date: expense.dueDate || expense.due_date || null,
        description: expense.description || '',
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding upcoming expense:', error);
      return null;
    }

    return {
      id: data.id,
      name: data.name || '',
      amount: parseFloat(data.amount),
      category: data.category || '',
      dueDate: data.due_date || '',
      description: data.description || '',
    };
  } catch (error) {
    console.error('Error in addUpcomingExpense:', error);
    return null;
  }
};

export const updateUpcomingExpense = async (id, updatedExpense, email = null) => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return null;

    const updateData = {};
    if (updatedExpense.name !== undefined) updateData.name = updatedExpense.name;
    if (updatedExpense.amount !== undefined) updateData.amount = parseFloat(updatedExpense.amount);
    if (updatedExpense.category !== undefined) updateData.category = updatedExpense.category;
    if (updatedExpense.dueDate !== undefined) updateData.due_date = updatedExpense.dueDate || null;
    if (updatedExpense.due_date !== undefined) updateData.due_date = updatedExpense.due_date || null;
    if (updatedExpense.description !== undefined) updateData.description = updatedExpense.description;

    const { data, error } = await supabase
      .from('upcoming_expenses')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating upcoming expense:', error);
      return null;
    }

    return {
      id: data.id,
      name: data.name || '',
      amount: parseFloat(data.amount),
      category: data.category || '',
      dueDate: data.due_date || '',
      description: data.description || '',
    };
  } catch (error) {
    console.error('Error in updateUpcomingExpense:', error);
    return null;
  }
};

export const deleteUpcomingExpense = async (id, email = null) => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return [];

    const { error } = await supabase
      .from('upcoming_expenses')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting upcoming expense:', error);
      return [];
    }

    return await getUpcomingExpenses();
  } catch (error) {
    console.error('Error in deleteUpcomingExpense:', error);
    return [];
  }
};

// Recurring Payments Management - Per User
export const getRecurringPayments = async (email = null) => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return [];

    const { data, error } = await supabase
      .from('recurring_payments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching recurring payments:', error);
      return [];
    }

    return (data || []).map(item => ({
      id: item.id,
      name: item.name || '',
      amount: parseFloat(item.amount),
      category: item.category || '',
      frequency: item.frequency || '',
      nextDueDate: item.next_due_date || '',
      description: item.description || '',
      lastAdded: item.last_added || '',
      autoAdd: item.auto_add !== undefined ? item.auto_add : true,
    }));
  } catch (error) {
    console.error('Error in getRecurringPayments:', error);
    return [];
  }
};

export const addRecurringPayment = async (payment, email = null) => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return null;

    const { data, error } = await supabase
      .from('recurring_payments')
      .insert({
        user_id: userId,
        name: payment.name || '',
        amount: parseFloat(payment.amount),
        category: payment.category || '',
        frequency: payment.frequency || '',
        next_due_date: payment.nextDueDate || payment.next_due_date || null,
        description: payment.description || '',
        auto_add: payment.autoAdd !== undefined ? payment.autoAdd : true,
        last_added: payment.lastAdded || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding recurring payment:', error);
      return null;
    }

    return {
      id: data.id,
      name: data.name || '',
      amount: parseFloat(data.amount),
      category: data.category || '',
      frequency: data.frequency || '',
      nextDueDate: data.next_due_date || '',
      description: data.description || '',
      lastAdded: data.last_added || '',
      autoAdd: data.auto_add !== undefined ? data.auto_add : true,
    };
  } catch (error) {
    console.error('Error in addRecurringPayment:', error);
    return null;
  }
};

export const updateRecurringPayment = async (id, updatedPayment, email = null) => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return null;

    const updateData = {};
    if (updatedPayment.name !== undefined) updateData.name = updatedPayment.name;
    if (updatedPayment.amount !== undefined) updateData.amount = parseFloat(updatedPayment.amount);
    if (updatedPayment.category !== undefined) updateData.category = updatedPayment.category;
    if (updatedPayment.frequency !== undefined) updateData.frequency = updatedPayment.frequency;
    if (updatedPayment.nextDueDate !== undefined) updateData.next_due_date = updatedPayment.nextDueDate || null;
    if (updatedPayment.next_due_date !== undefined) updateData.next_due_date = updatedPayment.next_due_date || null;
    if (updatedPayment.description !== undefined) updateData.description = updatedPayment.description;
    if (updatedPayment.lastAdded !== undefined) updateData.last_added = updatedPayment.lastAdded || null;
    if (updatedPayment.last_added !== undefined) updateData.last_added = updatedPayment.last_added || null;
    if (updatedPayment.autoAdd !== undefined) updateData.auto_add = updatedPayment.autoAdd;
    if (updatedPayment.auto_add !== undefined) updateData.auto_add = updatedPayment.auto_add;

    const { data, error } = await supabase
      .from('recurring_payments')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating recurring payment:', error);
      return null;
    }

    return {
      id: data.id,
      name: data.name || '',
      amount: parseFloat(data.amount),
      category: data.category || '',
      frequency: data.frequency || '',
      nextDueDate: data.next_due_date || '',
      description: data.description || '',
      lastAdded: data.last_added || '',
      autoAdd: data.auto_add !== undefined ? data.auto_add : true,
    };
  } catch (error) {
    console.error('Error in updateRecurringPayment:', error);
  return null;
  }
};

export const deleteRecurringPayment = async (id, email = null) => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return [];

    const { error } = await supabase
      .from('recurring_payments')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting recurring payment:', error);
      return [];
    }

    return await getRecurringPayments();
  } catch (error) {
    console.error('Error in deleteRecurringPayment:', error);
    return [];
  }
};

// Dashboard Calculations - Per User
export const getTotals = async (email = null) => {
  try {
    const userId = await getCurrentUserId();
    console.log('getTotals - userId:', userId);
    
    if (!userId) {
      console.warn('⚠️ getTotals: No userId found. User may not be authenticated.');
      return {
    totalIncome: 0,
    totalExpenses: 0,
    totalSaved: 0,
    categoryBreakdown: {},
    recentTransactions: [],
    monthlyIncomes: [],
    monthlyExpenses: [],
    budgets: [],
    savingsGoals: [],
    upcomingExpenses: [],
    avgBudgetProgress: 0,
    totalUpcoming: 0,
  };
    }
    
    console.log('getTotals - Fetching data for userId:', userId);

    const incomes = await getIncomes();
    const expenses = await getExpenses();
    const budgets = await getBudgets();
    const savingsGoals = await getSavingsGoals();
    const upcomingExpenses = await getUpcomingExpenses();
    
    console.log('getTotals - Data fetched:', {
      incomesCount: incomes.length,
      expensesCount: expenses.length,
      budgetsCount: budgets.length,
      savingsGoalsCount: savingsGoals.length,
      upcomingExpensesCount: upcomingExpenses.length
    });
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  // Filter current month data
  const monthlyIncomes = incomes.filter(inc => {
    const incDate = new Date(inc.date);
    return incDate.getMonth() === currentMonth && incDate.getFullYear() === currentYear;
  });
  
  const monthlyExpenses = expenses.filter(exp => {
    const expDate = new Date(exp.date);
    return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
  });
  
  const totalIncome = monthlyIncomes.reduce((sum, inc) => sum + parseFloat(inc.amount || 0), 0);
  const totalExpenses = monthlyExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
  const totalSaved = totalIncome - totalExpenses;
  
  // Category breakdown
  const categoryBreakdown = {};
  monthlyExpenses.forEach(exp => {
    const category = exp.category || 'Uncategorized';
    categoryBreakdown[category] = (categoryBreakdown[category] || 0) + parseFloat(exp.amount || 0);
  });
  
  // Recent transactions (last 10)
  const allTransactions = [
    ...monthlyIncomes.map(inc => ({ ...inc, type: 'income' })),
    ...monthlyExpenses.map(exp => ({ ...exp, type: 'expense' }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);
  
  // Budget progress
  let totalBudgetProgress = 0;
  budgets.forEach(budget => {
    const spent = monthlyExpenses
      .filter(exp => exp.category === budget.category)
      .reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
    totalBudgetProgress += (spent / parseFloat(budget.amount || 1)) * 100;
  });
  const avgBudgetProgress = budgets.length > 0 ? totalBudgetProgress / budgets.length : 0;
  
  // Total upcoming expenses
  const totalUpcoming = upcomingExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
  
  return {
    totalIncome,
    totalExpenses,
    totalSaved,
    categoryBreakdown,
    recentTransactions: allTransactions,
    monthlyIncomes,
    monthlyExpenses,
    budgets,
    savingsGoals,
    upcomingExpenses,
    avgBudgetProgress,
    totalUpcoming,
  };
  } catch (error) {
    console.error('Error in getTotals:', error);
    return {
      totalIncome: 0,
      totalExpenses: 0,
      totalSaved: 0,
      categoryBreakdown: {},
      recentTransactions: [],
      monthlyIncomes: [],
      monthlyExpenses: [],
      budgets: [],
      savingsGoals: [],
      upcomingExpenses: [],
      avgBudgetProgress: 0,
      totalUpcoming: 0,
    };
  }
};

// Get available funds (total saved - total in savings goals)
export const getAvailableFunds = async (email = null) => {
  try {
    const totals = await getTotals(email);
    const savingsGoals = await getSavingsGoals(email);
  const totalInGoals = savingsGoals.reduce((sum, goal) => sum + parseFloat(goal.savedAmount || 0), 0);
  return Math.max(0, totals.totalSaved - totalInGoals);
  } catch (error) {
    console.error('Error in getAvailableFunds:', error);
    return 0;
  }
};
