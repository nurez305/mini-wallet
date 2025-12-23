import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { useState } from 'react';
import './App.css';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import Budgets from './pages/Budgets';
import Recurring from './pages/Recurring';
import History from './pages/History';
import Export from './pages/Export';
import Header from './components/Header';
import { Menu, X } from 'lucide-react';
import "./App.css";

function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        {/* Mobile Menu Button */}
        <div className="md:hidden bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-3">
              <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b shadow-lg">
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
                          ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
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

        {/* Desktop Navigation */}
        <nav className="hidden md:block bg-white border-b">
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
                        ? 'border-yellow-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
