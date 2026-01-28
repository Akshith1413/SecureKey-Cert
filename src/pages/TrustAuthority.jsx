'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function TrustAuthority() {
  const { user } = useAuth();
  const [authorities, setAuthorities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    keyLength: 2048,
  });

  const isSecurityAuthority = user?.role === 'security_authority';

  useEffect(() => {
    fetchAuthorities();
  }, []);

  const fetchAuthorities = async () => {
    try {
      setLoading(true);
      const response = await api.get('/trust-authority');
      setAuthorities(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch Trust Authorities');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAuthority = async () => {
    try {
      if (!formData.name) {
        toast.error('Name is required');
        return;
      }

      setLoading(true);
      const response = await api.post('/trust-authority/create', formData);
      toast.success('Trust Authority created successfully');
      setAuthorities([...authorities, response.data.data]);
      setShowModal(false);
      setFormData({ name: '', description: '', keyLength: 2048 });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create Trust Authority');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-600 bg-clip-text text-transparent mb-2">
              Trust Authorities
            </h1>
            <p className="text-slate-400">Manage cryptographic trust infrastructure</p>
          </div>
          {isSecurityAuthority && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all"
            >
              + Create Authority
            </motion.button>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Authorities', value: authorities.length, icon: '🔐' },
            { label: 'Active Authorities', value: authorities.filter((a) => a.status === 'active').length, icon: '✓' },
            { label: 'Trust Level Average', value: `${Math.round(authorities.reduce((sum, a) => sum + a.trustLevel, 0) / (authorities.length || 1))}%`, icon: '⭐' },
            { label: 'Total Certificates Issued', value: authorities.reduce((sum, a) => sum + a.issuedCertificatesCount, 0), icon: '📜' },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -5 }}
              className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-lg p-6 backdrop-blur-sm hover:border-cyan-500/50 transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-cyan-400">{stat.value}</p>
                </div>
                <div className="text-4xl">{stat.icon}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Authorities List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 border border-slate-700/50 rounded-xl backdrop-blur-sm overflow-hidden"
        >
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin">⏳</div>
              <p className="text-slate-400 mt-2">Loading...</p>
            </div>
          ) : authorities.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-slate-400">No Trust Authorities found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700/50 bg-slate-800/50">
                    <th className="px-6 py-3 text-left text-slate-300 font-semibold">Name</th>
                    <th className="px-6 py-3 text-left text-slate-300 font-semibold">Status</th>
                    <th className="px-6 py-3 text-left text-slate-300 font-semibold">Trust Level</th>
                    <th className="px-6 py-3 text-left text-slate-300 font-semibold">Certificates Issued</th>
                    <th className="px-6 py-3 text-left text-slate-300 font-semibold">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {authorities.map((auth, idx) => (
                    <motion.tr
                      key={auth._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-white">{auth.name}</p>
                          <p className="text-slate-400 text-sm">{auth.description}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          auth.status === 'active'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {auth.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                              style={{ width: `${auth.trustLevel}%` }}
                            />
                          </div>
                          <span className="text-cyan-400 font-semibold">{auth.trustLevel}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-300">{auth.issuedCertificatesCount}</td>
                      <td className="px-6 py-4 text-slate-400 text-sm">
                        {new Date(auth.createdAt).toLocaleDateString()}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Create Modal */}
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-slate-700 rounded-xl p-8 max-w-md w-full"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Create Trust Authority</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-300 mb-2">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-cyan-500 focus:outline-none"
                    placeholder="Authority name"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-cyan-500 focus:outline-none"
                    placeholder="Description"
                    rows="3"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-2">Key Length</label>
                  <select
                    value={formData.keyLength}
                    onChange={(e) => setFormData({ ...formData, keyLength: parseInt(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-cyan-500 focus:outline-none"
                  >
                    <option value={2048}>2048 bits</option>
                    <option value={4096}>4096 bits</option>
                  </select>
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateAuthority}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/50 disabled:opacity-50 transition-all"
                  >
                    {loading ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
