'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function CryptoPolicies() {
  const { user } = useAuth();
  const [policies, setPolicies] = useState([]);
  const [authorities, setAuthorities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    policyName: '',
    trustAuthorityId: '',
    encryptionAlgorithm: 'aes-256-gcm',
    hashAlgorithm: 'sha256',
    signingAlgorithm: 'RSA-2048',
    description: '',
  });

  const isSecurityAuthority = user?.role === 'security_authority';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [policiesRes, authRes] = await Promise.all([
        api.get('/crypto-policies'),
        api.get('/trust-authority'),
      ]);
      setPolicies(policiesRes.data.data);
      setAuthorities(authRes.data.data);
    } catch (error) {
      toast.error('Failed to fetch data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePolicy = async () => {
    try {
      if (!formData.policyName || !formData.trustAuthorityId) {
        toast.error('Policy name and Trust Authority are required');
        return;
      }

      setLoading(true);
      const response = await api.post('/crypto-policies/create', formData);
      toast.success('Crypto Policy created successfully');
      setPolicies([...policies, response.data.data]);
      setShowModal(false);
      setFormData({
        policyName: '',
        trustAuthorityId: '',
        encryptionAlgorithm: 'aes-256-gcm',
        hashAlgorithm: 'sha256',
        signingAlgorithm: 'RSA-2048',
        description: '',
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create policy');
    } finally {
      setLoading(false);
    }
  };

  const policyFeatures = [
    { name: 'Key Length', icon: '🔑', description: 'RSA key length requirements' },
    { name: 'Certificate Validity', icon: '📅', description: 'Validity period control' },
    { name: 'Encryption', icon: '🔐', description: 'AES-256-GCM encryption' },
    { name: 'Hashing', icon: '#️⃣', description: 'SHA-256 hashing' },
    { name: 'Access Control', icon: '👤', description: 'RBAC enforcement' },
    { name: 'Key Rotation', icon: '🔄', description: 'Automatic rotation' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8 rounded-2xl m-2">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-8 pt-2">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 bg-clip-text text-transparent mb-2 leading-normal pb-1">
              Cryptographic Policies
            </h1>
            <p className="text-slate-400">Define and manage enterprise crypto standards</p>
          </div>
          {isSecurityAuthority && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all"
            >
              + New Policy
            </motion.button>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {policyFeatures.map((feature, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-lg p-6 backdrop-blur-sm hover:border-purple-500/50 transition-all"
            >
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="font-semibold text-white mb-1">{feature.name}</h3>
              <p className="text-slate-400 text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Policies List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 border border-slate-700/50 rounded-xl backdrop-blur-sm"
        >
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin">⏳</div>
              <p className="text-slate-400 mt-2">Loading policies...</p>
            </div>
          ) : policies.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-slate-400 text-lg">No policies found. Create one to get started.</p>
            </div>
          ) : (
            <div className="grid gap-4 p-6">
              {policies.map((policy, idx) => (
                <motion.div
                  key={policy._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6 hover:border-purple-500/50 transition-all group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">
                        {policy.policyName}
                      </h3>
                      <p className="text-slate-400 text-sm mt-1">{policy.description}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${policy.status === 'active'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-gray-500/20 text-gray-400'
                      }`}>
                      {policy.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-900/50 rounded p-3">
                      <p className="text-slate-400 text-xs mb-1">Encryption</p>
                      <p className="text-cyan-400 font-semibold text-sm">{policy.encryptionAlgorithm}</p>
                    </div>
                    <div className="bg-slate-900/50 rounded p-3">
                      <p className="text-slate-400 text-xs mb-1">Hash Algorithm</p>
                      <p className="text-cyan-400 font-semibold text-sm">{policy.hashAlgorithm}</p>
                    </div>
                    <div className="bg-slate-900/50 rounded p-3">
                      <p className="text-slate-400 text-xs mb-1">Signing</p>
                      <p className="text-cyan-400 font-semibold text-sm">{policy.signingAlgorithm}</p>
                    </div>
                    <div className="bg-slate-900/50 rounded p-3">
                      <p className="text-slate-400 text-xs mb-1">Version</p>
                      <p className="text-cyan-400 font-semibold text-sm">v{policy.policyVersion}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
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
              className="bg-slate-900 border border-slate-700 rounded-xl p-8 max-w-lg w-full max-h-96 overflow-y-auto"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Create Crypto Policy</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-300 mb-2">Policy Name</label>
                  <input
                    type="text"
                    value={formData.policyName}
                    onChange={(e) => setFormData({ ...formData, policyName: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
                    placeholder="Policy name"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-2">Trust Authority</label>
                  <select
                    value={formData.trustAuthorityId}
                    onChange={(e) => setFormData({ ...formData, trustAuthorityId: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="">Select Authority...</option>
                    {authorities.map((auth) => (
                      <option key={auth._id} value={auth._id}>
                        {auth.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 mb-2 text-sm">Encryption</label>
                    <select
                      value={formData.encryptionAlgorithm}
                      onChange={(e) => setFormData({ ...formData, encryptionAlgorithm: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500 focus:outline-none"
                    >
                      <option value="aes-256-gcm">AES-256-GCM</option>
                      <option value="aes-256-cbc">AES-256-CBC</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-2 text-sm">Hashing</label>
                    <select
                      value={formData.hashAlgorithm}
                      onChange={(e) => setFormData({ ...formData, hashAlgorithm: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500 focus:outline-none"
                    >
                      <option value="sha256">SHA-256</option>
                      <option value="sha384">SHA-384</option>
                      <option value="sha512">SHA-512</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-slate-300 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:outline-none text-sm"
                    placeholder="Policy description"
                    rows="2"
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreatePolicy}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 transition-all"
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
