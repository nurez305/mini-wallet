import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { useStore } from "../store/useStore";
import { ChevronRight, Filter } from 'lucide-react';

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
  const [showFilters, setShowFilters] = useState(false);

  const categories = useMemo(() => {
    const setCat = new Set<string>(transactions.map((t) => t.category));
    return ["All", ...Array.from(setCat)];
  }, [transactions]);

  const transactionsWithRunningBalance = useMemo(() => {
    const accountBalances: Record<string, number> = {};
    accounts.forEach(account => {
      accountBalances[account.id] = account.balance;
    });

    const accountTransactionTotals: Record<string, number> = {};
    transactions.forEach(transaction => {
      accountTransactionTotals[transaction.accountId] = 
        (accountTransactionTotals[transaction.accountId] || 0) + transaction.amount;
    });

    const accountInitialBalances: Record<string, number> = {};
    accounts.forEach(account => {
      accountInitialBalances[account.id] = account.balance - (accountTransactionTotals[account.id] || 0);
    });

    const transactionsByAccount: Record<string, typeof transactions> = {};
    
    transactions.forEach(transaction => {
      if (!transactionsByAccount[transaction.accountId]) {
        transactionsByAccount[transaction.accountId] = [];
      }
      transactionsByAccount[transaction.accountId].push(transaction);
    });
    
    const result: Array<typeof transactions[0] & { runningBalance: number }> = [];
    
    Object.entries(transactionsByAccount).forEach(([accountId, accountTransactions]) => {
      const sorted = [...accountTransactions].sort(
        (a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf()
      );
      
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

  // const filtered = useMemo(() => {
  //   return transactionsWithRunningBalance.filter((t) => {
  //     if (category !== "All" && t.category !== category) return false;
  //     if (q && !t.merchant.toLowerCase().includes(q.toLowerCase())) return false;
  //     return true;
  //   }).sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf());
  // }, [transactionsWithRunningBalance, q, category]);

  const filtered = useMemo(() => {
  return transactionsWithRunningBalance.filter((t) => {
    if (category !== "All" && t.category !== category) return false;
    if (q && !t.merchant.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }).sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf());
}, [transactionsWithRunningBalance, q, category]);

  return (
    <div className="w-full">
      {/* Mobile Filter Button */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="md:hidden mb-4 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg flex items-center justify-center space-x-2"
      >
        <Filter size={16} />
        <span>Filters</span>
        <ChevronRight className={`transform transition-transform ${showFilters ? 'rotate-90' : ''}`} size={16} />
      </button>

      {/* Filters - Collapsible on mobile */}
      <div className={`${showFilters ? 'block' : 'hidden'} md:block mb-6`}>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex flex-col space-y-3">
            <div className="flex items-center space-x-2">
              <input 
                value={q} 
                onChange={(e) => setQ(e.target.value)} 
                placeholder="Search merchant" 
                className="flex-1 border rounded px-3 py-2 text-sm" 
              />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)} 
                className="border rounded px-3 py-2 text-sm flex-1"
              >
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <button
                onClick={() => {
                  setQ("");
                  setCategory("All");
                  setShowFilters(false);
                }}
                className="px-4 py-2 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Transaction Cards */}
      <div className="md:hidden space-y-3">
        {filtered.slice(0, 10).map((t) => {
          const account = accounts.find(a => a.id === t.accountId);
          return (
            <div key={t.id} className="bg-white border rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{t.merchant}</h3>
                    <Amount n={t.amount} />
                  </div>
                  <div className="text-sm text-gray-600 mb-1">
                    {account?.name} • {dayjs(t.date).format("MMM D")}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                      {t.category}
                    </span>
                    <span className="text-xs text-gray-500">
                      Balance: <Balance balance={t.runningBalance} />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="bg-white border rounded-lg p-8 text-center">
            <p className="text-gray-500">No transactions found</p>
          </div>
        )}
        {filtered.length > 10 && (
          <div className="text-center text-sm text-gray-500 py-4">
            Showing 10 of {filtered.length} transactions
          </div>
        )}
      </div>

      {/* Desktop Table - Hidden on mobile */}
      <div className="hidden md:block bg-white border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-h-50 max-h-100 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="text-left px-4 py-3">Date</th>
                  <th className="text-left px-4 py-3">Account</th>
                  <th className="text-left px-4 py-3">Merchant</th>
                  <th className="text-left px-4 py-3">Category</th>
                  <th className="text-right px-4 py-3">Amount</th>
                  <th className="text-right px-4 py-3">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((t) => {
                  const account = accounts.find(a => a.id === t.accountId);
                  return (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{dayjs(t.date).format("DD/MM/YYYY")}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {account?.name || `Account ${t.accountId}`}
                      </td>
                      <td className="px-4 py-3">{t.merchant}</td>
                      <td className="px-4 py-3">{t.category}</td>
                      <td className="px-4 py-3 text-right"><Amount n={t.amount} /></td>
                      <td className="px-4 py-3 text-right">
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
      </div>

      {/* Transaction count summary */}
      <div className="mt-4 text-sm text-gray-500 text-center md:text-left">
        Showing {Math.min(filtered.length, 10)} of {filtered.length} transaction{filtered.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}