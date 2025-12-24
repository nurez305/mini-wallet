import { useMemo, useState } from "react";
import { useStore } from "../store/useStore";
import type { Transaction } from "../store/useStore";
import dayjs from "dayjs";

export default function TransactionList() {
  const transactions = useStore(s => s.transactions);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);

  const categories = Array.from(new Set(transactions.map(t => t.category)));

  const filtered = useMemo(() => {
    return transactions.filter(t => {
      if (category && t.category !== category) return false;
      if (query && !t.merchant.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [transactions, query, category]);


  return (
    <div>
      <div className="flex gap-2 items-center mb-3">
        <input 
          className="border p-2 rounded w-60 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400" 
          placeholder="Search merchant" 
          value={query} 
          onChange={(e) => setQuery(e.target.value)} 
        />
        <select 
          className="border p-2 rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white" 
          value={category ?? ""} 
          onChange={(e) => setCategory(e.target.value || null)}
        >
          <option value="" className="dark:bg-gray-800 dark:text-white">All categories</option>
          {categories.map(c => (
            <option key={c} value={c} className="dark:bg-gray-800 dark:text-white">
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded border dark:border-gray-700">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800 text-left">
            <tr>
              <th className="p-3 text-xs text-muted dark:text-gray-400">Date</th>
              <th className="p-3 text-xs text-muted dark:text-gray-400">Merchant</th>
              <th className="p-3 text-xs text-muted dark:text-gray-400">Category</th>
              <th className="p-3 text-xs text-muted dark:text-gray-400 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t: Transaction) => (
              <tr key={t.id} className="border-t dark:border-gray-700">
                <td className="p-3 text-sm dark:text-gray-300">{dayjs(t.date).format("DD/MM/YYYY")}</td>
                <td className="p-3 text-sm dark:text-gray-300">{t.merchant}</td>
                <td className="p-3 text-sm dark:text-gray-300">{t.category}</td>
                <td className={`p-3 text-sm text-right ${t.amount < 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}>
                  {t.amount < 0 ? "-" : "+"}${Math.abs(t.amount).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
