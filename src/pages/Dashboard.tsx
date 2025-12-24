import React from 'react';
import TransferForm from '../components/TransferForm';
import { useStore } from '../store/useStore';
import AccountPanel from '../components/AccountsPanel';
import TransactionsTable from '../components/TransactionsTable';
import DashboardSummary from '../components/DashboardSummary';

export default function Dashboard() {
  const { transactions, accounts } = useStore();
  
  const stats = React.useMemo(() => {
    // Calculate income for ALL accounts
    const totalIncome = transactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
    
    // Calculate expenses for ALL accounts
    const totalExpenses = Math.abs(
      transactions
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + t.amount, 0)
    );
    
    // Calculate net flow for ALL accounts
    const netFlow = totalIncome - totalExpenses;
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    
    // Calculate per-account stats
    const accountStats = accounts.map(account => {
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
    
    return { 
      totalIncome, 
      totalExpenses, 
      netFlow, 
      totalBalance,
      accountStats 
    };
  }, [transactions, accounts]);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Balance Card */}
        <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-lg shadow dark:border dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Balance</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                ${stats.totalBalance.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Across {accounts.length} account{accounts.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <span className="text-blue-600 dark:text-blue-300 font-bold text-sm sm:text-base">$</span>
            </div>
          </div>
        </div>
        
        {/* Total Income Card */}
        <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-lg shadow dark:border dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Income</p>
              <p className="text-lg sm:text-xl font-bold text-green-600 dark:text-green-400">
                ${stats.totalIncome.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                All accounts combined
              </p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <span className="text-green-600 dark:text-green-300 font-bold text-sm sm:text-base">+</span>
            </div>
          </div>
        </div>
        
        {/* Total Expenses Card */}
        <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-lg shadow dark:border dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Expenses</p>
              <p className="text-lg sm:text-xl font-bold text-red-600 dark:text-red-400">
                ${stats.totalExpenses.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                All accounts combined
              </p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <span className="text-red-600 dark:text-red-300 font-bold text-sm sm:text-base">-</span>
            </div>
          </div>
        </div>
        
        {/* Net Flow Card */}
        <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-lg shadow dark:border dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Net Flow</p>
              <p className={`text-lg sm:text-xl font-bold ${stats.netFlow >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {stats.netFlow >= 0 ? '+' : ''}${stats.netFlow.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Income minus expenses
              </p>
            </div>
            <div className={`w-8 h-8 sm:w-10 sm:h-10 ${stats.netFlow >= 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'} rounded-full flex items-center justify-center`}>
              <span className={`${stats.netFlow >= 0 ? 'text-green-600 dark:text-green-300' : 'text-red-600 dark:text-red-300'} font-bold text-sm sm:text-base`}>
                {stats.netFlow >= 0 ? '↑' : '↓'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <DashboardSummary />

      {/* Account-specific Stats */}
      {stats.accountStats.length > 1 && (
        <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-lg shadow dark:border dark:border-gray-800">
          <h2 className="text-lg font-semibold mb-4 dark:text-white">Account Breakdown</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.accountStats.map(account => (
              <div key={account.id} className="border dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: account.color || '#3B82F6' }}
                    />
                    <span className="font-medium dark:text-white">{account.name}</span>
                  </div>
                  <span className="font-bold dark:text-white">${account.balance.toFixed(2)}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Income:</span>
                    <span className="text-green-600 dark:text-green-400 font-medium">+${account.income.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Expenses:</span>
                    <span className="text-red-600 dark:text-red-400 font-medium">-${account.expenses.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t dark:border-gray-700">
                    <span className="text-gray-500 dark:text-gray-400">Net Flow:</span>
                    <span className={`font-medium ${account.netFlow >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {account.netFlow >= 0 ? '+' : ''}${account.netFlow.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Stats from Budgets and Recurring */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Overview */}
        <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-lg shadow dark:border dark:border-gray-800">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold dark:text-white">Budget Status</h2>
            <a 
              href="/budgets" 
              className="text-sm text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 font-medium"
            >
              View All →
            </a>
          </div>
          <div className="space-y-3">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Track spending against your budgets to avoid overspending.
            </p>
            <a 
              href="/budgets" 
              className="block text-center py-2 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/50 transition-colors"
            >
              Set up budgets to control spending
            </a>
          </div>
        </div>

        {/* Recurring Overview */}
        <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-lg shadow dark:border dark:border-gray-800">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold dark:text-white">Recurring Transactions</h2>
            <a 
              href="/recurring" 
              className="text-sm text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 font-medium"
            >
              View All →
            </a>
          </div>
          <div className="space-y-3">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Automate regular payments and income. Process scheduled transactions to stay on track.
            </p>
            <a 
              href="/recurring" 
              className="block text-center py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
            >
              Manage recurring transactions
            </a>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-6">
          <AccountPanel />
          <TransferForm />
        </div>
        
        {/* Right Column */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow dark:border dark:border-gray-800 p-4 sm:p-6">
            <h2 className="text-lg font-semibold mb-4 dark:text-white">Recent Transactions</h2>
            <TransactionsTable />
          </div>
        </div>
      </div>
    </div>
  );
}
