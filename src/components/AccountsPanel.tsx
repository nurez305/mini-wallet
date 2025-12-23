import type { Account } from "../store/useStore";
import { useStore } from "../store/useStore";
import { TrendingUp, TrendingDown } from 'lucide-react';

function AccountRow({ acc }: { acc: Account }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border rounded-lg bg-white hover:shadow-sm transition-shadow">
      <div className="flex items-center space-x-3">
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold"
          style={{ backgroundColor: acc.color || '#3B82F6' }}
        >
          {acc.name.charAt(0)}
        </div>
        <div>
          <div className="font-semibold">{acc.name}</div>
          <div className="text-xs text-gray-500">{acc.currency ?? "USD"}</div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm text-gray-600">Balance</div>
        <div className="text-lg font-bold">
          {(acc.balance).toLocaleString(undefined, { 
            style: "currency", 
            currency: acc.currency ?? "USD" 
          })}
        </div>
      </div>
    </div>
  );
}

export default function AccountPanel() {
  const accounts = useStore((s) => s.accounts);
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const previousBalance = 0; // You could calculate this from history

  const growth = totalBalance - previousBalance;
  const growthPercentage = previousBalance > 0 ? (growth / previousBalance) * 100 : 0;

  return (
    <aside className="space-y-4">
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Accounts Overview</h2>
          <div className={`flex items-center space-x-1 ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {growth >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span className="text-sm font-medium">
              {growth >= 0 ? '+' : ''}{growthPercentage.toFixed(1)}%
            </span>
          </div>
        </div>
        <div className="space-y-3">
          {accounts.map((a) => (
            <AccountRow key={a.id} acc={a} />
          ))}
        </div>
        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between">
            <span className="text-gray-600">Total Balance:</span>
            <span className="font-bold text-lg">
              ${totalBalance.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}