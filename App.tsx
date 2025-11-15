
import React, { useState, useMemo, useCallback } from 'react';
import ChatPage from './pages/ChatPage';
import { Theme, ThemeContext } from './contexts/ThemeContext';

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>('dark');

  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
      return newTheme;
    });
  }, []);

  const contextValue = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return (
    <ThemeContext.Provider value={contextValue}>
      <div className="min-h-screen bg-gray-100 dark:bg-whatsapp-bg text-gray-900 dark:text-gray-100 font-sans">
        <ChatPage />
      </div>
    </ThemeContext.Provider>
  );
};

export default App;
