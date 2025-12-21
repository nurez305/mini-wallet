import Header from "./components/Header";
import AccountsPanel from "./components/AccountsPanel";
import TransferForm from "./components/TransferForm";
import TransactionsTable from "./components/TransactionsTable";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* left column */}
        <div className="space-y-6">
          <AccountsPanel />
          <TransferForm />
        </div>

        {/* right column: spans 2/3 on large screens */}
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Transactions</h2>
            <div className="text-sm text-gray-600">Running balance shown per account on transaction rows</div>
          </div>
          <TransactionsTable />
        </div>
      </main>
    </div>
  );
}

