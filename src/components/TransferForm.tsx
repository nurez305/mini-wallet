import React, { useState } from "react";
import { useStore } from "../store/useStore";

export default function TransferForm() {
  const accounts = useStore((s) => s.accounts);
  const transfer = useStore((s) => s.transfer);

  const [fromId, setFromId] = useState(accounts[0]?.id ?? "");
  const [toId, setToId] = useState(accounts[1]?.id ?? (accounts[0]?.id ?? ""));
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      setError("Enter a positive amount");
      return;
    }
    if (fromId === toId) {
      setError("Choose different accounts");
      return;
    }
    setLoading(true);
    try {
      await transfer(fromId, toId, val, "Move Money");
      setAmount("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Transfer failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white p-4 rounded-lg border">
      <h3 className="text-lg font-semibold mb-3">Move Money</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs text-gray-600 mb-1">From</label>
          <select className="w-full border rounded p-2" value={fromId} onChange={(e) => setFromId(e.target.value)}>
            {accounts.map((acc) => <option key={acc.id} value={acc.id}>{acc.name} - {(acc.balance).toLocaleString()}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-600 mb-1">To</label>
          <select className="w-full border rounded p-2" value={toId} onChange={(e) => setToId(e.target.value)}>
            {accounts.map((acc) => <option key={acc.id} value={acc.id}>{acc.name} - {(acc.balance).toLocaleString()}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-600 mb-1">Amount</label>
          <input className="w-full border rounded p-2" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
        </div>

        {error && <div className="text-sm text-red-600">{error}</div>}

        <div>
          <button type="submit" disabled={loading} className="w-full bg-yellow-400 hover:bg-yellow-500 text-black py-2 rounded font-semibold">
            {loading ? "Sending..." : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
}


