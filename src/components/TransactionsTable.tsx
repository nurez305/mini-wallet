import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { useStore } from "../store/useStore";

function Amount({ n }: { n: number }) {
  const isCredit = n >= 0;
  return <span className={isCredit ? "text-green-600" : "text-red-600"}>{(n >= 0 ? "+" : "") + n.toFixed(2)}</span>;
}

function Balance({ balance }: { balance: number }) {
  const isPositive = balance >= 0;
  return <span className={isPositive ? "text-green-600" : "text-red-600"}>{balance.toFixed(2)}</span>;
}

export default function TransactionsTable() {
  const transactions = useStore((s) => s.transactions);
  const accounts = useStore((s) => s.accounts);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("All");

  const categories = useMemo(() => {
    const setCat = new Set<string>(transactions.map((t) => t.category));
    return ["All", ...Array.from(setCat)];
  }, [transactions]);

  
  const transactionsWithRunningBalance = useMemo(() => {
    const accountBalances: Record<string, number> = {};
    accounts.forEach(account => {
      accountBalances[account.id] = account.balance;
    });

    // Calculate total transaction amount per account
    const accountTransactionTotals: Record<string, number> = {};
    transactions.forEach(transaction => {
      accountTransactionTotals[transaction.accountId] = 
        (accountTransactionTotals[transaction.accountId] || 0) + transaction.amount;
    });

    // Calculate initial balance (balance before any transactions in our list)
    const accountInitialBalances: Record<string, number> = {};
    accounts.forEach(account => {
      accountInitialBalances[account.id] = account.balance - (accountTransactionTotals[account.id] || 0);
    });

    // Group transactions by accountId
    const transactionsByAccount: Record<string, typeof transactions> = {};
    
    transactions.forEach(transaction => {
      if (!transactionsByAccount[transaction.accountId]) {
        transactionsByAccount[transaction.accountId] = [];
      }
      transactionsByAccount[transaction.accountId].push(transaction);
    });
    
    // Calculate running balance for each account starting from initial balance
    const result: Array<typeof transactions[0] & { runningBalance: number }> = [];
    
    Object.entries(transactionsByAccount).forEach(([accountId, accountTransactions]) => {
      // Sort chronologically per account (oldest first)
      const sorted = [...accountTransactions].sort(
        (a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf()
      );
      
      // Start with the initial balance (balance before first transaction)
      let runningBalance = accountInitialBalances[accountId] || 0;
      
      sorted.forEach(transaction => {
        runningBalance += transaction.amount;
        result.push({
          ...transaction,
          runningBalance,
          accountId
        });
      });
    });
    
    return result;
  }, [transactions, accounts]);

  const filtered = useMemo(() => {
    return transactionsWithRunningBalance.filter((t) => {
      if (category !== "All" && t.category !== category) return false;
      if (q && !t.merchant.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    }).sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf());
  }, [transactionsWithRunningBalance, q, category]);

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-3">
        <input 
          value={q} 
          onChange={(e) => setQ(e.target.value)} 
          placeholder="Search merchant" 
          className="border rounded px-3 py-2 flex-1 w-full md:w-auto" 
        />
        <select 
          value={category} 
          onChange={(e) => setCategory(e.target.value)} 
          className="border rounded px-3 py-2 w-full md:w-auto"
        >
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Current Balances Summary */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">Current Account Balances</h3>
        <div className="flex flex-wrap gap-4">
          {accounts.map(account => (
            <div key={account.id} className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{account.name}:</span>
              <span className={`font-medium ${account.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${account.balance.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Table Container - NO horizontal scroll on big screens */}
      <div className="bg-white border rounded-lg overflow-hidden">
        {/* Horizontal scroll only on mobile */}
        <div className="overflow-x-auto md:overflow-x-visible">
          <div className="min-h-50 max-h-100 overflow-y-auto">
            {/* Normal table on desktop, wide table on mobile */}
            <table className="w-full text-sm md:table-auto md:min-w-0 min-w-3xl">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="text-left px-4 py-3 whitespace-nowrap">Date</th>
                  <th className="text-left px-4 py-3 whitespace-nowrap">Account</th>
                  <th className="text-left px-4 py-3 whitespace-nowrap">Merchant</th>
                  <th className="text-left px-4 py-3 whitespace-nowrap">Category</th>
                  <th className="text-right px-4 py-3 whitespace-nowrap">Amount</th>
                  <th className="text-right px-4 py-3 whitespace-nowrap">Running Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((t) => {
                  const account = accounts.find(a => a.id === t.accountId);
                  return (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">{dayjs(t.date).format("DD/MM/YYYY")}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                        {account?.name || `Account ${t.accountId}`}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">{t.merchant}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{t.category}</td>
                      <td className="px-4 py-3 text-right whitespace-nowrap"><Amount n={t.amount} /></td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <Balance balance={t.runningBalance} />
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
                      No transactions
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Mobile helper message (only shows on mobile) */}
        <div className="md:hidden p-3 bg-blue-50 border-t border-blue-100 text-center">
          <p className="text-sm text-blue-600">
            ← Scroll to view all columns →
          </p>
        </div>
      </div>

      {/* Transaction count summary */}
      <div className="mt-3 text-sm text-gray-500">
        Showing {filtered.length} transaction{filtered.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}