'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users as UsersIcon, Search, RefreshCw, Edit, Trash2, Shield, ShieldOff, Key, Eye, CheckCircle, AlertCircle, X } from 'lucide-react';
import api from '../services/api.js';
import toast from 'react-hot-toast';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [viewUser, setViewUser] = useState(null);
    const [editUser, setEditUser] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/users');
            setUsers(response.data.data || []);
        } catch (error) {
            toast.error('Failed to fetch users');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleActive = async (userId, currentStatus) => {
        try {
            await api.post(`/users/${userId}/disable`, { isActive: !currentStatus });
            setUsers(users.map(u => u._id === userId ? { ...u, isActive: !currentStatus } : u));
            toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
        } catch (error) {
            toast.error('Failed to update user status');
        }
    };

    const handleResetMFA = async (userId) => {
        if (!window.confirm('Are you sure you want to reset MFA for this user?')) return;
        try {
            await api.post(`/users/${userId}/reset-mfa`);
            toast.success('MFA reset successfully');
            fetchUsers();
        } catch (error) {
            toast.error('Failed to reset MFA');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
        try {
            await api.delete(`/users/${userId}`);
            setUsers(users.filter(u => u._id !== userId));
            toast.success('User deleted successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete user');
        }
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        try {
            const response = await api.put(`/users/${editUser._id}`, {
                firstName: editUser.firstName,
                lastName: editUser.lastName,
                role: editUser.role,
                department: editUser.department,
                permissions: editUser.permissions,
            });
            setUsers(users.map(u => u._id === editUser._id ? response.data.data : u));
            setEditUser(null);
            toast.success('User updated successfully');
        } catch (error) {
            toast.error('Failed to update user');
        }
    };

    const filteredUsers = users.filter((user) =>
        user.firstName?.toLowerCase().includes(search.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(search.toLowerCase()) ||
        user.email?.toLowerCase().includes(search.toLowerCase())
    );

    const getRoleColor = (role) => {
        switch (role) {
            case 'security_authority':
                return 'text-purple-400 bg-purple-900/30';
            case 'system_client':
                return 'text-blue-400 bg-blue-900/30';
            case 'auditor':
                return 'text-green-400 bg-green-900/30';
            default:
                return 'text-gray-400 bg-gray-900/30';
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-between items-center"
            >
                <div>
                    <h1 className="text-3xl font-bold mb-2">User Management</h1>
                    <p className="text-gray-400">Manage users and their permissions</p>
                </div>
                <button
                    onClick={fetchUsers}
                    className="btn-secondary px-4 flex items-center gap-2"
                >
                    <RefreshCw className="w-5 h-5" />
                    Refresh
                </button>
            </motion.div>

            {/* Search */}
            <div className="flex gap-4 flex-wrap">
                <div className="flex-1 min-w-64 relative">
                    <Search className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="input-field pl-10"
                    />
                </div>
            </div>

            {/* Users Table */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="card-hover overflow-x-auto"
            >
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-700">
                            <th className="px-6 py-4 text-left font-semibold text-gray-300">Name</th>
                            <th className="px-6 py-4 text-left font-semibold text-gray-300">Email</th>
                            <th className="px-6 py-4 text-left font-semibold text-gray-300">Role</th>
                            <th className="px-6 py-4 text-left font-semibold text-gray-300">Status</th>
                            <th className="px-6 py-4 text-left font-semibold text-gray-300">MFA</th>
                            <th className="px-6 py-4 text-left font-semibold text-gray-300">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-8 text-center">
                                    <div className="flex justify-center">
                                        <div className="loading-spinner" />
                                    </div>
                                </td>
                            </tr>
                        ) : filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-8 text-center text-gray-400">
                                    No users found
                                </td>
                            </tr>
                        ) : (
                            filteredUsers.map((user, idx) => (
                                <motion.tr
                                    key={user._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="border-b border-gray-700/50 hover:bg-gray-800/30 transition-colors"
                                >
                                    <td className="px-6 py-4 font-medium">
                                        {user.firstName} {user.lastName}
                                    </td>
                                    <td className="px-6 py-4 text-gray-400">{user.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleColor(user.role)}`}>
                                            {user.role?.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`flex items-center gap-2 ${user.isActive ? 'text-green-400' : 'text-red-400'}`}>
                                            {user.isActive ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                            {user.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={user.mfaEnabled ? 'text-green-400' : 'text-gray-400'}>
                                            {user.mfaEnabled ? 'Enabled' : 'Disabled'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 flex gap-2 flex-wrap">
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setViewUser(user)}
                                            className="p-2 hover:bg-blue-900/30 rounded-lg transition-colors text-blue-400"
                                            title="View"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setEditUser(user)}
                                            className="p-2 hover:bg-cyan-900/30 rounded-lg transition-colors text-cyan-400"
                                            title="Edit"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleToggleActive(user._id, user.isActive)}
                                            className={`p-2 rounded-lg transition-colors ${user.isActive ? 'hover:bg-orange-900/30 text-orange-400' : 'hover:bg-green-900/30 text-green-400'}`}
                                            title={user.isActive ? 'Deactivate' : 'Activate'}
                                        >
                                            {user.isActive ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleResetMFA(user._id)}
                                            className="p-2 hover:bg-yellow-900/30 rounded-lg transition-colors text-yellow-400"
                                            title="Reset MFA"
                                        >
                                            <Key className="w-4 h-4" />
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleDeleteUser(user._id)}
                                            className="p-2 hover:bg-red-900/30 rounded-lg transition-colors text-red-400"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </motion.button>
                                    </td>
                                </motion.tr>
                            ))
                        )}
                    </tbody>
                </table>
            </motion.div>

            {/* View User Modal */}
            {viewUser && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                    onClick={() => setViewUser(null)}
                >
                    <motion.div
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        onClick={(e) => e.stopPropagation()}
                        className="card w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">User Details</h2>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                onClick={() => setViewUser(null)}
                                className="text-gray-400 hover:text-white"
                            >
                                <X className="w-6 h-6" />
                            </motion.button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-800/50 rounded-lg p-4">
                                    <p className="text-gray-400 text-sm">Full Name</p>
                                    <p className="text-white font-semibold">{viewUser.firstName} {viewUser.lastName}</p>
                                </div>
                                <div className="bg-gray-800/50 rounded-lg p-4">
                                    <p className="text-gray-400 text-sm">Email</p>
                                    <p className="text-white font-semibold">{viewUser.email}</p>
                                </div>
                                <div className="bg-gray-800/50 rounded-lg p-4">
                                    <p className="text-gray-400 text-sm">Role</p>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleColor(viewUser.role)}`}>
                                        {viewUser.role?.replace('_', ' ')}
                                    </span>
                                </div>
                                <div className="bg-gray-800/50 rounded-lg p-4">
                                    <p className="text-gray-400 text-sm">Department</p>
                                    <p className="text-white font-semibold">{viewUser.department || 'General'}</p>
                                </div>
                                <div className="bg-gray-800/50 rounded-lg p-4">
                                    <p className="text-gray-400 text-sm">Status</p>
                                    <span className={viewUser.isActive ? 'text-green-400' : 'text-red-400'}>
                                        {viewUser.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <div className="bg-gray-800/50 rounded-lg p-4">
                                    <p className="text-gray-400 text-sm">MFA Status</p>
                                    <span className={viewUser.mfaEnabled ? 'text-green-400' : 'text-gray-400'}>
                                        {viewUser.mfaEnabled ? 'Enabled' : 'Disabled'}
                                    </span>
                                </div>
                            </div>

                            <div className="bg-gray-800/50 rounded-lg p-4">
                                <p className="text-gray-400 text-sm mb-2">Permissions</p>
                                <div className="flex flex-wrap gap-2">
                                    {viewUser.permissions?.length > 0 ? (
                                        viewUser.permissions.map((perm, idx) => (
                                            <span key={idx} className="px-2 py-1 bg-blue-900/30 text-blue-400 rounded text-xs">
                                                {perm}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-gray-500">No permissions assigned</span>
                                    )}
                                </div>
                            </div>

                            <div className="bg-gray-800/50 rounded-lg p-4">
                                <p className="text-gray-400 text-sm mb-2">User ID</p>
                                <p className="text-cyan-400 font-mono text-sm">{viewUser._id}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-800/50 rounded-lg p-4">
                                    <p className="text-gray-400 text-sm">Created</p>
                                    <p className="text-white">{new Date(viewUser.createdAt).toLocaleString()}</p>
                                </div>
                                <div className="bg-gray-800/50 rounded-lg p-4">
                                    <p className="text-gray-400 text-sm">Last Login</p>
                                    <p className="text-white">{viewUser.lastLogin ? new Date(viewUser.lastLogin).toLocaleString() : 'Never'}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}

            {/* Edit User Modal */}
            {editUser && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                    onClick={() => setEditUser(null)}
                >
                    <motion.div
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        onClick={(e) => e.stopPropagation()}
                        className="card w-full max-w-lg"
                    >
                        <h2 className="text-2xl font-bold mb-6">Edit User</h2>

                        <form onSubmit={handleUpdateUser} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">First Name</label>
                                    <input
                                        type="text"
                                        value={editUser.firstName}
                                        onChange={(e) => setEditUser({ ...editUser, firstName: e.target.value })}
                                        className="input-field"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Last Name</label>
                                    <input
                                        type="text"
                                        value={editUser.lastName}
                                        onChange={(e) => setEditUser({ ...editUser, lastName: e.target.value })}
                                        className="input-field"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Role</label>
                                <select
                                    value={editUser.role}
                                    onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                                    className="input-field"
                                >
                                    <option value="security_authority">Security Authority</option>
                                    <option value="system_client">System Client</option>
                                    <option value="auditor">Auditor</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Department</label>
                                <input
                                    type="text"
                                    value={editUser.department || ''}
                                    onChange={(e) => setEditUser({ ...editUser, department: e.target.value })}
                                    className="input-field"
                                />
                            </div>

                            <div className="flex gap-4">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    className="btn-primary flex-1"
                                >
                                    Save Changes
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="button"
                                    onClick={() => setEditUser(null)}
                                    className="btn-secondary flex-1"
                                >
                                    Cancel
                                </motion.button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
};

export default Users;
