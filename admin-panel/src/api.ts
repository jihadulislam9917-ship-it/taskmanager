import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export interface AdminUser {
    id: number;
    name: string;
    email: string;
    role: string;
    verified: boolean;
    subscription_plan: string;
    subscription_status: string;
    credits: number;
    created_at: string;
}

export interface Transaction {
    id: number;
    user_id: number;
    amount: number;
    type: string;
    description: string;
    created_at: string;
}

export interface AdminStats {
    total_users: number;
    total_tasks: number;
    active_subscriptions: number;
}

export const loginAdmin = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.user.role !== 'admin') {
        throw new Error('Unauthorized: Admin access required');
    }
    return response.data;
};

export const getAdminStats = async () => {
    const response = await api.get<AdminStats>('/admin/stats');
    return response.data;
};

export const getAdminUsers = async () => {
    const response = await api.get<AdminUser[]>('/admin/users');
    return response.data;
};

export const getAdminTransactions = async () => {
    const response = await api.get<Transaction[]>('/admin/transactions');
    return response.data;
};

export const updateUserStatus = async (id: number, data: Partial<AdminUser>) => {
    const response = await api.put<AdminUser>(`/admin/users/${id}`, data);
    return response.data;
};

export const addUserCredits = async (id: number, amount: number) => {
    const response = await api.post<AdminUser>(`/admin/users/${id}/credits`, { amount });
    return response.data;
};
