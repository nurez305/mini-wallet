type FiltersState = { category?: string; merchant?: string; startDate?: string; endDate?: string };

export default function Filters({ onChange }: { onChange: (s: FiltersState) => void }) {
  return (
    <div className="flex gap-3 items-center">
      <select
        onChange={(e) => onChange({ category: e.target.value })}
        className="p-2 border rounded bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
        defaultValue="All"
      >
        <option value="All" className="dark:bg-gray-800 dark:text-white">All categories</option>
        <option value="Food" className="dark:bg-gray-800 dark:text-white">Food</option>
        <option value="Transport" className="dark:bg-gray-800 dark:text-white">Transport</option>
        <option value="Income" className="dark:bg-gray-800 dark:text-white">Income</option>
        <option value="Transfer" className="dark:bg-gray-800 dark:text-white">Transfer</option>
      </select>

      <input
        type="text"
        placeholder="Search merchant"
        onChange={(e) => onChange({ merchant: e.target.value })}
        className="p-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400"
      />

      <input 
        type="date" 
        onChange={(e) => onChange({ startDate: e.target.value })} 
        className="p-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white" 
      />
      
      <input 
        type="date" 
        onChange={(e) => onChange({ endDate: e.target.value })} 
        className="p-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white" 
      />
    </div>
  );
}