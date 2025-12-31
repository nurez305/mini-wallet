/* eslint-disable @typescript-eslint/no-explicit-any */
import { CheckCircle, XCircle, AlertCircle, Download, RefreshCw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ImportResultsProps {
  results: {
    total: number;
    successful: number;
    failed: number;
    errors?: Array<{
      transaction: any;
      error: string;
    }>;
  };
  onReset: () => void;
}

export default function ImportResults({ results, onReset }: ImportResultsProps) {
  const successRate = results.total > 0 
    ? Math.round((results.successful / results.total) * 100) 
    : 0;

  const downloadErrorReport = () => {
    if (!results.errors || results.errors.length === 0) return;
    
    const errorData = results.errors.map(error => ({
      Date: error.transaction.date,
      Merchant: error.transaction.merchant,
      Amount: error.transaction.amount,
      Error: error.error,
    }));

    const csvContent = [
      ['Date', 'Merchant', 'Amount', 'Error'],
      ...errorData.map(e => [e.Date, e.Merchant, e.Amount, e.Error])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `import-errors-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
          {results.successful > 0 ? (
            <CheckCircle className="text-green-500" size={48} />
          ) : (
            <XCircle className="text-red-500" size={48} />
          )}
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {results.successful > 0 ? 'Import Successful!' : 'Import Completed'}
        </h2>
        
        <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
          {results.successful > 0 
            ? `Successfully imported ${results.successful} transaction${results.successful !== 1 ? 's' : ''} to your wallet.`
            : 'No transactions were imported due to validation errors.'
          }
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-gray-900 dark:text-white">{results.total}</div>
          <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">Total Processed</div>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-green-700 dark:text-green-400">{results.successful}</div>
          <div className="text-sm text-green-600 dark:text-green-300 mt-1">Successfully Imported</div>
        </div>
        
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-red-700 dark:text-red-400">{results.failed}</div>
          <div className="text-sm text-red-600 dark:text-red-300 mt-1">Failed</div>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-blue-700 dark:text-blue-400">{successRate}%</div>
          <div className="text-sm text-blue-600 dark:text-blue-300 mt-1">Success Rate</div>
        </div>
      </div>

      {/* Error Details */}
      {results.errors && results.errors.length > 0 && (
        <div className="border border-red-200 dark:border-red-800 rounded-lg">
          <div className="bg-red-50 dark:bg-red-900/20 px-6 py-4 border-b border-red-200 dark:border-red-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertCircle className="text-red-500" size={20} />
                <h3 className="font-medium text-red-700 dark:text-red-400">
                  Failed Transactions ({results.errors.length})
                </h3>
              </div>
              <button
                onClick={downloadErrorReport}
                className="flex items-center space-x-2 px-3 py-1 text-sm bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-800"
              >
                <Download size={14} />
                <span>Download Error Report</span>
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-red-200 dark:divide-red-800">
              <thead className="bg-red-50/50 dark:bg-red-900/20">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-red-700 dark:text-red-400 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-red-700 dark:text-red-400 uppercase">
                    Merchant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-red-700 dark:text-red-400 uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-red-700 dark:text-red-400 uppercase">
                    Error
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-red-100 dark:divide-red-900/30">
                {results.errors.slice(0, 5).map((error, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {error.transaction.date || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {error.transaction.merchant || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {error.transaction.amount || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-red-600 dark:text-red-400">
                        {error.error}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {results.errors.length > 5 && (
            <div className="px-6 py-3 text-center text-sm text-red-600 dark:text-red-400 bg-red-50/50 dark:bg-red-900/20">
              ...and {results.errors.length - 5} more errors. Download the report for complete details.
            </div>
          )}
        </div>
      )}

      {/* Next Steps */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h3 className="font-medium text-blue-900 dark:text-blue-200 mb-4">Next Steps</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
            <div className="text-lg font-medium text-gray-900 dark:text-white mb-2">View Transactions</div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              See your imported transactions in the history page
            </p>
            <Link
              to="/history"
              className="inline-flex items-center text-sm text-yellow-600 hover:text-yellow-700 dark:text-yellow-400"
            >
              Go to History
              <Home className="ml-2" size={14} />
            </Link>
          </div>
          
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
            <div className="text-lg font-medium text-gray-900 dark:text-white mb-2">Review Analytics</div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Check how imported transactions affect your spending insights
            </p>
            <Link
              to="/reports"
              className="inline-flex items-center text-sm text-yellow-600 hover:text-yellow-700 dark:text-yellow-400"
            >
              View Reports
              <Home className="ml-2" size={14} />
            </Link>
          </div>
          
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
            <div className="text-lg font-medium text-gray-900 dark:text-white mb-2">Import More</div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Import additional files or different formats
            </p>
            <button
              onClick={onReset}
              className="inline-flex items-center text-sm text-yellow-600 hover:text-yellow-700 dark:text-yellow-400"
            >
              Import Another File
              <RefreshCw className="ml-2" size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4 pt-6">
        <button
          onClick={onReset}
          className="flex items-center space-x-2 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <RefreshCw size={16} />
          <span>Import Another File</span>
        </button>
        
        <Link
          to="/"
          className="flex items-center space-x-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium"
        >
          <Home size={16} />
          <span>Go to Dashboard</span>
        </Link>
      </div>
    </div>
  );
}