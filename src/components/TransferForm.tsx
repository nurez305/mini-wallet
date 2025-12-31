import React, { useState, useRef, useEffect } from "react";
import { useStore } from "../store/useStore";
import { Check, X, Loader2 } from 'lucide-react';

export default function TransferForm() {
  const accounts = useStore((s) => s.accounts);
  const transfer = useStore((s) => s.transfer);

  const [fromId, setFromId] = useState(accounts[0]?.id ?? "");
  const [toId, setToId] = useState(accounts[1]?.id ?? (accounts[0]?.id ?? ""));
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Success modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  
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

  // Get account names for display
  const getAccountName = (id: string) => {
    const account = accounts.find(acc => acc.id === id);
    return account?.name || "Account";
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Validate and format number input
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Allow only numbers, decimal point, and empty string
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
      setError(null); // Clear error when user starts typing
    }
  };

  // Show success modal after delay
  const showSuccessAfterDelay = (transferAmount: number, fromAccount: string, toAccount: string) => {
    const formattedAmount = formatCurrency(transferAmount);
    setSuccessMessage(`Successfully transferred ${formattedAmount} from ${fromAccount} to ${toAccount}`);
    
    // Set timeout for 1 second before showing modal
    timeoutRef.current = setTimeout(() => {
      setShowSuccessModal(true);
      setLoading(false);
      timeoutRef.current = null;
    }, 1000);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    
    // Clear any pending timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Validate amount
    if (!amount || amount.trim() === '') {
      setError("Please enter an amount");
      return;
    }

    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      setError("Enter a positive amount");
      return;
    }
    
    // Validate decimal places (optional, max 2 decimal places)
    if (amount.includes('.') && amount.split('.')[1].length > 2) {
      setError("Maximum 2 decimal places allowed");
      return;
    }
    
    if (fromId === toId) {
      setError("Choose different accounts");
      return;
    }

    // Check if source account has sufficient balance
    const fromAccount = accounts.find(acc => acc.id === fromId);
    if (fromAccount && fromAccount.balance < val) {
      setError(`Insufficient balance. Available: ${formatCurrency(fromAccount.balance)}`);
      return;
    }

    setLoading(true);
    try {
      await transfer(fromId, toId, val, "Transfer");
      
      // Show success modal after 1 second
      showSuccessAfterDelay(val, getAccountName(fromId), getAccountName(toId));
      
      // Reset form immediately
      setAmount("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Transfer failed");
      setLoading(false);
    }
  }

  return (
    <>
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-md w-full p-6 transform transition-all duration-300 scale-100 animate-fadeIn">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-green-100 dark:bg-green-900/30">
                  <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Transfer Successful</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Funds transferred between accounts</p>
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
                onClick={() => setShowSuccessModal(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                View Transactions
              </button>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Form */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:border dark:border-gray-800 p-4 sm:p-6">
        <h3 className="text-lg font-semibold mb-6 dark:text-white">Transfer Funds</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              From Account
            </label>
            <select 
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              value={fromId} 
              onChange={(e) => setFromId(e.target.value)}
              disabled={loading}
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id} className="dark:bg-gray-800 dark:text-white">
                  {acc.name} - {formatCurrency(acc.balance)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              To Account
            </label>
            <select 
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              value={toId} 
              onChange={(e) => setToId(e.target.value)}
              disabled={loading}
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id} className="dark:bg-gray-800 dark:text-white">
                  {acc.name} - {formatCurrency(acc.balance)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Amount
            </label>
            <input 
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-3 text-lg dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed" 
              type="text"
              inputMode="decimal"
              value={amount} 
              onChange={handleAmountChange}
              placeholder="0.00"
              disabled={loading}
              pattern="\d*\.?\d*"
            />
            {error && (
              <div className="text-red-600 dark:text-red-400 text-sm mt-1">
                {error}
              </div>
            )}
          </div>

          <div>
            <button 
              type="submit" 
              disabled={loading || !amount || parseFloat(amount) <= 0}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>Transfer {amount ? formatCurrency(parseFloat(amount)) : formatCurrency(0)}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
