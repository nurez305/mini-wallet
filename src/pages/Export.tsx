import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Download, FileText, FileJson, Filter } from 'lucide-react';
import dayjs from 'dayjs';

export default function Export() {
  const { transactions, accounts, exportTransactions, filterTransactions } = useStore();
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    category: '',
    accountId: '',
    minAmount: '',
    maxAmount: ''
  });

  const handleExport = () => {
    const exportData = exportTransactions(exportFormat);
    
    // Create blob and download
    const blob = new Blob([exportData], { 
      type: exportFormat === 'csv' ? 'text/csv' : 'application/json' 
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${dayjs().format('YYYY-MM-DD')}.${exportFormat}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleFilteredExport = () => {
    const filtered = filterTransactions({
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined,
      category: filters.category || undefined,
      accountId: filters.accountId || undefined,
      minAmount: filters.minAmount ? parseFloat(filters.minAmount) : undefined,
      maxAmount: filters.maxAmount ? parseFloat(filters.maxAmount) : undefined
    });

    const exportData = exportFormat === 'csv' 
      ? convertToCSV(filtered)
      : JSON.stringify(filtered, null, 2);

    // Create blob and download
    const blob = new Blob([exportData], { 
      type: exportFormat === 'csv' ? 'text/csv' : 'application/json' 
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-filtered-${dayjs().format('YYYY-MM-DD')}.${exportFormat}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const convertToCSV = (data: typeof transactions) => {
    const headers = ['Date', 'Merchant', 'Category', 'Amount', 'Account', 'Description'];
    const rows = data.map(t => [
      dayjs(t.date).format('YYYY-MM-DD'),
      t.merchant,
      t.category,
      t.amount.toString(),
      accounts.find(a => a.id === t.accountId)?.name || t.accountId,
      t.description || ''
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const categories = Array.from(new Set(transactions.map(t => t.category)));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Export Data</h1>
          <p className="text-gray-600 dark:text-gray-300">Export your transaction data in various formats</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Export Options */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-gray-700/30">
            <h2 className="text-lg font-semibold mb-4 flex items-center space-x-2 dark:text-white">
              <Filter size={20} className="dark:text-gray-300" />
              <span>Filter Options</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Account
                </label>
                <select
                  value={filters.accountId}
                  onChange={(e) => setFilters({ ...filters, accountId: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">All Accounts</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Min Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={filters.minAmount}
                  onChange={(e) => setFilters({ ...filters, minAmount: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Max Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={filters.maxAmount}
                  onChange={(e) => setFilters({ ...filters, maxAmount: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="0.00"
                />
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Export Format
              </h3>
              <div className="flex space-x-4">
                <button
                  onClick={() => setExportFormat('csv')}
                  className={`flex-1 p-4 border rounded-lg flex flex-col items-center space-y-2 transition-colors ${
                    exportFormat === 'csv' 
                      ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-600' 
                      : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <FileText size={24} className="text-gray-600 dark:text-gray-300" />
                  <span className="text-gray-900 dark:text-white">CSV</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Excel, Sheets, Numbers</span>
                </button>
                
                <button
                  onClick={() => setExportFormat('json')}
                  className={`flex-1 p-4 border rounded-lg flex flex-col items-center space-y-2 transition-colors ${
                    exportFormat === 'json' 
                      ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-600' 
                      : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <FileJson size={24} className="text-gray-600 dark:text-gray-300" />
                  <span className="text-gray-900 dark:text-white">JSON</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">APIs, Development</span>
                </button>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-gray-700/30">
            <h2 className="text-lg font-semibold mb-4 dark:text-white">Export Actions</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleExport}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700 text-white py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
              >
                <Download size={20} />
                <span>Export All Data ({transactions.length} transactions)</span>
              </button>
              
              <button
                onClick={handleFilteredExport}
                className="flex-1 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
              >
                <Filter size={20} />
                <span>Export with Filters</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Preview */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-gray-700/30">
            <h2 className="text-lg font-semibold mb-4 dark:text-white">Export Preview</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Total Transactions:</span>
                <span className="font-medium dark:text-white">{transactions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Total Income:</span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  ${transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Total Expenses:</span>
                <span className="font-medium text-red-600 dark:text-red-400">
                  ${Math.abs(transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0)).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Data Range:</span>
                <span className="font-medium dark:text-white">
                  {transactions.length > 0 
                    ? `${dayjs(transactions[transactions.length - 1].date).format('MMM D, YYYY')} - ${dayjs(transactions[0].date).format('MMM D, YYYY')}`
                    : 'No data'
                  }
                </span>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-gray-700/30">
            <h2 className="text-lg font-semibold mb-4 dark:text-white">Export Tips</h2>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-1 shrink-0"></div>
                <span>CSV files can be opened in Excel, Google Sheets, or Numbers</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-1 shrink-0"></div>
                <span>JSON files are useful for developers and APIs</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-1 shrink-0"></div>
                <span>Filter your data before export to reduce file size</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-1 shrink-0"></div>
                <span>Regular exports help with data backup and analysis</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}