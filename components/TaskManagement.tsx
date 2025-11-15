
import React, { useState } from 'react';
import { Task, TaskStatus } from '../types';
import { Plus, Trash2 } from 'lucide-react';

const initialTasks: Task[] = [
    { id: '1', title: 'Update catering menu', description: 'Add new vegan options for the summer season.', status: TaskStatus.TODO, assignee: 'Chef Alice' },
    { id: '2', title: 'Restock inventory', description: 'Check stock levels for flour, sugar, and coffee beans.', status: TaskStatus.IN_PROGRESS, assignee: 'John Doe' },
    { id: '3', title: 'Fix leaking faucet', description: 'The sink in the main kitchen is dripping.', status: TaskStatus.DONE, assignee: 'Maintenance' },
    { id: '4', title: 'Plan weekly special', description: 'Decide on the special dish for next week.', status: TaskStatus.TODO, assignee: 'Chef Alice' },
];

const teamMembers = ['Chef Alice', 'John Doe', 'Maintenance', 'Jane Smith', 'Peter Jones'];


const TaskCard: React.FC<{ task: Task; onUpdateStatus: (id: string, status: TaskStatus) => void; onDelete: (id: string) => void; }> = ({ task, onUpdateStatus, onDelete }) => {
    return (
        <div className="p-4 mb-4 bg-white dark:bg-gray-700 rounded-lg shadow-md border border-gray-200 dark:border-gray-600">
            <div className="flex justify-between items-start">
                <h4 className="font-bold text-gray-800 dark:text-gray-100">{task.title}</h4>
                <button onClick={() => onDelete(task.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 my-2">{task.description}</p>
            <div className="flex items-center justify-between mt-3 text-xs">
                <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full">{task.assignee}</span>
                <select
                    value={task.status}
                    onChange={(e) => onUpdateStatus(task.id, e.target.value as TaskStatus)}
                    className="bg-gray-200 dark:bg-gray-600 border-none rounded-md text-xs py-1 px-2 focus:ring-primary-500"
                >
                    {Object.values(TaskStatus).map(status => (
                        <option key={status} value={status}>{status}</option>
                    ))}
                </select>
            </div>
        </div>
    );
};

const TaskColumn: React.FC<{ title: TaskStatus; tasks: Task[]; onUpdateStatus: (id: string, status: TaskStatus) => void; onDelete: (id: string) => void; }> = ({ title, tasks, onUpdateStatus, onDelete }) => {
    return (
        <div className="w-full md:w-1/3 bg-gray-100 dark:bg-gray-800 rounded-xl p-4">
            <h3 className="text-lg font-bold mb-4 text-center text-gray-700 dark:text-gray-200">{title} ({tasks.length})</h3>
            <div>
                {tasks.map(task => (
                    <TaskCard key={task.id} task={task} onUpdateStatus={onUpdateStatus} onDelete={onDelete} />
                ))}
            </div>
        </div>
    );
};


const TaskManagement: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>(initialTasks);
    const [showForm, setShowForm] = useState(false);
    const [newTask, setNewTask] = useState({ title: '', description: '', assignee: teamMembers[0] });

    const handleUpdateStatus = (id: string, status: TaskStatus) => {
        setTasks(tasks.map(task => task.id === id ? { ...task, status } : task));
    };
    
    const handleDeleteTask = (id: string) => {
        setTasks(tasks.filter(task => task.id !== id));
    };

    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        if(!newTask.title || !newTask.description || !newTask.assignee) return;
        
        const newId = (tasks.length > 0 ? Math.max(...tasks.map(t => parseInt(t.id))) : 0) + 1;
        const taskToAdd: Task = {
            id: newId.toString(),
            ...newTask,
            status: TaskStatus.TODO
        };
        setTasks([taskToAdd, ...tasks]);
        setNewTask({ title: '', description: '', assignee: teamMembers[0] });
        setShowForm(false);
    };
    
    const columns = Object.values(TaskStatus);

    return (
        <div className="p-4 md:p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Task Management</h1>
                <button 
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
                >
                    <Plus size={16} className="mr-2" />
                    {showForm ? 'Cancel' : 'Add Task'}
                </button>
            </div>

            {showForm && (
                <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md mb-6">
                    <form onSubmit={handleAddTask}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="Task Title"
                                value={newTask.title}
                                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                className="w-full p-2 border rounded bg-gray-100 dark:bg-gray-800 dark:border-gray-600"
                                required
                            />
                            <select
                                value={newTask.assignee}
                                onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                                className="w-full p-2 border rounded bg-gray-100 dark:bg-gray-800 dark:border-gray-600"
                                required
                            >
                                {teamMembers.map(member => (
                                    <option key={member} value={member}>{member}</option>
                                ))}
                            </select>
                        </div>
                        <textarea
                            placeholder="Description"
                            value={newTask.description}
                            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                            className="w-full p-2 border rounded mt-4 bg-gray-100 dark:bg-gray-800 dark:border-gray-600"
                            required
                        />
                        <button type="submit" className="mt-4 px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors">
                            Save Task
                        </button>
                    </form>
                </div>
            )}
            
            <div className="flex flex-col md:flex-row gap-6">
                {columns.map(status => (
                    <TaskColumn
                        key={status}
                        title={status}
                        tasks={tasks.filter(t => t.status === status)}
                        onUpdateStatus={handleUpdateStatus}
                        onDelete={handleDeleteTask}
                    />
                ))}
            </div>
        </div>
    );
};

export default TaskManagement;
