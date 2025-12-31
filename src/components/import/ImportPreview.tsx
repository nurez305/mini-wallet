/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from 'react';
import { ArrowLeft, AlertTriangle, CheckCircle, Download, Filter } from 'lucide-react';
import { useStore } from '../../store/useStore';

interface ImportPreviewProps {
  transactions: any[];
  onImport: () => void;
  onBack: () => void;
  isImporting: boolean;
}

export default function ImportPreview({ transactions, onImport, onBack, isImporting }: ImportPreviewProps) {
  const { accounts, validateImportTransactions } = useStore();
  const [filter, setFilter] = useState<'all' | 'valid' | 'invalid'>('all');
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  // Validate transactions
  const validation = useMemo(() => {
    return validateImportTransactions(transactions);
  }, [transactions, validateImportTransactions]);

  // Filtered transactions based on selection
  const filteredTransactions = useMemo(() => {
    let filtered = transactions.map((t, index) => ({
      ...t,
      _index: index,
      _isValid: validation.valid.some(v => 
        v.date === t.date && 
        v.merchant === t.merchant && 
        v.amount === t.amount
      ),
    }));

    if (filter === 'valid') {
      filtered = filtered.filter(t => t._isValid);
    } else if (filter === 'invalid') {
      filtered = filtered.filter(t => !t._isValid);
    }

    return filtered;
  }, [transactions, validation, filter]);

  // Statistics
  const stats = useMemo(() => ({
    total: transactions.length,
    valid: validation.valid.length,
    invalid: validation.invalid.length,
    duplicateCount: transactions.length - new Set(transactions.map(t => 
      `${t.date}-${t.merchant}-${t.amount}`
    )).size,
  }), [transactions, validation]);

  // Handle row selection
  const toggleRow = (index: number) => {
    setSelectedRows(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const toggleAllRows = () => {
    if (selectedRows.length === filteredTransactions.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredTransactions.map(t => t._index));
    }
  };

  // Format amount
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold dark:text-white">Import Preview</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Review and confirm your transactions before importing
          </p>
        </div>
        <button
          onClick={onBack}
          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Total Transactions</div>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="text-green-500" size={20} />
            <div>
              <div className="text-2xl font-bold text-green-700 dark:text-green-400">{stats.valid}</div>
              <div className="text-sm text-green-600 dark:text-green-300">Valid</div>
            </div>
          </div>
        </div>
        
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="text-red-500" size={20} />
            <div>
              <div className="text-2xl font-bold text-red-700 dark:text-red-400">{stats.invalid}</div>
              <div className="text-sm text-red-600 dark:text-red-300">Invalid</div>
            </div>
          </div>
        </div>
        
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="text-yellow-500" size={20} />
            <div>
              <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">{stats.duplicateCount}</div>
              <div className="text-sm text-yellow-600 dark:text-yellow-300">Potential Duplicates</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center space-x-2">
          <Filter size={16} className="text-gray-500" />
          <span className="text-sm font-medium dark:text-white">Filter:</span>
        </div>
        {['all', 'valid', 'invalid'].map((filterOption) => (
          <button
            key={filterOption}
            onClick={() => setFilter(filterOption as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === filterOption
                ? 'bg-yellow-500 text-white'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
          >
            {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
            {filterOption === 'all' && ` (${stats.total})`}
            {filterOption === 'valid' && ` (${stats.valid})`}
            {filterOption === 'invalid' && ` (${stats.invalid})`}
          </button>
        ))}
        
        <div className="ml-auto text-sm text-gray-600 dark:text-gray-300">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedRows.length === filteredTransactions.length}
              onChange={toggleAllRows}
              className="rounded border-gray-300 dark:border-gray-600"
            />
            <span>Select all visible ({filteredTransactions.length})</span>
          </label>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase w-12">
                <input
                  type="checkbox"
                  checked={selectedRows.length === filteredTransactions.length}
                  onChange={toggleAllRows}
                  className="rounded border-gray-300 dark:border-gray-600"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Merchant
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Account
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
            {filteredTransactions.slice(0, 10).map((transaction, index) => {
              const isValid = transaction._isValid;
              const isSelected = selectedRows.includes(transaction._index);
              const account = accounts.find(a => a.id === transaction.accountId);
             

              return (
                <tr 
                  key={index}
                  className={isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleRow(transaction._index)}
                      className="rounded border-gray-300 dark:border-gray-600"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {transaction.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {transaction.merchant}
                    </div>
                    {transaction.description && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {transaction.description}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${
                      transaction.amount < 0 
                        ? 'text-red-600 dark:text-red-400' 
                        : 'text-green-600 dark:text-green-400'
                    }`}>
                      {formatAmount(transaction.amount)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {account?.name || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isValid ? (
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="text-green-500" size={16} />
                        <span className="text-sm text-green-600 dark:text-green-400">Valid</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="text-red-500" size={16} />
                        <span className="text-sm text-red-600 dark:text-red-400">Invalid</span>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Validation Errors */}
      {validation.invalid.length > 0 && (
        <div className="border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h3 className="font-medium text-red-700 dark:text-red-400 mb-3">Validation Issues</h3>
          <div className="space-y-2">
            {validation.invalid.slice(0, 3).map((error, index) => (
              <div key={index} className="text-sm text-red-600 dark:text-red-300">
                <span className="font-medium">{error.transaction.merchant}</span>: {error.error}
              </div>
            ))}
            {validation.invalid.length > 3 && (
              <div className="text-sm text-red-500">
                ...and {validation.invalid.length - 3} more issues
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-between gap-4 pt-4 border-t dark:border-gray-700">
        <div className="flex gap-4">
          <button
            onClick={() => {
              // Export filtered data
              const dataToExport = filteredTransactions.filter(t => 
                selectedRows.includes(t._index)
              );
              alert(`Exporting ${dataToExport.length} transactions to CSV`);
            }}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Download size={16} />
            <span>Export Selected ({selectedRows.length})</span>
          </button>
          
          <button
            onClick={() => {
            }}
            className="px-4 py-2 border border-gray-300 dark:text-white dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Show All Details
          </button>
        </div>
        
        <div className="flex gap-4">
          <button
            onClick={onBack}
            className="px-6 py-3 border border-gray-300 dark:text-white dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          
          <button
            onClick={onImport}
            disabled={isImporting || validation.valid.length === 0}
            className={`px-6 py-3 rounded-lg font-medium flex items-center space-x-2 ${
              isImporting || validation.valid.length === 0
                ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-yellow-500 hover:bg-yellow-600 text-white'
            }`}
          >
            {isImporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Importing...</span>
              </>
            ) : (
              <>
                <CheckCircle size={16} />
                <span>
                  Import {validation.valid.length} Valid Transactions
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}