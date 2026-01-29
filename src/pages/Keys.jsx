'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, RefreshCw, Trash2, Eye, RotateCcw, AlertCircle, CheckCircle, Copy, Download, Lock } from 'lucide-react';
import api from '../services/api.js';
import toast from 'react-hot-toast';

const Keys = () => {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [showModal, setShowModal] = useState(false);
  const [viewKey, setViewKey] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    keyType: 'RSA',
    keyLength: 2048,
  });

  useEffect(() => {
    fetchKeys();
  }, [statusFilter]);

  const fetchKeys = async () => {
    try {
      setLoading(true);
      const response = await api.get('/keys', {
        params: { status: statusFilter },
      });
      setKeys(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch keys');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateKey = async (e) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error('Please provide a key name');
      return;
    }

    try {
      const response = await api.post('/keys/generate', formData);
      setKeys([response.data.data, ...keys]);
      toast.success('Key generated successfully');
      setShowModal(false);
      setFormData({
        name: '',
        description: '',
        keyType: 'RSA',
        keyLength: 2048,
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate key');
    }
  };

  const handleRotateKey = async (id) => {
    if (!window.confirm('Are you sure you want to rotate this key?')) return;

    try {
      const response = await api.post(`/keys/${id}/rotate`);
      toast.success('Key rotated successfully');
      fetchKeys();
    } catch (error) {
      toast.error('Failed to rotate key');
    }
  };

  const handleRevokeKey = async (id) => {
    if (!window.confirm('Are you sure you want to revoke this key?')) return;

    try {
      await api.post(`/keys/${id}/revoke`);
      setKeys(keys.map((k) => (k._id === id ? { ...k, status: 'revoked' } : k)));
      toast.success('Key revoked successfully');
    } catch (error) {
      toast.error('Failed to revoke key');
    }
  };

  const handleDeleteKey = async (id) => {
    if (!window.confirm('Are you sure you want to delete this key?')) return;

    try {
      await api.delete(`/keys/${id}`);
      setKeys(keys.filter((k) => k._id !== id));
      toast.success('Key deleted successfully');
    } catch (error) {
      toast.error('Failed to delete key');
    }
  };

  const handleDownloadKey = (key) => {
    try {
      const dataStr = JSON.stringify({ ...key, warning: 'PUBLIC KEY ONLY - Private Key Not Included' }, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${key.name}-${key._id}-public.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Key downloaded');
    } catch (error) {
      toast.error('Failed to download key');
    }
  };

  const filteredKeys = keys.filter((key) =>
    key.name.toLowerCase().includes(search.toLowerCase()) ||
    key.keyType.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-green-400';
      case 'rotated':
        return 'text-blue-400';
      case 'revoked':
        return 'text-red-400';
      default:
        return 'text-gray-400';
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
          <h1 className="text-3xl font-bold mb-2">Cryptographic Keys</h1>
          <p className="text-gray-400">Generate and manage your encryption keys</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Generate Key
        </motion.button>
      </motion.div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-64">
          <input
            type="text"
            placeholder="Search keys..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field w-48"
        >
          <option value="active">Active</option>
          <option value="rotated">Rotated</option>
          <option value="revoked">Revoked</option>
          <option value="archived">Archived</option>
        </select>
        <button
          onClick={fetchKeys}
          className="btn-secondary px-4 flex items-center gap-2"
        >
          <RefreshCw className="w-5 h-5" />
          Refresh
        </button>
      </div>

      {/* Keys Table */}
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
              <th className="px-6 py-4 text-left font-semibold text-gray-300">Type</th>
              <th className="px-6 py-4 text-left font-semibold text-gray-300">Length</th>
              <th className="px-6 py-4 text-left font-semibold text-gray-300">Status</th>
              <th className="px-6 py-4 text-left font-semibold text-gray-300">Created</th>
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
            ) : filteredKeys.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-400">
                  No keys found
                </td>
              </tr>
            ) : (
              filteredKeys.map((key, idx) => (
                <motion.tr
                  key={key._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="border-b border-gray-700/50 hover:bg-gray-800/30 transition-colors"
                >
                  <td className="px-6 py-4 font-medium">{key.name}</td>
                  <td className="px-6 py-4 text-gray-400">{key.keyType}</td>
                  <td className="px-6 py-4 text-gray-400">{key.keyLength} bits</td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-2 ${getStatusColor(key.status)}`}>
                      {key.status === 'active' ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <AlertCircle className="w-4 h-4" />
                      )}
                      <span className="capitalize">{key.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400">
                    {new Date(key.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 flex gap-2 flex-wrap">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setViewKey(key)}
                      className="p-2 hover:bg-blue-900/30 rounded-lg transition-colors text-blue-400"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDownloadKey(key)}
                      className="p-2 hover:bg-green-900/30 rounded-lg transition-colors text-green-400"
                      title="Download Public Key"
                    >
                      <Download className="w-4 h-4" />
                    </motion.button>
                    {key.status === 'active' && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleRotateKey(key._id)}
                        className="p-2 hover:bg-cyan-900/30 rounded-lg transition-colors text-cyan-400"
                        title="Rotate"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </motion.button>
                    )}
                    {key.status !== 'revoked' && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleRevokeKey(key._id)}
                        className="p-2 hover:bg-orange-900/30 rounded-lg transition-colors text-orange-400"
                        title="Revoke"
                      >
                        <AlertCircle className="w-4 h-4" />
                      </motion.button>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDeleteKey(key._id)}
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

      {/* Generate Key Modal */}
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="card w-full max-w-md"
          >
            <h2 className="text-2xl font-bold mb-6">Generate New Key</h2>

            <form onSubmit={handleGenerateKey} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Key Name</label>
                <input
                  type="text"
                  placeholder="Enter key name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Key Type</label>
                <select
                  value={formData.keyType}
                  onChange={(e) => {
                    const newType = e.target.value;
                    let newLength = 2048;
                    if (newType === 'AES') newLength = 256;
                    if (newType === 'ECDSA') newLength = 256;
                    if (newType === 'RSA') newLength = 2048;
                    setFormData({ ...formData, keyType: newType, keyLength: newLength });
                  }}
                  className="input-field"
                >
                  <option value="RSA">RSA (Asymmetric - for encryption & signing)</option>
                  <option value="AES">AES (Symmetric - for encryption only)</option>
                  <option value="ECDSA">ECDSA (Asymmetric - for signing only)</option>
                </select>
                <p className="text-gray-500 text-xs mt-1">
                  {formData.keyType === 'RSA' && 'RSA is used for encrypting data and digital signatures. Has both public & private keys.'}
                  {formData.keyType === 'AES' && 'AES is a symmetric key (same key for encrypt/decrypt). NO public key - only a secret key.'}
                  {formData.keyType === 'ECDSA' && 'ECDSA is used for digital signatures only. Has both public & private keys.'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Key Length</label>
                <select
                  value={formData.keyLength}
                  onChange={(e) => setFormData({ ...formData, keyLength: parseInt(e.target.value) })}
                  className="input-field"
                >
                  {formData.keyType === 'RSA' && (
                    <>
                      <option value={2048}>2048 bits (Recommended)</option>
                      <option value={4096}>4096 bits (More Secure)</option>
                    </>
                  )}
                  {formData.keyType === 'AES' && (
                    <>
                      <option value={128}>128 bits</option>
                      <option value={256}>256 bits (Recommended)</option>
                    </>
                  )}
                  {formData.keyType === 'ECDSA' && (
                    <>
                      <option value={256}>256 bits (P-256 curve)</option>
                      <option value={384}>384 bits (P-384 curve)</option>
                      <option value={521}>521 bits (P-521 curve)</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description (Optional)</label>
                <textarea
                  placeholder="Enter key description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field min-h-24"
                />
              </div>

              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="btn-primary flex-1"
                >
                  Generate Key
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* View Key Modal */}
      {viewKey && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setViewKey(null)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="card w-full max-w-3xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Key Details</h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewKey(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </motion.button>
            </div>

            <div className="space-y-4">
              {/* Status Banner */}
              <div className={`p-4 rounded-lg ${viewKey.status === 'active' ? 'bg-green-900/30 border border-green-700' :
                viewKey.status === 'revoked' ? 'bg-red-900/30 border border-red-700' :
                  viewKey.status === 'rotated' ? 'bg-blue-900/30 border border-blue-700' :
                    'bg-yellow-900/30 border border-yellow-700'
                }`}>
                <div className="flex items-center gap-3">
                  {viewKey.status === 'active' ? (
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-red-400" />
                  )}
                  <div>
                    <p className={`font-semibold text-lg capitalize ${viewKey.status === 'active' ? 'text-green-400' :
                      viewKey.status === 'revoked' ? 'text-red-400' :
                        'text-blue-400'
                      }`}>
                      {viewKey.status} Key
                    </p>
                    <p className="text-sm text-gray-400">
                      {viewKey.keyType} - {viewKey.keyLength} bits
                    </p>
                  </div>
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Name</p>
                  <p className="text-white font-semibold">{viewKey.name}</p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Key Type</p>
                  <p className="text-white font-semibold">{viewKey.keyType}</p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Key Length</p>
                  <p className="text-white font-semibold">{viewKey.keyLength} bits</p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Status</p>
                  <p className={`font-semibold capitalize ${getStatusColor(viewKey.status)}`}>
                    {viewKey.status}
                  </p>
                </div>
              </div>

              {/* Key ID */}
              <div className="bg-gray-800/50 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-2">Key ID</p>
                <p className="text-cyan-400 font-mono text-sm break-all">{viewKey._id}</p>
              </div>

              {/* Description */}
              {viewKey.description && (
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-2">Description</p>
                  <p className="text-white">{viewKey.description}</p>
                </div>
              )}

              {/* Public Key */}
              <div className="bg-gray-800/50 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-2">Public Key</p>
                {viewKey.keyType === 'AES' ? (
                  <div className="bg-yellow-900/20 border border-yellow-700 rounded p-3">
                    <p className="text-yellow-400 text-sm">
                      <strong>N/A</strong> - AES is a symmetric encryption algorithm.
                      It uses the same secret key for both encryption and decryption,
                      so there is no separate public/private key pair.
                    </p>
                  </div>
                ) : viewKey.publicKey ? (
                  <div className="bg-gray-900 rounded p-3 max-h-40 overflow-y-auto">
                    <p className="text-green-400 font-mono text-xs whitespace-pre-wrap break-all">
                      {viewKey.publicKey}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500">No public key available</p>
                )}
              </div>

              {/* Timestamps */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Created At</p>
                  <p className="text-white font-semibold">
                    {viewKey.createdAt ? new Date(viewKey.createdAt).toLocaleString() : 'N/A'}
                  </p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Valid Until</p>
                  <p className="text-white font-semibold">
                    {viewKey.validUntil ? new Date(viewKey.validUntil).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleDownloadKey(viewKey)}
                  className="btn-secondary flex-1 flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download Public Key
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    navigator.clipboard.writeText(viewKey._id);
                    toast.success('Key ID copied!');
                  }}
                  className="btn-primary flex-1"
                >
                  Copy Key ID
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Keys;
