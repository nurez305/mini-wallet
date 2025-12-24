import { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import dayjs from 'dayjs';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function History() {
  const { accounts, getAccountHistory, transactions } = useStore();
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<number>(30);

  // Get historical data for selected account
  const historicalData = useMemo(() => {
    if (selectedAccount === 'all') {
      // For all accounts, we need to calculate combined balance history
      const dailyBalances: Record<string, number> = {};
      
      accounts.forEach(account => {
        const accountHistory = getAccountHistory(account.id, timeRange);
        accountHistory.forEach(h => {
          const date = dayjs(h.date).format('YYYY-MM-DD');
          dailyBalances[date] = (dailyBalances[date] || 0) + h.balance;
        });
      });
      
      return Object.entries(dailyBalances)
        .map(([date, balance]) => ({ date, balance }))
        .sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf());
    } else {
      const accountHistory = getAccountHistory(selectedAccount, timeRange);
      return accountHistory.map(h => ({
        date: dayjs(h.date).format('MMM D'),
        balance: h.balance
      }));
    }
  }, [selectedAccount, timeRange, accounts, getAccountHistory]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (historicalData.length === 0) return null;
    
    const balances = historicalData.map(d => d.balance);
    const maxBalance = Math.max(...balances);
    const minBalance = Math.min(...balances);
    const averageBalance = balances.reduce((a, b) => a + b, 0) / balances.length;
    
    // Calculate growth
    const firstBalance = balances[0];
    const lastBalance = balances[balances.length - 1];
    const growth = ((lastBalance - firstBalance) / firstBalance) * 100;
    
    return { maxBalance, minBalance, averageBalance, growth };
  }, [historicalData]);

  // Get transaction history
  const transactionHistory = useMemo(() => {
    const cutoff = dayjs().subtract(timeRange, 'day');
    
    return transactions
      .filter(t => dayjs(t.date).isAfter(cutoff))
      .sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf());
  }, [transactions, timeRange]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Balance History</h1>
          <p className="text-gray-600 dark:text-gray-400">Track your account balances over time</p>
        </div>
        <div className="flex space-x-4">
          <select
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          >
            <option value="all" className="dark:bg-gray-800 dark:text-white">All Accounts</option>
            {accounts.map(acc => (
              <option key={acc.id} value={acc.id} className="dark:bg-gray-800 dark:text-white">
                {acc.name}
              </option>
            ))}
          </select>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="border rounded-md px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          >
            <option value={7} className="dark:bg-gray-800 dark:text-white">Last 7 days</option>
            <option value={30} className="dark:bg-gray-800 dark:text-white">Last 30 days</option>
            <option value={90} className="dark:bg-gray-800 dark:text-white">Last 90 days</option>
            <option value={365} className="dark:bg-gray-800 dark:text-white">Last year</option>
          </select>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Current Balance Card */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow dark:border dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Current Balance</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${historicalData[historicalData.length - 1]?.balance.toFixed(2) || '0.00'}
                </p>
              </div>
              {stats.growth >= 0 ? (
                <TrendingUp className="text-green-500 dark:text-green-400" size={24} />
              ) : (
                <TrendingDown className="text-red-500 dark:text-red-400" size={24} />
              )}
            </div>
            <div className={`text-sm mt-2 ${stats.growth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {stats.growth >= 0 ? '+' : ''}{stats.growth.toFixed(2)}% growth
            </div>
          </div>

          {/* Average Balance Card */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow dark:border dark:border-gray-800">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Average Balance</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${stats.averageBalance.toFixed(2)}
              </p>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">Over {timeRange} days</div>
          </div>

          {/* Highest Balance Card */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow dark:border dark:border-gray-800">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Highest Balance</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                ${stats.maxBalance.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Lowest Balance Card */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow dark:border dark:border-gray-800">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Lowest Balance</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                ${stats.minBalance.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Balance Chart */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow dark:border dark:border-gray-800">
        <h2 className="text-lg font-semibold mb-4 dark:text-white">Balance Trend</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historicalData}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#f0f0f0" 
                strokeOpacity={0.3}
              />
              <XAxis 
                dataKey="date" 
                tick={{ fill: '#6b7280' }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                tickFormatter={(value) => `$${value}`}
                tick={{ fill: '#6b7280' }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <Tooltip 
                formatter={(value) => [`$${value}`, 'Balance']}
                labelFormatter={(label) => `Date: ${label}`}
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  color: '#F9FAFB',
                  borderRadius: '0.375rem'
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="balance"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 6 }}
                name="Balance"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow dark:border dark:border-gray-800 overflow-hidden">
        <div className="px-6 py-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold dark:text-white">Recent Transactions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Merchant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Account
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {transactionHistory.slice(0, 10).map((t) => {
                const account = accounts.find(a => a.id === t.accountId);
                return (
                  <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                      {dayjs(t.date).format('MMM D, YYYY')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900 dark:text-white">{t.merchant}</div>
                      {t.description && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">{t.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                        {t.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`font-medium ${t.amount >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {t.amount >= 0 ? '+' : '-'}${Math.abs(t.amount).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                      {account?.name || 'Unknown'}
                    </td>
                  </tr>
                );
              })}
              {transactionHistory.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    No transactions in the selected time range
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}