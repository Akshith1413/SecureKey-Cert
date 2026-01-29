'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogOut, Settings, Home, Lock, FileText, Key, Users, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard', show: true },
    { icon: FileText, label: 'Certificates', path: '/certificates', show: true },
    { icon: Key, label: 'Keys', path: '/keys', show: true },
    { icon: Lock, label: 'Trust Authority', path: '/trust-authority', show: user?.role === 'security_authority' },
    { icon: Settings, label: 'Crypto Policies', path: '/crypto-policies', show: user?.role === 'security_authority' },
    { icon: FileText, label: 'Verify Files', path: '/file-verification', show: true },
    { icon: Activity, label: 'Audit Logs', path: '/audit-logs', show: user?.role === 'auditor' || user?.role === 'security_authority' },
    { icon: Users, label: 'Users', path: '/users', show: user?.role === 'security_authority' },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ duration: 0.3 }}
            className="fixed md:relative w-72 h-screen z-40 md:z-auto overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.95) 50%, rgba(15, 23, 42, 0.98) 100%)',
              borderRight: '1px solid rgba(59, 130, 246, 0.2)',
              boxShadow: '4px 0 24px rgba(0, 0, 0, 0.3)'
            }}
          >
            <div className="p-5 h-full flex flex-col">
              {/* Logo Section */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="mb-6 flex-shrink-0 pb-5 border-b border-gray-700/50"
              >
                <div className="flex items-center gap-3 group cursor-pointer">
                  <div className="w-11 h-11 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/30">
                    <Lock className="w-6 h-6 text-slate-900" />
                  </div>
                  <div>
                    <span className="font-bold text-xl bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">ST-CIMP</span>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Key Management</p>
                  </div>
                </div>
              </motion.div>

              {/* Navigation Label */}
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-3 px-2 font-semibold">Navigation</p>

              {/* Navigation - Scrollable */}
              <nav className="flex-1 space-y-1 overflow-y-auto min-h-0 pr-1 sidebar-scroll">
                {menuItems
                  .filter((item) => item.show)
                  .map((item, idx) => {
                    const Icon = item.icon;
                    const isActive = window.location.pathname === item.path;

                    return (
                      <motion.button
                        key={idx}
                        whileHover={{ x: 4, backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          navigate(item.path);
                          setSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${isActive
                          ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/30'
                          : 'text-gray-400 hover:text-white'
                          }`}
                      >
                        <div className={`p-1.5 rounded-lg ${isActive ? 'bg-white/20' : 'bg-gray-800/50'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-sm">{item.label}</span>
                        {isActive && (
                          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        )}
                      </motion.button>
                    );
                  })}
              </nav>

              {/* User Profile Card */}
              <div className="flex-shrink-0 mt-4 pt-4 border-t border-gray-700/50">
                {/* User Info */}
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-3 mb-3 border border-gray-700/30">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-lg flex items-center justify-center text-slate-900 font-bold text-sm shadow-md">
                      {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm truncate">{user?.firstName} {user?.lastName}</p>
                      <p className="text-gray-500 text-[10px] uppercase tracking-wider">{user?.role?.replace('_', ' ')}</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <motion.button
                    whileHover={{ scale: 1.03, backgroundColor: 'rgba(59, 130, 246, 0.15)' }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate('/settings')}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-gray-400 hover:text-blue-400 transition-all duration-200 border border-gray-700/30 hover:border-blue-500/30"
                  >
                    <Settings className="w-4 h-4" />
                    <span className="text-xs font-medium">Settings</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.03, backgroundColor: 'rgba(239, 68, 68, 0.15)' }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-gray-400 hover:text-red-400 transition-all duration-200 border border-gray-700/30 hover:border-red-500/30"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-xs font-medium">Logout</span>
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <motion.div
          initial={{ y: -60 }}
          animate={{ y: 0 }}
          className="glass border-b border-gray-700 px-6 py-4 flex justify-between items-center"
        >
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-800/50 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </motion.button>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-sm text-gray-400">Welcome</p>
              <p className="font-semibold">{user?.firstName} {user?.lastName}</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full flex items-center justify-center text-slate-900 font-bold">
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </div>
          </div>
        </motion.div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="p-6 md:p-8"
          >
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
