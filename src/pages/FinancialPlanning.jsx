import { useState, useEffect } from 'react';
import { 
  getBudgets, addBudget, updateBudget, deleteBudget, getExpenses,
  getSavingsGoals, addSavingsGoal, updateSavingsGoal, deleteSavingsGoal, addContributionToGoal, withdrawFromGoal, getAvailableFunds
} from '../utils/localStorage';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { useToast } from '../components/ToastContainer';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';
import { isAuthenticated } from '../utils/auth';

const FinancialPlanning = () => {
  const { showToast } = useToast();
  
  // Budgets state
  const [budgets, setBudgets] = useState([]);
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [editingBudgetId, setEditingBudgetId] = useState(null);
  const [deleteBudgetModalOpen, setDeleteBudgetModalOpen] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState(null);
  const [budgetFormData, setBudgetFormData] = useState({
    category: '',
    amount: '',
  });
  const [budgetFormErrors, setBudgetFormErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(true);

  // Savings Goals state
  const [goals, setGoals] = useState([]);
  const [availableFunds, setAvailableFunds] = useState(0);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [showContributionForm, setShowContributionForm] = useState(false);
  const [showWithdrawalForm, setShowWithdrawalForm] = useState(false);
  const [deleteGoalModalOpen, setDeleteGoalModalOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState(null);
  const [selectedGoalId, setSelectedGoalId] = useState(null);
  const [editingGoalId, setEditingGoalId] = useState(null);
  const [goalFormData, setGoalFormData] = useState({
    name: '',
    targetAmount: '',
    dueDate: '',
  });
  const [goalFormErrors, setGoalFormErrors] = useState({});
  const [contributionAmount, setContributionAmount] = useState('');
  const [withdrawalAmount, setWithdrawalAmount] = useState('');

  const categories = [
    'Food & Dining',
    'Transportation',
    'Shopping',
    'Bills & Utilities',
    'Entertainment',
    'Healthcare',
    'Education',
    'Travel',
    'Other',
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Check authentication status
        const authStatus = await isAuthenticated();
        setAuthenticated(authStatus);
        await loadBudgets();
        await loadGoals();
      } catch (error) {
        console.error('Error loading financial planning data:', error);
        showToast('Error loading data. Please refresh the page.', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadData();
    
    // Also refresh periodically to catch changes (but don't refresh if forms are open)
    const interval = setInterval(() => {
      // Only refresh if no forms are open to avoid disrupting user input
      if (!showBudgetForm && !showGoalForm && !showContributionForm && !showWithdrawalForm) {
        loadData();
      }
    }, 3000);
    
    return () => {
      clearInterval(interval);
    };
  }, [showBudgetForm, showGoalForm, showContributionForm, showWithdrawalForm]);

  const loadBudgets = async () => {
    try {
      const data = await getBudgets();
      setBudgets(data || []);
    } catch (error) {
      console.error('Error loading budgets:', error);
      setBudgets([]);
    }
  };

  const loadGoals = async () => {
    try {
    const data = await getSavingsGoals();
      console.log('Loaded goals:', data);
    setGoals(data);
    const funds = await getAvailableFunds();
      console.log('Available funds:', funds);
    setAvailableFunds(funds);
      // Preserve contribution form state if it's open
      if (showContributionForm && selectedGoalId) {
        // Verify the goal still exists
        const goalExists = data.find(g => g.id === selectedGoalId);
        if (!goalExists) {
          setShowContributionForm(false);
          setSelectedGoalId(null);
          setContributionAmount('');
        }
      }
      // Preserve withdrawal form state if it's open
      if (showWithdrawalForm && selectedGoalId) {
        // Verify the goal still exists
        const goalExists = data.find(g => g.id === selectedGoalId);
        if (!goalExists) {
          setShowWithdrawalForm(false);
          setSelectedGoalId(null);
          setWithdrawalAmount('');
        }
      }
    } catch (error) {
      console.error('Error loading goals:', error);
      setGoals([]);
      setAvailableFunds(0);
    }
  };

  // Budget handlers
  const validateBudgetForm = () => {
    const errors = {};
    if (!budgetFormData.category) {
      errors.category = 'Please select a category';
    }
    if (!budgetFormData.amount || parseFloat(budgetFormData.amount) <= 0) {
      errors.amount = 'Please enter a valid budget amount';
    }
    setBudgetFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleBudgetSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateBudgetForm()) {
      showToast('Please check form errors', 'error');
      return;
    }
    
    if (editingBudgetId) {
      const result = await updateBudget(editingBudgetId, budgetFormData);
      if (result) {
        showToast('Budget updated', 'success');
        resetBudgetForm();
        await loadBudgets();
      } else {
        showToast('Failed to update budget', 'error');
      }
    } else {
      const result = await addBudget(budgetFormData);
      if (result) {
        showToast('Budget added', 'success');
        resetBudgetForm();
        await loadBudgets();
      } else {
        showToast('Failed to add budget', 'error');
      }
    }
  };

  const handleBudgetEdit = (budget) => {
    setBudgetFormData({
      category: budget.category,
      amount: budget.amount,
    });
    setEditingBudgetId(budget.id);
    setShowBudgetForm(true);
  };

  const handleBudgetDeleteClick = (budget) => {
    setBudgetToDelete(budget);
    setDeleteBudgetModalOpen(true);
  };

  const handleBudgetDeleteConfirm = async () => {
    if (budgetToDelete) {
      await deleteBudget(budgetToDelete.id);
      showToast('Budget deleted', 'success');
      await loadBudgets();
      setDeleteBudgetModalOpen(false);
      setBudgetToDelete(null);
    }
  };

  const resetBudgetForm = () => {
    setBudgetFormData({
      category: '',
      amount: '',
    });
    setEditingBudgetId(null);
    setShowBudgetForm(false);
    setBudgetFormErrors({});
  };

  // Savings Goal handlers
  const validateGoalForm = () => {
    const errors = {};
    if (!goalFormData.name.trim()) {
      errors.name = 'Please enter goal name';
    }
    if (!goalFormData.targetAmount || parseFloat(goalFormData.targetAmount) <= 0) {
      errors.targetAmount = 'Please enter a valid target amount';
    }
    setGoalFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleGoalSubmit = async (e) => {
    e.preventDefault();
    console.log('Goal form submitted', { editingGoalId, goalFormData });
    
    if (!validateGoalForm()) {
      showToast('Please check form errors', 'error');
      return;
    }
    
    try {
    if (editingGoalId) {
        const result = await updateSavingsGoal(editingGoalId, goalFormData);
        console.log('updateSavingsGoal result:', result);
        if (result) {
          showToast('Savings goal updated successfully!', 'success');
          resetGoalForm();
          await loadGoals();
    } else {
          showToast('Failed to update goal. The goal may not exist.', 'error');
        }
      } else {
        const result = await addSavingsGoal(goalFormData);
        console.log('addSavingsGoal result:', result);
        if (result) {
          showToast('Savings goal created successfully!', 'success');
    resetGoalForm();
    await loadGoals();
        } else {
          showToast('Failed to create goal. Please check if you are logged in.', 'error');
        }
      }
    } catch (error) {
      console.error('Error saving goal:', error);
      showToast(`Error: ${error.message}`, 'error');
    }
  };

  const handleContributionSubmit = async (e) => {
    e.preventDefault();
    console.log('Contribution form submitted', { selectedGoalId, contributionAmount, availableFunds });
    
    if (!selectedGoalId) {
      showToast('Please select a goal', 'error');
      return;
    }
    if (!contributionAmount || contributionAmount.trim() === '') {
      showToast('Please enter an amount', 'error');
      return;
    }
      const amount = parseFloat(contributionAmount);
    console.log('Parsed amount:', amount);
    
    if (isNaN(amount) || amount <= 0) {
      showToast('Please enter a valid positive amount', 'error');
        return;
      }
    
    // Allow adding money even if available funds are low (user might want to track manually)
    // Just warn them if they exceed available funds
    if (amount > availableFunds && availableFunds > 0) {
      const proceed = window.confirm(
        `You're adding ${formatCurrency(amount)} but only have ${formatCurrency(availableFunds)} available. ` +
        `This will track the goal progress, but your actual savings may be less. Continue?`
      );
      if (!proceed) {
        return;
      }
    }
    
    try {
      const result = await addContributionToGoal(selectedGoalId, amount);
      console.log('addContributionToGoal result:', result);
      
      if (result) {
        showToast(`Successfully added ${formatCurrency(amount)} to goal!`, 'success');
      setContributionAmount('');
      setShowContributionForm(false);
      setSelectedGoalId(null);
      await loadGoals();
      } else {
        showToast('Failed to add contribution. The goal may not exist or you may not be logged in.', 'error');
      }
    } catch (error) {
      console.error('Error adding contribution:', error);
      showToast(`Error: ${error.message}`, 'error');
    }
  };

  const handleWithdrawalSubmit = async (e) => {
    e.preventDefault();
    console.log('Withdrawal form submitted', { selectedGoalId, withdrawalAmount });
    
    if (!selectedGoalId) {
      showToast('Please select a goal', 'error');
      return;
    }
    if (!withdrawalAmount || withdrawalAmount.trim() === '') {
      showToast('Please enter an amount', 'error');
      return;
    }
    const amount = parseFloat(withdrawalAmount);
    console.log('Parsed withdrawal amount:', amount);
    
    if (isNaN(amount) || amount <= 0) {
      showToast('Please enter a valid positive amount', 'error');
      return;
    }
    
    const selectedGoal = goals.find(g => g.id === selectedGoalId);
    if (!selectedGoal) {
      showToast('Goal not found', 'error');
      return;
    }
    
    const currentSaved = parseFloat(selectedGoal.savedAmount || 0);
    if (amount > currentSaved) {
      showToast(`Cannot withdraw more than saved. Current saved: ${formatCurrency(currentSaved)}`, 'error');
      return;
    }
    
    try {
      const result = await withdrawFromGoal(selectedGoalId, amount);
      console.log('withdrawFromGoal result:', result);
      
      if (result) {
        showToast(`Successfully withdrew ${formatCurrency(amount)} from goal!`, 'success');
        setWithdrawalAmount('');
        setShowWithdrawalForm(false);
        setSelectedGoalId(null);
        await loadGoals();
      } else {
        showToast('Failed to withdraw. The goal may not exist or you may not be logged in.', 'error');
      }
    } catch (error) {
      console.error('Error withdrawing:', error);
      showToast(`Error: ${error.message}`, 'error');
    }
  };

  const handleGoalEdit = (goal) => {
    setGoalFormData({
      name: goal.name,
      targetAmount: goal.targetAmount,
      dueDate: goal.dueDate || '',
    });
    setEditingGoalId(goal.id);
    setShowGoalForm(true);
  };

  const handleGoalDeleteClick = (goal) => {
    setGoalToDelete(goal);
    setDeleteGoalModalOpen(true);
  };

  const handleGoalDeleteConfirm = async () => {
    if (goalToDelete) {
      await deleteSavingsGoal(goalToDelete.id);
      showToast('Savings goal deleted', 'success');
      await loadGoals();
      setDeleteGoalModalOpen(false);
      setGoalToDelete(null);
    }
  };

  const resetGoalForm = () => {
    setGoalFormData({
      name: '',
      targetAmount: '',
      dueDate: '',
    });
    setEditingGoalId(null);
    setShowGoalForm(false);
    setGoalFormErrors({});
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(amount);
  };

  const getSpentAmount = (category) => {
    const expenses = getExpenses();
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyExpenses = expenses.filter(exp => {
      const expDate = new Date(exp.date);
      return (
        expDate.getMonth() === currentMonth &&
        expDate.getFullYear() === currentYear &&
        exp.category === category
      );
    });
    
    // Sum all expenses (negative amounts = refunds reduce the total)
    const total = monthlyExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
    return total;
  };

  const getRemainingBudget = (budget) => {
    const spent = getSpentAmount(budget.category);
    return parseFloat(budget.amount) - spent;
  };

  const goalsData = goals.map(goal => {
    const percentage = (parseFloat(goal.savedAmount || 0) / parseFloat(goal.targetAmount || 1)) * 100;
    return {
      ...goal,
      percentage: Math.min(percentage, 100),
    };
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-12 text-white/60">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 fade-in">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">
            💰 Financial Planning
          </h1>
          <p className="text-white/80 text-sm">Manage budgets and savings goals</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="primary"
            onClick={() => setShowBudgetForm(!showBudgetForm)}
            className="shadow-xl"
          >
            {showBudgetForm ? '❌ Cancel' : '➕ Add Budget'}
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              console.log('Add Goal button clicked, current state:', showGoalForm);
              setShowGoalForm(!showGoalForm);
            }}
            className="shadow-xl"
          >
            {showGoalForm ? '❌ Cancel' : '🎯 Add Goal'}
          </Button>
        </div>
      </div>

      {/* Budget Form */}
      {showBudgetForm && (
        <Card className="mb-8 slide-up">
          <h2 className="text-3xl font-bold text-white mb-2 flex items-center">
            <span className="mr-2">{editingBudgetId ? '✏️' : '➕'}</span>
            {editingBudgetId ? 'Edit Budget' : 'Add New Budget'}
          </h2>
          <p className="text-white/60 text-sm mb-6">
            💡 Budgets automatically track spending from expenses in the selected category
          </p>
          <form onSubmit={handleBudgetSubmit} className="space-y-6">
            <div>
              <label className="block text-white/90 font-semibold mb-2 text-sm">
                Category <span className="text-red-400">*</span>
              </label>
              <select
                value={budgetFormData.category}
                onChange={(e) => {
                  setBudgetFormData({ ...budgetFormData, category: e.target.value });
                  if (budgetFormErrors.category) setBudgetFormErrors({ ...budgetFormErrors, category: '' });
                }}
                required
                className={`input-glass w-full ${budgetFormErrors.category ? 'border-red-400 border-2' : ''}`}
                aria-invalid={!!budgetFormErrors.category}
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-gray-800">
                    {cat}
                  </option>
                ))}
              </select>
              {budgetFormErrors.category && (
                <p className="text-red-300 text-sm mt-1 flex items-center" role="alert">
                  <span className="mr-1">⚠️</span>
                  {budgetFormErrors.category}
                </p>
              )}
            </div>
            <div>
              <label className="block text-white/90 font-semibold mb-2 text-sm">
                Budget Amount (CAD) <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 font-semibold">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={budgetFormData.amount}
                  onChange={(e) => {
                    setBudgetFormData({ ...budgetFormData, amount: e.target.value });
                    if (budgetFormErrors.amount) setBudgetFormErrors({ ...budgetFormErrors, amount: '' });
                  }}
                  required
                  className={`input-glass w-full pl-8 ${budgetFormErrors.amount ? 'border-red-400 border-2' : ''}`}
                  placeholder="0.00"
                  aria-invalid={!!budgetFormErrors.amount}
                />
              </div>
              {budgetFormErrors.amount && (
                <p className="text-red-300 text-sm mt-1 flex items-center" role="alert">
                  <span className="mr-1">⚠️</span>
                  {budgetFormErrors.amount}
                </p>
              )}
            </div>
            <div className="flex space-x-4 pt-2">
              <Button type="submit" variant="primary" className="flex-1">
                {editingBudgetId ? '💾 Update Budget' : '➕ Add Budget'}
              </Button>
              <Button type="button" variant="outline" onClick={resetBudgetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Savings Goal Form */}
      {showGoalForm && (
        <Card className="mb-8 slide-up" id="savings-goal-form">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
            <span className="mr-2">{editingGoalId ? '✏️' : '➕'}</span>
            {editingGoalId ? 'Edit Savings Goal' : 'Add New Savings Goal'}
          </h2>
          {!authenticated && (
            <div className="mb-4 p-4 bg-red-500/20 rounded-lg border border-red-400/30">
              <p className="text-red-300 text-sm font-semibold">
                ⚠️ You must be logged in to create savings goals. Please log in first.
              </p>
            </div>
          )}
          <form onSubmit={handleGoalSubmit} className="space-y-6" noValidate>
            <div>
              <label htmlFor="goal-name" className="block text-white/90 font-semibold mb-2 text-sm">
                Goal Name <span className="text-red-400">*</span>
              </label>
              <input
                id="goal-name"
                type="text"
                value={goalFormData.name}
                onChange={(e) => {
                  setGoalFormData({ ...goalFormData, name: e.target.value });
                  if (goalFormErrors.name) setGoalFormErrors({ ...goalFormErrors, name: '' });
                }}
                required
                className={`input-glass w-full ${goalFormErrors.name ? 'border-red-400 border-2' : ''}`}
                placeholder="e.g., Mexico Trip, PS5 Purchase"
                aria-invalid={!!goalFormErrors.name}
                aria-describedby={goalFormErrors.name ? 'name-error' : undefined}
              />
              {goalFormErrors.name && (
                <p id="name-error" className="text-red-300 text-sm mt-1 flex items-center" role="alert">
                  <span className="mr-1">⚠️</span>
                  {goalFormErrors.name}
                </p>
              )}
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="goal-target-amount" className="block text-white/90 font-semibold mb-2 text-sm">
                  Target Amount (CAD) <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 font-semibold">$</span>
                  <input
                    id="goal-target-amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={goalFormData.targetAmount}
                    onChange={(e) => {
                      setGoalFormData({ ...goalFormData, targetAmount: e.target.value });
                      if (goalFormErrors.targetAmount) setGoalFormErrors({ ...goalFormErrors, targetAmount: '' });
                    }}
                    required
                    className={`input-glass w-full pl-8 ${goalFormErrors.targetAmount ? 'border-red-400 border-2' : ''}`}
                    placeholder="0.00"
                    aria-invalid={!!goalFormErrors.targetAmount}
                    aria-describedby={goalFormErrors.targetAmount ? 'target-amount-error' : undefined}
                  />
                </div>
                {goalFormErrors.targetAmount && (
                  <p id="target-amount-error" className="text-red-300 text-sm mt-1 flex items-center" role="alert">
                    <span className="mr-1">⚠️</span>
                    {goalFormErrors.targetAmount}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="goal-due-date" className="block text-white/90 font-semibold mb-2 text-sm">
                  Due Date (Optional)
                </label>
                <input
                  id="goal-due-date"
                  type="date"
                  value={goalFormData.dueDate}
                  onChange={(e) => setGoalFormData({ ...goalFormData, dueDate: e.target.value })}
                  className="input-glass w-full"
                />
              </div>
            </div>
            <div className="flex space-x-4 pt-2">
              <Button type="submit" variant="primary" className="flex-1">
                {editingGoalId ? '💾 Update Goal' : '➕ Add Goal'}
              </Button>
              <Button type="button" variant="outline" onClick={resetGoalForm}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Withdrawal Form - Show before Contribution Form */}
      {showWithdrawalForm && selectedGoalId && (
        <Card className="mb-8 slide-up border-2 border-orange-400/50" id="withdrawal-form">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
            <span className="mr-2">💸</span>
            Withdraw Money from Goal: {goals.find(g => g.id === selectedGoalId)?.name || 'Goal'}
          </h2>
          {!authenticated && (
            <div className="mb-4 p-4 bg-red-500/20 rounded-lg border border-red-400/30">
              <p className="text-red-300 text-sm font-semibold">
                ⚠️ You must be logged in to withdraw money from goals. Please log in first.
              </p>
            </div>
          )}
          {(() => {
            const selectedGoal = goals.find(g => g.id === selectedGoalId);
            const currentSaved = selectedGoal ? parseFloat(selectedGoal.savedAmount || 0) : 0;
            return (
              <div className="mb-4 p-4 bg-gradient-to-r from-orange-500/20 to-orange-400/10 rounded-lg border border-orange-400/30">
                <p className="text-white/80 text-sm mb-1">Currently Saved in Goal:</p>
                <p className="text-3xl font-bold text-orange-300">{formatCurrency(currentSaved)}</p>
                <p className="text-white/60 text-xs mt-2">
                  💸 Withdrawing money will move it back to your available funds for expenses
                </p>
                {currentSaved <= 0 && (
                  <div className="mt-2 p-3 bg-red-500/20 rounded-lg border border-red-400/30">
                    <p className="text-red-300 text-xs font-semibold">
                      ⚠️ This goal has no money saved. You cannot withdraw from it.
                    </p>
                  </div>
                )}
              </div>
            );
          })()}
          <form onSubmit={handleWithdrawalSubmit} className="space-y-4">
            <div>
              <label className="block text-white/90 font-semibold mb-2 text-sm">
                Amount to Withdraw (CAD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 font-semibold">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={withdrawalAmount}
                  onChange={(e) => setWithdrawalAmount(e.target.value)}
                  required
                  className="input-glass w-full pl-8 text-lg"
                  placeholder="0.00"
                  max={(() => {
                    const selectedGoal = goals.find(g => g.id === selectedGoalId);
                    return selectedGoal ? parseFloat(selectedGoal.savedAmount || 0) : 0;
                  })()}
                />
              </div>
              {withdrawalAmount && (() => {
                const selectedGoal = goals.find(g => g.id === selectedGoalId);
                const currentSaved = selectedGoal ? parseFloat(selectedGoal.savedAmount || 0) : 0;
                const amount = parseFloat(withdrawalAmount);
                if (amount > currentSaved) {
                  return (
                    <p className="text-red-300 text-sm mt-1 flex items-center">
                      <span className="mr-1">⚠️</span>
                      Cannot withdraw more than saved! Maximum: {formatCurrency(currentSaved)}
                    </p>
                  );
                }
                if (amount > 0 && amount <= currentSaved) {
                  return (
                    <p className="text-orange-300 text-sm mt-1 flex items-center">
                      <span className="mr-1">✓</span>
                      Will withdraw {formatCurrency(amount)} from this goal
                    </p>
                  );
                }
                return null;
              })()}
              {(() => {
                const selectedGoal = goals.find(g => g.id === selectedGoalId);
                const currentSaved = selectedGoal ? parseFloat(selectedGoal.savedAmount || 0) : 0;
                if (currentSaved > 0) {
                  return (
                    <div className="flex gap-2 mt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setWithdrawalAmount((currentSaved * 0.25).toFixed(2))}
                        className="text-xs py-1"
                      >
                        25%
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setWithdrawalAmount((currentSaved * 0.5).toFixed(2))}
                        className="text-xs py-1"
                      >
                        50%
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setWithdrawalAmount((currentSaved * 0.75).toFixed(2))}
                        className="text-xs py-1"
                      >
                        75%
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setWithdrawalAmount(currentSaved.toFixed(2))}
                        className="text-xs py-1"
                      >
                        All
                      </Button>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
            <div className="flex space-x-4">
              <Button 
                type="submit" 
                variant="primary" 
                className="flex-1 text-lg py-3" 
                disabled={
                  !withdrawalAmount || 
                  withdrawalAmount.trim() === '' ||
                  isNaN(parseFloat(withdrawalAmount)) || 
                  parseFloat(withdrawalAmount) <= 0 ||
                  (() => {
                    const selectedGoal = goals.find(g => g.id === selectedGoalId);
                    const currentSaved = selectedGoal ? parseFloat(selectedGoal.savedAmount || 0) : 0;
                    return parseFloat(withdrawalAmount) > currentSaved;
                  })()
                }
              >
                💸 Withdraw Money from Goal
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setShowWithdrawalForm(false);
                  setSelectedGoalId(null);
                  setWithdrawalAmount('');
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Contribution Form - Show before Budgets Section */}
      {showContributionForm && selectedGoalId && (
        <Card className="mb-8 slide-up border-2 border-green-400/50" id="contribution-form">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
            <span className="mr-2">💰</span>
            Add Money to Goal: {goals.find(g => g.id === selectedGoalId)?.name || 'Goal'}
          </h2>
          {!authenticated && (
            <div className="mb-4 p-4 bg-red-500/20 rounded-lg border border-red-400/30">
              <p className="text-red-300 text-sm font-semibold">
                ⚠️ You must be logged in to add money to goals. Please log in first.
              </p>
            </div>
          )}
          <div className="mb-4 p-4 bg-gradient-to-r from-green-500/20 to-green-400/10 rounded-lg border border-green-400/30">
            <p className="text-white/80 text-sm mb-1">Available Funds to Transfer:</p>
            <p className="text-3xl font-bold text-green-300">{formatCurrency(availableFunds)}</p>
            <p className="text-white/60 text-xs mt-2">
              💰 Available funds = Total Saved (Income - Expenses) - Money already in goals
            </p>
            {availableFunds <= 0 && (
              <div className="mt-2 p-3 bg-orange-500/20 rounded-lg border border-orange-400/30">
                <p className="text-orange-300 text-xs font-semibold mb-1">
                  ⚠️ You currently have no available funds
                </p>
                <p className="text-orange-200/80 text-xs">
                  Available funds = (Income - Expenses) - Money in goals. 
                  You can still add money to track your goal progress manually.
                </p>
              </div>
            )}
          </div>
          <form onSubmit={handleContributionSubmit} className="space-y-4">
            <div>
              <label className="block text-white/90 font-semibold mb-2 text-sm">
                Amount to Transfer (CAD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 font-semibold">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={contributionAmount}
                  onChange={(e) => setContributionAmount(e.target.value)}
                  required
                  className="input-glass w-full pl-8 text-lg"
                  placeholder="0.00"
                  max={availableFunds}
                />
              </div>
              {contributionAmount && parseFloat(contributionAmount) > availableFunds && (
                <p className="text-red-300 text-sm mt-1 flex items-center">
                  <span className="mr-1">⚠️</span>
                  Amount exceeds available funds! Maximum: {formatCurrency(availableFunds)}
                </p>
              )}
              {contributionAmount && parseFloat(contributionAmount) > 0 && parseFloat(contributionAmount) <= availableFunds && (
                <p className="text-green-300 text-sm mt-1 flex items-center">
                  <span className="mr-1">✓</span>
                  Will transfer {formatCurrency(parseFloat(contributionAmount))} to this goal
                </p>
              )}
              {availableFunds > 0 && (
                <div className="flex gap-2 mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setContributionAmount((availableFunds * 0.25).toFixed(2))}
                    className="text-xs py-1"
                  >
                    25%
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setContributionAmount((availableFunds * 0.5).toFixed(2))}
                    className="text-xs py-1"
                  >
                    50%
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setContributionAmount((availableFunds * 0.75).toFixed(2))}
                    className="text-xs py-1"
                  >
                    75%
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setContributionAmount(availableFunds.toFixed(2))}
                    className="text-xs py-1"
                  >
                    All
                  </Button>
                </div>
              )}
            </div>
            <div className="flex space-x-4">
              <Button 
                type="submit" 
                variant="primary" 
                className="flex-1 text-lg py-3" 
                disabled={
                  !contributionAmount || 
                  contributionAmount.trim() === '' ||
                  isNaN(parseFloat(contributionAmount)) || 
                  parseFloat(contributionAmount) <= 0
                }
              >
                💰 Transfer Money to Goal
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setShowContributionForm(false);
                  setSelectedGoalId(null);
                  setContributionAmount('');
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Budgets Section */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl md:text-4xl font-bold text-white flex items-center">
            <span className="mr-3 text-4xl">📈</span> Budgets
        </h2>
          <div className="hidden md:block px-4 py-2 bg-blue-500/20 rounded-lg border border-blue-400/30">
            <p className="text-xs text-blue-300">
              💡 Budgets automatically track spending. Use negative expense amounts for refunds.
            </p>
          </div>
        </div>
        
        {budgets.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {budgets.map((budget, index) => {
              const spent = getSpentAmount(budget.category);
              const remaining = getRemainingBudget(budget);
              const percentage = spent > 0 ? (spent / parseFloat(budget.amount)) * 100 : 0;
              const hasRefunds = spent < 0;
              
              return (
                <Card key={budget.id} className="slide-up hover:scale-[1.02] transition-transform duration-300" style={{ animationDelay: `${0.1 * index}s` }}>
                  <div className="mb-6">
                  <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-white mb-2">{budget.category}</h3>
                        <div className="flex items-center gap-4 mb-3">
                          <div className="px-3 py-1.5 bg-white/10 rounded-lg border border-white/20">
                            <p className="text-xs text-white/60 uppercase tracking-wide mb-0.5">Budget Limit</p>
                            <p className="text-lg font-bold text-white">
                              {formatCurrency(parseFloat(budget.amount))}
                      </p>
                    </div>
                          <div className={`px-3 py-1.5 rounded-lg border ${
                            hasRefunds 
                              ? 'bg-green-500/20 border-green-400/30' 
                              : 'bg-red-500/20 border-red-400/30'
                          }`}>
                            <p className={`text-xs uppercase tracking-wide mb-0.5 ${
                              hasRefunds ? 'text-green-300/80' : 'text-red-300/80'
                            }`}>
                              {hasRefunds ? 'Net Spent' : 'Spent'}
                            </p>
                            <p className={`text-lg font-bold ${
                              hasRefunds ? 'text-green-300' : 'text-red-300'
                            }`}>
                              {formatCurrency(Math.abs(spent))}
                              {hasRefunds && <span className="text-xs ml-1">(Refunds applied)</span>}
                            </p>
                          </div>
                        </div>
                    </div>
                  </div>
                  
                    {/* Progress Bar */}
                  <div className="mb-4">
                      <div className="w-full bg-white/10 rounded-full h-4 shadow-inner overflow-hidden">
                        {spent > 0 && (
                      <div
                            className={`h-4 rounded-full transition-all duration-700 ease-out ${
                          percentage > 100
                                ? 'bg-gradient-to-r from-red-600 via-red-500 to-red-600'
                            : percentage > 80
                                ? 'bg-gradient-to-r from-orange-500 via-orange-400 to-orange-500'
                                : 'bg-gradient-to-r from-green-500 via-green-400 to-green-500'
                        }`}
                        style={{ 
                          width: `${Math.min(percentage, 100)}%`,
                              boxShadow: percentage > 90 ? '0 0 15px rgba(239, 68, 68, 0.6)' : 'none'
                        }}
                      ></div>
                        )}
                    </div>
                      <div className="flex justify-between items-center mt-3">
                        <div className="flex items-center gap-2">
                          {spent > 0 ? (
                            <>
                              <span className={`text-sm font-bold ${
                                percentage > 100 ? 'text-red-300' : percentage > 80 ? 'text-orange-300' : 'text-green-300'
                              }`}>
                                {percentage.toFixed(1)}%
                              </span>
                              <span className="text-xs text-white/60">used</span>
                            </>
                          ) : (
                            <span className="text-sm font-bold text-green-300">
                              ↩️ Refunds exceed expenses
                            </span>
                          )}
                        </div>
                        <div className={`px-3 py-1.5 rounded-lg ${
                          remaining >= 0 
                            ? 'bg-green-500/20 border border-green-400/30' 
                            : 'bg-red-500/20 border border-red-400/30'
                        }`}>
                          <p className={`text-sm font-bold flex items-center gap-1 ${
                        remaining >= 0 ? 'text-green-300' : 'text-red-300'
                      }`}>
                            {remaining >= 0 ? '✓' : '⚠️'} 
                            <span>{remaining >= 0 ? 'Remaining' : 'Over Budget'}:</span>
                            <span>{formatCurrency(Math.abs(remaining))}</span>
                      </p>
                        </div>
                    </div>
                  </div>
                  
                    {/* Info Box */}
                    <div className="mb-4 p-3 bg-blue-500/10 rounded-lg border border-blue-400/20">
                      <p className="text-xs text-blue-300/80">
                        💡 Spending is automatically tracked from expenses. Use negative amounts for refunds to reduce the spent total.
                      </p>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
                    <Button
                      variant="secondary"
                      onClick={() => handleBudgetEdit(budget)}
                        className="px-5 py-2.5 text-sm font-semibold"
                    >
                        ✏️ Edit Budget
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleBudgetDeleteClick(budget)}
                        className="px-5 py-2.5 text-sm font-semibold"
                    >
                        🗑️ Delete
                    </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="py-16">
            <div className="text-center text-white/60">
              <span className="text-7xl mb-6 block">📈</span>
              <p className="text-xl font-semibold mb-2 text-white/80">No budgets set yet</p>
              <p className="text-sm mb-6">Create a budget to track your spending by category</p>
              <Button
                variant="primary"
                onClick={() => setShowBudgetForm(true)}
                className="px-6 py-3"
              >
                ➕ Create Your First Budget
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Savings Goals Section */}
      <div>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 flex items-center">
          <span className="mr-3 text-4xl">🎯</span> Savings Goals
        </h2>
        {goals.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goalsData.map((goal, index) => (
              <Card key={goal.id} className="slide-up hover:scale-[1.02] transition-transform duration-300" style={{ animationDelay: `${0.1 * index}s` }}>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-white mb-4">{goal.name}</h3>
                  <div className="mb-4">
                  <ResponsiveContainer width="100%" height={200}>
                    <RadialBarChart 
                      cx="50%" 
                      cy="50%" 
                      innerRadius="60%" 
                      outerRadius="90%" 
                      data={[{ ...goal, value: goal.percentage }]}
                      startAngle={90}
                      endAngle={-270}
                    >
                      <RadialBar 
                        dataKey="value" 
                        fill="#00AEEF"
                        cornerRadius={10}
                        animationDuration={1000}
                      />
                      <text 
                        x="50%" 
                        y="50%" 
                        textAnchor="middle" 
                        dominantBaseline="middle" 
                        fill="white"
                          fontSize="28"
                        fontWeight="bold"
                      >
                        {goal.percentage.toFixed(0)}%
                      </text>
                    </RadialBarChart>
                  </ResponsiveContainer>
                  </div>
                  <div className="space-y-3 mb-4">
                    <div className="px-4 py-2 bg-green-500/20 rounded-lg border border-green-400/30">
                      <p className="text-xs text-green-300/80 uppercase tracking-wide mb-1">Saved</p>
                      <p className="text-lg font-bold text-green-300">
                        {formatCurrency(parseFloat(goal.savedAmount || 0))}
                      </p>
                    </div>
                    <div className="px-4 py-2 bg-white/10 rounded-lg border border-white/20">
                      <p className="text-xs text-white/60 uppercase tracking-wide mb-1">Target</p>
                      <p className="text-lg font-bold text-white">
                        {formatCurrency(parseFloat(goal.targetAmount))}
                      </p>
                    </div>
                    {goal.dueDate && (
                      <div className="px-4 py-2 bg-blue-500/20 rounded-lg border border-blue-400/30">
                        <p className="text-xs text-blue-300/80">
                          📅 Due: {new Date(goal.dueDate).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2 pt-4 border-t border-white/10">
                    <div className="flex space-x-2">
                      <Button
                        variant="primary"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('Add Money button clicked for goal:', goal.id, goal.name);
                          setSelectedGoalId(goal.id);
                          setShowContributionForm(true);
                          setShowWithdrawalForm(false);
                          // Scroll to contribution form after a brief delay
                          setTimeout(() => {
                            const formElement = document.getElementById('contribution-form');
                            if (formElement) {
                              formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }
                          }, 100);
                        }}
                        className="flex-1 text-sm font-bold py-2.5"
                        type="button"
                      >
                        💰 Add Money
                      </Button>
                      {parseFloat(goal.savedAmount || 0) > 0 && (
                        <Button
                          variant="secondary"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('Withdraw Money button clicked for goal:', goal.id, goal.name);
                            setSelectedGoalId(goal.id);
                            setShowWithdrawalForm(true);
                            setShowContributionForm(false);
                            // Scroll to withdrawal form after a brief delay
                            setTimeout(() => {
                              const formElement = document.getElementById('withdrawal-form');
                              if (formElement) {
                                formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                              }
                            }, 100);
                          }}
                          className="flex-1 text-sm font-bold py-2.5"
                          type="button"
                        >
                          💸 Withdraw
                        </Button>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="secondary"
                        onClick={() => handleGoalEdit(goal)}
                        className="flex-1 px-4 py-2.5 text-sm"
                        aria-label="Edit goal"
                      >
                        ✏️ Edit
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleGoalDeleteClick(goal)}
                        className="flex-1 px-4 py-2.5 text-sm"
                        aria-label="Delete goal"
                      >
                        🗑️ Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="py-16">
            <div className="text-center text-white/60">
              <span className="text-7xl mb-6 block">🎯</span>
              <p className="text-xl font-semibold mb-2 text-white/80">No savings goals yet</p>
              <p className="text-sm mb-6">Set a goal and track your progress towards it</p>
              <Button
                variant="secondary"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Create Your First Goal button clicked');
                  console.log('Current showGoalForm state:', showGoalForm);
                  setShowGoalForm(true);
                  console.log('Set showGoalForm to true');
                  // Scroll to form after a brief delay
                  setTimeout(() => {
                    const formElement = document.getElementById('savings-goal-form');
                    if (formElement) {
                      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }, 150);
                }}
                className="px-6 py-3"
                type="button"
              >
                ➕ Create Your First Goal
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Delete Budget Modal */}
      <Modal
        isOpen={deleteBudgetModalOpen}
        onClose={() => {
          setDeleteBudgetModalOpen(false);
          setBudgetToDelete(null);
        }}
        title="Confirm Delete Budget"
        message={
          budgetToDelete
            ? `Are you sure you want to delete the budget for "${budgetToDelete.category}" (${formatCurrency(parseFloat(budgetToDelete.amount))})? This action cannot be undone.`
            : ''
        }
        confirmText="Yes"
        cancelText="No"
        onConfirm={handleBudgetDeleteConfirm}
        type="danger"
      />

      {/* Delete Goal Modal */}
      <Modal
        isOpen={deleteGoalModalOpen}
        onClose={() => {
          setDeleteGoalModalOpen(false);
          setGoalToDelete(null);
        }}
        title="Confirm Delete Savings Goal"
        message={
          goalToDelete
            ? `Are you sure you want to delete the savings goal "${goalToDelete.name}"? This action cannot be undone.`
            : ''
        }
        confirmText="Yes"
        cancelText="No"
        onConfirm={handleGoalDeleteConfirm}
        type="danger"
      />
    </div>
  );
};

export default FinancialPlanning;




