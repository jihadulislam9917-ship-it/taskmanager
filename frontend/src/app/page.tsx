'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Task, getTasks, createTask, updateTask, deleteTask, CreateTaskInput, logout } from '@/lib/api';
import TaskItem from '@/components/TaskItem';
import TaskForm from '@/components/TaskForm';
import PurchaseCreditsModal from '@/components/PurchaseCreditsModal';
import { Plus, Loader2, LogOut, CreditCard, User } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchTasks();
  }, [router]);

  const fetchTasks = async () => {
    try {
      const data = await getTasks();
      setTasks(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch tasks. Please ensure the backend is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = () => {
    setEditingTask(undefined);
    setIsModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleDeleteTask = async (id: number) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await deleteTask(id);
      setTasks(tasks.filter(t => t.id !== id));
    } catch (err) {
      alert('Failed to delete task');
      console.error(err);
    }
  };

  const handleSubmit = async (data: CreateTaskInput) => {
    setIsSubmitting(true);
    try {
      if (editingTask) {
        const updated = await updateTask(editingTask.id, data);
        setTasks(tasks.map(t => t.id === editingTask.id ? updated : t));
      } else {
        const created = await createTask(data);
        setTasks([...tasks, created]);
      }
      setIsModalOpen(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (err.response?.status === 403 && err.response?.data?.error === 'Insufficient credits') {
        alert('You have run out of credits! Please purchase more to continue.');
        setIsPurchaseModalOpen(true);
        setIsModalOpen(false);
      } else {
        alert('Failed to save task');
        console.error(err);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm mb-8">
          <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Task Manager</h1>
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/profile')}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
              >
                <User size={18} />
                Profile
              </button>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </header>

      <div className="max-w-4xl mx-auto px-4 pb-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">My Tasks</h2>
            <p className="text-gray-500 mt-1">Manage your tasks efficiently</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setIsPurchaseModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
            >
              <CreditCard size={20} />
              Buy Credits
            </button>
            <button
              onClick={handleCreateTask}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus size={20} />
              New Task
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 flex items-center gap-2">
            <span className="font-medium">Error:</span> {error}
          </div>
        )}

        {tasks.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-500 text-lg">No tasks found. Create one to get started!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
              />
            ))}
          </div>
        )}

        {isModalOpen && (
          <TaskForm
            initialData={editingTask}
            onSubmit={handleSubmit}
            onCancel={() => setIsModalOpen(false)}
            isSubmitting={isSubmitting}
          />
        )}

        {isPurchaseModalOpen && (
          <PurchaseCreditsModal
            onClose={() => setIsPurchaseModalOpen(false)}
            onSuccess={() => {
              setIsPurchaseModalOpen(false);
              alert('Credits added successfully!');
            }}
          />
        )}
      </div>
    </main>
  );
}
