import type { Account } from "../store/useStore";
import { useStore } from "../store/useStore";

function AccountRow({ acc }: { acc: Account }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border rounded-lg bg-white">
      <div>
        <div className="text-lg font-semibold">{acc.name}</div>
        <div className="text-xs text-gray-500">{acc.currency ?? "USD"}</div>
      </div>
      <div className="text-right">
        <div className="text-sm text-gray-600">Balance</div>
        <div className="text-lg font-medium">{(acc.balance).toLocaleString(undefined, { style: "currency", currency: acc.currency ?? "USD" })}</div>
      </div>
    </div>
  );
}

export default function AccountsPanel() {
  const accounts = useStore((s) => s.accounts);
  return (
    <aside className="space-y-4">
      <div className="bg-white p-4 rounded-lg border">
        <h2 className="text-lg font-semibold mb-3">Accounts</h2>
        <div className="space-y-3">
          {accounts.map((a) => (
            <AccountRow key={a.id} acc={a} />
          ))}
        </div>
      </div>
    </aside>
  );
}
