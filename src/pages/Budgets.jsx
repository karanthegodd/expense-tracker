import { useState, useEffect } from 'react';
import { getBudgets, addBudget, updateBudget, deleteBudget, getExpenses } from '../utils/database';
import Card from '../components/Card';
import Button from '../components/Button';

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
  });

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
    loadBudgets();
  }, []);

  const loadBudgets = () => {
    const data = getBudgets();
    setBudgets(data);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingId) {
      updateBudget(editingId, formData);
    } else {
      addBudget(formData);
    }
    
    resetForm();
    loadBudgets();
  };

  const handleEdit = (budget) => {
    setFormData({
      category: budget.category,
      amount: budget.amount,
    });
    setEditingId(budget.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      deleteBudget(id);
      loadBudgets();
    }
  };

  const resetForm = () => {
    setFormData({
      category: '',
      amount: '',
    });
    setEditingId(null);
    setShowForm(false);
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
    
    return monthlyExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
  };

  const getRemainingBudget = (budget) => {
    const spent = getSpentAmount(budget.category);
    return parseFloat(budget.amount) - spent;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 fade-in">
        <div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-2">
            📈 Budget Management
          </h1>
          <p className="text-white/80 text-lg">Set and track your spending limits</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowForm(!showForm)}
          className="shadow-xl text-lg"
        >
          {showForm ? '❌ Cancel' : '➕ Add Budget'}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-8 slide-up">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
            <span className="mr-2">{editingId ? '✏️' : '➕'}</span>
            {editingId ? 'Edit Budget' : 'Add New Budget'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white/90 font-semibold mb-2 text-sm">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
                className="input-glass w-full"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-gray-800">
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-white/90 font-semibold mb-2 text-sm">
                Budget Amount (CAD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 font-semibold">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                  className="input-glass w-full pl-8"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="flex space-x-4 pt-2">
              <Button type="submit" variant="primary" className="flex-1">
                {editingId ? '💾 Update Budget' : '➕ Add Budget'}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <span className="mr-2">💰</span> Your Budgets
        </h2>
        {budgets.length > 0 ? (
          <div className="space-y-6">
            {budgets.map((budget, index) => {
              const spent = getSpentAmount(budget.category);
              const remaining = getRemainingBudget(budget);
              const percentage = (spent / parseFloat(budget.amount)) * 100;
              
              return (
                <div key={budget.id} className="glass-card p-6 slide-up" style={{ animationDelay: `${0.1 * index}s` }}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{budget.category}</h3>
                      <p className="text-sm text-white/80 font-medium">
                        Budget: <span className="font-bold text-white">{formatCurrency(parseFloat(budget.amount))}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-white/60 uppercase tracking-wide mb-1">Spent</p>
                      <p className="text-xl font-bold text-red-300">
                        {formatCurrency(spent)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="w-full bg-white/10 rounded-full h-3 shadow-inner">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ${
                          percentage > 100
                            ? 'bg-gradient-to-r from-red-600 to-red-700'
                            : percentage > 80
                            ? 'bg-gradient-to-r from-orange to-orange-600'
                            : 'bg-gradient-to-r from-green-500 to-green-600'
                        }`}
                        style={{ 
                          width: `${Math.min(percentage, 100)}%`,
                          boxShadow: percentage > 90 ? '0 0 10px rgba(255, 59, 48, 0.5)' : 'none'
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-xs font-semibold text-white/80">
                        {percentage.toFixed(1)}% used
                      </p>
                      <p className={`text-sm font-bold ${
                        remaining >= 0 ? 'text-green-300' : 'text-red-300'
                      }`}>
                        {remaining >= 0 ? '✓' : '⚠'} Remaining: {formatCurrency(Math.abs(remaining))}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2 pt-4 border-t border-white/10">
                    <Button
                      variant="secondary"
                      onClick={() => handleEdit(budget)}
                      className="px-4 py-2 text-sm"
                    >
                      ✏️ Edit
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleDelete(budget.id)}
                      className="px-4 py-2 text-sm"
                    >
                      🗑️ Delete
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-white/60">
            <span className="text-6xl mb-4 block">📈</span>
            <p className="text-lg">No budgets set yet</p>
            <p className="text-sm mt-2">Click "Add Budget" to get started!</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Budgets;

