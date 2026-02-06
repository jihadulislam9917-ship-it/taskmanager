import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
});

api.interceptors.request.use((config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

export interface LoginResponse {
    token: string;
    user: User;
}

export const register = async (name: string, email: string, password: string) => {
    return await api.post('/auth/signup', { name, email, password });
};

export const login = async (email: string, password: string) => {
    const response = await api.post<LoginResponse>('/auth/login', { email, password });
    if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
};

export const getCurrentUser = async () => {
    const response = await api.get<{data: User}>('/auth/me');
    return response.data.data;
};

export const updateProfile = async (data: { name?: string; password?: string; current_password?: string }) => {
    const response = await api.put<{ data: User }>('/auth/profile', data);
    return response.data.data;
};

export interface Task {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
  assignee: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskInput {
  title: string;
  description: string;
  status: string;
  priority: string;
  due_date: string | null;
  assignee: string;
}

export const getTasks = async () => {
  const response = await api.get<Task[]>('/tasks');
  return response.data;
};

export const createTask = async (task: CreateTaskInput) => {
  const response = await api.post<Task>('/tasks', task);
  return response.data;
};

export const updateTask = async (id: number, task: CreateTaskInput) => {
  const response = await api.put<Task>(`/tasks/${id}`, task);
  return response.data;
};

export const deleteTask = async (id: number) => {
  await api.delete(`/tasks/${id}`);
};

export interface AdminUser extends User {
    verified: boolean;
    subscription_plan: string;
    subscription_status: string;
    created_at: string;
}

export interface AdminStats {
    total_users: number;
    total_tasks: number;
    active_subscriptions: number;
}

export const getAdminUsers = async () => {
    const response = await api.get<AdminUser[]>('/admin/users');
    return response.data;
};

export const getAdminStats = async () => {
    const response = await api.get<AdminStats>('/admin/stats');
    return response.data;
};

export const updateUserStatus = async (id: number, data: Partial<AdminUser>) => {
    const response = await api.put<AdminUser>(`/admin/users/${id}`, data);
    return response.data;
};

export const createPaymentIntent = async (credits: number) => {
    const response = await api.post<{clientSecret: string}>('/subscriptions/purchase', { credits });
    return response.data;
};
