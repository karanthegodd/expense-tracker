import { useState, useEffect, useMemo } from 'react';
import { getExpenses, addExpense, updateExpense, deleteExpense } from '../utils/database';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { useToast } from '../components/ToastContainer';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [formErrors, setFormErrors] = useState({});

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
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    const data = await getExpenses();
    setExpenses(data.sort((a, b) => new Date(b.date) - new Date(a.date)));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Please enter expense name';
    }
    if (!formData.amount || parseFloat(formData.amount) === 0 || isNaN(parseFloat(formData.amount))) {
      errors.amount = 'Please enter a valid amount (use negative for refunds)';
    }
    if (!formData.category) {
      errors.category = 'Please select a category';
    }
    if (!formData.date) {
      errors.date = 'Please select a date';
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
      const result = await updateExpense(editingId, formData);
      if (result) {
        showToast('Expense updated', 'success');
        resetForm();
        await loadExpenses();
      } else {
        showToast('Failed to update expense', 'error');
      }
    } else {
      const result = await addExpense(formData);
      if (result) {
        showToast('Expense added', 'success');
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
      category: expense.category,
      date: expense.date,
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
      await deleteExpense(expenseToDelete.id);
      showToast('Expense deleted', 'success');
      await loadExpenses();
      setDeleteModalOpen(false);
      setExpenseToDelete(null);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      amount: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
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

  // Filter and sort expenses
  const filteredAndSortedExpenses = useMemo(() => {
    let filtered = expenses.filter((expense) => {
      const matchesSearch = expense.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !filterCategory || expense.category === filterCategory;
      return matchesSearch && matchesCategory;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.date) - new Date(a.date);
        case 'date-asc':
          return new Date(a.date) - new Date(b.date);
        case 'amount-desc':
          return parseFloat(b.amount) - parseFloat(a.amount);
        case 'amount-asc':
          return parseFloat(a.amount) - parseFloat(b.amount);
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [expenses, searchQuery, filterCategory, sortBy]);

  const totalFiltered = filteredAndSortedExpenses.reduce(
    (sum, exp) => sum + parseFloat(exp.amount || 0),
    0
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 fade-in">
        <div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2">
            💸 Expense Management
          </h1>
          <p className="text-white/80 text-lg">Track and categorize your expenses</p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          className="shadow-xl"
          aria-label={showForm ? 'Cancel adding expense' : 'Add new expense'}
        >
          {showForm ? '❌ Cancel' : '➕ Add Expense'}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-8 slide-up">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 flex items-center">
            <span className="mr-2">{editingId ? '✏️' : '➕'}</span>
            {editingId ? 'Edit Expense' : 'Add New Expense'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div>
              <label htmlFor="expense-name" className="block text-white/90 font-semibold mb-2 text-sm">
                Expense Name <span className="text-red-400">*</span>
              </label>
              <input
                id="expense-name"
                type="text"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (formErrors.name) setFormErrors({ ...formErrors, name: '' });
                }}
                required
                className={`input-glass w-full ${formErrors.name ? 'border-red-400 border-2' : ''}`}
                placeholder="e.g., Groceries, Gas, Netflix"
                aria-invalid={!!formErrors.name}
                aria-describedby={formErrors.name ? 'name-error' : undefined}
              />
              {formErrors.name && (
                <p id="name-error" className="text-red-300 text-sm mt-1 flex items-center" role="alert">
                  <span className="mr-1">⚠️</span>
                  {formErrors.name}
                </p>
              )}
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="expense-amount" className="block text-white/90 font-semibold mb-2 text-sm">
                  Amount (CAD) <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 font-semibold">$</span>
                  <input
                    id="expense-amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => {
                      setFormData({ ...formData, amount: e.target.value });
                      if (formErrors.amount) setFormErrors({ ...formErrors, amount: '' });
                    }}
                    required
                    className={`input-glass w-full pl-8 ${formErrors.amount ? 'border-red-400 border-2' : ''}`}
                    placeholder="0.00 (use negative for refunds)"
                    aria-invalid={!!formErrors.amount}
                    aria-describedby={formErrors.amount ? 'amount-error' : undefined}
                  />
                </div>
                {formErrors.amount && (
                  <p id="amount-error" className="text-red-300 text-sm mt-1 flex items-center" role="alert">
                    <span className="mr-1">⚠️</span>
                    {formErrors.amount}
                  </p>
                )}
                <p className="text-white/60 text-xs mt-1">
                  💡 Use a negative amount (e.g., -50.00) to record a refund
                </p>
              </div>
              <div>
                <label htmlFor="expense-category" className="block text-white/90 font-semibold mb-2 text-sm">
                  Category <span className="text-red-400">*</span>
                </label>
                <select
                  id="expense-category"
                  value={formData.category}
                  onChange={(e) => {
                    setFormData({ ...formData, category: e.target.value });
                    if (formErrors.category) setFormErrors({ ...formErrors, category: '' });
                  }}
                  required
                  className={`input-glass w-full ${formErrors.category ? 'border-red-400 border-2' : ''}`}
                  aria-invalid={!!formErrors.category}
                  aria-describedby={formErrors.category ? 'category-error' : undefined}
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat} className="bg-gray-800">
                      {cat}
                    </option>
                  ))}
                </select>
                {formErrors.category && (
                  <p id="category-error" className="text-red-300 text-sm mt-1 flex items-center" role="alert">
                    <span className="mr-1">⚠️</span>
                    {formErrors.category}
                  </p>
                )}
              </div>
            </div>
            <div>
              <label htmlFor="expense-date" className="block text-white/90 font-semibold mb-2 text-sm">
                Date <span className="text-red-400">*</span>
              </label>
              <input
                id="expense-date"
                type="date"
                value={formData.date}
                onChange={(e) => {
                  setFormData({ ...formData, date: e.target.value });
                  if (formErrors.date) setFormErrors({ ...formErrors, date: '' });
                }}
                required
                className={`input-glass w-full ${formErrors.date ? 'border-red-400 border-2' : ''}`}
                aria-invalid={!!formErrors.date}
                aria-describedby={formErrors.date ? 'date-error' : undefined}
              />
              {formErrors.date && (
                <p id="date-error" className="text-red-300 text-sm mt-1 flex items-center" role="alert">
                  <span className="mr-1">⚠️</span>
                  {formErrors.date}
                </p>
              )}
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

      {/* Search and Filter Section */}
      <Card className="mb-6 slide-up">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="search-expenses" className="block text-white/90 font-semibold mb-2 text-sm">
              Search Expenses
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                id="search-expenses"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-glass w-full pl-10"
                placeholder="Search expense names..."
                aria-label="Search expenses"
              />
            </div>
          </div>
          <div>
            <label htmlFor="filter-category" className="block text-white/90 font-semibold mb-2 text-sm">
              Filter by Category
            </label>
            <select
              id="filter-category"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="input-glass w-full"
              aria-label="Filter by category"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat} className="bg-gray-800">
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="sort-expenses" className="block text-white/90 font-semibold mb-2 text-sm">
              Sort By
            </label>
            <select
              id="sort-expenses"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-glass w-full"
              aria-label="Sort by"
            >
              <option value="date-desc">Date (Newest)</option>
              <option value="date-asc">Date (Oldest)</option>
              <option value="amount-desc">Amount (High to Low)</option>
              <option value="amount-asc">Amount (Low to High)</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
            </select>
          </div>
        </div>
        {searchQuery || filterCategory ? (
          <div className="mt-4 p-3 bg-white/10 rounded-lg border border-white/20">
            <p className="text-white/80 text-sm">
              Showing <span className="font-bold text-white">{filteredAndSortedExpenses.length}</span> expenses
              {totalFiltered > 0 && (
                <> with total <span className="font-bold text-red-300">{formatCurrency(totalFiltered)}</span></>
              )}
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterCategory('');
              }}
              className="text-orange-300 hover:text-orange-200 text-sm mt-2 underline"
            >
              Clear Filters
            </button>
          </div>
        ) : null}
      </Card>

      <Card>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <span className="mr-2">📉</span> Expense History
        </h2>
        {filteredAndSortedExpenses.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full" role="table" aria-label="Expense list">
                <thead>
                  <tr className="border-b-2 border-white/20">
                    <th className="text-left py-4 px-4 font-semibold text-white/80">Date</th>
                    <th className="text-left py-4 px-4 font-semibold text-white/80">Name</th>
                    <th className="text-left py-4 px-4 font-semibold text-white/80">Category</th>
                    <th className="text-right py-4 px-4 font-semibold text-white/80">Amount</th>
                    <th className="text-right py-4 px-4 font-semibold text-white/80">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedExpenses.map((expense, index) => (
                    <tr 
                      key={expense.id} 
                      className="border-b border-white/10 hover:bg-white/5 transition-all duration-200 slide-up"
                      style={{ animationDelay: `${0.05 * index}s` }}
                    >
                      <td className="py-4 px-4 text-white/80">
                        {new Date(expense.date).toLocaleDateString('en-CA')}
                      </td>
                      <td className="py-4 px-4 font-semibold text-white">{expense.name}</td>
                      <td className="py-4 px-4">
                        <span className="px-3 py-1.5 bg-light-blue/30 text-light-blue-200 rounded-lg text-sm font-semibold border border-light-blue/50">
                          {expense.category}
                        </span>
                      </td>
                      <td className={`py-4 px-4 text-right font-bold text-lg ${
                        parseFloat(expense.amount) < 0 ? 'text-green-300' : 'text-red-300'
                      }`}>
                        {parseFloat(expense.amount) < 0 ? (
                          <span className="flex items-center justify-end gap-1">
                            <span>↩️</span>
                            <span>{formatCurrency(Math.abs(parseFloat(expense.amount)))}</span>
                            <span className="text-xs">(Refund)</span>
                          </span>
                        ) : (
                          <span>-{formatCurrency(parseFloat(expense.amount))}</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="secondary"
                            onClick={() => handleEdit(expense)}
                            className="px-4 py-2 text-sm"
                            aria-label={`Edit ${expense.name}`}
                          >
                            ✏️ Edit
                          </Button>
                          <Button
                            variant="danger"
                            onClick={() => handleDeleteClick(expense)}
                            className="px-4 py-2 text-sm"
                            aria-label={`Delete ${expense.name}`}
                          >
                            🗑️ Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {filteredAndSortedExpenses.map((expense, index) => (
                <div
                  key={expense.id}
                  className="glass-card p-4 slide-up"
                  style={{ animationDelay: `${0.05 * index}s` }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-white text-lg mb-1">{expense.name}</h3>
                      <p className="text-white/60 text-sm mb-1">
                        {new Date(expense.date).toLocaleDateString('en-CA')}
                      </p>
                      {parseFloat(expense.amount) < 0 && (
                        <span className="px-2 py-0.5 bg-green-500/20 text-green-300 rounded text-xs font-semibold">
                          ↩️ Refund
                        </span>
                      )}
                    </div>
                    <p className={`font-bold text-xl ${
                      parseFloat(expense.amount) < 0 ? 'text-green-300' : 'text-red-300'
                    }`}>
                      {parseFloat(expense.amount) < 0 ? (
                        <span className="flex items-center gap-1">
                          <span>+</span>
                          <span>{formatCurrency(Math.abs(parseFloat(expense.amount)))}</span>
                        </span>
                      ) : (
                        <span>-{formatCurrency(parseFloat(expense.amount))}</span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1.5 bg-light-blue/30 text-light-blue-200 rounded-lg text-sm font-semibold border border-light-blue/50">
                      {expense.category}
                    </span>
                    <div className="flex space-x-2">
                      <Button
                        variant="secondary"
                        onClick={() => handleEdit(expense)}
                        className="px-3 py-1.5 text-xs"
                        aria-label={`Edit ${expense.name}`}
                      >
                        ✏️
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleDeleteClick(expense)}
                        className="px-3 py-1.5 text-xs"
                        aria-label={`Delete ${expense.name}`}
                      >
                        🗑️
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-white/60">
            <span className="text-4xl mb-3 block">💸</span>
            <p className="text-sm">
              {searchQuery || filterCategory ? 'No matching expenses found' : 'No expense records yet'}
            </p>
            <p className="text-xs mt-2">
              {searchQuery || filterCategory ? 'Try adjusting your search or filters' : 'Click "Add Expense" to get started!'}
            </p>
          </div>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setExpenseToDelete(null);
        }}
        title="Confirm Delete"
        message={
          expenseToDelete
            ? `Are you sure you want to delete "${expenseToDelete.name}" (${formatCurrency(parseFloat(expenseToDelete.amount))})? This action cannot be undone.`
            : ''
        }
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        type="danger"
      />
    </div>
  );
};

export default Expenses;
