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
        <input className="border p-2 rounded w-60" placeholder="Search merchant" value={query} onChange={(e) => setQuery(e.target.value)} />
        <select className="border p-2 rounded" value={category ?? ""} onChange={(e) => setCategory(e.target.value || null)}>
          <option value="">All categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="bg-white rounded border">
        <table className="w-full">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3 text-xs text-muted">Date</th>
              <th className="p-3 text-xs text-muted">Merchant</th>
              <th className="p-3 text-xs text-muted">Category</th>
              <th className="p-3 text-xs text-muted text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t: Transaction) => (
              <tr key={t.id} className="border-t">
                <td className="p-3 text-sm">{dayjs(t.date).format("DD/MM/YYYY")}</td>
                <td className="p-3 text-sm">{t.merchant}</td>
                <td className="p-3 text-sm">{t.category}</td>
                <td className={`p-3 text-sm text-right ${t.amount < 0 ? "text-red-600" : "text-green-600"}`}>
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
