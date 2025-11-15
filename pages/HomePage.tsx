
import React from 'react';
import { Page } from '../App';
import { MessageSquare, Shield } from 'lucide-react';

interface HomePageProps {
    onNavigate: (page: Page) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4 text-center bg-gray-100 dark:bg-black">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-bold text-gray-800 dark:text-gray-100 mb-4">
          Welcome to <span className="text-primary-600 dark:text-primary-400">Stanley's Cafeteria</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8">
          Your AI-powered assistant for orders, questions, and restaurant management.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Customer Card */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 bg-primary-100 dark:bg-primary-900 rounded-full">
              <MessageSquare className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Customer Chat</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Engage with our AI chatbot to place orders, get information about our menu, and more.
            </p>
            <button
              onClick={() => onNavigate('customer')}
              className="w-full px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors duration-300"
            >
              Start Chatting
            </button>
          </div>

          {/* Admin Card */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 bg-green-100 dark:bg-green-900 rounded-full">
              <Shield className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Admin Panel</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Access the management dashboard to oversee orders, manage tasks, and configure the bot.
            </p>
            <button
              onClick={() => onNavigate('admin')}
              className="w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors duration-300"
            >
              Go to Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
