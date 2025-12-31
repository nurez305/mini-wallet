/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Check, AlertCircle, HelpCircle, Eye } from 'lucide-react';

interface ColumnMapperProps {
  data: any[];
  headers: string[];
  initialMapping: Record<string, string>;
  accountOptions: Array<{ id: string; name: string }>;
  onMappingComplete: (mappedData: any[], selectedAccountId: string) => void;
  onBack: () => void;
}

const transactionFields = [
  { id: 'date', label: 'Date', required: true, description: 'Transaction date (YYYY-MM-DD)' },
  { id: 'merchant', label: 'Merchant', required: true, description: 'Store or payee name' },
  { id: 'amount', label: 'Amount', required: true, description: 'Transaction amount (negative for expenses)' },
  { id: 'category', label: 'Category', required: true, description: 'Transaction category' },
];

export default function ColumnMapper({
  data,
  headers,
  initialMapping,
  accountOptions,
  onMappingComplete,
  onBack,
}: ColumnMapperProps) {
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('main');
  
  // Use refs to track if this is the initial mount
  const isInitialMount = useRef(true);
  const hasSetDefaultAccount = useRef(false);

  // Initialize mapping for all headers (wrapped in useEffect with proper dependency)
  useEffect(() => {
    // Only run on initial mount or when headers/initialMapping change
    if (isInitialMount.current || headers.length !== Object.keys(mapping).length) {
      const completeMapping: Record<string, string> = {};
      headers.forEach(header => {
        completeMapping[header] = initialMapping[header] || '';
      });
      
      // Use setTimeout to avoid synchronous setState in effect
      const timer = setTimeout(() => {
        setMapping(completeMapping);
      }, 0);
      
      return () => clearTimeout(timer);
    }
  }, [headers, initialMapping]); // Removed mapping from dependencies

  // Set default account if available
  useEffect(() => {
    // Only set default account once on initial mount
    if (accountOptions.length > 0 && !hasSetDefaultAccount.current) {
      hasSetDefaultAccount.current = true;
      
      // Use setTimeout to avoid synchronous setState in effect
      const timer = setTimeout(() => {
        setSelectedAccountId(accountOptions[0].id);
      }, 0);
      
      return () => clearTimeout(timer);
    }
  }, [accountOptions]); // Removed selectedAccountId from dependencies

  // Mark initial mount as complete
  useEffect(() => {
    const timer = setTimeout(() => {
      isInitialMount.current = false;
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleMappingChange = (header: string, field: string) => {
    setMapping(prev => ({
      ...prev,
      [header]: field,
    }));
  };

  const validateMappings = () => {
    const requiredFields = transactionFields.filter(f => f.required).map(f => f.id);
    const mappedFields = Object.values(mapping).filter(f => f && f !== 'ignore');
    
    const errors: Record<string, boolean> = {};
    
    // Check if required fields are mapped
    requiredFields.forEach(field => {
      if (!mappedFields.includes(field)) {
        errors[field] = true;
      }
    });

    // Check for duplicate mappings (except ignore)
    const fieldCounts: Record<string, number> = {};
    Object.values(mapping).forEach(field => {
      if (field && field !== 'ignore') {
        fieldCounts[field] = (fieldCounts[field] || 0) + 1;
      }
    });

    Object.entries(fieldCounts).forEach(([field, count]) => {
      if (count > 1) {
        errors[field] = true;
      }
    });

    // Check if account is selected
    if (!selectedAccountId) {
      errors['account'] = true;
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Helper function to parse amounts from strings
  const parseAmount = (value: any): number => {
    if (typeof value === 'number') return value;
    
    if (typeof value === 'string') {
      // Remove currency symbols, commas, parentheses for negative numbers
      const cleaned = value
        .replace(/[$,]/g, '') // Remove $ and commas
        .replace(/\(/g, '-')  // Convert (123) to -123
        .replace(/\)/g, '')   // Remove closing )
        .trim();
      
      // Parse to float
      const parsed = parseFloat(cleaned);
      
      // If it's a valid number, return it
      if (!isNaN(parsed)) {
        return parsed;
      }
    }
    
    // If we can't parse it, return 0
    console.warn(`Could not parse amount: ${value}, defaulting to 0`);
    return 0;
  };

  // Helper function to parse dates
  const parseDate = (value: any): string => {
    if (!value) return new Date().toISOString().split('T')[0];
    
    if (typeof value === 'string') {
      // Try to parse the date with multiple attempts
      const dateFormats = [
        'YYYY-MM-DD',
        'MM/DD/YYYY', 
        'DD/MM/YYYY',
        'YYYY/MM/DD',
        'MM-DD-YYYY',
        'DD-MM-YYYY',
      ];
      
      // Try each format approach
      for (let i = 0; i < dateFormats.length; i++) {
        const parsed = new Date(value);
        if (!isNaN(parsed.getTime())) {
          return parsed.toISOString().split('T')[0];
        }
      }
    }
    
    // Return today's date as fallback
    return new Date().toISOString().split('T')[0];
  };

  const generateMappedData = () => {
    if (!validateMappings()) {
      alert('Please fix mapping errors before previewing');
      return;
    }

    const mappedData = data.slice(0, 5).map(row => {
      const transaction: Record<string, any> = {};
      
      Object.entries(mapping).forEach(([header, field]) => {
        if (field && field !== 'ignore') {
          // Transform data if needed
          let value = row[header];
          
          if (field === 'amount') {
            value = parseAmount(value);
          } else if (field === 'date') {
            value = parseDate(value);
          }
          
          transaction[field] = value;
        }
      });

      // Add the selected account ID
      transaction.accountId = selectedAccountId;
      
      return transaction;
    });

    console.log('Preview data generated:', mappedData);
    setPreviewData(mappedData);
    setShowPreview(true);
  };

  const handleComplete = () => {
    if (!validateMappings()) {
      alert('Please fix all mapping errors before continuing');
      return;
    }

    const mappedData = data.map(row => {
      const transaction: Record<string, any> = {};
      
      Object.entries(mapping).forEach(([header, field]) => {
        if (field && field !== 'ignore') {
          let value = row[header];
          
          if (field === 'amount') {
            value = parseAmount(value);
          } else if (field === 'date') {
            value = parseDate(value);
          }
          
          transaction[field] = value;
        }
      });

      // Add the selected account ID
      transaction.accountId = selectedAccountId;
      
      return transaction;
    });

    console.log('Final mapped data for import:', mappedData);
    onMappingComplete(mappedData, selectedAccountId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold dark:text-white">Map Columns</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Match your CSV columns to transaction fields
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

      {/* Account Selection */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 dark:text-blue-200 mb-3">Select Account for Import</h3>
        <p className="text-sm text-blue-800 dark:text-blue-300 mb-3">
          All imported transactions will be added to this account:
        </p>
        <div className="flex flex-wrap gap-3">
          {accountOptions.map(account => (
            <button
              key={account.id}
              onClick={() => setSelectedAccountId(account.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedAccountId === account.id
                  ? 'bg-yellow-500 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              {account.name} (ID: {account.id})
            </button>
          ))}
        </div>
        {selectedAccountId && (
          <p className="text-sm text-green-600 dark:text-green-400 mt-2">
            Selected: {accountOptions.find(a => a.id === selectedAccountId)?.name}
          </p>
        )}
        {fieldErrors['account'] && (
          <p className="text-red-600 dark:text-red-400 text-sm mt-2">
            Please select an account for the import
          </p>
        )}
      </div>

      {/* Mapping Table */}
      <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                CSV Column
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Sample Data
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Map to Field
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
            {headers.map((header) => {
              const sampleValue = data[0]?.[header] || '(empty)';
              const selectedField = mapping[header] || '';
              
              return (
                <tr key={header}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900 dark:text-white">{header}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600 dark:text-gray-300 truncate max-w-xs">
                      {String(sampleValue)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={selectedField}
                      onChange={(e) => handleMappingChange(header, e.target.value)}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-800 dark:text-white"
                    >
                      <option value="">Select field...</option>
                      {transactionFields.map(field => (
                        <option key={field.id} value={field.id}>
                          {field.label}
                          {field.required && ' *'}
                        </option>
                      ))}
                      <option value="ignore">Ignore Column</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    {selectedField ? (
                      <div className="flex items-center space-x-2">
                        <Check className="text-green-500" size={16} />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {selectedField === 'ignore' ? 'Ignored' : `Mapped to ${selectedField}`}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="text-yellow-500" size={16} />
                        <span className="text-sm text-gray-500">Not mapped</span>
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
      {Object.keys(fieldErrors).length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertCircle className="text-red-500" size={20} />
            <h3 className="font-medium text-red-700 dark:text-red-400">
              Mapping Issues Detected
            </h3>
          </div>
          <ul className="mt-2 text-sm text-red-600 dark:text-red-300 space-y-1">
            {transactionFields
              .filter(field => fieldErrors[field.id])
              .map(field => (
                <li key={field.id}>• {field.label} is required or duplicated</li>
              ))}
          </ul>
        </div>
      )}

      {/* Preview Section */}
      {showPreview && previewData.length > 0 && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900 dark:text-white">Preview (first 5 rows)</h3>
            <button
              onClick={() => setShowPreview(false)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Hide Preview
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Date
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Merchant
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Amount
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Category
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Account
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                {previewData.map((row, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-300">
                      {row.date}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-300">
                      {row.merchant || '-'}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      <span className={`${
                        row.amount < 0 
                          ? 'text-red-600 dark:text-red-400' 
                          : 'text-green-600 dark:text-green-400'
                      }`}>
                        {typeof row.amount === 'number' ? row.amount.toFixed(2) : row.amount}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-300">
                      {row.category || '-'}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-300">
                      {accountOptions.find(a => a.id === row.accountId)?.name || row.accountId}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Field Descriptions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-3">
          <HelpCircle className="text-blue-500" size={20} />
          <h3 className="font-medium text-blue-900 dark:text-blue-200">Field Descriptions</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {transactionFields.map(field => (
            <div key={field.id} className="text-sm">
              <span className="font-medium text-gray-900 dark:text-white">
                {field.label}
                {field.required && ' *'}
              </span>
              <p className="text-gray-600 dark:text-gray-300 text-xs mt-1">
                {field.description}
              </p>
            </div>
          ))}
          <div className="text-sm">
            <span className="font-medium text-gray-900 dark:text-white">
              Account *
            </span>
            <p className="text-gray-600 dark:text-gray-300 text-xs mt-1">
              All transactions will be imported to the selected account above
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between pt-4 border-t dark:border-gray-700">
        <button
          onClick={generateMappedData}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium"
        >
          <Eye size={16} />
          <span>Preview Mapped Data</span>
        </button>
        <button
          onClick={handleComplete}
          disabled={Object.keys(fieldErrors).length > 0 || !selectedAccountId}
          className={`px-6 py-3 rounded-lg font-medium ${
            Object.keys(fieldErrors).length > 0 || !selectedAccountId
              ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-yellow-500 hover:bg-yellow-600 text-white'
          }`}
        >
          Continue to Import Preview
        </button>
      </div>
    </div>
  );
}