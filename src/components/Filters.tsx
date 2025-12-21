
type FiltersState = { category?: string; merchant?: string; startDate?: string; endDate?: string };

export default function Filters({ onChange }: { onChange: (s: FiltersState) => void }) {
  return (
    <div className="flex gap-3 items-center">
      <select
        onChange={(e) => onChange({ category: e.target.value })}
        className="p-2 border rounded bg-white"
        defaultValue="All"
      >
        <option value="All">All categories</option>
        <option value="Food">Food</option>
        <option value="Transport">Transport</option>
        <option value="Income">Income</option>
        <option value="Transfer">Transfer</option>
      </select>

      <input
        type="text"
        placeholder="Search merchant"
        onChange={(e) => onChange({ merchant: e.target.value })}
        className="p-2 border rounded"
      />

      <input type="date" onChange={(e) => onChange({ startDate: e.target.value })} className="p-2 border rounded" />
      <input type="date" onChange={(e) => onChange({ endDate: e.target.value })} className="p-2 border rounded" />
    </div>
  );
}
