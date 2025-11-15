
import React, { useState } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import TaskManagement from '../components/TaskManagement';

type AdminView = 'tasks' | 'dashboard';

const AdminPage: React.FC = () => {
    const [activeView, setActiveView] = useState<AdminView>('tasks');

    const renderActiveView = () => {
        switch(activeView) {
            case 'tasks':
                return <TaskManagement />;
            case 'dashboard':
                return <div className="p-8"><h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Dashboard</h1><p className="text-gray-600 dark:text-gray-400">Overview of sales, orders, and agents will be here.</p></div>
            default:
                return <TaskManagement />;
        }
    }

    return (
        <div className="flex h-[calc(100vh-4rem)] bg-gray-100 dark:bg-black">
            <AdminSidebar activeView={activeView} setActiveView={setActiveView} />
            <div className="flex-1 overflow-y-auto">
                {renderActiveView()}
            </div>
        </div>
    );
};

export default AdminPage;
