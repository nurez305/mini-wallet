/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from 'react';
import { useStore } from '../store/useStore';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import dayjs from 'dayjs';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function Reports() {
  const { transactions, accounts } = useStore();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [selectedAccount, setSelectedAccount] = useState<string>('all');

  // Calculate category spending
  const categoryData = useMemo(() => {
    const now = dayjs();
    let startDate;
    
    switch (timeRange) {
      case 'week': startDate = now.subtract(7, 'day'); break;
      case 'month': startDate = now.subtract(30, 'day'); break;
      case 'year': startDate = now.subtract(365, 'day'); break;
    }
    
    const filtered = transactions.filter(t => {
      if (t.amount >= 0) return false; // Only expenses
      if (selectedAccount !== 'all' && t.accountId !== selectedAccount) return false;
      return dayjs(t.date).isAfter(startDate);
    });
    
    const categoryMap: Record<string, number> = {};
    
    filtered.forEach(t => {
      const category = t.category;
      const amount = Math.abs(t.amount);
      categoryMap[category] = (categoryMap[category] || 0) + amount;
    });
    
    return Object.entries(categoryMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions, timeRange, selectedAccount]);

  // Calculate monthly trends
  const monthlyData = useMemo(() => {
    const months: Record<string, { income: number; expense: number }> = {};
    
    transactions.forEach(t => {
      const month = dayjs(t.date).format('MMM YYYY');
      if (!months[month]) {
        months[month] = { income: 0, expense: 0 };
      }
      
      if (t.amount >= 0) {
        months[month].income += t.amount;
      } else {
        months[month].expense += Math.abs(t.amount);
      }
    });
    
    return Object.entries(months)
      .map(([month, data]) => ({
        month,
        income: data.income,
        expense: data.expense,
        net: data.income - data.expense
      }))
      .sort((a, b) => dayjs(a.month).valueOf() - dayjs(b.month).valueOf())
      .slice(-6); // Last 6 months
  }, [transactions]);

  // Calculate account distribution
  const accountData = useMemo(() => {
    return accounts.map(acc => ({
      name: acc.name,
      value: acc.balance,
      color: acc.color
    }));
  }, [accounts]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Financial Reports</h1>
        <div className="flex space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="border rounded-md px-3 py-1 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          >
            <option value="week" className="dark:bg-gray-800 dark:text-white">Last Week</option>
            <option value="month" className="dark:bg-gray-800 dark:text-white">Last Month</option>
            <option value="year" className="dark:bg-gray-800 dark:text-white">Last Year</option>
          </select>
          <select
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            className="border rounded-md px-3 py-1 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          >
            <option value="all" className="dark:bg-gray-800 dark:text-white">All Accounts</option>
            {accounts.map(acc => (
              <option key={acc.id} value={acc.id} className="dark:bg-gray-800 dark:text-white">
                {acc.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending by Category */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow dark:border dark:border-gray-800">
          <h2 className="text-lg font-semibold mb-4 dark:text-white">Spending by Category</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Trends */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow dark:border dark:border-gray-800">
          <h2 className="text-lg font-semibold mb-4 dark:text-white">Monthly Trends</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#D1D5DB" />
                <YAxis stroke="#D1D5DB" />
                <Tooltip 
                  formatter={(value) => [`$${value}`, 'Amount']}
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    color: '#F9FAFB'
                  }}
                />
                <Legend />
                <Bar dataKey="income" fill="#10B981" name="Income" />
                <Bar dataKey="expense" fill="#EF4444" name="Expense" />
                <Bar dataKey="net" fill="#3B82F6" name="Net" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Account Distribution */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow dark:border dark:border-gray-800">
          <h2 className="text-lg font-semibold mb-4 dark:text-white">Account Balances</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={accountData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {accountData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`$${value}`, 'Balance']}
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    color: '#F9FAFB'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow dark:border dark:border-gray-800">
          <h2 className="text-lg font-semibold mb-4 dark:text-white">Financial Summary</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/30 rounded">
              <span className="text-gray-700 dark:text-gray-300">Total Income</span>
              <span className="text-green-600 dark:text-green-400 font-bold">
                ${transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/30 rounded">
              <span className="text-gray-700 dark:text-gray-300">Total Expenses</span>
              <span className="text-red-600 dark:text-red-400 font-bold">
                ${Math.abs(transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0)).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/30 rounded">
              <span className="text-gray-700 dark:text-gray-300">Net Worth</span>
              <span className="text-blue-600 dark:text-blue-400 font-bold">
                ${accounts.reduce((sum, acc) => sum + acc.balance, 0).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded">
              <span className="text-gray-700 dark:text-gray-300">Transactions Count</span>
              <span className="text-gray-900 dark:text-white font-bold">{transactions.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}