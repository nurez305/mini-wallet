import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mini-wallet-theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    console.log('Theme useEffect - isDarkMode:', isDarkMode);
    console.log('HTML classes before:', root.className);
    
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('mini-wallet-theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('mini-wallet-theme', 'light');
    }
    
    console.log('HTML classes after:', root.className);
    console.log('---');
  }, [isDarkMode]);

  const handleClick = () => {
    console.log('Button clicked - current:', isDarkMode, 'new:', !isDarkMode);
    setIsDarkMode(!isDarkMode);
  };

  return (
    <button
      onClick={handleClick}
      className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDarkMode ? (
        <Sun size={20} className="text-yellow-500" />
      ) : (
        <Moon size={20} className="text-gray-700" />
      )}
    </button>
  );
}