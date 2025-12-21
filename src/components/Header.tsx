export default function Header() {
  return (
    <header className="bg-white border-b">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-serif font-bold text-gray-900">Mini Wallet</h1>
        <div className="text-sm text-gray-600">{new Date().toDateString()}</div>
      </div>
    </header>
  );
}

