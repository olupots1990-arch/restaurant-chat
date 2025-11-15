
import React from 'react';
import { ListTodo, Shield } from 'lucide-react';

type AdminView = 'tasks' | 'dashboard';

interface AdminSidebarProps {
    activeView: AdminView;
    setActiveView: (view: AdminView) => void;
}

const SidebarItem: React.FC<{
    view: AdminView;
    activeView: AdminView;
    onClick: (view: AdminView) => void;
    icon: React.ReactNode;
    label: string;
}> = ({ view, activeView, onClick, icon, label }) => (
    <button
        onClick={() => onClick(view)}
        className={`flex items-center w-full px-4 py-3 text-left transition-colors ${
            activeView === view
                ? 'bg-primary-500 text-white'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
    >
        {icon}
        <span className="ml-3">{label}</span>
    </button>
);

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeView, setActiveView }) => {
    return (
        <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Admin Panel</h2>
            </div>
            <nav className="py-4">
                <SidebarItem 
                    view="dashboard" 
                    activeView={activeView} 
                    onClick={setActiveView} 
                    icon={<Shield size={20} />} 
                    label="Dashboard" 
                />
                <SidebarItem 
                    view="tasks" 
                    activeView={activeView} 
                    onClick={setActiveView} 
                    icon={<ListTodo size={20} />} 
                    label="Task Management" 
                />
            </nav>
        </div>
    );
};

export default AdminSidebar;
