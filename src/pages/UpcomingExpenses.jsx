import { useState, useEffect } from 'react';
import { getUpcomingExpenses, addUpcomingExpense, updateUpcomingExpense, deleteUpcomingExpense } from '../utils/database';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import ChartContainer from '../components/ChartContainer';
import { useToast } from '../components/ToastContainer';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatDateEST } from '../utils/dateUtils';

const UpcomingExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    dueDate: '',
  });

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    const data = await getUpcomingExpenses();
    setExpenses(data.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Please enter expense name';
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0 || isNaN(parseFloat(formData.amount))) {
      errors.amount = 'Please enter a valid amount';
    }
    if (!formData.dueDate) {
      errors.dueDate = 'Please select a due date';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showToast('Please check form errors', 'error');
      return;
    }
    
    if (editingId) {
      const result = await updateUpcomingExpense(editingId, formData);
      if (result) {
        showToast('Upcoming expense updated successfully', 'success');
        resetForm();
        await loadExpenses();
      } else {
        showToast('Failed to update expense', 'error');
      }
    } else {
      const result = await addUpcomingExpense(formData);
      if (result) {
        showToast('Upcoming expense added successfully', 'success');
        resetForm();
        await loadExpenses();
      } else {
        showToast('Failed to add expense', 'error');
      }
    }
  };

  const handleEdit = (expense) => {
    setFormData({
      name: expense.name,
      amount: expense.amount,
      dueDate: expense.dueDate,
    });
    setEditingId(expense.id);
    setShowForm(true);
    setFormErrors({});
  };

  const handleDeleteClick = (expense) => {
    setExpenseToDelete(expense);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (expenseToDelete) {
      await deleteUpcomingExpense(expenseToDelete.id);
      showToast('Upcoming expense deleted successfully', 'success');
      await loadExpenses();
    }
    setDeleteModalOpen(false);
    setExpenseToDelete(null);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      amount: '',
      dueDate: '',
    });
    setEditingId(null);
    setShowForm(false);
    setFormErrors({});
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(amount);
  };

  // Prepare forecast data
  const getForecastData = () => {
    const months = [];
    const now = new Date();
    
    for (let i = 0; i < 6; i++) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const monthName = formatDateEST(monthDate, { month: 'short', year: 'numeric' });
      
      const monthExpenses = expenses.filter(exp => {
        const expDate = new Date(exp.dueDate);
        return expDate.getMonth() === monthDate.getMonth() && 
               expDate.getFullYear() === monthDate.getFullYear();
      });
      
      const required = monthExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
      
      months.push({
        month: monthName,
        required,
      });
    }
    
    return months;
  };

  const forecastData = getForecastData();

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 fade-in">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">
            📅 Upcoming Expenses
          </h1>
          <p className="text-white/80 text-lg">Plan for major future expenses</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowForm(!showForm)}
          className="shadow-xl"
        >
          {showForm ? '❌ Cancel' : '➕ Add Expense'}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-8 slide-up">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
            <span className="mr-2">{editingId ? '✏️' : '➕'}</span>
            {editingId ? 'Edit Upcoming Expense' : 'Add New Upcoming Expense'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white/90 font-semibold mb-2 text-sm">
                Expense Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (formErrors.name) setFormErrors({ ...formErrors, name: '' });
                }}
                className={`input-glass w-full ${formErrors.name ? 'border-red-400' : ''}`}
                placeholder="e.g., Mexico Trip, New Laptop, Moving Out"
              />
              {formErrors.name && (
                <p className="text-red-300 text-sm mt-1">{formErrors.name}</p>
              )}
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/90 font-semibold mb-2 text-sm">
                  Amount (CAD)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 font-semibold">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => {
                      setFormData({ ...formData, amount: e.target.value });
                      if (formErrors.amount) setFormErrors({ ...formErrors, amount: '' });
                    }}
                    className={`input-glass w-full pl-8 ${formErrors.amount ? 'border-red-400' : ''}`}
                    placeholder="0.00"
                  />
                </div>
                {formErrors.amount && (
                  <p className="text-red-300 text-sm mt-1">{formErrors.amount}</p>
                )}
              </div>
              <div>
                <label className="block text-white/90 font-semibold mb-2 text-sm">
                  Due Date
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => {
                    setFormData({ ...formData, dueDate: e.target.value });
                    if (formErrors.dueDate) setFormErrors({ ...formErrors, dueDate: '' });
                  }}
                  className={`input-glass w-full ${formErrors.dueDate ? 'border-red-400' : ''}`}
                />
                {formErrors.dueDate && (
                  <p className="text-red-300 text-sm mt-1">{formErrors.dueDate}</p>
                )}
              </div>
            </div>
            <div className="flex space-x-4 pt-2">
              <Button type="submit" variant="primary" className="flex-1">
                {editingId ? '💾 Update Expense' : '➕ Add Expense'}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Forecast Chart */}
      {forecastData.length > 0 && (
        <ChartContainer title="6-Month Forecast" icon="📊" className="mb-10">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={forecastData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="month" 
                stroke="rgba(255,255,255,0.7)"
                tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.7)"
                tick={{ fill: 'rgba(255,255,255,0.7)' }}
              />
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
              <Bar dataKey="required" fill="#FF3B30" name="Required Amount" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      )}

      {/* Expenses List */}
      <Card>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <span className="mr-2">📋</span> Upcoming Expenses List
        </h2>
        {expenses.length > 0 ? (
          <div className="space-y-4">
            {expenses.map((expense, index) => (
              <div 
                key={expense.id} 
                className="glass-card p-4 slide-up"
                style={{ animationDelay: `${0.05 * index}s` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">{expense.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-white/80">
                      <span>Amount: <span className="font-bold text-white">{formatCurrency(parseFloat(expense.amount))}</span></span>
                      <span>Due: <span className="font-bold text-white">{formatDateEST(expense.dueDate)}</span></span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="secondary"
                      onClick={() => handleEdit(expense)}
                      className="text-sm"
                    >
                      ✏️ Edit
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleDeleteClick(expense)}
                      className="text-sm"
                    >
                      🗑️ Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-white/60">
            <span className="text-6xl mb-4 block">📅</span>
            <p className="text-lg">No upcoming expenses yet</p>
            <p className="text-sm mt-2">Click "Add Expense" to get started!</p>
          </div>
        )}
      </Card>

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setExpenseToDelete(null);
        }}
        title="Delete Upcoming Expense"
        message={expenseToDelete ? `Are you sure you want to delete "${expenseToDelete.name}"? This action cannot be undone.` : ''}
        confirmText="Yes"
        cancelText="No"
        onConfirm={handleDeleteConfirm}
        type="danger"
      />
    </div>
  );
};

export default UpcomingExpenses;

