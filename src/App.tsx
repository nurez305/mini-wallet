import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react'; // Added useEffect
import './App.css';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import Budgets from './pages/Budgets';
import Recurring from './pages/Recurring';
import History from './pages/History';
import Export from './pages/Export';
import Header from './components/Header';
import { Menu, X } from 'lucide-react';

function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('mini-wallet-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navigationItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/reports', label: 'Reports' },
    { path: '/budgets', label: 'Budgets' },
    { path: '/recurring', label: 'Recurring' },
    { path: '/history', label: 'History' },
    { path: '/export', label: 'Export' },
  ];

  return (
    <Router>
      {/* Only added: dark:bg-gray-950 */}
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Header />
        
        {/* Only added: dark:bg-gray-900, dark:border-gray-800 */}
        <div className="md:hidden bg-white dark:bg-gray-900 border-b dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-3">
              {/* Only added: dark:text-white */}
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Navigation
              </h2>
              {/* Only added: dark:text-gray-300, dark:hover:text-white, dark:hover:bg-gray-800 */}
              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Only added: dark:bg-gray-900, dark:border-gray-800 */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-900 border-b dark:border-gray-800 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
              <nav className="flex flex-col space-y-1">
                {navigationItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={closeMobileMenu}
                    className={({ isActive }) =>
                      `py-3 px-4 rounded-lg text-sm font-medium ${
                        isActive
                          ? 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </div>
          </div>
        )}

        {/* Only added: dark:bg-gray-900, dark:border-gray-800 */}
        <nav className="hidden md:block bg-white dark:bg-gray-900 border-b dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8">
              {navigationItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `py-3 px-1 inline-flex items-center border-b-2 text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? 'border-yellow-500 text-gray-900 dark:text-white'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/budgets" element={<Budgets />} />
            <Route path="/recurring" element={<Recurring />} />
            <Route path="/history" element={<History />} />
            <Route path="/export" element={<Export />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;