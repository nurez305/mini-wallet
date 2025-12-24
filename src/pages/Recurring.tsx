import React, { useEffect, useState } from 'react';
import { useStore, RecurringTransaction } from '../store/useStore';
import { Plus, Edit2, Trash2, Calendar, RefreshCw, X } from 'lucide-react';
import dayjs from 'dayjs';

export default function Recurring() {
  const { 
    recurringTransactions, 
    addRecurringTransaction, 
    updateRecurringTransaction, 
    deleteRecurringTransaction,
    processRecurringTransactions,
    accounts,
    transactions
  } = useStore();
  
  const [showForm, setShowForm] = useState(false);
  const [editingRecurring, setEditingRecurring] = useState<RecurringTransaction | null>(null);
  
  const [formData, setFormData] = useState({
    merchant: '',
    category: '',
    amount: '',
    accountId: accounts[0]?.id || '',
    description: '',
    frequency: 'monthly' as RecurringTransaction['frequency'],
    startDate: dayjs().format('YYYY-MM-DD'),
    endDate: ''
  });

  // Calculate pending transactions directly (no state needed)
  const getPendingCount = () => {
    const now = dayjs();
    // const today = now.format('YYYY-MM-DD');
    
    const pending = recurringTransactions.filter(rt => {
      if (!rt.isActive) return false;
      
      const lastProcessed = rt.lastProcessed ? dayjs(rt.lastProcessed) : dayjs(rt.startDate);
      const daysSinceLast = now.diff(lastProcessed, 'day');
      
      switch (rt.frequency) {
        case 'daily': return daysSinceLast >= 1;
        case 'weekly': return daysSinceLast >= 7;
        case 'monthly': return daysSinceLast >= 30;
        case 'yearly': return daysSinceLast >= 365;
        default: return false;
      }
    });
    
    return pending.length;
  };

// Replace the entire handleSubmit function:
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  
  // Parse amount and ensure it's a number
  const amountValue = parseFloat(formData.amount) || 0;
  
  // For expenses (non-Income categories), make amount negative
  const finalAmount = formData.category === 'Income' ? 
    Math.abs(amountValue) : 
    -Math.abs(amountValue);
  
  if (editingRecurring) {
    // For editing: pass updates without id and with proper types
    const updates = {
      merchant: formData.merchant,
      category: formData.category,
      amount: finalAmount,
      accountId: formData.accountId,
      description: formData.description,
      frequency: formData.frequency,
      startDate: formData.startDate,
      endDate: formData.endDate || undefined,
      // Do not include lastProcessed in updates unless we want to reset it
    };
    
    updateRecurringTransaction(editingRecurring.id, updates);
  } else {
    // For new: create complete object without id (store will generate it)
    const newRecurring: Omit<RecurringTransaction, 'id'> = {
      merchant: formData.merchant,
      category: formData.category,
      amount: finalAmount,
      accountId: formData.accountId,
      description: formData.description,
      frequency: formData.frequency,
      startDate: formData.startDate,
      endDate: formData.endDate || undefined,
      isActive: true,
      // lastProcessed is optional and will be undefined by default
    };
    
    // Cast to any to bypass TypeScript error, or update store type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    addRecurringTransaction(newRecurring as any);
  }
  
  resetForm();
};

// Also update the handleEdit function:
const handleEdit = (rt: RecurringTransaction) => {
  setEditingRecurring(rt);
  setFormData({
    merchant: rt.merchant,
    category: rt.category,
    amount: Math.abs(rt.amount).toString(), // Show absolute value in form
    accountId: rt.accountId,
    description: rt.description || '',
    frequency: rt.frequency,
    startDate: rt.startDate,
    endDate: rt.endDate || ''
  });
  setShowForm(true);
};
  const resetForm = () => {
    setFormData({
      merchant: '',
      category: '',
      amount: '',
      accountId: accounts[0]?.id || '',
      description: '',
      frequency: 'monthly',
      startDate: dayjs().format('YYYY-MM-DD'),
      endDate: ''
    });
    setShowForm(false);
    setEditingRecurring(null);
  };

  const toggleActive = (rt: RecurringTransaction) => {
    updateRecurringTransaction(rt.id, { isActive: !rt.isActive });
  };

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'monthly': return 'Monthly';
      case 'yearly': return 'Yearly';
      default: return frequency;
    }
  };

  const getNextDate = (rt: RecurringTransaction) => {
    const nextDate = rt.lastProcessed 
      ? dayjs(rt.lastProcessed).add(1, rt.frequency === 'daily' ? 'day' : rt.frequency === 'weekly' ? 'week' : rt.frequency === 'monthly' ? 'month' : 'year')
      : dayjs(rt.startDate);
    
    return nextDate;
  };

  // In your Recurring component, update handleProcessNow:
// Update the handleProcessNow function to include transactions from store:

// Replace handleProcessNow with this:
const handleProcessNow = () => {
  console.log('=== PROCESS NOW CLICKED ===');
  
  // Get current state for comparison
  const mainAccountBefore = accounts.find(a => a.id === 'main');
  const savingsAccountBefore = accounts.find(a => a.id === 'savings');
  const transactionCountBefore = transactions.length;
  
  console.log('Before processing:');
  console.log('- Main balance:', mainAccountBefore?.balance);
  console.log('- Savings balance:', savingsAccountBefore?.balance);
  console.log('- Transaction count:', transactionCountBefore);
  
  // Process transactions
  processRecurringTransactions();
  
  // The state will update via React's re-render
  // We'll see the changes in the next render cycle
  
  alert('Recurring transactions processed! Check:\n1. Your balances\n2. Transaction history\n3. Refresh the page if changes are not visible immediately.');
};

// Add this useEffect at the top of your Recurring component, after the useState declarations:
useEffect(() => {
  console.log('=== STATE UPDATED ===');
  console.log('Accounts:', accounts);
  console.log('Transactions count:', transactions.length);
  console.log('Latest transactions:', transactions.slice(0, 3));
}, [accounts, transactions]);

const handleDeleteRecurring = (rt: RecurringTransaction) => {
  if (window.confirm(`Delete recurring transaction "${rt.merchant}"?\n\nThis will also delete any transactions created from it and update your balances.`)) {
    console.log('Deleting recurring transaction:', rt);
    
    // Store current balance for comparison
    const account = accounts.find(a => a.id === rt.accountId);
    console.log('Account balance before delete:', account?.balance);
    
    // Delete the recurring transaction (which will also delete related transactions)
    deleteRecurringTransaction(rt.id);
    
    // Show feedback
    alert(`Recurring transaction "${rt.merchant}" deleted!\n\nYour account balance has been updated.`);
  }
};

  // Calculate stats
  const monthlyRecurringIncome = recurringTransactions
    .filter(rt => rt.isActive && rt.amount > 0)
    .reduce((sum, rt) => sum + rt.amount, 0);
  
  const monthlyRecurringExpenses = Math.abs(
    recurringTransactions
      .filter(rt => rt.isActive && rt.amount < 0)
      .reduce((sum, rt) => sum + rt.amount, 0)
  );

  const activeRecurring = recurringTransactions.filter(rt => rt.isActive).length;
  const pendingCount = getPendingCount();
  

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Recurring Transactions</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Manage automatic recurring payments and income</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleProcessNow}
            className="bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 text-sm sm:text-base"
          >
            <RefreshCw size={20} />
            <span>Process Now</span>
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="bg-yellow-500 dark:bg-yellow-600 hover:bg-yellow-600 dark:hover:bg-yellow-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 text-sm sm:text-base"
          >
            <Plus size={20} />
            <span>Add Recurring</span>
          </button>
        </div>
      </div>

      {/* Pending Transactions Notification */}
      {pendingCount > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <div className="flex items-center mb-3 sm:mb-0">
              <div className="shrink-0">
                <RefreshCw className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                  {pendingCount} pending recurring transaction{pendingCount !== 1 ? 's' : ''}
                </h3>
                <div className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                  <p>
                    Click "Process Now" to add these to your transactions.
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={handleProcessNow}
              className="bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              Process Now
            </button>
          </div>
        </div>
      )}

      {/* Form Section */}
      {showForm && (
        <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-lg shadow dark:border dark:border-gray-800">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold dark:text-white">
              {editingRecurring ? 'Edit Recurring Transaction' : 'New Recurring Transaction'}
            </h2>
            <button
              onClick={resetForm}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Merchant
                </label>
                <input
                  type="text"
                  value={formData.merchant}
                  onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm sm:text-base dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  placeholder="e.g., Netflix, Salary"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm sm:text-base dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  required
                >
                  <option value="" className="dark:bg-gray-800 dark:text-white">Select Category</option>
                  <option value="Income" className="dark:bg-gray-800 dark:text-white">Income</option>
                  <option value="Food" className="dark:bg-gray-800 dark:text-white">Food</option>
                  <option value="Transportation" className="dark:bg-gray-800 dark:text-white">Transportation</option>
                  <option value="Entertainment" className="dark:bg-gray-800 dark:text-white">Entertainment</option>
                  <option value="Bills" className="dark:bg-gray-800 dark:text-white">Bills</option>
                  <option value="Shopping" className="dark:bg-gray-800 dark:text-white">Shopping</option>
                  <option value="Health" className="dark:bg-gray-800 dark:text-white">Health</option>
                  <option value="Other" className="dark:bg-gray-800 dark:text-white">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm sm:text-base dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  placeholder="0.00"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Account
                </label>
                <select
                  value={formData.accountId}
                  onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm sm:text-base dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  required
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id} className="dark:bg-gray-800 dark:text-white">
                      {acc.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Frequency
                </label>
                <select
                  value={formData.frequency}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
                  className="w-full border rounded-lg px-3 py-2 text-sm sm:text-base dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                >
                  <option value="daily" className="dark:bg-gray-800 dark:text-white">Daily</option>
                  <option value="weekly" className="dark:bg-gray-800 dark:text-white">Weekly</option>
                  <option value="monthly" className="dark:bg-gray-800 dark:text-white">Monthly</option>
                  <option value="yearly" className="dark:bg-gray-800 dark:text-white">Yearly</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm sm:text-base dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  required
                />
              </div>
              
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm sm:text-base dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  placeholder="Add a description"
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-yellow-500 dark:bg-yellow-600 hover:bg-yellow-600 dark:hover:bg-yellow-700 text-white rounded-lg text-sm sm:text-base"
              >
                {editingRecurring ? 'Update' : 'Create'} Transaction
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Stats Summary */}
      {recurringTransactions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow dark:border dark:border-gray-800">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                ${monthlyRecurringIncome.toFixed(2)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Monthly Income</div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow dark:border dark:border-gray-800">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                ${monthlyRecurringExpenses.toFixed(2)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Monthly Expenses</div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow dark:border dark:border-gray-800">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {activeRecurring}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Active Recurring</div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Table - Hidden on mobile */}
      <div className="hidden md:block bg-white dark:bg-gray-900 rounded-lg shadow dark:border dark:border-gray-800 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Merchant
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Frequency
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Next Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {recurringTransactions.map((rt) => {
              const nextDate = getNextDate(rt);
              
              return (
                <tr key={rt.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{rt.merchant}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{rt.category}</div>
                      {rt.description && (
                        <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">{rt.description}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`font-medium ${rt.amount >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {rt.amount >= 0 ? '+' : '-'}${Math.abs(rt.amount).toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-1">
                      <Calendar size={16} className="text-gray-400 dark:text-gray-500" />
                      <span className="dark:text-gray-300">{getFrequencyLabel(rt.frequency)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap dark:text-gray-300">
                    {nextDate.format('MMM D, YYYY')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleActive(rt)}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        rt.isActive
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-400'
                      }`}
                    >
                      {rt.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(rt)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 p-1 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteRecurring(rt)}
                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 p-1 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            
            {recurringTransactions.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                  <div className="mb-4">No recurring transactions set up yet</div>
                  <button
                    onClick={() => setShowForm(true)}
                    className="text-yellow-600 dark:text-yellow-500 hover:text-yellow-700 dark:hover:text-yellow-400 font-medium"
                  >
                    Add your first recurring transaction
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards - Show on mobile only */}
      <div className="md:hidden space-y-4">
        {recurringTransactions.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow dark:border dark:border-gray-800 p-8 text-center">
            <div className="text-gray-400 dark:text-gray-500 mb-4">No recurring transactions set up yet</div>
            <button
              onClick={() => setShowForm(true)}
              className="text-yellow-600 dark:text-yellow-500 hover:text-yellow-700 dark:hover:text-yellow-400 font-medium"
            >
              Add your first recurring transaction
            </button>
          </div>
        ) : (
          recurringTransactions.map((rt) => {
            const nextDate = getNextDate(rt);
            const account = accounts.find(a => a.id === rt.accountId);
            
            return (
              <div key={rt.id} className="bg-white dark:bg-gray-900 rounded-lg shadow border dark:border-gray-800 p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{rt.merchant}</h3>
                      <span className={`font-medium ${rt.amount >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {rt.amount >= 0 ? '+' : '-'}${Math.abs(rt.amount).toFixed(2)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {rt.category} • {account?.name}
                    </div>
                    {rt.description && (
                      <div className="text-xs text-gray-500 dark:text-gray-500 mb-3">{rt.description}</div>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Frequency</div>
                    <div className="font-medium flex items-center space-x-1">
                      <Calendar size={14} className="text-gray-400 dark:text-gray-500" />
                      <span className="dark:text-gray-300">{getFrequencyLabel(rt.frequency)}</span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Next Date</div>
                    <div className="font-medium dark:text-gray-300">{nextDate.format('MMM D')}</div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-3 border-t dark:border-gray-700">
                  <div>
                    <button
                      onClick={() => toggleActive(rt)}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        rt.isActive
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-400'
                      }`}
                    >
                      {rt.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(rt)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 p-1 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteRecurring(rt)}
                      className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 p-1 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Info Section */}
      <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 dark:text-blue-300 mb-2">How Recurring Transactions Work</h3>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li className="flex items-start">
            <div className="w-1.5 h-1.5 bg-blue-500 dark:bg-blue-400 rounded-full mt-1.5 mr-2 shrink-0"></div>
            <span>Recurring transactions are automatically added to your transactions based on their frequency</span>
          </li>
          <li className="flex items-start">
            <div className="w-1.5 h-1.5 bg-blue-500 dark:bg-blue-400 rounded-full mt-1.5 mr-2 shrink-0"></div>
            <span>Click "Process Now" to manually add pending transactions</span>
          </li>
          <li className="flex items-start">
            <div className="w-1.5 h-1.5 bg-blue-500 dark:bg-blue-400 rounded-full mt-1.5 mr-2 shrink-0"></div>
            <span>Set recurring transactions to "Inactive" to temporarily pause them</span>
          </li>
        </ul>
      </div>
    </div>
  );
}