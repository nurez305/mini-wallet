import { useStore } from '../store/useStore';
import { TrendingUp, TrendingDown, Target, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';


export default function DashboardSummary() {
  const { transactions, accounts, budgets, recurringTransactions } = useStore();
  
  // Calculate summary stats
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalIncome = transactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = Math.abs(
    transactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + t.amount, 0)
  );
  const netFlow = totalIncome - totalExpenses;
  
  // Budget stats
  const activeBudgets = budgets.length;
  const overspentBudgets = budgets.filter(budget => {
    const spent = budget.spent || 0;
    return spent > budget.limit;
  }).length;
  
  // Recurring stats - NOW USING THESE VARIABLES
  const activeRecurring = recurringTransactions.filter(rt => rt.isActive).length;
  const monthlyRecurringIncome = recurringTransactions
    .filter(rt => rt.isActive && rt.amount > 0)
    .reduce((sum, rt) => sum + rt.amount, 0);
  const monthlyRecurringExpenses = Math.abs(
    recurringTransactions
      .filter(rt => rt.isActive && rt.amount < 0)
      .reduce((sum, rt) => sum + rt.amount, 0)
  );
  const netRecurring = monthlyRecurringIncome - monthlyRecurringExpenses;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-6">Financial Summary</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Balance Card */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-blue-700">Total Balance</span>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold">$</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">${totalBalance.toFixed(2)}</div>
          <div className="text-xs text-blue-600 mt-1">
            Across {accounts.length} account{accounts.length !== 1 ? 's' : ''}
          </div>
        </div>
        
        {/* Budget Status Card */}
        <Link to="/budgets" className="block">
          <div className="bg-yellow-50 rounded-lg p-4 hover:bg-yellow-100 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-yellow-700">Active Budgets</span>
              <Target className="text-yellow-600" size={20} />
            </div>
            <div className="text-2xl font-bold text-gray-900">{activeBudgets}</div>
            {activeBudgets > 0 ? (
              <div className="text-xs text-yellow-600 mt-1">
                {overspentBudgets > 0 ? 
                  `${overspentBudgets} over limit` : 
                  'All on track'
                }
              </div>
            ) : (
              <div className="text-xs text-yellow-600 mt-1">
                <span className="font-medium">Set up budgets</span>
              </div>
            )}
          </div>
        </Link>
        
        {/* Recurring Status Card - NOW USING THE VARIABLES */}
        <Link to="/recurring" className="block">
          <div className="bg-green-50 rounded-lg p-4 hover:bg-green-100 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-green-700">Recurring</span>
              <RefreshCw className="text-green-600" size={20} />
            </div>
            <div className="text-2xl font-bold text-gray-900">{activeRecurring}</div>
            {activeRecurring > 0 ? (
              <div className="text-xs text-green-600 mt-1">
                Net: 
                <span className={`ml-1 ${netRecurring >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                  {netRecurring >= 0 ? '+' : '-'}${Math.abs(netRecurring).toFixed(2)}/month
                </span>
              </div>
            ) : (
              <div className="text-xs text-green-600 mt-1">
                <span className="font-medium">Set up recurring</span>
              </div>
            )}
          </div>
        </Link>
        
        {/* Net Flow Card */}
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-purple-700">This Month</span>
            {netFlow >= 0 ? 
              <TrendingUp className="text-green-600" size={20} /> : 
              <TrendingDown className="text-red-600" size={20} />
            }
          </div>
          <div className={`text-2xl font-bold ${netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {netFlow >= 0 ? '+' : ''}${netFlow.toFixed(2)}
          </div>
          <div className="text-xs text-purple-600 mt-1">
            Net income this month
          </div>
        </div>
      </div>
      
      {/* Action Buttons - Enhanced with stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <Link to="/budgets" className="block">
          <div className="w-full bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border border-yellow-200 rounded-lg py-3 px-4">
            <div className="text-sm font-medium">Manage Budgets</div>
            {activeBudgets > 0 && (
              <div className="text-xs mt-1">
                {activeBudgets} active • {overspentBudgets > 0 ? '⚠️ Needs attention' : '✓ All good'}
              </div>
            )}
          </div>
        </Link>
        
        <Link to="/recurring" className="block">
          <div className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg py-3 px-4">
            <div className="text-sm font-medium">Manage Recurring</div>
            {activeRecurring > 0 && (
              <div className="text-xs mt-1">
                {activeRecurring} active • ${monthlyRecurringIncome.toFixed(2)} income • ${monthlyRecurringExpenses.toFixed(2)} expenses
              </div>
            )}
          </div>
        </Link>
        
        <Link to="/reports" className="block">
          <div className="w-full bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-lg py-3 px-4">
            <div className="text-sm font-medium">View Reports</div>
            <div className="text-xs mt-1">
              ${totalIncome.toFixed(2)} income • ${totalExpenses.toFixed(2)} expenses
            </div>
          </div>
        </Link>
      </div>

      {/* Additional Stats Section - Using the variables more */}
      {(activeBudgets > 0 || activeRecurring > 0) && (
        <div className="mt-6 pt-6 border-t">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Financial Planning</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeBudgets > 0 && (
              <div className="bg-yellow-50 p-3 rounded">
                <div className="text-xs text-yellow-700 mb-1">Budget Coverage</div>
                <div className="text-sm font-medium">
                  {budgets.filter(b => (b.spent || 0) > 0).length} of {activeBudgets} budgets active
                </div>
              </div>
            )}
            
            {activeRecurring > 0 && (
              <div className="bg-blue-50 p-3 rounded">
                <div className="text-xs text-blue-700 mb-1">Monthly Recurring</div>
                <div className="text-sm font-medium">
                  ${netRecurring >= 0 ? '+' : ''}{netRecurring.toFixed(2)} net/month
                </div>
              </div>
            )}
            
            <div className="bg-purple-50 p-3 rounded">
              <div className="text-xs text-purple-700 mb-1">Cash Flow</div>
              <div className="text-sm font-medium">
                ${netFlow >= 0 ? '+' : ''}{netFlow.toFixed(2)} net this month
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}