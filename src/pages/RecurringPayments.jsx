import { useState, useEffect } from 'react';
import { getRecurringPayments, addRecurringPayment, updateRecurringPayment, deleteRecurringPayment, addExpense } from '../utils/database';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { useToast } from '../components/ToastContainer';
import { formatDateEST } from '../utils/dateUtils';

const RecurringPayments = () => {
  const [payments, setPayments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    category: '',
    frequency: 'monthly', // monthly, weekly, yearly
    nextDueDate: '',
    autoAdd: true, // Automatically add as expense when due
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
    const initialize = async () => {
      try {
        setLoading(true);
        await loadPayments();
        // Check for due payments on load
        await checkAndAddDuePayments();
        await loadPayments(); // Reload after checking
      } catch (error) {
        console.error('Error initializing recurring payments:', error);
        showToast('Error loading recurring payments. Please refresh the page.', 'error');
      } finally {
        setLoading(false);
      }
    };
    initialize();
  }, []);

  const loadPayments = async () => {
    try {
      const data = await getRecurringPayments();
      setPayments((data || []).sort((a, b) => new Date(a.nextDueDate) - new Date(b.nextDueDate)));
    } catch (error) {
      console.error('Error loading payments:', error);
      setPayments([]);
    }
  };

  const checkAndAddDuePayments = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const allPayments = await getRecurringPayments();
      
      if (!allPayments || !Array.isArray(allPayments)) return;
      
      for (const payment of allPayments) {
        if (payment && payment.autoAdd && payment.nextDueDate) {
          try {
            const dueDate = new Date(payment.nextDueDate);
            if (isNaN(dueDate.getTime())) continue; // Skip invalid dates
            dueDate.setHours(0, 0, 0, 0);
            
            // If payment is due today or past due, add it as an expense
            if (dueDate <= today) {
              // Check if already added this period
              const lastAdded = payment.lastAdded || '';
              const todayStr = today.toISOString().split('T')[0];
              
              if (lastAdded !== todayStr) {
                await addExpense({
                  name: payment.name,
                  amount: payment.amount,
                  category: payment.category,
                  date: todayStr,
                });
                
                // Update next due date based on frequency
                const nextDate = new Date(dueDate);
                if (payment.frequency === 'weekly') {
                  nextDate.setDate(nextDate.getDate() + 7);
                } else if (payment.frequency === 'monthly') {
                  nextDate.setMonth(nextDate.getMonth() + 1);
                } else if (payment.frequency === 'yearly') {
                  nextDate.setFullYear(nextDate.getFullYear() + 1);
                }
                
                await updateRecurringPayment(payment.id, {
                  nextDueDate: nextDate.toISOString().split('T')[0],
                  lastAdded: todayStr,
                });
              }
            }
          } catch (error) {
            console.error('Error processing payment:', payment, error);
            // Continue with next payment
          }
        }
      }
    } catch (error) {
      console.error('Error checking due payments:', error);
      // Don't show error to user, just log it
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Please enter payment name';
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0 || isNaN(parseFloat(formData.amount))) {
      errors.amount = 'Please enter a valid amount';
    }
    if (!formData.category) {
      errors.category = 'Please select a category';
    }
    if (!formData.nextDueDate) {
      errors.nextDueDate = 'Please select next due date';
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
      const result = await updateRecurringPayment(editingId, formData);
      if (result) {
        showToast('Recurring payment updated successfully', 'success');
        resetForm();
        await loadPayments();
      } else {
        showToast('Failed to update payment', 'error');
      }
    } else {
      const result = await addRecurringPayment(formData);
      if (result) {
        showToast('Recurring payment added successfully', 'success');
        resetForm();
        await loadPayments();
      } else {
        showToast('Failed to add payment', 'error');
      }
    }
  };

  const handleEdit = (payment) => {
    setFormData({
      name: payment.name,
      amount: payment.amount,
      category: payment.category,
      frequency: payment.frequency || 'monthly',
      nextDueDate: payment.nextDueDate || '',
      autoAdd: payment.autoAdd !== undefined ? payment.autoAdd : true,
    });
    setEditingId(payment.id);
    setShowForm(true);
    setFormErrors({});
  };

  const handleDeleteClick = (payment) => {
    setPaymentToDelete(payment);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (paymentToDelete) {
      await deleteRecurringPayment(paymentToDelete.id);
      showToast('Recurring payment deleted successfully', 'success');
      await loadPayments();
    }
    setDeleteModalOpen(false);
    setPaymentToDelete(null);
  };

  const handleAddNow = async (payment) => {
    const today = new Date().toISOString().split('T')[0];
    const result = await addExpense({
      name: payment.name,
      amount: payment.amount,
      category: payment.category,
      date: today,
    });
    if (result) {
      showToast(`${payment.name} added as an expense for today!`, 'success');
      await loadPayments();
    } else {
      showToast('Failed to add expense', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      amount: '',
      category: '',
      frequency: 'monthly',
      nextDueDate: '',
      autoAdd: true,
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

  const getDaysUntilDue = (dueDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

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
            🔄 Recurring Payments
          </h1>
          <p className="text-white/80 text-sm">Manage your subscriptions and recurring expenses</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowForm(!showForm)}
          className="shadow-xl"
        >
          {showForm ? '❌ Cancel' : '➕ Add Recurring Payment'}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-8 slide-up">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
            <span className="mr-2">{editingId ? '✏️' : '➕'}</span>
            {editingId ? 'Edit Recurring Payment' : 'Add New Recurring Payment'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white/90 font-semibold mb-2 text-sm">
                Payment Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (formErrors.name) setFormErrors({ ...formErrors, name: '' });
                }}
                className={`input-glass w-full ${formErrors.name ? 'border-red-400' : ''}`}
                placeholder="e.g., Netflix, Spotify, Gym Membership"
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
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => {
                    setFormData({ ...formData, category: e.target.value });
                    if (formErrors.category) setFormErrors({ ...formErrors, category: '' });
                  }}
                  className={`input-glass w-full ${formErrors.category ? 'border-red-400' : ''}`}
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat} className="bg-gray-800">
                      {cat}
                    </option>
                  ))}
                </select>
                {formErrors.category && (
                  <p className="text-red-300 text-sm mt-1">{formErrors.category}</p>
                )}
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/90 font-semibold mb-2 text-sm">
                  Frequency
                </label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                  className="input-glass w-full"
                >
                  <option value="weekly" className="bg-gray-800">Weekly</option>
                  <option value="monthly" className="bg-gray-800">Monthly</option>
                  <option value="yearly" className="bg-gray-800">Yearly</option>
                </select>
              </div>
              <div>
                <label className="block text-white/90 font-semibold mb-2 text-sm">
                  Next Due Date
                </label>
                <input
                  type="date"
                  value={formData.nextDueDate}
                  onChange={(e) => {
                    setFormData({ ...formData, nextDueDate: e.target.value });
                    if (formErrors.nextDueDate) setFormErrors({ ...formErrors, nextDueDate: '' });
                  }}
                  className={`input-glass w-full ${formErrors.nextDueDate ? 'border-red-400' : ''}`}
                />
                {formErrors.nextDueDate && (
                  <p className="text-red-300 text-sm mt-1">{formErrors.nextDueDate}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="autoAdd"
                checked={formData.autoAdd}
                onChange={(e) => setFormData({ ...formData, autoAdd: e.target.checked })}
                className="w-5 h-5 rounded"
              />
              <label htmlFor="autoAdd" className="text-white/90 text-sm">
                Automatically add as expense when due
              </label>
            </div>
            <div className="flex space-x-4 pt-2">
              <Button type="submit" variant="primary" className="flex-1">
                {editingId ? '💾 Update Payment' : '➕ Add Payment'}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {payments.length > 0 ? (
        <div className="space-y-4">
          {payments.map((payment, index) => {
            const daysUntil = getDaysUntilDue(payment.nextDueDate);
            const isOverdue = daysUntil < 0;
            const isDueSoon = daysUntil >= 0 && daysUntil <= 3;
            
            return (
              <Card key={payment.id} className="slide-up" style={{ animationDelay: `${0.05 * index}s` }}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-3">
                      <h3 className="text-2xl font-bold text-white">{payment.name}</h3>
                      {payment.autoAdd && (
                        <span className="px-2 py-1 bg-green-500/30 text-green-200 rounded text-xs font-semibold border border-green-400/50">
                          Auto-Add
                        </span>
                      )}
                      <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                        isOverdue 
                          ? 'bg-red-500/30 text-red-200 border border-red-400/50'
                          : isDueSoon
                          ? 'bg-orange-500/30 text-orange-200 border border-orange-400/50'
                          : 'bg-blue-500/30 text-blue-200 border border-blue-400/50'
                      }`}>
                        {isOverdue 
                          ? `⚠️ Overdue by ${Math.abs(daysUntil)} days`
                          : isDueSoon
                          ? `Due in ${daysUntil} days`
                          : `Due in ${daysUntil} days`
                        }
                      </span>
                    </div>
                    <div className="grid md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-white/60 mb-1">Amount</p>
                        <p className="text-white font-bold text-lg">{formatCurrency(parseFloat(payment.amount))}</p>
                      </div>
                      <div>
                        <p className="text-white/60 mb-1">Frequency</p>
                        <p className="text-white font-semibold capitalize">{payment.frequency}</p>
                      </div>
                      <div>
                        <p className="text-white/60 mb-1">Category</p>
                        <p className="text-white font-semibold">{payment.category}</p>
                      </div>
                      <div>
                        <p className="text-white/60 mb-1">Next Due</p>
                        <p className="text-white font-semibold">{formatDateEST(payment.nextDueDate)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2 ml-4">
                    <Button
                      variant="secondary"
                      onClick={() => handleAddNow(payment)}
                      className="text-sm whitespace-nowrap"
                    >
                      💰 Add Now
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => handleEdit(payment)}
                      className="text-sm"
                    >
                      ✏️ Edit
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleDeleteClick(payment)}
                      className="text-sm"
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
        <Card>
          <div className="text-center py-12 text-white/60">
            <span className="text-6xl mb-4 block">🔄</span>
            <p className="text-lg">No recurring payments yet</p>
            <p className="text-sm mt-2">Click "Add Recurring Payment" to set up subscriptions like Netflix, Spotify, etc.</p>
          </div>
        </Card>
      )}

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setPaymentToDelete(null);
        }}
        title="Delete Recurring Payment"
        message={paymentToDelete ? `Are you sure you want to delete "${paymentToDelete.name}"? This action cannot be undone.` : ''}
        confirmText="Yes"
        cancelText="No"
        onConfirm={handleDeleteConfirm}
        type="danger"
      />
    </div>
  );
};

export default RecurringPayments;

