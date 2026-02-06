import React, { useEffect, useState } from 'react';
import { 
    Shield, 
    Activity, 
    Users, 
    CreditCard, 
    LogOut, 
    Search, 
    CheckCircle, 
    XCircle,
    Loader2,
} from 'lucide-react';
import { 
    loginAdmin, 
    getAdminStats, 
    getAdminUsers, 
    updateUserStatus, 
    addUserCredits,
    getAdminTransactions,
} from './api';
import type { 
    AdminUser, 
    AdminStats,
    Transaction,
} from './api';

function App() {
    const [token, setToken] = useState<string | null>(localStorage.getItem('admin_token'));
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'transactions'>('dashboard');
    const [searchTerm, setSearchTerm] = useState('');
    
    // Login Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (token) {
            fetchData();
        }
    }, [token]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statsData, usersData, transactionsData] = await Promise.all([
                getAdminStats(),
                getAdminUsers(),
                getAdminTransactions()
            ]);
            setStats(statsData);
            setUsers(usersData);
            setTransactions(transactionsData);
        } catch (err: any) {
            console.error(err);
            if (err.response?.status === 401) {
                logout();
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const data = await loginAdmin(email, password);
            localStorage.setItem('admin_token', data.token);
            setToken(data.token);
        } catch (err: any) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('admin_token');
        setToken(null);
        setStats(null);
        setUsers([]);
    };

    const handleRoleUpdate = async (user: AdminUser) => {
        const newRole = user.role === 'admin' ? 'user' : 'admin';
        if (!confirm(`Change role to ${newRole}?`)) return;
        
        try {
            await updateUserStatus(user.id, { role: newRole });
            setUsers(users.map(u => u.id === user.id ? { ...u, role: newRole } : u));
        } catch (err) {
            alert('Failed to update role');
        }
    };

    const handleSubUpdate = async (user: AdminUser) => {
        const newStatus = user.subscription_status === 'active' ? 'canceled' : 'active';
        if (!confirm(`Change subscription to ${newStatus}?`)) return;

        try {
            await updateUserStatus(user.id, { subscription_status: newStatus });
            setUsers(users.map(u => u.id === user.id ? { ...u, subscription_status: newStatus } : u));
        } catch (err) {
            alert('Failed to update subscription');
        }
    };

    const handleAddCredits = async (user: AdminUser) => {
        const amountStr = prompt("Enter amount of credits to add (use negative to deduct):");
        if (!amountStr) return;
        const amount = parseInt(amountStr);
        if (isNaN(amount)) return alert("Invalid amount");

        try {
            const updatedUser = await addUserCredits(user.id, amount);
            setUsers(users.map(u => u.id === user.id ? { ...u, credits: updatedUser.credits } : u));
        } catch (err) {
            alert('Failed to add credits');
        }
    };

    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
                    <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Admin Login</h2>
                    <form onSubmit={handleLogin}>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                            <input 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                required 
                            />
                        </div>
                        <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                required 
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>
                    {error && <p className="text-red-500 text-center mt-4 text-sm">{error}</p>}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white p-6 flex flex-col fixed h-full">
                <div className="flex items-center gap-3 mb-10">
                    <Shield className="w-8 h-8 text-blue-400" />
                    <h1 className="text-xl font-bold">Admin Panel</h1>
                </div>
                
                <nav className="flex-1 space-y-4">
                    <button 
                        onClick={() => setActiveTab('dashboard')}
                        className={`flex items-center gap-3 p-3 rounded-lg w-full ${activeTab === 'dashboard' ? 'text-blue-400 bg-slate-800' : 'text-gray-400 hover:bg-slate-800'}`}
                    >
                        <Activity className="w-5 h-5" />
                        Dashboard
                    </button>
                    <button 
                        onClick={() => setActiveTab('users')}
                        className={`flex items-center gap-3 p-3 rounded-lg w-full ${activeTab === 'users' ? 'text-blue-400 bg-slate-800' : 'text-gray-400 hover:bg-slate-800'}`}
                    >
                        <Users className="w-5 h-5" />
                        Users
                    </button>
                    <button 
                        onClick={() => setActiveTab('transactions')}
                        className={`flex items-center gap-3 p-3 rounded-lg w-full ${activeTab === 'transactions' ? 'text-blue-400 bg-slate-800' : 'text-gray-400 hover:bg-slate-800'}`}
                    >
                        <CreditCard className="w-5 h-5" />
                        Transactions
                    </button>
                </nav>

                <button 
                    onClick={logout}
                    className="flex items-center gap-3 text-red-400 hover:bg-slate-800 p-3 rounded-lg w-full mt-auto"
                >
                    <LogOut className="w-5 h-5" />
                    Logout
                </button>
            </aside>

            {/* Main Content */}
            <main className="ml-64 p-8 w-full">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-800">
                        {activeTab === 'dashboard' ? 'Dashboard Overview' : 
                         activeTab === 'users' ? 'User Management' : 'Transaction History'}
                    </h2>
                    <p className="text-gray-500">Welcome back, Admin</p>
                </div>

                {loading && !stats ? (
                    <div className="flex justify-center p-12">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                ) : (
                    <>
                        {activeTab === 'dashboard' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-gray-500 text-sm">Total Users</p>
                                            <h3 className="text-3xl font-bold text-gray-900 mt-2">{stats?.total_users || 0}</h3>
                                        </div>
                                        <div className="p-3 bg-blue-50 rounded-lg">
                                            <Users className="w-6 h-6 text-blue-600" />
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-gray-500 text-sm">Active Tasks</p>
                                            <h3 className="text-3xl font-bold text-gray-900 mt-2">{stats?.total_tasks || 0}</h3>
                                        </div>
                                        <div className="p-3 bg-purple-50 rounded-lg">
                                            <Activity className="w-6 h-6 text-purple-600" />
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-gray-500 text-sm">Active Subscriptions</p>
                                            <h3 className="text-3xl font-bold text-gray-900 mt-2">{stats?.active_subscriptions || 0}</h3>
                                        </div>
                                        <div className="p-3 bg-green-50 rounded-lg">
                                            <CreditCard className="w-6 h-6 text-green-600" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'users' && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                                    <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input 
                                            type="text" 
                                            placeholder="Search users..." 
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                                
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="px-6 py-4 text-sm font-semibold text-gray-500">User</th>
                                                <th className="px-6 py-4 text-sm font-semibold text-gray-500">Role</th>
                                                <th className="px-6 py-4 text-sm font-semibold text-gray-500">Status</th>
                                                <th className="px-6 py-4 text-sm font-semibold text-gray-500">Subscription</th>
                                                <th className="px-6 py-4 text-sm font-semibold text-gray-500">Credits</th>
                                                <th className="px-6 py-4 text-sm font-semibold text-gray-500">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {filteredUsers.map(user => (
                                                <tr key={user.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4">
                                                        <div>
                                                            <p className="font-medium text-gray-900">{user.name}</p>
                                                            <p className="text-sm text-gray-500">{user.email}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                            user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                                                        }`}>
                                                            {user.role}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`flex items-center gap-1 text-sm ${
                                                            user.verified ? 'text-green-600' : 'text-amber-600'
                                                        }`}>
                                                            {user.verified ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                                            {user.verified ? 'Verified' : 'Unverified'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="font-medium capitalize">{user.subscription_plan}</span>
                                                            <span className={`text-xs ${
                                                                user.subscription_status === 'active' ? 'text-green-600' : 'text-red-600'
                                                            }`}>
                                                                {user.subscription_status}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="font-bold text-gray-700">{user.credits}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex gap-2">
                                                            <button 
                                                                onClick={() => handleRoleUpdate(user)}
                                                                className="text-xs text-blue-600 hover:underline"
                                                            >
                                                                {user.role === 'admin' ? 'Demote' : 'Promote'}
                                                            </button>
                                                            <button 
                                                                onClick={() => handleSubUpdate(user)}
                                                                className="text-xs text-red-600 hover:underline"
                                                            >
                                                                {user.subscription_status === 'active' ? 'Cancel Sub' : 'Activate Sub'}
                                                            </button>
                                                            <button 
                                                                onClick={() => handleAddCredits(user)}
                                                                className="text-xs text-green-600 hover:underline"
                                                            >
                                                                Add Credits
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'transactions' && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="p-6 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900">All Transactions</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="px-6 py-4 text-sm font-semibold text-gray-500">ID</th>
                                                <th className="px-6 py-4 text-sm font-semibold text-gray-500">User ID</th>
                                                <th className="px-6 py-4 text-sm font-semibold text-gray-500">Type</th>
                                                <th className="px-6 py-4 text-sm font-semibold text-gray-500">Amount</th>
                                                <th className="px-6 py-4 text-sm font-semibold text-gray-500">Description</th>
                                                <th className="px-6 py-4 text-sm font-semibold text-gray-500">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {transactions.map(tx => (
                                                <tr key={tx.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 text-sm text-gray-500">#{tx.id}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-500">{tx.user_id}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                            tx.type === 'purchase' ? 'bg-green-100 text-green-700' :
                                                            tx.type === 'usage' ? 'bg-red-100 text-red-700' :
                                                            tx.type === 'bonus' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-gray-100 text-gray-700'
                                                        }`}>
                                                            {tx.type}
                                                        </span>
                                                    </td>
                                                    <td className={`px-6 py-4 font-mono font-medium ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                        {tx.amount > 0 ? '+' : ''}{tx.amount}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-500">{tx.description}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-500">
                                                        {new Date(tx.created_at).toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}

export default App;
