import { useState, useEffect } from 'react';
import { getTotals } from '../utils/database';
import Card from '../components/Card';
import ChartContainer from '../components/ChartContainer';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { isAuthenticated } from '../utils/auth';
import { manualRefreshSession } from '../utils/sessionKeepAlive';
import { formatDateEST, parseLocalDate, getTodayDateEST } from '../utils/dateUtils';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell, RadialBarChart, RadialBar 
} from 'recharts';

const Dashboard = () => {
  const [data, setData] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    totalSaved: 0,
    categoryBreakdown: {},
    recentTransactions: [],
    budgets: [],
    savingsGoals: [],
    upcomingExpenses: [],
    avgBudgetProgress: 0,
    totalUpcoming: 0,
    allIncomes: [],
    allExpenses: [],
  });
  const [sessionExpired, setSessionExpired] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    // Default to current month in format YYYY-MM
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const loadData = async () => {
    try {
      console.log('🔄 Dashboard: Loading data...');
      
      // Check if user is authenticated first
      const authenticated = await isAuthenticated();
      console.log('Dashboard: Authenticated?', authenticated);
      
      if (!authenticated) {
        console.warn('⚠️ Dashboard: User not authenticated');
        setSessionExpired(true);
        return;
      }
      
      setSessionExpired(false);
      console.log('Dashboard: Fetching totals...');
      const totals = await getTotals();
      console.log('Dashboard: Totals received:', totals);
      console.log('Dashboard: Budgets in totals:', totals.budgets);
      console.log('Dashboard: Budgets count:', (totals.budgets || []).length);
      // Store all incomes and expenses for month filtering
      setData({
        ...totals,
        allIncomes: totals.allIncomes || totals.monthlyIncomes || [],
        allExpenses: totals.allExpenses || totals.monthlyExpenses || [],
        budgets: totals.budgets || [], // Ensure budgets are included
      });
    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
      console.error('Error stack:', error.stack);
      
      // Check if error is due to authentication
      const authenticated = await isAuthenticated();
      console.log('Dashboard: After error, authenticated?', authenticated);
      
      if (!authenticated) {
        setSessionExpired(true);
      }
      
      // Set default empty data on error
      setData({
        totalIncome: 0,
        totalExpenses: 0,
        totalSaved: 0,
        categoryBreakdown: {},
        recentTransactions: [],
        budgets: [],
        savingsGoals: [],
        upcomingExpenses: [],
        avgBudgetProgress: 0,
        totalUpcoming: 0,
        allIncomes: [],
        allExpenses: [],
      });
    }
  };

  useEffect(() => {
    // Load data immediately
    loadData();
    
    // Also try to refresh session first, then load data
    const initializeData = async () => {
      try {
        await manualRefreshSession();
        await loadData();
      } catch (error) {
        console.error('Error initializing data:', error);
        loadData(); // Fallback to regular load
      }
    };
    
    // Small delay to ensure auth is ready
    const timeout = setTimeout(initializeData, 500);
    
    // Refresh every 10 seconds to catch expense/budget changes
    const interval = setInterval(loadData, 10000);
    
    // Reload data when page becomes visible (user switches back to tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('📊 Dashboard visible - reloading data');
        loadData();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Reload data when window gains focus
    const handleFocus = () => {
      console.log('📊 Dashboard focused - reloading data');
      loadData();
    };
    window.addEventListener('focus', handleFocus);
    
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Force re-render when selected month changes so charts and budgets update
  useEffect(() => {
    // The calculations already use selectedMonth, but we need to trigger a re-render
    // This ensures all derived data (charts, budgets) recalculate
    if (data.allIncomes || data.allExpenses) {
      setData(prevData => ({ ...prevData }));
    }
  }, [selectedMonth]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(amount);
  };

  // Prepare daily data for line chart (selected month) - with cumulative totals
  const getDailyData = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const selectedDate = new Date(year, month - 1, 1);
    const daysInMonth = new Date(year, month, 0).getDate();
    
    const dailyData = [];
    // Filter incomes and expenses for selected month
    const monthlyIncomes = (data.allIncomes || []).filter(inc => {
      if (!inc.date) return false;
      const incDate = parseLocalDate(inc.date);
      if (!incDate) return false;
      return incDate.getMonth() === month - 1 && incDate.getFullYear() === year;
    });
    const monthlyExpenses = (data.allExpenses || []).filter(exp => {
      if (!exp.date) return false;
      const expDate = parseLocalDate(exp.date);
      if (!expDate) return false;
      return expDate.getMonth() === month - 1 && expDate.getFullYear() === year;
    });
    
    let cumulativeIncome = 0;
    let cumulativeExpenses = 0;
    
    // Debug: Log filtered data
    console.log('📊 Chart Debug - Monthly Incomes:', monthlyIncomes.length, monthlyIncomes);
    console.log('📊 Chart Debug - Monthly Expenses:', monthlyExpenses.length, monthlyExpenses);
    
    for (let day = 1; day <= daysInMonth; day++) {
      // Generate date string in local timezone format
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      // Match by comparing parsed dates (handles timezone correctly)
      const dayIncome = monthlyIncomes
        .filter(inc => {
          if (!inc.date) return false;
          const incDate = parseLocalDate(inc.date);
          if (!incDate) return false;
          const matches = incDate.getDate() === day && 
                 incDate.getMonth() === month - 1 && 
                 incDate.getFullYear() === year;
          if (matches && day <= 3) {
            console.log(`✅ Income match day ${day}:`, inc.date, inc.amount);
          }
          return matches;
        })
        .reduce((sum, inc) => sum + parseFloat(inc.amount || 0), 0);
      
      const dayExpense = monthlyExpenses
        .filter(exp => {
          if (!exp.date) return false;
          const expDate = parseLocalDate(exp.date);
          if (!expDate) return false;
          const matches = expDate.getDate() === day && 
                 expDate.getMonth() === month - 1 && 
                 expDate.getFullYear() === year;
          if (matches) {
            console.log(`✅ Expense match day ${day}:`, exp.date, exp.amount, exp.name);
          }
          return matches;
        })
          .reduce((sum, exp) => {
            const amount = parseFloat(exp.amount || 0);
            // Use actual amount - refunds (negative) reduce the cumulative total
            // This matches how budgets calculate spending
            return sum + amount;
          }, 0);
      
      // Add to cumulative totals
      cumulativeIncome += dayIncome;
      cumulativeExpenses += dayExpense; // Can go down if refunds exceed expenses
      
      dailyData.push({
        day: day,
        date: dateStr,
        income: cumulativeIncome,
        expenses: cumulativeExpenses, // Cumulative spending (always positive for chart display)
      });
    }
    
    console.log('📊 Chart Debug - Final dailyData:', dailyData);
    
    return dailyData;
  };

  const dailyData = getDailyData();

  // Category data for pie chart (for selected month)
  const getCategoryData = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const monthlyExpenses = (data.allExpenses || []).filter(exp => {
      if (!exp.date) return false;
      const expDate = parseLocalDate(exp.date);
      if (!expDate) return false;
      return expDate.getMonth() === month - 1 && expDate.getFullYear() === year;
    });
    
    const categoryBreakdown = {};
    monthlyExpenses.forEach(exp => {
      const category = exp.category || 'Uncategorized';
      categoryBreakdown[category] = (categoryBreakdown[category] || 0) + parseFloat(exp.amount || 0);
    });
    
    // Filter out categories with zero or negative net spending for pie chart
    // (refunds can make categories negative, which doesn't make sense for a pie chart)
    return Object.entries(categoryBreakdown)
      .filter(([category, amount]) => amount > 0) // Only show positive spending
      .map(([category, amount]) => ({
    category,
    amount: parseFloat(amount.toFixed(2)),
  }));
  };

  const categoryData = getCategoryData();

  const pieColors = ['#FF6A00', '#00AEEF', '#002145', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#9C27B0'];

  // Budget progress data (for selected month)
  const getBudgetProgressData = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const selectedDate = new Date(year, month - 1, 1);
    const budgets = data.budgets || [];
    const allExpenses = data.allExpenses || [];
    
    console.log('🔍 getBudgetProgressData - All budgets:', budgets);
    console.log('🔍 getBudgetProgressData - All expenses count:', allExpenses.length);
    
    // Calculate the end of the selected month
    const selectedMonthEnd = new Date(year, month, 0, 23, 59, 59, 999);
    
    return budgets
      .filter(budget => {
        // Only show budgets that were active during the selected month
        // Check start date: budget must have started by the end of selected month
        let budgetStart = null;
        if (budget.startDate) {
          budgetStart = parseLocalDate(budget.startDate);
          if (budgetStart) {
            budgetStart.setHours(0, 0, 0, 0);
            // Budget hasn't started yet
            if (budgetStart > selectedMonthEnd) return false;
          }
        } else if (budget.createdAt) {
          budgetStart = new Date(budget.createdAt);
          budgetStart.setHours(0, 0, 0, 0);
          // Budget hasn't started yet
          if (budgetStart > selectedMonthEnd) return false;
        }
        
        // Check expiration date: budget must not have expired before the start of selected month
        if (budget.expirationDate) {
          const expirationDate = parseLocalDate(budget.expirationDate);
          if (expirationDate) {
            expirationDate.setHours(23, 59, 59, 999);
            // Budget expired before selected month started
            if (expirationDate < selectedDate) return false;
          }
        }
        
        // Budget is active during selected month
        return true;
      })
      .map(budget => {
        // Calculate cumulative spending from budget start date to expiration (or current date)
        // Budgets always show cumulative spending, not filtered by selected month
        // Start date: use startDate if set, otherwise use createdAt
        // This must match FinancialPlanning.jsx getSpentAmount logic exactly
        let startDate = null;
        if (budget.startDate) {
          startDate = parseLocalDate(budget.startDate);
          if (startDate) {
            startDate.setHours(0, 0, 0, 0); // Start of start date
          }
        } else if (budget.createdAt) {
          startDate = new Date(budget.createdAt);
          startDate.setHours(0, 0, 0, 0); // Start of creation day
        }
        
        // End date: expiration date if set, otherwise use current date (never expires)
        // This must match FinancialPlanning.jsx getSpentAmount logic exactly
        let endDate = new Date();
        endDate.setHours(23, 59, 59, 999); // End of today
        
        if (budget.expirationDate) {
          const expirationDate = parseLocalDate(budget.expirationDate);
          if (expirationDate) {
            expirationDate.setHours(23, 59, 59, 999); // End of expiration day
            // Use expiration date if it exists (whether past or future)
            // If expiration is in the future, use it. If in the past, still use it (budget expired).
            // Only if no expiration date, use current date (budget never expires)
            endDate = expirationDate;
          }
        }
        
        // Filter expenses by category first
        const categoryExpenses = allExpenses.filter(exp => {
          const matches = exp.category === budget.category;
          // Debug for ALL categories, not just Shopping
          if (matches) {
            console.log(`✅ Found ${budget.category} expense:`, {
              name: exp.name || exp.description,
              category: exp.category,
              amount: exp.amount,
              date: exp.date,
              budgetCategory: budget.category,
              match: exp.category === budget.category
            });
          }
          // Also log mismatches for Bills & Utilities to debug
          if (budget.category === 'Bills & Utilities' && !matches && exp.category) {
            console.log(`❌ Bills & Utilities budget - expense category mismatch:`, {
              expenseCategory: exp.category,
              budgetCategory: budget.category,
              expenseCategoryLength: exp.category?.length,
              budgetCategoryLength: budget.category?.length,
              exactMatch: exp.category === budget.category,
              expense: exp
            });
          }
          return matches;
        });
        
        console.log(`📊 Budget "${budget.category}": Found ${categoryExpenses.length} expenses in category`);
        
        // Then filter by date range and calculate spent
        // IMPORTANT: This logic must match FinancialPlanning.jsx getSpentAmount exactly
        const spent = categoryExpenses
          .filter(exp => {
            if (!exp || !exp.date) {
              console.warn('⚠️ Expense missing date:', exp);
              return false;
            }
            
            // Use same date parsing as FinancialPlanning.jsx - use parseLocalDate for consistency
            const expDate = parseLocalDate(exp.date);
            if (!expDate) {
              if (budget.category === 'Shopping') {
                console.log('❌ Could not parse expense date:', exp.date);
              }
              return false;
            }
            
            // Only count expenses within the budget's active period
            // Start date: expenses on or after start date are included
            // End date: expenses on or before end date are included
            if (startDate) {
              const startDateNormalized = new Date(startDate);
              startDateNormalized.setHours(0, 0, 0, 0); // Start of day
              // Exclude expenses before start date (expenses on start date are included)
              if (expDate < startDateNormalized) {
                console.log(`❌ ${budget.category} - Expense before startDate:`, {
                  expenseDate: exp.date,
                  parsedExpenseDate: expDate.toISOString().split('T')[0],
                  startDate: startDateNormalized.toISOString().split('T')[0],
                  expense: exp.name || exp.description
                });
                return false;
              }
            }
            
            // Normalize end date to end of day (23:59:59.999)
            const endDateNormalized = new Date(endDate);
            endDateNormalized.setHours(23, 59, 59, 999);
            // Exclude expenses after end date (expenses on end date are included)
            if (expDate > endDateNormalized) {
              console.log(`❌ ${budget.category} - Expense after endDate:`, {
                expenseDate: exp.date,
                parsedExpenseDate: expDate.toISOString().split('T')[0],
                endDate: endDateNormalized.toISOString().split('T')[0],
                expense: exp.name || exp.description
              });
              return false;
            }
            
            console.log(`✅ ${budget.category} - Counting expense:`, {
              date: exp.date,
              parsedDate: expDate.toISOString().split('T')[0],
              amount: exp.amount,
              name: exp.name || exp.description,
              startDate: startDate ? startDate.toISOString().split('T')[0] : 'null',
              endDate: endDate.toISOString().split('T')[0]
            });
            return true;
          })
          .reduce((sum, exp) => {
            // Match FinancialPlanning.jsx: use actual amount (negative = refunds reduce total)
            const amount = parseFloat(exp.amount || 0);
            // Negative amounts (refunds) subtract from the total
            // Positive amounts (expenses) add to the total
            const result = sum + amount;
            if (budget.category === 'Shopping') {
              console.log(`  Adding expense: ${exp.name || exp.description}, amount: ${amount}, running total: ${result}`);
            }
            return result;
          }, 0);
        
        // Debug logging for ALL budgets
        console.log(`🎯 Budget "${budget.category}":`, {
          category: budget.category,
          createdAt: budget.createdAt,
          startDate: startDate ? startDate.toISOString().split('T')[0] : 'null',
          expirationDate: budget.expirationDate || 'null',
          endDate: endDate.toISOString().split('T')[0],
          totalCategoryExpenses: categoryExpenses.length,
          allExpenseDates: categoryExpenses.map(e => ({ date: e.date, amount: e.amount, name: e.name || e.description })),
          spent: spent,
          budgetAmount: budget.amount,
          remaining: parseFloat(budget.amount) - spent,
          percentage: ((spent / parseFloat(budget.amount || 1)) * 100).toFixed(1) + '%'
        });
      
      const percentage = (spent / parseFloat(budget.amount || 1)) * 100;
      
      let color = '#4CAF50'; // Green
      if (percentage > 100) color = '#FF3B30'; // Red - over budget
      else if (percentage > 90) color = '#FF3B30'; // Red
      else if (percentage > 50) color = '#FFB300'; // Orange
      
      return {
        category: budget.category,
        budget: parseFloat(budget.amount),
        spent: spent,
        remaining: parseFloat(budget.amount) - spent,
        percentage: percentage, // Don't cap at 100% - show over budget
        color,
      };
    });
  };

  const budgetProgressData = getBudgetProgressData();

  // Savings goals data for radial chart
  const savingsGoalsData = (data.savingsGoals || []).map(goal => {
    const percentage = (parseFloat(goal.savedAmount || 0) / parseFloat(goal.targetAmount || 1)) * 100;
    return {
      ...goal,
      percentage: Math.min(percentage, 100),
      fill: '#00AEEF',
    };
  });

  // Upcoming expenses forecast data
  const getUpcomingForecastData = () => {
    const months = [];
    const now = new Date();
    const upcomingExpenses = data.upcomingExpenses || [];
    
    for (let i = 0; i < 6; i++) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const monthName = formatDateEST(monthDate, { month: 'short', year: 'numeric' });
      
      const monthExpenses = upcomingExpenses.filter(exp => {
        const expDate = new Date(exp.dueDate);
        return expDate.getMonth() === monthDate.getMonth() && 
               expDate.getFullYear() === monthDate.getFullYear();
      });
      
      const required = monthExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
      
      // Calculate saved amount (simplified - using current month savings)
      const saved = i === 0 ? Math.max(0, data.totalSaved) : 0;
      
      months.push({
        month: monthName,
        required,
        saved,
        deficit: Math.max(0, required - saved),
      });
    }
    
    return months;
  };

  const forecastData = getUpcomingForecastData();

  // Get expenses for selected budget
  const getBudgetExpenses = (budgetItem) => {
    if (!budgetItem) return [];
    
    const allExpenses = data.allExpenses || [];
    const budgets = data.budgets || [];
    const budget = budgets.find(b => b.category === budgetItem.category);
    
    if (!budget) return [];
    
    // Use same logic as getBudgetProgressData to filter expenses
    let startDate = null;
    if (budget.startDate) {
      startDate = parseLocalDate(budget.startDate);
      if (startDate) {
        startDate.setHours(0, 0, 0, 0);
      }
    } else if (budget.createdAt) {
      startDate = new Date(budget.createdAt);
      startDate.setHours(0, 0, 0, 0);
    }
    
    let endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    
    if (budget.expirationDate) {
      const expirationDate = parseLocalDate(budget.expirationDate);
      if (expirationDate) {
        expirationDate.setHours(23, 59, 59, 999);
        endDate = expirationDate;
      }
    }
    
    return allExpenses
      .filter(exp => {
        if (!exp || !exp.date || exp.category !== budget.category) return false;
        const expDate = parseLocalDate(exp.date);
        if (!expDate) return false;
        
        if (startDate) {
          const startDateNormalized = new Date(startDate);
          startDateNormalized.setHours(0, 0, 0, 0);
          if (expDate < startDateNormalized) return false;
        }
        
        const endDateNormalized = new Date(endDate);
        endDateNormalized.setHours(23, 59, 59, 999);
        if (expDate > endDateNormalized) return false;
        
        return true;
      })
      .sort((a, b) => {
        const dateA = parseLocalDate(a.date);
        const dateB = parseLocalDate(b.date);
        return dateB - dateA; // Most recent first
      });
  };

  // Get pie chart data for budget expenses (grouped by expense name/description)
  // Excludes refunds - only shows actual expenses (positive amounts)
  const getBudgetExpensePieData = (expenses) => {
    const expenseMap = {};
    expenses.forEach(exp => {
      const amount = parseFloat(exp.amount || 0);
      // Skip refunds (negative amounts) - only include actual expenses
      if (amount <= 0) return;
      
      const name = exp.name || exp.description || 'Unnamed Expense';
      if (!expenseMap[name]) {
        expenseMap[name] = {
          name: name,
          amount: 0,
          count: 0
        };
      }
      expenseMap[name].amount += amount;
      expenseMap[name].count += 1;
    });
    
    return Object.values(expenseMap)
      .map(item => ({
        name: item.name.length > 25 ? item.name.substring(0, 25) + '...' : item.name,
        fullName: item.name,
        amount: item.amount,
        count: item.count
      }))
      .sort((a, b) => b.amount - a.amount);
  };

  const budgetExpenses = selectedBudget ? getBudgetExpenses(selectedBudget) : [];
  const budgetPieData = getBudgetExpensePieData(budgetExpenses);
  // Use extended pie colors for budget expenses (more colors for more expense items)
  const extendedPieColors = ['#FF6A00', '#00AEEF', '#002145', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#9C27B0', '#FF9800', '#2196F3'];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 fade-in">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">
            Dashboard
          </h1>
          <p className="text-white/80 text-sm">Overview of your financial health</p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="flex items-center gap-2">
            <label htmlFor="month-select" className="text-white/80 text-sm font-medium">
              View Month:
            </label>
            <input
              id="month-select"
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="input-glass px-3 py-2 text-sm"
              max={`${(() => {
                const now = new Date();
                const estDateStr = now.toLocaleString('en-US', { 
                  timeZone: 'America/New_York',
                  year: 'numeric',
                  month: '2-digit'
                });
                const [month, , year] = estDateStr.split('/');
                return `${year}-${month}`;
              })()}`}
            />
          </div>
          <Button 
            variant="secondary" 
            onClick={async () => {
              console.log('Manual refresh triggered');
              const refreshed = await manualRefreshSession();
              console.log('Session refreshed:', refreshed);
              await loadData();
            }} 
            className="shadow-xl text-sm"
          >
          🔄 Refresh Data
        </Button>
        </div>
      </div>

      {sessionExpired && (
        <Card className="mb-6 border-2 border-orange-400/50 bg-orange-500/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">⚠️</span>
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Session Expired</h3>
                <p className="text-white/80 text-sm">
                  Your session has expired. Please log out and log back in to see your data.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="primary" 
                onClick={async () => {
                  await manualRefreshSession();
                  await loadData();
                }}
                className="shadow-xl"
              >
                🔄 Refresh Session
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => window.location.href = '/login'}
                className="shadow-xl"
              >
                Go to Login
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* KPI Cards - Show selected month totals with carryforward */}
      {(() => {
        const [year, month] = selectedMonth.split('-').map(Number);
        const selectedDate = new Date(year, month - 1, 1);
        
        // Get all incomes and expenses up to and including the selected month
        const incomesUpToMonth = (data.allIncomes || []).filter(inc => {
          if (!inc.date) return false;
          const incDate = parseLocalDate(inc.date);
          if (!incDate) return false;
          const incMonth = new Date(incDate.getFullYear(), incDate.getMonth(), 1);
          return incMonth <= selectedDate;
        });
        
        const expensesUpToMonth = (data.allExpenses || []).filter(exp => {
          if (!exp.date) return false;
          const expDate = parseLocalDate(exp.date);
          if (!expDate) return false;
          const expMonth = new Date(expDate.getFullYear(), expDate.getMonth(), 1);
          return expMonth <= selectedDate;
        });
        
        // Calculate cumulative savings up to selected month
        const cumulativeIncome = incomesUpToMonth.reduce((sum, inc) => sum + parseFloat(inc.amount || 0), 0);
        const cumulativeExpenses = expensesUpToMonth.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
        const cumulativeSaved = cumulativeIncome - cumulativeExpenses;
        
        // Get just the selected month's data
        const monthlyIncomes = (data.allIncomes || []).filter(inc => {
          if (!inc.date) return false;
          const incDate = parseLocalDate(inc.date);
          if (!incDate) return false;
          return incDate.getMonth() === month - 1 && incDate.getFullYear() === year;
        });
        const monthlyExpenses = (data.allExpenses || []).filter(exp => {
          if (!exp.date) return false;
          const expDate = parseLocalDate(exp.date);
          if (!expDate) return false;
          return expDate.getMonth() === month - 1 && expDate.getFullYear() === year;
        });
        const monthIncome = monthlyIncomes.reduce((sum, inc) => sum + parseFloat(inc.amount || 0), 0);
        const monthExpenses = monthlyExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
        const monthSaved = monthIncome - monthExpenses;
        
        // Calculate previous month's savings (carryforward)
        const previousMonth = new Date(year, month - 2, 1);
        const previousIncomes = (data.allIncomes || []).filter(inc => {
          if (!inc.date) return false;
          const incDate = parseLocalDate(inc.date);
          if (!incDate) return false;
          const incMonth = new Date(incDate.getFullYear(), incDate.getMonth(), 1);
          return incMonth < selectedDate;
        });
        const previousExpenses = (data.allExpenses || []).filter(exp => {
          if (!exp.date) return false;
          const expDate = parseLocalDate(exp.date);
          if (!expDate) return false;
          const expMonth = new Date(expDate.getFullYear(), expDate.getMonth(), 1);
          return expMonth < selectedDate;
        });
        const previousSaved = previousIncomes.reduce((sum, inc) => sum + parseFloat(inc.amount || 0), 0) - 
                             previousExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
        
        const monthBudgetProgress = budgetProgressData.length > 0 
          ? budgetProgressData.reduce((sum, b) => sum + b.percentage, 0) / budgetProgressData.length 
          : 0;
        
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="kpi-card slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold opacity-90 uppercase tracking-wide">Monthly Income</h3>
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <span className="text-lg">💰</span>
            </div>
          </div>
              <p className="text-2xl font-bold">{formatCurrency(monthIncome)}</p>
              <p className="text-xs text-white/60 mt-1">All-time: {formatCurrency(data.totalIncome)}</p>
        </div>

        <div className="kpi-card slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold opacity-90 uppercase tracking-wide">Monthly Expenses</h3>
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <span className="text-lg">💸</span>
            </div>
          </div>
              <p className="text-2xl font-bold">{formatCurrency(monthExpenses)}</p>
              <p className="text-xs text-white/60 mt-1">All-time: {formatCurrency(data.totalExpenses)}</p>
        </div>

        <div className="kpi-card slide-up" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold opacity-90 uppercase tracking-wide">Cumulative Saved</h3>
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <span className="text-lg">{cumulativeSaved >= 0 ? '✅' : '⚠️'}</span>
            </div>
          </div>
              <p className={`text-2xl font-bold ${cumulativeSaved >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                {formatCurrency(cumulativeSaved)}
              </p>
              <p className="text-xs text-white/60 mt-1">
                This month: {formatCurrency(monthSaved)} {previousSaved > 0 && `(Carried forward: ${formatCurrency(previousSaved)})`}
          </p>
        </div>

        <div className="kpi-card slide-up" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold opacity-90 uppercase tracking-wide">Budget Progress</h3>
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <span className="text-lg">📊</span>
            </div>
          </div>
              <p className="text-2xl font-bold">{monthBudgetProgress.toFixed(0)}%</p>
        </div>

        <div className="kpi-card slide-up" style={{ animationDelay: '0.5s' }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold opacity-90 uppercase tracking-wide">Upcoming</h3>
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <span className="text-lg">📅</span>
            </div>
          </div>
              <p className="text-2xl font-bold">{formatCurrency(data.totalUpcoming)}</p>
        </div>
      </div>
        );
      })()}

      {/* Charts Row 1: Line Chart and Pie Chart */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <ChartContainer 
          title={`Income vs Expenses - ${(() => {
            const [year, month] = selectedMonth.split('-').map(Number);
            const date = new Date(year, month - 1, 1);
            return formatDateEST(date, { month: 'long', year: 'numeric' });
          })()}`} 
          icon="📈"
        >
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={dailyData} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="day" 
                stroke="rgba(255,255,255,0.7)"
                tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.7)"
                tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }}
              />
              <Tooltip 
                formatter={(value) => formatCurrency(value)}
                contentStyle={{ 
                  backgroundColor: 'rgba(0, 0, 0, 0.85)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: 'white',
                  padding: '10px 14px'
                }}
              />
              <Legend 
                wrapperStyle={{ color: 'white' }}
              />
              <Line 
                type="monotone" 
                dataKey="income" 
                stroke="#00AEEF" 
                strokeWidth={2.5}
                dot={{ fill: '#00AEEF', r: 3 }}
                name="Income"
              />
              <Line 
                type="monotone" 
                dataKey="expenses" 
                stroke="#FF6A00" 
                strokeWidth={2.5}
                dot={{ fill: '#FF6A00', r: 3 }}
                name="Expenses"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer title="Expense by Category" icon="🥧">
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="amount"
                  animationBegin={0}
                  animationDuration={800}
                >
                  {categoryData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={pieColors[index % pieColors.length]}
                      style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name, props) => {
                    const total = categoryData.reduce((sum, item) => sum + item.amount, 0);
                    const percent = ((props.payload.amount / total) * 100).toFixed(1);
                    return [
                      `${props.payload.category}: ${percent}%`,
                      formatCurrency(value)
                    ];
                  }}
                  contentStyle={{ 
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '12px',
                    color: 'white',
                    padding: '12px 16px',
                    fontSize: '14px',
                    fontWeight: '600',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
                  }}
                  itemStyle={{ 
                    color: 'white',
                    padding: '4px 0'
                  }}
                  labelStyle={{ 
                    color: 'rgba(255,255,255,0.9)',
                    fontWeight: '700',
                    marginBottom: '8px',
                    fontSize: '15px'
                  }}
                />
                <Legend 
                  formatter={(value, entry) => {
                    const total = categoryData.reduce((sum, item) => sum + item.amount, 0);
                    const percent = ((entry.payload.amount / total) * 100).toFixed(0);
                    return `${entry.payload.category}: ${percent}%`;
                  }}
                  wrapperStyle={{ color: 'white', paddingTop: '20px', fontSize: '14px' }}
                  iconType="circle"
                  iconSize={12}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-white/60">
              <span className="text-4xl mb-3">📊</span>
              <p className="text-sm">No expense data available</p>
              <p className="text-xs mt-1">Start adding expenses to see your breakdown</p>
            </div>
          )}
        </ChartContainer>
      </div>

      {/* Budget Progress Section */}
      {budgetProgressData.length > 0 && (
        <Card className="mb-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <span className="mr-2 text-lg">📋</span> Budget Progress
          </h2>
          <div className="space-y-4">
            {budgetProgressData.map((item, index) => (
              <div 
                key={item.category} 
                className="glass-card p-4 slide-up cursor-pointer hover:bg-white/10 transition-all duration-200" 
                style={{ animationDelay: `${0.1 * index}s` }}
                onClick={() => setSelectedBudget(item)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-white flex items-center gap-2">
                    {item.category}
                    <span className="text-xs text-white/60">(Click to view expenses)</span>
                  </span>
                  <div className="flex items-center space-x-4 text-sm text-white/80">
                    <span>Budget: {formatCurrency(item.budget)}</span>
                    <span>
                      {item.spent < 0 ? (
                        <span className="text-green-300">Net Spent: {formatCurrency(Math.abs(item.spent))} <span className="text-xs">(Refunds applied)</span></span>
                      ) : (
                    <span>Spent: {formatCurrency(item.spent)}</span>
                      )}
                    </span>
                    <span className={`font-bold ${item.remaining >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                      Remaining: {formatCurrency(item.remaining)}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-white/10 rounded-full h-4 overflow-visible relative">
                  {item.spent < 0 ? (
                    // If refunds exceed expenses, show green bar at 0%
                    <div
                      className="h-4 rounded-full transition-all duration-500 bg-green-500"
                      style={{ 
                        width: '0%',
                        boxShadow: `0 0 10px rgba(34, 197, 94, 0.5)`
                      }}
                    ></div>
                  ) : (
                    <>
                  <div
                    className="h-4 rounded-full transition-all duration-500"
                    style={{ 
                          width: `${Math.min(item.percentage, 100)}%`,
                      backgroundColor: item.color,
                      boxShadow: `0 0 10px ${item.color}50`
                    }}
                  ></div>
                      {item.percentage > 100 && (
                        <div 
                          className="absolute top-0 h-4 bg-red-600 rounded-r-full"
                          style={{ 
                            left: '100%',
                            width: `${Math.min((item.percentage - 100) * 0.2, 20)}%`,
                            maxWidth: '20%'
                          }}
                        ></div>
                      )}
                    </>
                  )}
                </div>
                <p className="text-xs text-white/60 mt-1">
                  {item.spent < 0 ? (
                    <span className="text-green-300 font-semibold">
                      ↩️ Refunds exceed expenses by {formatCurrency(Math.abs(item.spent))}
                    </span>
                  ) : (
                    <>
                      {item.percentage.toFixed(1)}% used
                      {item.percentage > 100 && (
                        <span className="text-red-300 ml-2 font-semibold">
                          (Over by {formatCurrency(item.spent - item.budget)})
                        </span>
                      )}
                    </>
                  )}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Budget Expenses Modal */}
      <Modal
        isOpen={selectedBudget !== null}
        onClose={() => setSelectedBudget(null)}
        title={`${selectedBudget?.category} Budget Expenses`}
        type="alert"
        confirmText="Close"
      >
        {selectedBudget && (
          <div className="space-y-6">
            {/* Budget Summary */}
            <div className="glass-card p-4 bg-white/5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-white/60 text-xs mb-1">Budget</p>
                  <p className="text-white font-bold text-lg">{formatCurrency(selectedBudget.budget)}</p>
                </div>
                <div>
                  <p className="text-white/60 text-xs mb-1">Spent</p>
                  <p className={`font-bold text-lg ${selectedBudget.spent < 0 ? 'text-green-300' : 'text-white'}`}>
                    {formatCurrency(selectedBudget.spent)}
                  </p>
                </div>
                <div>
                  <p className="text-white/60 text-xs mb-1">Remaining</p>
                  <p className={`font-bold text-lg ${selectedBudget.remaining >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                    {formatCurrency(selectedBudget.remaining)}
                  </p>
                </div>
                <div>
                  <p className="text-white/60 text-xs mb-1">Progress</p>
                  <p className="text-white font-bold text-lg">{selectedBudget.percentage.toFixed(1)}%</p>
                </div>
              </div>
            </div>

            {/* Pie Chart */}
            {budgetPieData.length > 0 ? (
              <div>
                <h3 className="text-white font-semibold mb-4 text-lg">Expense Breakdown</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={budgetPieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="amount"
                      animationBegin={0}
                      animationDuration={800}
                    >
                      {budgetPieData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={extendedPieColors[index % extendedPieColors.length]}
                          style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name, props) => {
                        const total = budgetPieData.reduce((sum, item) => sum + item.amount, 0);
                        const percent = ((props.payload.amount / total) * 100).toFixed(1);
                        return [
                          `${props.payload.fullName}: ${percent}%`,
                          formatCurrency(value)
                        ];
                      }}
                      contentStyle={{ 
                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: '12px',
                        color: 'white',
                        padding: '12px 16px',
                        fontSize: '14px',
                        fontWeight: '600',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
                      }}
                    />
                    <Legend 
                      formatter={(value, entry) => {
                        const total = budgetPieData.reduce((sum, item) => sum + item.amount, 0);
                        const percent = ((entry.payload.amount / total) * 100).toFixed(0);
                        return `${entry.payload.fullName}: ${percent}%`;
                      }}
                      wrapperStyle={{ color: 'white', paddingTop: '20px', fontSize: '13px' }}
                      iconType="circle"
                      iconSize={12}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-8 text-white/60">
                <span className="text-4xl mb-3 block">📊</span>
                <p className="text-sm">No expenses in this budget yet</p>
                <p className="text-xs mt-1 text-white/50">(Refunds are excluded from the chart)</p>
              </div>
            )}

            {/* Expenses List */}
            {budgetExpenses.length > 0 && (
              <div>
                <h3 className="text-white font-semibold mb-4 text-lg">All Expenses ({budgetExpenses.length})</h3>
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {budgetExpenses.map((exp, idx) => {
                    const amount = parseFloat(exp.amount || 0);
                    const isRefund = amount < 0;
                    return (
                      <div 
                        key={exp.id || idx} 
                        className="glass-card p-3 flex items-center justify-between hover:bg-white/10 transition-colors"
                      >
                        <div className="flex-1">
                          <p className="text-white font-medium">{exp.name || exp.description || 'Unnamed Expense'}</p>
                          <p className="text-white/60 text-xs mt-1">
                            {formatDateEST(exp.date)}
                            {exp.description && exp.description !== exp.name && (
                              <span className="ml-2">• {exp.description}</span>
                            )}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold text-lg ${isRefund ? 'text-green-300' : 'text-red-300'}`}>
                            {isRefund ? (
                              <span className="flex items-center gap-1">
                                <span>↩️</span>
                                <span>+{formatCurrency(Math.abs(amount))}</span>
                              </span>
                            ) : (
                              <span>-{formatCurrency(amount)}</span>
                            )}
                          </p>
                          {isRefund && (
                            <p className="text-green-300/80 text-xs mt-1">Refund</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Savings Goals and Upcoming Expenses Row */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <Card>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <span className="mr-2 text-lg">🎯</span> Savings Goals
          </h2>
          {savingsGoalsData.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {savingsGoalsData.map((goal, index) => (
                <div key={goal.id} className="glass-card p-4 text-center slide-up" style={{ animationDelay: `${0.1 * index}s` }}>
                  <h3 className="font-semibold text-white mb-2 text-sm">{goal.name}</h3>
                  <ResponsiveContainer width="100%" height={120}>
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
                        fill={goal.fill}
                        cornerRadius={10}
                        animationDuration={1000}
                      />
                      <text 
                        x="50%" 
                        y="50%" 
                        textAnchor="middle" 
                        dominantBaseline="middle" 
                        fill="white"
                        fontSize="14"
                        fontWeight="bold"
                      >
                        {goal.percentage.toFixed(0)}%
                      </text>
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <p className="text-xs text-white/80 mt-2">
                    {formatCurrency(goal.savedAmount)} / {formatCurrency(goal.targetAmount)}
                  </p>
                  {goal.dueDate && (
                    <p className="text-xs text-white/60 mt-1">
                      Due: {formatDateEST(goal.dueDate)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-white/60">
              <span className="text-4xl mb-3 block">🎯</span>
              <p className="text-sm">No savings goals yet</p>
            </div>
          )}
        </Card>

        <Card>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <span className="mr-2 text-lg">📅</span> Upcoming Expenses Forecast
          </h2>
          {forecastData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={forecastData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <defs>
                  <linearGradient id="requiredGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF3B30" stopOpacity={1}/>
                    <stop offset="95%" stopColor="#FF3B30" stopOpacity={0.7}/>
                  </linearGradient>
                  <linearGradient id="savedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4CAF50" stopOpacity={1}/>
                    <stop offset="95%" stopColor="#4CAF50" stopOpacity={0.7}/>
                  </linearGradient>
                  <linearGradient id="deficitGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FFB300" stopOpacity={1}/>
                    <stop offset="95%" stopColor="#FFB300" stopOpacity={0.7}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  stroke="rgba(255,255,255,0.5)"
                  tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                  tickLine={{ stroke: 'rgba(255,255,255,0.3)' }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.3)' }}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.5)"
                  tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                  tickLine={{ stroke: 'rgba(255,255,255,0.3)' }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.3)' }}
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                />
                <Tooltip 
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{ 
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '12px',
                    color: 'white',
                    padding: '12px 16px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
                  }}
                  labelStyle={{ 
                    color: 'rgba(255,255,255,0.9)',
                    marginBottom: '8px',
                    fontWeight: '600'
                  }}
                  itemStyle={{ 
                    color: 'white',
                    padding: '4px 0'
                  }}
                />
                <Legend 
                  wrapperStyle={{ color: 'white', paddingTop: '20px', fontSize: '14px' }}
                  iconType="square"
                  iconSize={12}
                />
                <Bar 
                  dataKey="required" 
                  fill="url(#requiredGradient)" 
                  name="Required" 
                  radius={[8, 8, 0, 0]}
                  animationDuration={1000}
                  animationEasing="ease-out"
                />
                <Bar 
                  dataKey="saved" 
                  fill="url(#savedGradient)" 
                  name="Saved" 
                  radius={[8, 8, 0, 0]}
                  animationDuration={1000}
                  animationEasing="ease-out"
                />
                <Bar 
                  dataKey="deficit" 
                  fill="url(#deficitGradient)" 
                  name="Deficit" 
                  radius={[8, 8, 0, 0]}
                  animationDuration={1000}
                  animationEasing="ease-out"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8 text-white/60">
              <span className="text-4xl mb-3 block">📅</span>
              <p className="text-sm">No upcoming expenses</p>
            </div>
          )}
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center">
          <span className="mr-2 text-lg">💳</span> Recent Transactions
        </h2>
        {data.recentTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-white/20">
                  <th className="text-left py-4 px-4 font-semibold text-white/80">Date</th>
                  <th className="text-left py-4 px-4 font-semibold text-white/80">Type</th>
                  <th className="text-left py-4 px-4 font-semibold text-white/80">Description</th>
                  <th className="text-left py-4 px-4 font-semibold text-white/80">Category</th>
                  <th className="text-right py-4 px-4 font-semibold text-white/80">Amount</th>
                </tr>
              </thead>
              <tbody>
                {data.recentTransactions.map((transaction, index) => (
                  <tr 
                    key={transaction.id} 
                    className="border-b border-white/10 hover:bg-white/5 transition-all duration-200 slide-up"
                    style={{ animationDelay: `${0.05 * index}s` }}
                  >
                    <td className="py-4 px-4 text-white/80">
                      {formatDateEST(transaction.date)}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${
                          transaction.type === 'income'
                            ? 'bg-green-500/30 text-green-200 border border-green-400/50'
                            : 'bg-red-500/30 text-red-200 border border-red-400/50'
                        }`}
                      >
                        {transaction.type === 'income' ? '💰 Income' : '💸 Expense'}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-medium text-white">
                      {transaction.type === 'income' ? transaction.source : transaction.name}
                    </td>
                    <td className="py-4 px-4">
                      {transaction.category ? (
                        <span className="px-2 py-1 bg-light-blue/30 text-light-blue-200 rounded-lg text-sm font-medium border border-light-blue/50">
                          {transaction.category}
                        </span>
                      ) : (
                        <span className="text-white/40">N/A</span>
                      )}
                    </td>
                    <td className={`py-4 px-4 text-right font-bold text-lg ${
                      transaction.type === 'income' 
                        ? 'text-green-300' 
                        : parseFloat(transaction.amount) < 0 
                        ? 'text-green-300' 
                        : 'text-red-300'
                    }`}>
                      {transaction.type === 'income' ? (
                        <span>+{formatCurrency(parseFloat(transaction.amount))}</span>
                      ) : parseFloat(transaction.amount) < 0 ? (
                        <span className="flex items-center justify-end gap-1">
                          <span>↩️</span>
                          <span>+{formatCurrency(Math.abs(parseFloat(transaction.amount)))}</span>
                          <span className="text-xs">(Refund)</span>
                        </span>
                      ) : (
                        <span>-{formatCurrency(parseFloat(transaction.amount))}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-white/60">
            <span className="text-6xl mb-4 block">💳</span>
            <p className="text-lg">No transactions yet</p>
            <p className="text-sm mt-2">Start by adding income or expenses!</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;
