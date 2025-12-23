import React, { useState } from 'react';
import { useStore, Budget } from '../store/useStore';
import { Plus, Edit2, Trash2, TrendingUp, TrendingDown } from 'lucide-react';

export default function Budgets() {
  const { budgets, addBudget, updateBudget, deleteBudget, calculateBudgetSpending } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [formData, setFormData] = useState({
    category: '',
    limit: '',
    period: 'monthly' as Budget['period']
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const budgetData = {
      ...formData,
      limit: parseFloat(formData.limit),
      startDate: new Date().toISOString()
    };
    
    if (editingBudget) {
      updateBudget(editingBudget.id, budgetData);
    } else {
      addBudget(budgetData as Budget);
    }
    
    setFormData({ category: '', limit: '', period: 'monthly' });
    setShowForm(false);
    setEditingBudget(null);
  };

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setFormData({
      category: budget.category,
      limit: budget.limit.toString(),
      period: budget.period
    });
    setShowForm(true);
  };

  const progressPercentage = (spent: number, limit: number) => {
    return Math.min((spent / limit) * 100, 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage < 70) return 'bg-green-500';
    if (percentage < 90) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Budget Management</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Add Budget</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">
            {editingBudget ? 'Edit Budget' : 'Create New Budget'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Food">Food</option>
                  <option value="Transportation">Transportation</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Health">Health</option>
                  <option value="Bills">Bills</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Limit ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.limit}
                  onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="0.00"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Period
                </label>
                <select
                  value={formData.period}
                  onChange={(e) => setFormData({ ...formData, period: e.target.value as Budget['period'] })}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingBudget(null);
                  setFormData({ category: '', limit: '', period: 'monthly' });
                }}
                className="px-4 py-2 border rounded-lg text-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg"
              >
                {editingBudget ? 'Update' : 'Create'} Budget
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgets.map((budget) => {
          const spent = calculateBudgetSpending(budget);
          const percentage = progressPercentage(spent, budget.limit);
          const remaining = budget.limit - spent;
          
          return (
            <div key={budget.id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{budget.category}</h3>
                  <p className="text-sm text-gray-500 capitalize">{budget.period} Budget</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(budget)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => deleteBudget(budget.id)}
                    className="p-1 hover:bg-red-50 rounded text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Spent / Limit</span>
                    <span className="font-medium">
                      ${spent.toFixed(2)} / ${budget.limit.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getProgressColor(percentage)}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {percentage.toFixed(1)}% used
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <div className="text-sm text-gray-500">Remaining</div>
                    <div className={`font-semibold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${remaining.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Status</div>
                    <div className="flex items-center space-x-1">
                      {remaining >= 0 ? (
                        <>
                          <TrendingDown size={16} className="text-green-600" />
                          <span className="font-medium text-green-600">On Track</span>
                        </>
                      ) : (
                        <>
                          <TrendingUp size={16} className="text-red-600" />
                          <span className="font-medium text-red-600">Over Budget</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        {budgets.length === 0 && (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-400 mb-4">No budgets created yet</div>
            <button
              onClick={() => setShowForm(true)}
              className="text-yellow-600 hover:text-yellow-700 font-medium"
            >
              Create your first budget
            </button>
          </div>
        )}
      </div>
    </div>
  );
}