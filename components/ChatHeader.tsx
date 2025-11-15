
import React from 'react';
import { Theme } from '../contexts/ThemeContext';
import { Sun, Moon, Search, X } from 'lucide-react';

interface ChatHeaderProps {
  onThemeToggle: () => void;
  currentTheme: Theme;
  isSearching: boolean;
  onToggleSearch: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearch: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ 
    onThemeToggle, 
    currentTheme,
    isSearching,
    onToggleSearch,
    searchQuery,
    setSearchQuery,
    onSearch
}) => {

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-200 dark:bg-whatsapp-input-bg border-b border-gray-300 dark:border-gray-700">
      {isSearching ? (
        <div className="flex items-center w-full">
           <Search className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleSearchKeyPress}
            className="w-full bg-transparent border-none focus:ring-0 outline-none text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 px-2"
            autoFocus
          />
          <button onClick={onToggleSearch} className="p-2 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
            <X className="w-5 h-5 text-gray-800 dark:text-gray-200" />
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center">
            <img src="https://picsum.photos/40/40" alt="Avatar" className="w-10 h-10 rounded-full mr-3" />
            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Stanley's Cafeteria</h2>
              <p className="text-sm text-green-600 dark:text-green-400">Online</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
             <button onClick={onToggleSearch} className="p-2 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
               <Search className="w-5 h-5 text-gray-800 dark:text-gray-200" />
            </button>
            <button onClick={onThemeToggle} className="p-2 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
              {currentTheme === 'dark' ? <Sun className="w-5 h-5 text-gray-200" /> : <Moon className="w-5 h-5 text-gray-800" />}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatHeader;
