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
            className="fixed md:relative w-64 h-screen glass border-r border-gray-700 z-40 md:z-auto"
          >
            <div className="p-6 h-full flex flex-col">
              {/* Logo */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="mb-8"
              >
                <div className="flex items-center gap-3 group cursor-pointer">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-lg flex items-center justify-center">
                    <Lock className="w-6 h-6 text-slate-900" />
                  </div>
                  <span className="font-bold text-lg text-gradient">SCKLMS</span>
                </div>
              </motion.div>

              {/* Navigation */}
              <nav className="flex-1 space-y-2">
                {menuItems
                  .filter((item) => item.show)
                  .map((item, idx) => {
                    const Icon = item.icon;
                    const isActive = window.location.pathname === item.path;

                    return (
                      <motion.button
                        key={idx}
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          navigate(item.path);
                          setSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${isActive
                            ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                            : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                          }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </motion.button>
                    );
                  })}
              </nav>

              {/* User Info */}
              <div className="border-t border-gray-700 pt-4 space-y-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  onClick={() => navigate('/settings')}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all duration-200"
                >
                  <Settings className="w-5 h-5" />
                  <span>Settings</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-all duration-200"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </motion.button>
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
