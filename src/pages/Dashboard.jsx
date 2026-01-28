'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Shield, Key, FileText, Users, Activity, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [certsRes, keysRes, logsRes] = await Promise.all([
        api.get('/certificates'),
        api.get('/keys'),
        api.get('/audit-logs?limit=10'),
      ]);

      const certs = certsRes.data.data || [];
      const keys = keysRes.data.data || [];

      setStats({
        totalCerts: certs.length,
        activeCerts: certs.filter((c) => c.status === 'valid').length,
        totalKeys: keys.length,
        activeKeys: keys.filter((k) => k.status === 'active').length,
        recentActivity: logsRes.data.data || [],
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = [
    { name: 'Mon', certs: 4, keys: 2 },
    { name: 'Tue', certs: 3, keys: 3 },
    { name: 'Wed', certs: 2, keys: 5 },
    { name: 'Thu', certs: 5, keys: 4 },
    { name: 'Fri', certs: 6, keys: 3 },
    { name: 'Sat', certs: 2, keys: 2 },
    { name: 'Sun', certs: 3, keys: 1 },
  ];

  const securityStats = [
    { name: 'Active', value: stats?.activeKeys || 0, color: '#10B981' },
    { name: 'Rotated', value: 2, color: '#F59E0B' },
    { name: 'Revoked', value: 1, color: '#EF4444' },
  ];

  const StatCard = ({ icon: Icon, title, value, subtitle, color }) => (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="card-hover group cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm mb-1">{title}</p>
          <p className={`text-3xl font-bold ${color || 'text-white'}`}>{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className="p-3 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg group-hover:from-blue-500/30 group-hover:to-cyan-500/30 transition-all">
          <Icon className="w-6 h-6 text-cyan-400" />
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, <span className="text-gradient">{user?.firstName}</span>
          </h1>
          <p className="text-gray-400">Manage your certificates and cryptographic keys securely</p>
        </div>
        <div className="text-right">
          <p className="text-gray-400 text-sm">Role</p>
          <p className="text-lg font-semibold capitalize text-cyan-400">
            {user?.role?.replace('_', ' ')}
          </p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={FileText}
          title="Certificates"
          value={stats?.totalCerts || 0}
          subtitle={`${stats?.activeCerts || 0} active`}
          color="text-blue-400"
        />
        <StatCard
          icon={Key}
          title="Cryptographic Keys"
          value={stats?.totalKeys || 0}
          subtitle={`${stats?.activeKeys || 0} active`}
          color="text-cyan-400"
        />
        <StatCard
          icon={Activity}
          title="Recent Activities"
          value={stats?.recentActivity?.length || 0}
          color="text-green-400"
        />
        <StatCard
          icon={Shield}
          title="Security Status"
          value="Good"
          subtitle="All systems secure"
          color="text-emerald-400"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Chart */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 card-hover"
        >
          <h2 className="text-xl font-bold mb-6">Weekly Activity</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }} />
              <Line
                type="monotone"
                dataKey="certs"
                stroke="#0066CC"
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Certificates"
              />
              <Line
                type="monotone"
                dataKey="keys"
                stroke="#06B6D4"
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Keys"
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Key Status Pie */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="card-hover"
        >
          <h2 className="text-xl font-bold mb-6">Key Status</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={securityStats}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {securityStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2 text-sm">
            {securityStats.map((stat) => (
              <div key={stat.name} className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stat.color }} />
                  {stat.name}
                </span>
                <span className="font-semibold">{stat.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="card-hover"
      >
        <h2 className="text-xl font-bold mb-6">Recent Activity</h2>
        <div className="space-y-4">
          {stats?.recentActivity?.slice(0, 5).map((activity, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-center gap-4 flex-1">
                {activity.status === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className="font-semibold text-sm capitalize">{activity.action}</p>
                  <p className="text-xs text-gray-400">{activity.resourceName || 'System'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">
                  {new Date(activity.createdAt).toLocaleDateString()}
                </p>
                <span
                  className={`text-xs font-semibold capitalize ${
                    activity.severity === 'critical'
                      ? 'text-red-400'
                      : activity.severity === 'high'
                        ? 'text-orange-400'
                        : 'text-gray-400'
                  }`}
                >
                  {activity.severity}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
