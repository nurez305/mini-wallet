export interface ImportTransaction {
  date: string;
  merchant: string;
  amount: number;
  category: string;
  accountId: string;
  description?: string;
  _importId?: string;
}

export interface ImportValidationResult {
  valid: ImportTransaction[];
  invalid: Array<{
    transaction: ImportTransaction;
    error: string;
  }>;
}