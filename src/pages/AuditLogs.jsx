'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Download, RefreshCw, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import api from '../services/api.js';
import toast from 'react-hot-toast';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, [actionFilter, severityFilter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/audit-logs', {
        params: {
          action: actionFilter || undefined,
          severity: severityFilter || undefined,
          limit: 100,
        },
      });
      setLogs(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/audit-logs/stats/summary');
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.get('/audit-logs/export', {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `audit-logs-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentElement.removeChild(link);

      toast.success('Audit logs exported successfully');
    } catch (error) {
      toast.error('Failed to export logs');
    }
  };

  const filteredLogs = logs.filter((log) =>
    log.action.toLowerCase().includes(search.toLowerCase()) ||
    log.resourceName?.toLowerCase().includes(search.toLowerCase()) ||
    log.userName?.toLowerCase().includes(search.toLowerCase())
  );

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-400" />;
      case 'high':
        return <AlertTriangle className="w-5 h-5 text-orange-400" />;
      case 'medium':
        return <Info className="w-5 h-5 text-yellow-400" />;
      default:
        return <CheckCircle className="w-5 h-5 text-green-400" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'text-red-400';
      case 'high':
        return 'text-orange-400';
      case 'medium':
        return 'text-yellow-400';
      default:
        return 'text-green-400';
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
          <h1 className="text-3xl font-bold mb-2">Audit Logs</h1>
          <p className="text-gray-400">Monitor and review system activity</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleExport}
          className="btn-primary flex items-center gap-2"
        >
          <Download className="w-5 h-5" />
          Export CSV
        </motion.button>
      </motion.div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card"
          >
            <p className="text-gray-400 text-sm">Total Logs</p>
            <p className="text-2xl font-bold text-cyan-400">{stats.totalLogs}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="card"
          >
            <p className="text-gray-400 text-sm">Critical</p>
            <p className="text-2xl font-bold text-red-400">
              {stats.severityStats?.find((s) => s._id === 'critical')?.count || 0}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="card"
          >
            <p className="text-gray-400 text-sm">High</p>
            <p className="text-2xl font-bold text-orange-400">
              {stats.severityStats?.find((s) => s._id === 'high')?.count || 0}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="card"
          >
            <p className="text-gray-400 text-sm">Users</p>
            <p className="text-2xl font-bold text-blue-400">{stats.topUsers?.length || 0}</p>
          </motion.div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-64">
          <input
            type="text"
            placeholder="Search logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field"
          />
        </div>
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="input-field w-48"
        >
          <option value="">All Severity</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <button
          onClick={() => fetchLogs()}
          className="btn-secondary px-4 flex items-center gap-2"
        >
          <RefreshCw className="w-5 h-5" />
          Refresh
        </button>
      </div>

      {/* Logs Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="card-hover overflow-x-auto"
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="px-6 py-4 text-left font-semibold text-gray-300">Action</th>
              <th className="px-6 py-4 text-left font-semibold text-gray-300">User</th>
              <th className="px-6 py-4 text-left font-semibold text-gray-300">Resource</th>
              <th className="px-6 py-4 text-left font-semibold text-gray-300">Severity</th>
              <th className="px-6 py-4 text-left font-semibold text-gray-300">Status</th>
              <th className="px-6 py-4 text-left font-semibold text-gray-300">Timestamp</th>
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
            ) : filteredLogs.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-400">
                  No audit logs found
                </td>
              </tr>
            ) : (
              filteredLogs.map((log, idx) => (
                <motion.tr
                  key={log._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="border-b border-gray-700/50 hover:bg-gray-800/30 transition-colors"
                >
                  <td className="px-6 py-4 font-medium capitalize">{log.action}</td>
                  <td className="px-6 py-4 text-gray-400">{log.userName || 'System'}</td>
                  <td className="px-6 py-4 text-gray-400">{log.resourceName || 'N/A'}</td>
                  <td className="px-6 py-4 flex items-center gap-2">
                    {getSeverityIcon(log.severity)}
                    <span className={`capitalize ${getSeverityColor(log.severity)}`}>{log.severity}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`capitalize ${log.status === 'success'
                        ? 'text-green-400'
                        : log.status === 'failure'
                          ? 'text-red-400'
                          : 'text-yellow-400'
                        }`}
                    >
                      {log.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-xs">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
};

export default AuditLogs;
