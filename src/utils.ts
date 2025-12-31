// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const normalizeTransactionAmount = (amount: any): number => {
  if (typeof amount === 'number') return amount;
  
  if (typeof amount === 'string') {
    const cleaned = amount
      .replace(/[$,]/g, '')
      .replace(/\(/g, '-')
      .replace(/\)/g, '')
      .trim();
    
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }
  
  return 0;
};


export const downloadSampleCSV = () => {
  const sampleData = `Date,Merchant,Amount,Category
2024-01-15,Amazon,-89.99,Shopping
2024-01-16,Starbucks,-5.75,Food & Drink
2024-01-17,Salary Deposit,2500.00,Income
2024-01-18,Netflix,-15.99,Entertainment
2024-01-19,Grocery Store,-125.50,Groceries`;

  const blob = new Blob([sampleData], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'mini-wallet-template.csv';
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};