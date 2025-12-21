
import { useStore } from "../store/useStore";
import type { Account } from "../store/useStore";

export default function AccountList() {
  const accounts = useStore(s => s.accounts);

  return (
    <aside className="bg-white p-4 rounded border h-full">
      <h2 className="font-semibold mb-3">Accounts</h2>
      <ul className="space-y-3">
        {accounts.map((a: Account) => (
          <li key={a.id} className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">{a.name}</div>
              <div className="text-xs text-muted">{a.currency ?? "USD"}</div>
            </div>
            <div className="text-right">
              <div className="font-semibold">${a.balance.toFixed(2)}</div>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}
