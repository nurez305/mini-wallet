import { useStore } from "../store/useStore";
import type { Account } from "../store/useStore";

export default function AccountList() {
  const accounts = useStore(s => s.accounts);

  return (
    <aside className="bg-white dark:bg-gray-900 p-4 rounded border dark:border-gray-700 h-full">
      <h2 className="font-semibold mb-3 dark:text-white">Accounts</h2>
      <ul className="space-y-3">
        {accounts.map((a: Account) => (
          <li key={a.id} className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium dark:text-white">{a.name}</div>
              <div className="text-xs text-muted dark:text-gray-400">{a.currency ?? "USD"}</div>
            </div>
            <div className="text-right">
              <div className="font-semibold dark:text-white">${a.balance.toFixed(2)}</div>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}
