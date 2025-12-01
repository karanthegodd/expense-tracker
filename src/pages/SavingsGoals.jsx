import { useState, useEffect } from 'react';
import { getSavingsGoals, addSavingsGoal, updateSavingsGoal, deleteSavingsGoal, addContributionToGoal, getAvailableFunds } from '../utils/database';
import Card from '../components/Card';
import Button from '../components/Button';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';
import { formatDateEST } from '../utils/dateUtils';

const SavingsGoals = () => {
  const [goals, setGoals] = useState([]);
  const [availableFunds, setAvailableFunds] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [showContributionForm, setShowContributionForm] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    dueDate: '',
  });
  const [contributionAmount, setContributionAmount] = useState('');

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = () => {
    const data = getSavingsGoals();
    setGoals(data);
    const funds = getAvailableFunds();
    setAvailableFunds(funds);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingId) {
      updateSavingsGoal(editingId, formData);
    } else {
      addSavingsGoal(formData);
    }
    
    resetForm();
    loadGoals();
  };

  const handleContributionSubmit = (e) => {
    e.preventDefault();
    if (selectedGoalId && contributionAmount) {
      const amount = parseFloat(contributionAmount);
      if (amount > availableFunds) {
        alert(`Insufficient funds! You have ${formatCurrency(availableFunds)} available.`);
        return;
      }
      if (amount <= 0) {
        alert('Please enter a positive amount.');
        return;
      }
      addContributionToGoal(selectedGoalId, contributionAmount);
      setContributionAmount('');
      setShowContributionForm(false);
      setSelectedGoalId(null);
      loadGoals();
    }
  };

  const handleEdit = (goal) => {
    setFormData({
      name: goal.name,
      targetAmount: goal.targetAmount,
      dueDate: goal.dueDate || '',
    });
    setEditingId(goal.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this savings goal?')) {
      deleteSavingsGoal(id);
      loadGoals();
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      targetAmount: '',
      dueDate: '',
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

  const goalsData = goals.map(goal => {
    const percentage = (parseFloat(goal.savedAmount || 0) / parseFloat(goal.targetAmount || 1)) * 100;
    return {
      ...goal,
      percentage: Math.min(percentage, 100),
    };
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 fade-in">
        <div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-2">
            🎯 Savings Goals
          </h1>
          <p className="text-white/80 text-lg">Track your savings progress</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowForm(!showForm)}
          className="shadow-xl"
        >
          {showForm ? '❌ Cancel' : '➕ Add Goal'}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-8 slide-up">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
            <span className="mr-2">{editingId ? '✏️' : '➕'}</span>
            {editingId ? 'Edit Savings Goal' : 'Add New Savings Goal'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white/90 font-semibold mb-2 text-sm">
                Goal Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="input-glass w-full"
                placeholder="e.g., Mexico Trip, PS5 Purchase"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/90 font-semibold mb-2 text-sm">
                  Target Amount (CAD)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 font-semibold">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                    required
                    className="input-glass w-full pl-8"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <label className="block text-white/90 font-semibold mb-2 text-sm">
                  Due Date (Optional)
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="input-glass w-full"
                />
              </div>
            </div>
            <div className="flex space-x-4 pt-2">
              <Button type="submit" variant="primary" className="flex-1">
                {editingId ? '💾 Update Goal' : '➕ Add Goal'}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {showContributionForm && selectedGoalId && (
        <Card className="mb-8 slide-up border-2 border-green-400/50">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
            <span className="mr-2">💰</span>
            Add Money to Goal: {goals.find(g => g.id === selectedGoalId)?.name || 'Goal'}
          </h2>
          <div className="mb-4 p-4 bg-gradient-to-r from-green-500/20 to-green-400/10 rounded-lg border border-green-400/30">
            <p className="text-white/80 text-sm mb-1">Available Funds to Transfer:</p>
            <p className="text-3xl font-bold text-green-300">{formatCurrency(availableFunds)}</p>
            <p className="text-white/60 text-xs mt-2">💰 This is money you can move from your savings to this goal</p>
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
              <Button type="submit" variant="primary" className="flex-1 text-lg py-3" disabled={!contributionAmount || parseFloat(contributionAmount) <= 0 || parseFloat(contributionAmount) > availableFunds}>
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

      {goals.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goalsData.map((goal, index) => (
            <Card key={goal.id} className="slide-up" style={{ animationDelay: `${0.1 * index}s` }}>
              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-4">{goal.name}</h3>
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
                      fontSize="24"
                      fontWeight="bold"
                    >
                      {goal.percentage.toFixed(0)}%
                    </text>
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  <p className="text-white/80 text-sm">
                    Saved: <span className="font-bold text-white">{formatCurrency(parseFloat(goal.savedAmount || 0))}</span>
                  </p>
                  <p className="text-white/80 text-sm">
                    Target: <span className="font-bold text-white">{formatCurrency(parseFloat(goal.targetAmount))}</span>
                  </p>
                  {goal.dueDate && (
                    <p className="text-white/60 text-xs mt-2">
                      Due: {formatDateEST(goal.dueDate)}
                    </p>
                  )}
                </div>
                <div className="flex space-x-2 mt-4">
                  <Button
                    variant="primary"
                    onClick={() => {
                      setSelectedGoalId(goal.id);
                      setShowContributionForm(true);
                    }}
                    className="flex-1 text-sm font-bold"
                  >
                    💰 Add Money
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => handleEdit(goal)}
                    className="text-sm"
                  >
                    ✏️
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleDelete(goal.id)}
                    className="text-sm"
                  >
                    🗑️
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <div className="text-center py-12 text-white/60">
            <span className="text-6xl mb-4 block">🎯</span>
            <p className="text-lg">No savings goals yet</p>
            <p className="text-sm mt-2">Click "Add Goal" to get started!</p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default SavingsGoals;

