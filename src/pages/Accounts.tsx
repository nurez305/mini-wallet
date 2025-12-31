import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Plus, Minus, Download, Upload, Check, X, Loader2 } from 'lucide-react';
import TransferForm from '../components/TransferForm';
import TransactionsTable from '../components/TransactionsTable';

export default function Accounts() {
  const { accounts, transactions, addTransaction } = useStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'deposit' | 'withdraw'>('overview');
  const [selectedAccountId, setSelectedAccountId] = useState<string>(accounts[0]?.id || '');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<string>('Transfer');
  
  // Error states for deposit and withdraw forms
  const [depositError, setDepositError] = useState<string>('');
  const [withdrawError, setWithdrawError] = useState<string>('');
  
  // Success modal states
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [transactionType, setTransactionType] = useState<'deposit' | 'withdraw'>('deposit');
  
  // Loading states for deposit and withdrawal
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingType, setProcessingType] = useState<'deposit' | 'withdraw' | null>(null);
  
  // Timeout reference
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up timeout on component unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Account stats calculation
  const accountStats = React.useMemo(() => {
    return accounts.map(account => {
      const accountTransactions = transactions.filter(t => t.accountId === account.id);
      const accountIncome = accountTransactions
        .filter(t => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);
      const accountExpenses = Math.abs(
        accountTransactions
          .filter(t => t.amount < 0)
          .reduce((sum, t) => sum + t.amount, 0)
      );
      const accountNetFlow = accountIncome - accountExpenses;
      
      return {
        ...account,
        income: accountIncome,
        expenses: accountExpenses,
        netFlow: accountNetFlow
      };
    });
  }, [transactions, accounts]);

  // Get selected account
  const selectedAccount = accounts.find(acc => acc.id === selectedAccountId);


  // Clear errors when switching tabs
  const handleTabChange = (tab: 'overview' | 'deposit' | 'withdraw') => {
    // Clear any pending timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    setActiveTab(tab);
    setDepositError('');
    setWithdrawError('');
    setAmount('');
    setDescription('');
    setShowSuccessModal(false);
    setIsProcessing(false);
    setProcessingType(null);
  };

  // Show success modal after delay
  const showSuccessAfterDelay = (type: 'deposit' | 'withdraw', amount: number, accountName: string) => {
    const formattedAmount = amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD'
    });
    
    let message = '';
    if (type === 'deposit') {
      message = `Successfully deposited ${formattedAmount} to ${accountName}`;
    } else {
      message = `Successfully withdrew ${formattedAmount} from ${accountName}`;
    }
    
    setSuccessMessage(message);
    setTransactionType(type);
    
    // Set timeout for 1 second before showing modal
    timeoutRef.current = setTimeout(() => {
      setShowSuccessModal(true);
      setIsProcessing(false);
      setProcessingType(null);
      timeoutRef.current = null;
    }, 1000);
  };

  // Handle deposit
  const handleDeposit = () => {
    setDepositError(''); // Clear previous errors

    if (!selectedAccountId) {
      setDepositError('Please select an account');
      return;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      setDepositError('Please enter a valid positive amount');
      return;
    }

    // Set processing state
    setIsProcessing(true);
    setProcessingType('deposit');

    const depositAmount = parseFloat(amount);
    const newTransaction = {
      // FIX: Use full ISO string with time for proper sorting
      date: new Date().toISOString(), // Changed from .split('T')[0]
      merchant: description || 'Deposit',
      amount: depositAmount,
      category: category || 'Deposit',
      accountId: selectedAccountId,
      description: description || 'Manual deposit'
    };

    addTransaction(newTransaction);
    
    // Show success modal after 1 second
    showSuccessAfterDelay('deposit', depositAmount, selectedAccount?.name || 'Account');
    
    // Reset form immediately
    setAmount('');
    setDescription('');
    setDepositError('');
  };

  // Handle withdrawal
  const handleWithdraw = () => {
    setWithdrawError(''); // Clear previous errors

    if (!selectedAccountId) {
      setWithdrawError('Please select an account');
      return;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      setWithdrawError('Please enter a valid positive amount');
      return;
    }

    const withdrawAmount = parseFloat(amount);
    if (selectedAccount && selectedAccount.balance < withdrawAmount) {
      setWithdrawError(`Insufficient balance. Available: $${selectedAccount.balance.toFixed(2)}`);
      return;
    }

    // Set processing state
    setIsProcessing(true);
    setProcessingType('withdraw');

    const newTransaction = {
      // FIX: Use full ISO string with time for proper sorting
      date: new Date().toISOString(), // Changed from .split('T')[0]
      merchant: description || 'Withdrawal',
      amount: -withdrawAmount,
      category: category || 'Withdrawal',
      accountId: selectedAccountId,
      description: description || 'Manual withdrawal'
    };

    addTransaction(newTransaction);
    
    // Show success modal after 1 second
    showSuccessAfterDelay('withdraw', withdrawAmount, selectedAccount?.name || 'Account');
    
    // Reset form immediately
    setAmount('');
    setDescription('');
    setWithdrawError('');
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-md w-full p-6 transform transition-all duration-300 scale-100 animate-fadeIn">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  transactionType === 'deposit' 
                    ? 'bg-green-100 dark:bg-green-900/30' 
                    : 'bg-blue-100 dark:bg-blue-900/30'
                }`}>
                  <Check className={`w-6 h-6 ${
                    transactionType === 'deposit' 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-blue-600 dark:text-blue-400'
                  }`} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {transactionType === 'deposit' ? 'Deposit Successful' : 'Withdrawal Successful'}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {transactionType === 'deposit' ? 'Funds added to account' : 'Funds withdrawn from account'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="my-4">
              <p className="text-gray-700 dark:text-gray-300 text-center">{successMessage}</p>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                  onClick={() => {
                  setShowSuccessModal(false);
                  if (transactionType === 'deposit') {
                    setActiveTab('overview');
                  }
                }}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                View Transactions
              </button>
              <button
              onClick={() => setShowSuccessModal(false)}
                className={`px-4 py-2 rounded-lg font-medium text-white transition-colors ${
                  transactionType === 'deposit' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Accounts</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your accounts, make deposits, withdrawals, and transfers
          </p>
        </div>
      </div>

      {/* Account Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {[
          { id: 'overview', label: 'Overview', icon: null },
          { id: 'deposit', label: 'Deposit', icon: <Plus size={16} /> },
          { id: 'withdraw', label: 'Withdraw', icon: <Minus size={16} /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id as any)}
            className={`flex items-center space-x-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-yellow-500 text-yellow-600 dark:text-yellow-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            {tab.icon && <span>{tab.icon}</span>}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Account Actions */}
        <div className="lg:col-span-1 space-y-6">
          {/* Account Selection */}
          <div className="bg-white dark:bg-gray-900 border dark:border-gray-700 p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4 dark:text-white">Select Account</h2>
            <div className="space-y-3">
              {accounts.map(account => (
                <button
                  key={account.id}
                  onClick={() => setSelectedAccountId(account.id)}
                  disabled={isProcessing}
                  className={`w-full p-4 rounded-lg text-left transition-colors ${
                    selectedAccountId === account.id
                      ? 'bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800'
                      : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{account.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {accountStats.find(a => a.id === account.id)?.transactions || 0} transactions
                      </div>
                    </div>
                    <div className="text-xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(account.balance)}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Transfer Form */}
          <TransferForm />
        </div>

        {/* Right Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Account Overview */}
          {activeTab === 'overview' && selectedAccount && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4 dark:text-white">{selectedAccount.name} Overview</h2>
              
              {/* Balance Card */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6">
                <div className="text-center">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Current Balance</div>
                  <div className="text-4xl font-bold text-gray-900 dark:text-white mt-2">
                    {formatCurrency(selectedAccount.balance)}
                  </div>
                </div>
              </div>

              {/* Account Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                    {formatCurrency(accountStats.find(a => a.id === selectedAccountId)?.income || 0)}
                  </div>
                  <div className="text-sm text-green-600 dark:text-green-300 mt-1">Total Income</div>
                </div>
                
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="text-2xl font-bold text-red-700 dark:text-red-400">
                    {formatCurrency(accountStats.find(a => a.id === selectedAccountId)?.expenses || 0)}
                  </div>
                  <div className="text-sm text-red-600 dark:text-red-300 mt-1">Total Expenses</div>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                    {formatCurrency(accountStats.find(a => a.id === selectedAccountId)?.netFlow || 0)}
                  </div>
                  <div className="text-sm text-blue-600 dark:text-blue-300 mt-1">Net Flow</div>
                </div>
              </div>
             <TransactionsTable /> 
            </div>
          )}

          {/* Deposit Form */}
          {activeTab === 'deposit' && selectedAccount && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4 dark:text-white flex items-center space-x-2">
                <Download size={20} />
                <span>Deposit to {selectedAccount.name}</span>
              </h2>
              
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Current Balance:</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(selectedAccount.balance)}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Amount to Deposit
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      setDepositError(''); // Clear error when user starts typing
                    }}
                    disabled={isProcessing}
                    className="w-full border rounded-lg px-3 py-3 text-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="0.00"
                  />
                  {depositError && (
                    <div className="text-red-600 dark:text-red-400 text-sm mt-1">{depositError}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isProcessing}
                    className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="e.g., Salary, Gift, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category (Optional)
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    disabled={isProcessing}
                    className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="Deposit">Deposit</option>
                    <option value="Income">Income</option>
                    <option value="Salary">Salary</option>
                    <option value="Gift">Gift</option>
                    <option value="Refund">Refund</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <button
                  onClick={handleDeposit}
                  disabled={isProcessing || !amount || parseFloat(amount) <= 0}
                  className={`w-full text-white py-3 rounded-lg font-medium text-lg transition-colors flex items-center justify-center space-x-2 ${
                    isProcessing && processingType === 'deposit'
                      ? 'bg-green-600 cursor-wait'
                      : 'bg-green-500 hover:bg-green-600'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isProcessing && processingType === 'deposit' ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Download size={20} />
                      <span>Deposit ${amount ? parseFloat(amount).toFixed(2) : '0.00'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Withdrawal Form */}
          {activeTab === 'withdraw' && selectedAccount && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4 dark:text-white flex items-center space-x-2">
                <Upload size={20} />
                <span>Withdraw from {selectedAccount.name}</span>
              </h2>
              
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Available Balance:</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(selectedAccount.balance)}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Amount to Withdraw
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      setWithdrawError(''); // Clear error when user starts typing
                    }}
                    disabled={isProcessing}
                    className="w-full border rounded-lg px-3 py-3 text-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="0.00"
                    max={selectedAccount.balance}
                  />
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Maximum: {formatCurrency(selectedAccount.balance)}
                  </div>
                  {withdrawError && (
                    <div className="text-red-600 dark:text-red-400 text-sm mt-1">{withdrawError}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isProcessing}
                    className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="e.g., Cash, Payment, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category (Optional)
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    disabled={isProcessing}
                    className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="Withdrawal">Withdrawal</option>
                    <option value="Expense">Expense</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Food">Food</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <button
                  onClick={handleWithdraw}
                  disabled={isProcessing || !amount || parseFloat(amount) <= 0 || selectedAccount.balance < (parseFloat(amount) || 0)}
                  className={`w-full py-3 rounded-lg font-medium text-lg transition-colors flex items-center justify-center space-x-2 ${
                    isProcessing && processingType === 'withdraw'
                      ? 'bg-blue-600 cursor-wait'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isProcessing && processingType === 'withdraw' ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : selectedAccount.balance < (parseFloat(amount) || 0) ? (
                    <>
                      <span>Insufficient Funds</span>
                    </>
                  ) : (
                    <>
                      <Upload size={20} />
                      <span>Withdraw $${amount ? parseFloat(amount).toFixed(2) : '0.00'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}