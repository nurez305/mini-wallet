/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import { Upload, FileText, X, AlertCircle } from 'lucide-react';

interface FileUploadZoneProps {
  onFileUploaded: (data: any[], headers: string[]) => void;
}

export default function FileUploadZone({ onFileUploaded }: FileUploadZoneProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    setPreviewData([]);
    
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      
      setIsParsing(true);
      
      Papa.parse(selectedFile, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          setIsParsing(false);
          
          if (results.errors.length > 0) {
            setError(`Parsing error: ${results.errors[0].message}`);
            return;
          }
          
          if (results.data.length === 0) {
            setError('No data found in the file');
            return;
          }
          
          setPreviewData(results.data.slice(0, 5)); // Show first 5 rows
          onFileUploaded(results.data, results.meta.fields || []);
        },
        error: (error: Error) => {
          setIsParsing(false);
          setError(`Failed to parse file: ${error.message}`);
        }
      });
    }
  }, [onFileUploaded]);

  const handleRemoveFile = () => {
    setFile(null);
    setPreviewData([]);
    setError(null);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/plain': ['.txt']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        }`}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <Upload size={32} className="text-gray-500 dark:text-gray-400" />
          </div>
          
          <div>
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              {isDragActive ? 'Drop your file here' : 'Drag & drop your file'}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              or click to browse
            </p>
          </div>
          
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Supports CSV, Excel (up to 10MB)
          </div>
        </div>
      </div>

      {/* Selected File */}
      {file && (
        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="text-blue-500" size={24} />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{file.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type}
                </p>
              </div>
            </div>
            <button
              onClick={handleRemoveFile}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
          
          {isParsing && (
            <div className="mt-4 flex items-center space-x-2 text-blue-600 dark:text-blue-400">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              <span>Parsing file...</span>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="text-red-500" size={20} />
            <span className="text-red-700 dark:text-red-400">{error}</span>
          </div>
        </div>
      )}

      {/* Data Preview */}
      {previewData.length > 0 && (
        <div className="mt-6">
          <h3 className="font-medium text-gray-900 dark:text-white mb-2">Preview (first 5 rows)</h3>
          <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  {Object.keys(previewData[0]).map((header) => (
                    <th
                      key={header}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                {previewData.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {Object.values(row).map((cell: any, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="px-4 py-3 text-sm text-gray-900 dark:text-gray-300"
                      >
                        {cell || '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}