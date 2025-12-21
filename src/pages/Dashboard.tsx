import Header from "../components/Header";
import AccountList from "../components/AccountList";
import TransactionList from "../components/TransactionList";
import TransferForm from "../components/TransferForm";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-6xl mx-auto p-6 grid grid-cols-3 gap-6">
        <div className="col-span-1">
          <AccountList />
          <div className="mt-6">
            <TransferForm />
          </div>
        </div>
        <div className="col-span-2">
          <TransactionList />
        </div>
      </main>
    </div>
  );
}

