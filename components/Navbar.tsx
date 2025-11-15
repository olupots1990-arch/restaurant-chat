
import React from 'react';
import { Page } from '../App';
import { Home, User, Shield } from 'lucide-react';

interface NavbarProps {
    currentPage: Page;
    onNavigate: (page: Page) => void;
}

const NavItem: React.FC<{
    page: Page;
    currentPage: Page;
    onNavigate: (page: Page) => void;
    icon: React.ReactNode;
    label: string;
}> = ({ page, currentPage, onNavigate, icon, label }) => (
    <button
        onClick={() => onNavigate(page)}
        className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            currentPage === page
                ? 'bg-primary-500 text-white'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
    >
        {icon}
        <span className="ml-2">{label}</span>
    </button>
);

const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
    return (
        <nav className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 shadow-md h-16">
            <div className="flex items-center">
                <img src="https://picsum.photos/40/40" alt="Logo" className="w-10 h-10 rounded-full mr-3" />
                <h1 className="text-xl font-bold text-gray-800 dark:text-white">Stanley's Cafeteria</h1>
            </div>
            <div className="flex items-center space-x-2">
                <NavItem page="home" currentPage={currentPage} onNavigate={onNavigate} icon={<Home size={16} />} label="Home" />
                <NavItem page="customer" currentPage={currentPage} onNavigate={onNavigate} icon={<User size={16} />} label="Customer Chat" />
                <NavItem page="admin" currentPage={currentPage} onNavigate={onNavigate} icon={<Shield size={16} />} label="Admin" />
            </div>
        </nav>
    );
};

export default Navbar;
