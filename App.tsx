
import React, { useState, useMemo, useCallback } from 'react';
import CustomerPage from './pages/CustomerPage';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import Navbar from './components/Navbar';
import { Theme, ThemeContext } from './contexts/ThemeContext';

export type Page = 'home' | 'customer' | 'admin';

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>('dark');
  const [page, setPage] = useState<Page>('home');

  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
      return newTheme;
    });
  }, []);

  const contextValue = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  const renderPage = () => {
    switch (page) {
      case 'home':
        return <HomePage onNavigate={setPage} />;
      case 'customer':
        return <CustomerPage />;
      case 'admin':
        return <AdminPage />;
      default:
        return <HomePage onNavigate={setPage} />;
    }
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <div className="min-h-screen bg-gray-100 dark:bg-black text-gray-900 dark:text-gray-100 font-sans">
        <Navbar currentPage={page} onNavigate={setPage} />
        <main>{renderPage()}</main>
      </div>
    </ThemeContext.Provider>
  );
};

export default App;
