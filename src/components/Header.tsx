// Update: src/components/Header.tsx
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  const accounts = useStore((s) => s.accounts);
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  return (
    <header className="bg-white dark:bg-gray-900 shadow transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <div className="bg-yellow-400 dark:bg-yellow-500 w-8 h-8 rounded-lg flex items-center justify-center mr-3 transition-colors duration-200">
                <span className="text-black dark:text-gray-900 font-bold text-lg">$</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-200">
                  Mini Wallet
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block transition-colors duration-200">
                  Manage your finances easily
                </p>
              </div>
            </Link>
          </div>
          
          <div className="flex items-center justify-between sm:justify-end space-x-4">
            {/* Theme Toggle - Added here */}
            <div className="flex items-center">
              <ThemeToggle />
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-6">
              <div className="text-left sm:text-right">
                <div className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
                  Total Balance
                </div>
                <div className="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-200">
                  ${totalBalance.toFixed(2)}
                </div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 hidden sm:block transition-colors duration-200">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 sm:hidden transition-colors duration-200">
                {new Date().toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}


















// import { Link } from 'react-router-dom';
// import { useStore } from '../store/useStore';

// export default function Header() {
//   const accounts = useStore((s) => s.accounts);
//   const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

//   return (
//     <header className="bg-white shadow">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
//         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
//           <div className="flex items-center">
//             <Link to="/" className="flex items-center">
//               <div className="bg-yellow-400 w-8 h-8 rounded-lg flex items-center justify-center mr-3">
//                 <span className="text-black font-bold text-lg">$</span>
//               </div>
//               <div>
//                 <h1 className="text-2xl font-bold text-gray-900">Mini Wallet</h1>
//                 <p className="text-xs text-gray-500 hidden sm:block">Manage your finances easily</p>
//               </div>
//             </Link>
//           </div>
          
//           <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-6">
//             <div className="text-left sm:text-right">
//               <div className="text-sm text-gray-600">Total Balance</div>
//               <div className="text-xl font-bold text-gray-900">
//                 ${totalBalance.toFixed(2)}
//               </div>
//             </div>
//             <div className="text-sm text-gray-600 hidden sm:block">
//               {new Date().toLocaleDateString('en-US', { 
//                 weekday: 'short', 
//                 year: 'numeric', 
//                 month: 'short', 
//                 day: 'numeric' 
//               })}
//             </div>
//             <div className="text-sm text-gray-600 sm:hidden">
//               {new Date().toLocaleDateString('en-US', { 
//                 month: 'short', 
//                 day: 'numeric' 
//               })}
//             </div>
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// }

