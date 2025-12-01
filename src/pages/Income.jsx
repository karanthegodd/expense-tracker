import { useState, useEffect, useMemo } from 'react';
import { getIncomes, addIncome, updateIncome, deleteIncome } from '../utils/database';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { useToast } from '../components/ToastContainer';

const Income = () => {
  const [incomes, setIncomes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [incomeToDelete, setIncomeToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    source: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    isRefund: false,
  });
  const [formErrors, setFormErrors] = useState({});

  const incomeCategories = [
    'Salary',
    'Freelance',
    'Investment',
    'Part-time Job',
    'Scholarship',
    'Gift',
    'Business',
    'Rental Income',
    'Refund',
    'Other',
  ];

  useEffect(() => {
    loadIncomes();
  }, []);

  const loadIncomes = async () => {
    const data = await getIncomes();
    setIncomes(data.sort((a, b) => new Date(b.date) - new Date(a.date)));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.source.trim()) {
      errors.source = 'Please enter income source';
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      errors.amount = 'Please enter a valid amount';
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
      const result = await updateIncome(editingId, formData);
      if (result) {
        showToast('Income updated', 'success');
        resetForm();
        await loadIncomes();
      } else {
        showToast('Failed to update income', 'error');
      }
    } else {
      const result = await addIncome(formData);
      if (result) {
        showToast('Income added', 'success');
        resetForm();
        await loadIncomes();
      } else {
        showToast('Failed to add income', 'error');
      }
    }
  };

  const handleEdit = (income) => {
    setFormData({
      source: income.source,
      amount: income.amount,
      category: income.category || '',
      date: income.date,
      isRefund: income.isRefund || income.category === 'Refund',
    });
    setEditingId(income.id);
    setShowForm(true);
    setFormErrors({});
  };

  const handleDeleteClick = (income) => {
    setIncomeToDelete(income);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (incomeToDelete) {
      await deleteIncome(incomeToDelete.id);
      showToast('Income deleted', 'success');
      await loadIncomes();
      setDeleteModalOpen(false);
      setIncomeToDelete(null);
    }
  };

  const resetForm = () => {
    setFormData({
      source: '',
      amount: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
      isRefund: false,
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

  // Filter and sort incomes
  const filteredAndSortedIncomes = useMemo(() => {
    let filtered = incomes.filter((income) => {
      const query = searchQuery.toLowerCase();
      return (
        income.source.toLowerCase().includes(query) ||
        (income.category && income.category.toLowerCase().includes(query))
      );
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
        case 'source-asc':
          return a.source.localeCompare(b.source);
        case 'source-desc':
          return b.source.localeCompare(a.source);
        case 'category-asc':
          return (a.category || '').localeCompare(b.category || '');
        case 'category-desc':
          return (b.category || '').localeCompare(a.category || '');
        default:
          return 0;
      }
    });

    return filtered;
  }, [incomes, searchQuery, sortBy]);

  const totalFiltered = filteredAndSortedIncomes.reduce(
    (sum, inc) => sum + parseFloat(inc.amount || 0),
    0
  );

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 fade-in">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">
            💰 Income Management
          </h1>
          <p className="text-white/80 text-sm">Track and manage your income sources</p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          className="shadow-xl"
          aria-label={showForm ? 'Cancel adding income' : 'Add new income'}
        >
          {showForm ? '❌ Cancel' : '➕ Add Income'}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-8 slide-up">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 flex items-center">
            <span className="mr-2">{editingId ? '✏️' : '➕'}</span>
            {editingId ? 'Edit Income' : 'Add New Income'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div>
              <label htmlFor="income-source" className="block text-white/90 font-semibold mb-2 text-sm">
                Income Source <span className="text-red-400">*</span>
              </label>
              <input
                id="income-source"
                type="text"
                value={formData.source}
                onChange={(e) => {
                  setFormData({ ...formData, source: e.target.value });
                  if (formErrors.source) setFormErrors({ ...formErrors, source: '' });
                }}
                required
                className={`input-glass w-full ${formErrors.source ? 'border-red-400 border-2' : ''}`}
                placeholder="e.g., Salary, Freelance, Investment"
                aria-invalid={!!formErrors.source}
                aria-describedby={formErrors.source ? 'source-error' : undefined}
              />
              {formErrors.source && (
                <p id="source-error" className="text-red-300 text-sm mt-1 flex items-center" role="alert">
                  <span className="mr-1">⚠️</span>
                  {formErrors.source}
                </p>
              )}
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="income-amount" className="block text-white/90 font-semibold mb-2 text-sm">
                  Amount (CAD) <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 font-semibold">$</span>
                  <input
                    id="income-amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.amount}
                    onChange={(e) => {
                      setFormData({ ...formData, amount: e.target.value });
                      if (formErrors.amount) setFormErrors({ ...formErrors, amount: '' });
                    }}
                    required
                    className={`input-glass w-full pl-8 ${formErrors.amount ? 'border-red-400 border-2' : ''}`}
                    placeholder="0.00"
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
              </div>
              <div>
                <label htmlFor="income-category" className="block text-white/90 font-semibold mb-2 text-sm">
                  Category <span className="text-red-400">*</span>
                </label>
                <select
                  id="income-category"
                  value={formData.category}
                  onChange={(e) => {
                    const selectedCategory = e.target.value;
                    setFormData({ 
                      ...formData, 
                      category: selectedCategory,
                      isRefund: selectedCategory === 'Refund'
                    });
                    if (formErrors.category) setFormErrors({ ...formErrors, category: '' });
                  }}
                  required
                  className={`input-glass w-full ${formErrors.category ? 'border-red-400 border-2' : ''}`}
                  aria-invalid={!!formErrors.category}
                  aria-describedby={formErrors.category ? 'category-error' : undefined}
                >
                  <option value="">Select category</option>
                  {incomeCategories.map((cat) => (
                    <option key={cat} value={cat} className="bg-gray-800">
                      {cat === 'Refund' ? '↩️ Refund' : cat}
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
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="income-date" className="block text-white/90 font-semibold mb-2 text-sm">
                  Date <span className="text-red-400">*</span>
                </label>
                <input
                  id="income-date"
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
              <div className="flex items-end">
                <label className="flex items-center space-x-3 cursor-pointer p-4 bg-white/5 rounded-lg border border-white/20 hover:bg-white/10 transition-colors w-full">
                  <input
                    type="checkbox"
                    checked={formData.isRefund || formData.category === 'Refund'}
                    onChange={(e) => {
                      const isRefund = e.target.checked;
                      setFormData({ 
                        ...formData, 
                        isRefund,
                        category: isRefund ? 'Refund' : (formData.category === 'Refund' ? '' : formData.category)
                      });
                    }}
                    className="w-5 h-5 rounded border-white/30 bg-white/10 text-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-900 cursor-pointer"
                  />
                  <span className="text-white/90 font-semibold text-sm">
                    ↩️ This is a Refund
                  </span>
                </label>
              </div>
            </div>
            <div className="flex space-x-4 pt-2">
              <Button type="submit" variant="primary" className="flex-1">
                {editingId ? '💾 Update Income' : '➕ Add Income'}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Search and Sort Section */}
      <Card className="mb-6 slide-up">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="search-incomes" className="block text-white/90 font-semibold mb-2 text-sm">
              Search Income
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                id="search-incomes"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-glass w-full pl-10"
                placeholder="Search income sources or categories..."
                aria-label="Search income"
              />
            </div>
          </div>
          <div>
            <label htmlFor="sort-incomes" className="block text-white/90 font-semibold mb-2 text-sm">
              Sort By
            </label>
            <select
              id="sort-incomes"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-glass w-full"
              aria-label="Sort by"
            >
              <option value="date-desc">Date (Newest)</option>
              <option value="date-asc">Date (Oldest)</option>
              <option value="amount-desc">Amount (High to Low)</option>
              <option value="amount-asc">Amount (Low to High)</option>
              <option value="source-asc">Source (A-Z)</option>
              <option value="source-desc">Source (Z-A)</option>
              <option value="category-asc">Category (A-Z)</option>
              <option value="category-desc">Category (Z-A)</option>
            </select>
          </div>
        </div>
        {searchQuery ? (
          <div className="mt-4 p-3 bg-white/10 rounded-lg border border-white/20">
            <p className="text-white/80 text-sm">
              Showing <span className="font-bold text-white">{filteredAndSortedIncomes.length}</span> income entries
              {totalFiltered > 0 && (
                <> with total <span className="font-bold text-green-300">{formatCurrency(totalFiltered)}</span></>
              )}
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="text-orange-300 hover:text-orange-200 text-sm mt-2 underline"
            >
              Clear Search
            </button>
          </div>
        ) : null}
      </Card>

      <Card>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <span className="mr-2">📈</span> Income History
        </h2>
        {filteredAndSortedIncomes.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full" role="table" aria-label="Income list">
                <thead>
                  <tr className="border-b-2 border-white/20">
                    <th className="text-left py-4 px-4 font-semibold text-white/80">Date</th>
                    <th className="text-left py-4 px-4 font-semibold text-white/80">Source</th>
                    <th className="text-left py-4 px-4 font-semibold text-white/80">Category</th>
                    <th className="text-right py-4 px-4 font-semibold text-white/80">Amount</th>
                    <th className="text-right py-4 px-4 font-semibold text-white/80">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedIncomes.map((income, index) => (
                    <tr 
                      key={income.id} 
                      className="border-b border-white/10 hover:bg-white/5 transition-all duration-200 slide-up"
                      style={{ animationDelay: `${0.05 * index}s` }}
                    >
                      <td className="py-4 px-4 text-white/80">
                        {new Date(income.date).toLocaleDateString('en-CA')}
                      </td>
                      <td className="py-4 px-4 font-semibold text-white">
                        {income.isRefund || income.category === 'Refund' ? (
                          <span className="flex items-center gap-2">
                            <span>↩️</span>
                            <span>{income.source}</span>
                          </span>
                        ) : (
                          income.source
                        )}
                      </td>
                      <td className="py-4 px-4 text-white/80">
                        <span className={`px-2 py-1 rounded-md text-sm ${
                          income.isRefund || income.category === 'Refund'
                            ? 'bg-green-500/20 text-green-300'
                            : 'bg-blue-500/20 text-blue-300'
                        }`}>
                          {income.category || 'N/A'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right font-bold text-green-300 text-lg">
                        +{formatCurrency(parseFloat(income.amount))}
                        {(income.isRefund || income.category === 'Refund') && (
                          <span className="text-xs ml-1 text-green-400">(Refund)</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="secondary"
                            onClick={() => handleEdit(income)}
                            className="px-4 py-2 text-sm"
                            aria-label={`Edit ${income.source}`}
                          >
                            ✏️ Edit
                          </Button>
                          <Button
                            variant="danger"
                            onClick={() => handleDeleteClick(income)}
                            className="px-4 py-2 text-sm"
                            aria-label={`Delete ${income.source}`}
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
              {filteredAndSortedIncomes.map((income, index) => (
                <div
                  key={income.id}
                  className="glass-card p-4 slide-up"
                  style={{ animationDelay: `${0.05 * index}s` }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-white text-lg mb-1">
                        {income.isRefund || income.category === 'Refund' ? (
                          <span className="flex items-center gap-2">
                            <span>↩️</span>
                            <span>{income.source}</span>
                          </span>
                        ) : (
                          income.source
                        )}
                      </h3>
                      <p className="text-white/60 text-sm mb-1">
                        {new Date(income.date).toLocaleDateString('en-CA')}
                      </p>
                      <span className={`px-2 py-1 rounded-md text-xs ${
                        income.isRefund || income.category === 'Refund'
                          ? 'bg-green-500/20 text-green-300'
                          : 'bg-blue-500/20 text-blue-300'
                      }`}>
                        {income.category || 'N/A'}
                      </span>
                    </div>
                    <p className="font-bold text-green-300 text-xl">
                      +{formatCurrency(parseFloat(income.amount))}
                      {(income.isRefund || income.category === 'Refund') && (
                        <span className="text-xs ml-1 text-green-400 block">(Refund)</span>
                      )}
                    </p>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="secondary"
                      onClick={() => handleEdit(income)}
                      className="px-3 py-1.5 text-xs"
                      aria-label={`Edit ${income.source}`}
                    >
                      ✏️
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleDeleteClick(income)}
                      className="px-3 py-1.5 text-xs"
                      aria-label={`Delete ${income.source}`}
                    >
                      🗑️
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-white/60">
            <span className="text-4xl mb-3 block">💰</span>
            <p className="text-sm">
              {searchQuery ? 'No matching income found' : 'No income records yet'}
            </p>
            <p className="text-sm mt-2">
              {searchQuery ? 'Try adjusting your search' : 'Click "Add Income" to get started!'}
            </p>
          </div>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setIncomeToDelete(null);
        }}
        title="Confirm Delete"
        message={
          incomeToDelete
            ? `Are you sure you want to delete "${incomeToDelete.source}" (${formatCurrency(parseFloat(incomeToDelete.amount))})? This action cannot be undone.`
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

export default Income;
