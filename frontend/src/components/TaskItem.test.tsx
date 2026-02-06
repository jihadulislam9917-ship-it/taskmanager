import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TaskItem from './TaskItem';
import { Task } from '@/lib/api';

const mockTask: Task = {
  id: 1,
  title: 'Test Task',
  description: 'Test Description',
  status: 'pending',
  priority: 'high',
  due_date: '2023-12-31',
  assignee: 'John Doe',
  created_at: '2023-01-01',
  updated_at: '2023-01-01',
};

describe('TaskItem', () => {
  it('renders task details correctly', () => {
    render(<TaskItem task={mockTask} onEdit={() => {}} onDelete={() => {}} />);
    
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('high Priority')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    const handleEdit = jest.fn();
    render(<TaskItem task={mockTask} onEdit={handleEdit} onDelete={() => {}} />);
    
    const buttons = screen.getAllByRole('button');
    // First button is Edit (Pencil) based on the component structure
    fireEvent.click(buttons[0]); 
    
    expect(handleEdit).toHaveBeenCalledWith(mockTask);
  });

  it('calls onDelete when delete button is clicked', () => {
    const handleDelete = jest.fn();
    render(<TaskItem task={mockTask} onEdit={() => {}} onDelete={handleDelete} />);
    
    const buttons = screen.getAllByRole('button');
    // Second button is Delete (Trash2)
    fireEvent.click(buttons[1]); 
    
    expect(handleDelete).toHaveBeenCalledWith(mockTask.id);
  });
});
