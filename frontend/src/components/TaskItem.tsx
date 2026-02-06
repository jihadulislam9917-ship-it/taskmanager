import React from 'react';
import { Task } from '@/lib/api';
import { Pencil, Trash2, Calendar, User, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { clsx } from 'clsx';

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onEdit, onDelete }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'in-progress': return <Clock className="w-5 h-5 text-blue-500" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-start gap-3">
          <div className="mt-1">{getStatusIcon(task.status)}</div>
          <div>
            <h3 className="font-semibold text-gray-900">{task.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{task.description}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors"
          >
            <Pencil size={18} />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-1.5 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-600">
        <span className={clsx('px-2.5 py-0.5 rounded-full text-xs font-medium capitalize', getPriorityColor(task.priority))}>
          {task.priority} Priority
        </span>
        
        {task.due_date && (
          <div className="flex items-center gap-1.5">
            <Calendar size={16} />
            <span>{new Date(task.due_date).toLocaleDateString()}</span>
          </div>
        )}

        {task.assignee && (
          <div className="flex items-center gap-1.5">
            <User size={16} />
            <span>{task.assignee}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskItem;
