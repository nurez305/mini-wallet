/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { FileText, CheckCircle, Download } from 'lucide-react';
import FileUploadZone from '../components/import/FileUploadZone';
import ImportPreview from '../components/import/ImportPreview';
import ColumnMapper from '../components/import/ColumnMapper';
import ImportResults from '../components/import/ImportResults';
import { downloadSampleCSV } from '../utils';

type ImportStep = 'upload' | 'map' | 'preview' | 'results';

export default function Import() {
  const { addTransactionsBulk, validateImportTransactions, accounts } = useStore();
  const [currentStep, setCurrentStep] = useState<ImportStep>('upload');
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [transactionsToImport, setTransactionsToImport] = useState<any[]>([]);
  const [importResults, setImportResults] = useState<any>(null);
  const [isImporting, setIsImporting] = useState(false);

  // Get our account names for the dropdown
  const accountOptions = accounts.map(acc => ({
    id: acc.id,
    name: acc.name
  }));

  // Log accounts for debugging
  useEffect(() => {
    console.log('Available accounts:', accountOptions);
  }, [accountOptions]);

  // Handle file upload completion
  const handleFileUploaded = (data: any[], headers: string[]) => {
    setParsedData(data);
    
    // Try to auto-detect column mappings
    const autoMapped = autoDetectColumns(headers);
    setColumnMapping(autoMapped);
    
    setCurrentStep('map');
  };

  // Auto-detect column names based on our actual structure
  const autoDetectColumns = (headers: string[]): Record<string, string> => {
    const mapping: Record<string, string> = {};
    
    headers.forEach(header => {
      const lowerHeader = header.toLowerCase();
      
      if (lowerHeader.includes('date') || lowerHeader.includes('time')) {
        mapping[header] = 'date';
      } else if (lowerHeader.includes('amount')) {
        mapping[header] = 'amount';
      } else if (lowerHeader.includes('description') || lowerHeader.includes('merchant')) {
        mapping[header] = 'merchant';
      } else if (lowerHeader.includes('category')) {
        mapping[header] = 'category';
      }
    });
    
    return mapping;
  };

  // Handle column mapping completion
  const handleMappingComplete = (mappedData: any[], selectedAccountId: string) => {
    // Add the selected account ID to all transactions
    const processedData = mappedData.map(item => ({
      ...item,
      accountId: selectedAccountId, // Use the selected account
      amount: typeof item.amount === 'string' ? parseFloat(item.amount) : item.amount
    }));
    
    setTransactionsToImport(processedData);
    setCurrentStep('preview');
  };

  // Handle import execution
  const handleImport = async () => {
    setIsImporting(true);
    
    try {
      // Validate transactions first
      const validation = validateImportTransactions(transactionsToImport);
      
      if (validation.valid.length > 0) {
        // Add valid transactions to store
        addTransactionsBulk(validation.valid);
      }
      
      setImportResults({
        total: transactionsToImport.length,
        successful: validation.valid.length,
        failed: validation.invalid.length,
        errors: validation.invalid,
      });
      
      setCurrentStep('results');
    } catch (error) {
      console.error('Import failed:', error);
    } finally {
      setIsImporting(false);
    }
  };

  // Reset and start over
  const handleReset = () => {
    setParsedData([]);
    setColumnMapping({});
    setTransactionsToImport([]);
    setImportResults(null);
    setCurrentStep('upload');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Import Transactions</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Import transactions to either Main or Savings account
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
          {['upload', 'map', 'preview', 'results'].map((step, index) => (
            <div key={step} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                currentStep === step 
                  ? 'bg-yellow-500 text-white' 
                  : index < ['upload', 'map', 'preview', 'results'].indexOf(currentStep)
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}>
                {index + 1}
              </div>
              <div className="ml-2">
                <div className="text-sm font-medium dark:text-white capitalize">{step}</div>
              </div>
              {index < 3 && (
                <div className={`w-24 h-1 mx-4 ${
                  index < ['upload', 'map', 'preview', 'results'].indexOf(currentStep)
                    ? 'bg-green-500'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        {currentStep === 'upload' && (
          <div>
            <h2 className="text-lg font-semibold mb-4 dark:text-white">Upload Your File</h2>
            <FileUploadZone onFileUploaded={handleFileUploaded} />
          </div>
        )}

        {currentStep === 'map' && parsedData.length > 0 && (
          <ColumnMapper
            data={parsedData}
            headers={Object.keys(parsedData[0] || {})}
            initialMapping={columnMapping}
            accountOptions={accountOptions} // Pass account options
            onMappingComplete={handleMappingComplete}
            onBack={() => setCurrentStep('upload')}
          />
        )}

        {currentStep === 'preview' && transactionsToImport.length > 0 && (
          <ImportPreview
            transactions={transactionsToImport}
            onImport={handleImport}
            onBack={() => setCurrentStep('map')}
            isImporting={isImporting}
          />
        )}

        {currentStep === 'results' && importResults && (
          <ImportResults
            results={importResults}
            onReset={handleReset}
          />
        )}
      </div>

      {/* Help Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4 dark:text-white">Import Tips</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center mb-2">
              <FileText className="text-blue-500 mr-2" size={20} />
              <h3 className="font-medium dark:text-white">Required Columns</h3>
            </div>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li>• Date (YYYY-MM-DD)</li>
              <li>• Merchant/Description</li>
              <li>• Amount (negative for expenses)</li>
              <li>• Category</li>
            </ul>
          </div>
          
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center mb-2">
              <CheckCircle className="text-green-500 mr-2" size={20} />
              <h3 className="font-medium dark:text-white">Account Selection</h3>
            </div>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li>• All imported transactions go to one account</li>
              <li>• Choose Main or Savings account</li>
              <li>• Account balance updates automatically</li>
            </ul>
          </div>
          
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center mb-2">
              <Download className="text-purple-500 mr-2" size={20} />
              <h3 className="font-medium dark:text-white">Sample Template</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              Download our CSV template:
            </p>
            <button
              onClick={() => downloadSampleCSV()}
              className="text-sm text-yellow-600 hover:text-yellow-700 dark:text-yellow-400"
            >
              Download CSV Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
