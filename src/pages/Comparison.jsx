import { useState, useEffect } from 'react';
import { getIncomes, getExpenses } from '../utils/database';
import Card from '../components/Card';
import ChartContainer from '../components/ChartContainer';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { formatDateEST } from '../utils/dateUtils';

const Comparison = () => {
  const [comparisonType, setComparisonType] = useState('months'); // 'months', 'years', 'days'
  const [period1, setPeriod1] = useState('');
  const [period2, setPeriod2] = useState('');
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comparisonData, setComparisonData] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (period1 && period2) {
      calculateComparison();
    }
  }, [period1, period2, comparisonType, incomes, expenses]);

  const loadData = async () => {
    try {
      setLoading(true);
      const incomesData = await getIncomes();
      const expensesData = await getExpenses();
      setIncomes(incomesData || []);
      setExpenses(expensesData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAvailablePeriods = () => {
    const allDates = [
      ...incomes.map(inc => new Date(inc.date)),
      ...expenses.map(exp => new Date(exp.date))
    ].filter(d => !isNaN(d.getTime()));

    if (allDates.length === 0) return [];

    const minDate = new Date(Math.min(...allDates));
    const maxDate = new Date(Math.max(...allDates));

    if (comparisonType === 'years') {
      const years = [];
      for (let year = minDate.getFullYear(); year <= maxDate.getFullYear(); year++) {
        years.push(year.toString());
      }
      return years;
    } else if (comparisonType === 'months') {
      const months = [];
      const current = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
      const end = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
      
      while (current <= end) {
        const year = current.getFullYear();
        const month = String(current.getMonth() + 1).padStart(2, '2');
        months.push(`${year}-${month}`);
        current.setMonth(current.getMonth() + 1);
      }
      return months;
    } else { // days
      const days = [];
      const current = new Date(minDate);
      const end = new Date(maxDate);
      
      while (current <= end) {
        days.push(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
      }
      return days.slice(-30); // Last 30 days
    }
  };

  const filterDataByPeriod = (data, period) => {
    if (!period) return [];
    
    if (comparisonType === 'years') {
      const year = parseInt(period);
      return data.filter(item => {
        const date = new Date(item.date);
        return date.getFullYear() === year;
      });
    } else if (comparisonType === 'months') {
      const [year, month] = period.split('-').map(Number);
      return data.filter(item => {
        const date = new Date(item.date);
        return date.getFullYear() === year && date.getMonth() === month - 1;
      });
    } else { // days
      return data.filter(item => {
        const itemDate = new Date(item.date).toISOString().split('T')[0];
        return itemDate === period;
      });
    }
  };

  const calculateComparison = () => {
    const period1Incomes = filterDataByPeriod(incomes, period1);
    const period1Expenses = filterDataByPeriod(expenses, period1);
    const period2Incomes = filterDataByPeriod(incomes, period2);
    const period2Expenses = filterDataByPeriod(expenses, period2);

    const period1Income = period1Incomes.reduce((sum, inc) => sum + parseFloat(inc.amount || 0), 0);
    const period1Expense = period1Expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
    const period1Saved = period1Income - period1Expense;

    const period2Income = period2Incomes.reduce((sum, inc) => sum + parseFloat(inc.amount || 0), 0);
    const period2Expense = period2Expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
    const period2Saved = period2Income - period2Expense;

    // Category breakdown
    const period1Categories = {};
    period1Expenses.forEach(exp => {
      const cat = exp.category || 'Uncategorized';
      period1Categories[cat] = (period1Categories[cat] || 0) + parseFloat(exp.amount || 0);
    });

    const period2Categories = {};
    period2Expenses.forEach(exp => {
      const cat = exp.category || 'Uncategorized';
      period2Categories[cat] = (period2Categories[cat] || 0) + parseFloat(exp.amount || 0);
    });

    const allCategories = new Set([...Object.keys(period1Categories), ...Object.keys(period2Categories)]);
    const categoryComparison = Array.from(allCategories).map(cat => ({
      category: cat,
      period1: period1Categories[cat] || 0,
      period2: period2Categories[cat] || 0,
      difference: (period2Categories[cat] || 0) - (period1Categories[cat] || 0),
      changePercent: period1Categories[cat] 
        ? (((period2Categories[cat] || 0) - (period1Categories[cat] || 0)) / period1Categories[cat] * 100).toFixed(1)
        : 'N/A'
    }));

    const incomeChange = period1Income ? ((period2Income - period1Income) / period1Income * 100).toFixed(1) : 'N/A';
    const expenseChange = period1Expense ? ((period2Expense - period1Expense) / period1Expense * 100).toFixed(1) : 'N/A';
    const savedChange = period1Saved ? ((period2Saved - period1Saved) / Math.abs(period1Saved) * 100).toFixed(1) : 'N/A';

    setComparisonData({
      period1: {
        label: formatPeriodLabel(period1),
        income: period1Income,
        expense: period1Expense,
        saved: period1Saved,
        incomeCount: period1Incomes.length,
        expenseCount: period1Expenses.length
      },
      period2: {
        label: formatPeriodLabel(period2),
        income: period2Income,
        expense: period2Expense,
        saved: period2Saved,
        incomeCount: period2Incomes.length,
        expenseCount: period2Expenses.length
      },
      changes: {
        income: incomeChange,
        expense: expenseChange,
        saved: savedChange,
        incomeDiff: period2Income - period1Income,
        expenseDiff: period2Expense - period1Expense,
        savedDiff: period2Saved - period1Saved
      },
      categoryComparison
    });
  };

  const formatPeriodLabel = (period) => {
    if (!period) return '';
    
    if (comparisonType === 'years') {
      return period;
    } else if (comparisonType === 'months') {
      const [year, month] = period.split('-').map(Number);
      const date = new Date(year, month - 1, 1);
      return formatDateEST(date, { month: 'long', year: 'numeric' });
    } else {
      const date = new Date(period);
      return formatDateEST(date, { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const pieColors = ['#00AEEF', '#FF6A00', '#4CAF50', '#FFB300', '#9C27B0', '#F44336', '#2196F3', '#FF9800'];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center text-white text-xl">Loading...</div>
      </div>
    );
  }

  const availablePeriods = getAvailablePeriods();

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          📊 Comparison Tool
        </h1>
        <p className="text-white/80 text-sm">Compare your financial data across different time periods</p>
      </div>

      {/* Comparison Type Selector */}
      <Card className="mb-6">
        <div className="mb-4">
          <label className="block text-white/90 font-semibold mb-2 text-sm">
            Compare By
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setComparisonType('months');
                setPeriod1('');
                setPeriod2('');
                setComparisonData(null);
              }}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                comparisonType === 'months'
                  ? 'bg-orange text-white'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              📅 Months
            </button>
            <button
              onClick={() => {
                setComparisonType('years');
                setPeriod1('');
                setPeriod2('');
                setComparisonData(null);
              }}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                comparisonType === 'years'
                  ? 'bg-orange text-white'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              📆 Years
            </button>
            <button
              onClick={() => {
                setComparisonType('days');
                setPeriod1('');
                setPeriod2('');
                setComparisonData(null);
              }}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                comparisonType === 'days'
                  ? 'bg-orange text-white'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              📆 Days
            </button>
          </div>
        </div>

        {/* Period Selectors */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-white/90 font-semibold mb-2 text-sm">
              {comparisonType === 'years' ? 'Year 1' : comparisonType === 'months' ? 'Month 1' : 'Day 1'}
            </label>
            <select
              value={period1}
              onChange={(e) => setPeriod1(e.target.value)}
              className="input-glass w-full"
            >
              <option value="">Select {comparisonType === 'years' ? 'Year' : comparisonType === 'months' ? 'Month' : 'Day'}</option>
              {availablePeriods.map(period => (
                <option key={period} value={period} className="bg-gray-800">
                  {formatPeriodLabel(period)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-white/90 font-semibold mb-2 text-sm">
              {comparisonType === 'years' ? 'Year 2' : comparisonType === 'months' ? 'Month 2' : 'Day 2'}
            </label>
            <select
              value={period2}
              onChange={(e) => setPeriod2(e.target.value)}
              className="input-glass w-full"
            >
              <option value="">Select {comparisonType === 'years' ? 'Year' : comparisonType === 'months' ? 'Month' : 'Day'}</option>
              {availablePeriods.map(period => (
                <option key={period} value={period} className="bg-gray-800">
                  {formatPeriodLabel(period)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Comparison Results */}
      {comparisonData && (
        <>
          {/* Summary Cards */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <Card>
              <h3 className="text-sm font-semibold text-white/80 mb-3 uppercase tracking-wide">Income</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-white/60 text-sm">{comparisonData.period1.label}</span>
                  <span className="text-white font-bold">{formatCurrency(comparisonData.period1.income)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/60 text-sm">{comparisonData.period2.label}</span>
                  <span className="text-white font-bold">{formatCurrency(comparisonData.period2.income)}</span>
                </div>
                <div className="pt-2 border-t border-white/10">
                  <div className="flex justify-between items-center">
                    <span className="text-white/60 text-sm">Change</span>
                    <span className={`font-bold ${
                      comparisonData.changes.incomeDiff >= 0 ? 'text-green-300' : 'text-red-300'
                    }`}>
                      {comparisonData.changes.incomeDiff >= 0 ? '+' : ''}{formatCurrency(comparisonData.changes.incomeDiff)} 
                      ({comparisonData.changes.income}%)
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="text-sm font-semibold text-white/80 mb-3 uppercase tracking-wide">Expenses</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-white/60 text-sm">{comparisonData.period1.label}</span>
                  <span className="text-white font-bold">{formatCurrency(comparisonData.period1.expense)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/60 text-sm">{comparisonData.period2.label}</span>
                  <span className="text-white font-bold">{formatCurrency(comparisonData.period2.expense)}</span>
                </div>
                <div className="pt-2 border-t border-white/10">
                  <div className="flex justify-between items-center">
                    <span className="text-white/60 text-sm">Change</span>
                    <span className={`font-bold ${
                      comparisonData.changes.expenseDiff <= 0 ? 'text-green-300' : 'text-red-300'
                    }`}>
                      {comparisonData.changes.expenseDiff >= 0 ? '+' : ''}{formatCurrency(comparisonData.changes.expenseDiff)} 
                      ({comparisonData.changes.expense}%)
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="text-sm font-semibold text-white/80 mb-3 uppercase tracking-wide">Saved</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-white/60 text-sm">{comparisonData.period1.label}</span>
                  <span className={`font-bold ${comparisonData.period1.saved >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                    {formatCurrency(comparisonData.period1.saved)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/60 text-sm">{comparisonData.period2.label}</span>
                  <span className={`font-bold ${comparisonData.period2.saved >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                    {formatCurrency(comparisonData.period2.saved)}
                  </span>
                </div>
                <div className="pt-2 border-t border-white/10">
                  <div className="flex justify-between items-center">
                    <span className="text-white/60 text-sm">Change</span>
                    <span className={`font-bold ${
                      comparisonData.changes.savedDiff >= 0 ? 'text-green-300' : 'text-red-300'
                    }`}>
                      {comparisonData.changes.savedDiff >= 0 ? '+' : ''}{formatCurrency(comparisonData.changes.savedDiff)} 
                      ({comparisonData.changes.saved}%)
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Bar Chart Comparison */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <ChartContainer title="Income & Expenses Comparison" icon="📊">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                  {
                    name: comparisonData.period1.label,
                    Income: comparisonData.period1.income,
                    Expenses: comparisonData.period1.expense,
                    Saved: comparisonData.period1.saved
                  },
                  {
                    name: comparisonData.period2.label,
                    Income: comparisonData.period2.income,
                    Expenses: comparisonData.period2.expense,
                    Saved: comparisonData.period2.saved
                  }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.7)" tick={{ fill: 'rgba(255,255,255,0.7)' }} />
                  <YAxis stroke="rgba(255,255,255,0.7)" tick={{ fill: 'rgba(255,255,255,0.7)' }} />
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{ 
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      color: 'white'
                    }}
                  />
                  <Legend wrapperStyle={{ color: 'white' }} />
                  <Bar dataKey="Income" fill="#00AEEF" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="Expenses" fill="#FF6A00" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="Saved" fill="#4CAF50" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>

            <ChartContainer title="Category Comparison" icon="🥧">
              {comparisonData.categoryComparison.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart 
                    data={comparisonData.categoryComparison} 
                    layout="vertical"
                    margin={{ left: 140, right: 20, top: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis type="number" stroke="rgba(255,255,255,0.7)" tick={{ fill: 'rgba(255,255,255,0.7)' }} />
                    <YAxis 
                      dataKey="category" 
                      type="category" 
                      stroke="rgba(255,255,255,0.7)" 
                      tick={{ fill: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: 500 }}
                      width={130}
                      interval={0}
                    />
                    <Tooltip 
                      formatter={(value) => formatCurrency(value)}
                      contentStyle={{ 
                        backgroundColor: 'rgba(0, 0, 0, 0.95)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: '8px',
                        color: 'white',
                        padding: '12px 16px'
                      }}
                      labelStyle={{ color: 'white', fontWeight: 600, marginBottom: '8px' }}
                      itemStyle={{ color: 'white' }}
                    />
                    <Legend wrapperStyle={{ color: 'white' }} />
                    <Bar dataKey="period1" fill="#00AEEF" name={comparisonData.period1.label} radius={[0, 8, 8, 0]} />
                    <Bar dataKey="period2" fill="#FF6A00" name={comparisonData.period2.label} radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-white/60">
                  <span className="text-4xl mb-3">📊</span>
                  <p className="text-sm">No category data available</p>
                </div>
              )}
            </ChartContainer>
          </div>

          {/* Category Breakdown Table */}
          {comparisonData.categoryComparison.length > 0 && (
            <Card>
              <h2 className="text-xl font-bold text-white mb-4">Category Breakdown</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-white/20">
                      <th className="text-left py-3 px-4 font-semibold text-white/80">Category</th>
                      <th className="text-right py-3 px-4 font-semibold text-white/80">{comparisonData.period1.label}</th>
                      <th className="text-right py-3 px-4 font-semibold text-white/80">{comparisonData.period2.label}</th>
                      <th className="text-right py-3 px-4 font-semibold text-white/80">Difference</th>
                      <th className="text-right py-3 px-4 font-semibold text-white/80">Change %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonData.categoryComparison.map((item, index) => (
                      <tr key={item.category} className="border-b border-white/10">
                        <td className="py-3 px-4 text-white">{item.category}</td>
                        <td className="py-3 px-4 text-right text-white/80">{formatCurrency(item.period1)}</td>
                        <td className="py-3 px-4 text-right text-white/80">{formatCurrency(item.period2)}</td>
                        <td className={`py-3 px-4 text-right font-semibold ${
                          item.difference >= 0 ? 'text-red-300' : 'text-green-300'
                        }`}>
                          {item.difference >= 0 ? '+' : ''}{formatCurrency(item.difference)}
                        </td>
                        <td className={`py-3 px-4 text-right font-semibold ${
                          item.changePercent !== 'N/A' && parseFloat(item.changePercent) >= 0 ? 'text-red-300' : 'text-green-300'
                        }`}>
                          {item.changePercent !== 'N/A' ? `${item.changePercent}%` : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}

      {!comparisonData && period1 && period2 && (
        <Card>
          <div className="text-center py-8 text-white/60">
            <span className="text-4xl mb-3 block">📊</span>
            <p className="text-sm">Select both periods to see comparison</p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Comparison;

