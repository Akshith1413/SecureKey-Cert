'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, User, Lock, Bell, Shield, Eye, EyeOff, Save, Key, CheckCircle, Smartphone, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';
import toast from 'react-hot-toast';

const Settings = () => {
    const { user, refreshUser } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);
    const [accountInfo, setAccountInfo] = useState(null);

    // Profile state
    const [profile, setProfile] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        department: user?.department || '',
    });

    // Password state
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    // MFA state
    const [mfaState, setMfaState] = useState({
        enabled: user?.mfaEnabled || false,
        qrCode: null,
        secret: null,
        backupCodes: null,
        verificationCode: '',
        emailOtpSent: false,
        emailOtp: '',
    });

    // Fetch live account info
    const fetchAccountInfo = async () => {
        try {
            const response = await api.get('/auth/account-info');
            setAccountInfo(response.data.data);
        } catch (error) {
            console.error('Failed to fetch account info:', error);
        }
    };

    useEffect(() => {
        if (user) {
            setProfile({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                department: user.department || '',
            });
            setMfaState(prev => ({ ...prev, enabled: user.mfaEnabled || false }));
            fetchAccountInfo();
        }
    }, [user]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put('/auth/profile', profile);
            toast.success('Profile updated successfully');
            if (refreshUser) refreshUser();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }
        if (passwordData.newPassword.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }
        setLoading(true);
        try {
            await api.put('/auth/password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
            });
            toast.success('Password changed successfully');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    const handleSetupMFA = async () => {
        setLoading(true);
        try {
            const response = await api.post('/auth/mfa/setup');
            setMfaState(prev => ({
                ...prev,
                qrCode: response.data.qrCode,
                secret: response.data.secret,
                backupCodes: response.data.backupCodes,
            }));
            toast.success('Scan the QR code with your authenticator app');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to setup MFA');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyMFA = async () => {
        if (!mfaState.verificationCode) {
            toast.error('Please enter verification code');
            return;
        }
        setLoading(true);
        try {
            await api.post('/auth/mfa/verify', {
                secret: mfaState.secret,
                token: mfaState.verificationCode,
                backupCodes: mfaState.backupCodes,
            });
            setMfaState(prev => ({ ...prev, enabled: true, qrCode: null, secret: null, backupCodes: null, verificationCode: '' }));
            toast.success('MFA enabled successfully');
            if (refreshUser) refreshUser();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid verification code');
        } finally {
            setLoading(false);
        }
    };

    const handleSendEmailOtp = async () => {
        setLoading(true);
        try {
            await api.post('/auth/mfa/email/send');
            setMfaState(prev => ({ ...prev, emailOtpSent: true }));
            toast.success('OTP sent to your email');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyEmailOtp = async () => {
        if (!mfaState.emailOtp) {
            toast.error('Please enter OTP');
            return;
        }
        setLoading(true);
        try {
            await api.post('/auth/mfa/email/verify', {
                token: mfaState.emailOtp,
            });
            setMfaState(prev => ({ ...prev, enabled: true, emailOtpSent: false, emailOtp: '' }));
            toast.success('Email MFA enabled successfully');
            if (refreshUser) refreshUser();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleDisableMFA = async () => {
        if (!window.confirm('Are you sure you want to disable MFA? This will reduce your account security.')) return;
        setLoading(true);
        try {
            await api.post('/auth/mfa/disable');
            setMfaState(prev => ({ ...prev, enabled: false }));
            toast.success('MFA disabled');
            if (refreshUser) refreshUser();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to disable MFA');
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'security', label: 'Security', icon: Lock },
        { id: 'mfa', label: 'Two-Factor Auth', icon: Shield },
        { id: 'account', label: 'Account Info', icon: SettingsIcon },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-3xl font-bold mb-2">Settings</h1>
                <p className="text-gray-400">Manage your account settings and preferences</p>
            </motion.div>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Sidebar Tabs */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="md:w-64"
                >
                    <div className="card p-2 space-y-1">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <motion.button
                                    key={tab.id}
                                    whileHover={{ x: 4 }}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${activeTab === tab.id
                                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                                        : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    {tab.label}
                                </motion.button>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Content */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex-1"
                >
                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <div className="card">
                            <h2 className="text-xl font-bold mb-6">Profile Information</h2>
                            <form onSubmit={handleUpdateProfile} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">First Name</label>
                                        <input
                                            type="text"
                                            value={profile.firstName}
                                            onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                                            className="input-field"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Last Name</label>
                                        <input
                                            type="text"
                                            value={profile.lastName}
                                            onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                                            className="input-field"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Email</label>
                                    <input
                                        type="email"
                                        value={profile.email}
                                        className="input-field bg-gray-700 cursor-not-allowed"
                                        disabled
                                    />
                                    <p className="text-gray-500 text-xs mt-1">Email cannot be changed</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Department</label>
                                    <input
                                        type="text"
                                        value={profile.department}
                                        onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                                        className="input-field"
                                    />
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={loading}
                                    className="btn-primary flex items-center gap-2"
                                >
                                    <Save className="w-4 h-4" />
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </motion.button>
                            </form>
                        </div>
                    )}

                    {/* Security Tab */}
                    {activeTab === 'security' && (
                        <div className="card">
                            <h2 className="text-xl font-bold mb-6">Change Password</h2>
                            <form onSubmit={handleChangePassword} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Current Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPasswords.current ? 'text' : 'password'}
                                            value={passwordData.currentPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                            className="input-field pr-10"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                                            className="absolute right-3 top-3 text-gray-400 hover:text-white"
                                        >
                                            {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">New Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPasswords.new ? 'text' : 'password'}
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                            className="input-field pr-10"
                                            required
                                            minLength={8}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                            className="absolute right-3 top-3 text-gray-400 hover:text-white"
                                        >
                                            {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPasswords.confirm ? 'text' : 'password'}
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                            className="input-field pr-10"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                            className="absolute right-3 top-3 text-gray-400 hover:text-white"
                                        >
                                            {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={loading}
                                    className="btn-primary flex items-center gap-2"
                                >
                                    <Lock className="w-4 h-4" />
                                    {loading ? 'Changing...' : 'Change Password'}
                                </motion.button>
                            </form>
                        </div>
                    )}

                    {/* MFA Tab */}
                    {activeTab === 'mfa' && (
                        <div className="card">
                            <h2 className="text-xl font-bold mb-6">Two-Factor Authentication</h2>

                            {mfaState.enabled ? (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 p-4 bg-green-900/20 border border-green-700 rounded-lg">
                                        <CheckCircle className="w-6 h-6 text-green-400" />
                                        <div>
                                            <p className="text-green-400 font-semibold">MFA is Enabled</p>
                                            <p className="text-gray-400 text-sm">Your account is protected with two-factor authentication</p>
                                        </div>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleDisableMFA}
                                        disabled={loading}
                                        className="btn-secondary text-red-400 hover:text-red-300"
                                    >
                                        {loading ? 'Disabling...' : 'Disable MFA'}
                                    </motion.button>
                                </div>
                            ) : mfaState.qrCode ? (
                                <div className="space-y-4">
                                    <p className="text-gray-400">Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)</p>
                                    <div className="flex justify-center p-4 bg-white rounded-lg w-fit mx-auto">
                                        <img src={mfaState.qrCode} alt="MFA QR Code" className="w-48 h-48" />
                                    </div>
                                    <div className="bg-gray-800/50 rounded-lg p-4">
                                        <p className="text-gray-400 text-sm mb-2">Or enter this secret manually:</p>
                                        <p className="text-cyan-400 font-mono text-sm break-all">{mfaState.secret}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Enter Verification Code</label>
                                        <input
                                            type="text"
                                            value={mfaState.verificationCode}
                                            onChange={(e) => setMfaState({ ...mfaState, verificationCode: e.target.value })}
                                            placeholder="000000"
                                            className="input-field text-center text-2xl tracking-widest"
                                            maxLength={6}
                                        />
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleVerifyMFA}
                                        disabled={loading}
                                        className="btn-primary w-full"
                                    >
                                        {loading ? 'Verifying...' : 'Verify & Enable MFA'}
                                    </motion.button>
                                    <button
                                        onClick={() => setMfaState(prev => ({ ...prev, qrCode: null, secret: null }))}
                                        className="text-gray-400 hover:text-white text-sm"
                                    >
                                        ← Go back
                                    </button>
                                </div>
                            ) : mfaState.emailOtpSent ? (
                                <div className="space-y-4">
                                    <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
                                        <p className="text-blue-400">An OTP code has been sent to your email. Enter it below.</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Enter 6-digit OTP</label>
                                        <input
                                            type="text"
                                            value={mfaState.emailOtp}
                                            onChange={(e) => setMfaState({ ...mfaState, emailOtp: e.target.value })}
                                            placeholder="000000"
                                            className="input-field text-center text-2xl tracking-widest"
                                            maxLength={6}
                                        />
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleVerifyEmailOtp}
                                        disabled={loading}
                                        className="btn-primary w-full"
                                    >
                                        {loading ? 'Verifying...' : 'Verify & Enable Email MFA'}
                                    </motion.button>
                                    <button
                                        onClick={() => setMfaState(prev => ({ ...prev, emailOtpSent: false }))}
                                        className="text-gray-400 hover:text-white text-sm"
                                    >
                                        ← Go back
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <p className="text-gray-400">
                                        Add an extra layer of security to your account by enabling two-factor authentication.
                                        Choose your preferred method below.
                                    </p>

                                    {/* Authenticator App Option */}
                                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="bg-purple-900/30 p-3 rounded-lg">
                                                <Smartphone className="w-6 h-6 text-purple-400" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-white">Authenticator App</h3>
                                                <p className="text-gray-400 text-sm">Use Google Authenticator, Authy, or similar apps</p>
                                            </div>
                                        </div>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleSetupMFA}
                                            disabled={loading}
                                            className="btn-secondary flex items-center gap-2 w-full justify-center"
                                        >
                                            <Key className="w-4 h-4" />
                                            {loading ? 'Setting up...' : 'Setup with Authenticator'}
                                        </motion.button>
                                    </div>

                                    {/* Email OTP Option */}
                                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="bg-blue-900/30 p-3 rounded-lg">
                                                <Mail className="w-6 h-6 text-blue-400" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-white">Email OTP</h3>
                                                <p className="text-gray-400 text-sm">Receive a one-time code via email each login</p>
                                            </div>
                                        </div>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleSendEmailOtp}
                                            disabled={loading}
                                            className="btn-primary flex items-center gap-2 w-full justify-center"
                                        >
                                            <Mail className="w-4 h-4" />
                                            {loading ? 'Sending OTP...' : 'Setup with Email OTP'}
                                        </motion.button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Account Info Tab */}
                    {activeTab === 'account' && (
                        <div className="card space-y-4">
                            <h2 className="text-xl font-bold mb-6">Account Information</h2>

                            {accountInfo ? (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gray-800/50 rounded-lg p-4">
                                            <p className="text-gray-400 text-sm">User ID</p>
                                            <p className="text-cyan-400 font-mono text-sm break-all">{accountInfo.userId}</p>
                                        </div>
                                        <div className="bg-gray-800/50 rounded-lg p-4">
                                            <p className="text-gray-400 text-sm">Role</p>
                                            <p className="text-white font-semibold capitalize">{accountInfo.role?.replace('_', ' ')}</p>
                                        </div>
                                        <div className="bg-gray-800/50 rounded-lg p-4">
                                            <p className="text-gray-400 text-sm">Account Status</p>
                                            <p className={accountInfo.isActive ? 'text-green-400' : 'text-red-400'}>
                                                {accountInfo.isActive ? 'Active' : 'Inactive'}
                                            </p>
                                        </div>
                                        <div className="bg-gray-800/50 rounded-lg p-4">
                                            <p className="text-gray-400 text-sm">MFA Status</p>
                                            <p className={accountInfo.mfaEnabled ? 'text-green-400' : 'text-yellow-400'}>
                                                {accountInfo.mfaEnabled ? 'Enabled' : 'Not Enabled'}
                                            </p>
                                        </div>
                                        <div className="bg-gray-800/50 rounded-lg p-4">
                                            <p className="text-gray-400 text-sm">Account Created</p>
                                            <p className="text-white">{accountInfo.createdAt ? new Date(accountInfo.createdAt).toLocaleDateString() : 'N/A'}</p>
                                        </div>
                                        <div className="bg-gray-800/50 rounded-lg p-4">
                                            <p className="text-gray-400 text-sm">Last Login</p>
                                            <p className="text-white">{accountInfo.lastLogin ? new Date(accountInfo.lastLogin).toLocaleString() : 'Never'}</p>
                                        </div>
                                    </div>

                                    <div className="bg-gray-800/50 rounded-lg p-4">
                                        <p className="text-gray-400 text-sm mb-2">Your Permissions</p>
                                        <div className="flex flex-wrap gap-2">
                                            {accountInfo.permissions?.length > 0 ? (
                                                accountInfo.permissions.map((perm, idx) => (
                                                    <span key={idx} className="px-2 py-1 bg-blue-900/30 text-blue-400 rounded text-xs">
                                                        {perm}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-gray-500">Permissions are set based on your role</span>
                                            )}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex justify-center p-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default Settings;
