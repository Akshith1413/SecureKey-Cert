'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Download, Trash2, Eye, RefreshCw, AlertCircle, CheckCircle, Lock, Unlock, Ligature as Signature } from 'lucide-react';
import api from '../services/api.js';
import toast from 'react-hot-toast';

const Certificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [viewCert, setViewCert] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    certificateData: '',
    issuer: '',
    subject: '',
    serialNumber: '',
    validFrom: '',
    validUntil: '',
    algorithm: 'RSA-2048',
  });

  useEffect(() => {
    fetchCertificates();
  }, [statusFilter]);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const response = await api.get('/certificates', {
        params: statusFilter !== 'all' ? { status: statusFilter } : {},
      });
      setCertificates(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch certificates');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCert = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.certificateData) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      const response = await api.post('/certificates', formData);
      setCertificates([response.data.data, ...certificates]);
      toast.success('Certificate created successfully');
      setShowModal(false);
      setFormData({
        name: '',
        description: '',
        certificateData: '',
        issuer: '',
        subject: '',
        serialNumber: '',
        validFrom: '',
        validUntil: '',
        algorithm: 'RSA-2048',
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create certificate');
    }
  };

  const handleDeleteCert = async (id) => {
    if (!window.confirm('Are you sure you want to delete this certificate?')) return;

    try {
      await api.delete(`/certificates/${id}`);
      setCertificates(certificates.filter((c) => c._id !== id));
      toast.success('Certificate deleted successfully');
    } catch (error) {
      toast.error('Failed to delete certificate');
    }
  };

  const handleRevokeCert = async (id) => {
    if (!window.confirm('Are you sure you want to revoke this certificate?')) return;

    try {
      const response = await api.post(`/certificates/${id}/revoke`);
      setCertificates(certificates.map((c) => (c._id === id ? response.data.data : c)));
      toast.success('Certificate revoked successfully');
    } catch (error) {
      toast.error('Failed to revoke certificate');
    }
  };

  const handleDownloadCert = (cert) => {
    try {
      const dataStr = JSON.stringify(cert, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${cert.name}-${cert._id}.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Certificate downloaded');
    } catch (error) {
      toast.error('Failed to download certificate');
    }
  };

  const handleSignCert = async (id) => {
    try {
      const response = await api.post(`/certificates/${id}/sign`);
      setCertificates(certificates.map((c) => (c._id === id ? response.data.data : c)));
      toast.success('Certificate signed successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to sign certificate');
    }
  };

  const filteredCerts = certificates.filter((cert) =>
    cert.name.toLowerCase().includes(search.toLowerCase()) ||
    cert.issuer?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'valid':
        return 'text-green-400';
      case 'expired':
        return 'text-red-400';
      case 'revoked':
        return 'text-orange-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    return status === 'valid' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />;
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
          <h1 className="text-3xl font-bold mb-2">Certificates</h1>
          <p className="text-gray-400">Manage and monitor your certificates</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Certificate
        </motion.button>
      </motion.div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-64 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search certificates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field w-48"
        >
          <option value="all">All Status</option>
          <option value="valid">Valid</option>
          <option value="expired">Expired</option>
          <option value="revoked">Revoked</option>
        </select>
        <button
          onClick={fetchCertificates}
          className="btn-secondary px-4 flex items-center gap-2"
        >
          <RefreshCw className="w-5 h-5" />
          Refresh
        </button>
      </div>

      {/* Certificates Table */}
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
              <th className="px-6 py-4 text-left font-semibold text-gray-300">Issuer</th>
              <th className="px-6 py-4 text-left font-semibold text-gray-300">Status</th>
              <th className="px-6 py-4 text-left font-semibold text-gray-300">Valid Until</th>
              <th className="px-6 py-4 text-left font-semibold text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center">
                  <div className="flex justify-center">
                    <div className="loading-spinner" />
                  </div>
                </td>
              </tr>
            ) : filteredCerts.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-400">
                  No certificates found
                </td>
              </tr>
            ) : (
              filteredCerts.map((cert, idx) => (
                <motion.tr
                  key={cert._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="border-b border-gray-700/50 hover:bg-gray-800/30 transition-colors"
                >
                  <td className="px-6 py-4 font-medium">{cert.name}</td>
                  <td className="px-6 py-4 text-gray-400">{cert.issuer || 'N/A'}</td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-2 ${getStatusColor(cert.status)}`}>
                      {getStatusIcon(cert.status)}
                      <span className="capitalize">{cert.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400">
                    {cert.validUntil ? new Date(cert.validUntil).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 flex gap-2 flex-wrap">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setViewCert(cert)}
                      className="p-2 hover:bg-blue-900/30 rounded-lg transition-colors text-blue-400"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDownloadCert(cert)}
                      className="p-2 hover:bg-cyan-900/30 rounded-lg transition-colors text-cyan-400"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </motion.button>
                    {cert.status === 'valid' && !cert.digitalSignature && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSignCert(cert._id)}
                        className="p-2 hover:bg-green-900/30 rounded-lg transition-colors text-green-400"
                        title="Sign"
                      >
                        <Lock className="w-4 h-4" />
                      </motion.button>
                    )}
                    {cert.status === 'valid' && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleRevokeCert(cert._id)}
                        className="p-2 hover:bg-orange-900/30 rounded-lg transition-colors text-orange-400"
                        title="Revoke"
                      >
                        <AlertCircle className="w-4 h-4" />
                      </motion.button>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDeleteCert(cert._id)}
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

      {/* Add Certificate Modal */}
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
            className="card w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-2xl font-bold mb-6">Add New Certificate</h2>

            <form onSubmit={handleCreateCert} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Certificate Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  required
                />
                <select
                  value={formData.algorithm}
                  onChange={(e) => setFormData({ ...formData, algorithm: e.target.value })}
                  className="input-field"
                >
                  <option value="RSA-2048">RSA-2048</option>
                  <option value="RSA-4096">RSA-4096</option>
                  <option value="EC-256">EC-256</option>
                </select>
              </div>

              <textarea
                placeholder="Certificate Data"
                value={formData.certificateData}
                onChange={(e) => setFormData({ ...formData, certificateData: e.target.value })}
                className="input-field min-h-32 font-mono text-xs"
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Issuer"
                  value={formData.issuer}
                  onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                  className="input-field"
                />
                <input
                  type="text"
                  placeholder="Subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
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
                  Create Certificate
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

      {/* View Certificate Modal */}
      {viewCert && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setViewCert(null)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="card w-full max-w-3xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Certificate Details</h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewCert(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </motion.button>
            </div>

            <div className="space-y-4">
              {/* Status Banner */}
              <div className={`p-4 rounded-lg ${viewCert.status === 'valid' ? 'bg-green-900/30 border border-green-700' :
                  viewCert.status === 'revoked' ? 'bg-red-900/30 border border-red-700' :
                    'bg-yellow-900/30 border border-yellow-700'
                }`}>
                <div className="flex items-center gap-3">
                  {viewCert.status === 'valid' ? <CheckCircle className="w-6 h-6 text-green-400" /> : <AlertCircle className="w-6 h-6 text-red-400" />}
                  <div>
                    <p className={`font-semibold text-lg ${viewCert.status === 'valid' ? 'text-green-400' : 'text-red-400'
                      }`}>
                      {viewCert.status === 'valid' ? 'Valid Certificate' : viewCert.status.toUpperCase()}
                    </p>
                    <p className="text-sm text-gray-400">
                      {viewCert.digitalSignature ? '✓ Digitally Signed' : '○ Not Signed'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Name</p>
                  <p className="text-white font-semibold">{viewCert.name}</p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Algorithm</p>
                  <p className="text-white font-semibold">{viewCert.algorithm}</p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Issuer</p>
                  <p className="text-white font-semibold">{viewCert.issuer || 'N/A'}</p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Subject</p>
                  <p className="text-white font-semibold">{viewCert.subject || 'N/A'}</p>
                </div>
              </div>

              {/* IDs */}
              <div className="bg-gray-800/50 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-2">Certificate ID (MongoDB)</p>
                <p className="text-cyan-400 font-mono text-sm break-all">{viewCert._id}</p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-2">Certificate UUID</p>
                <p className="text-cyan-400 font-mono text-sm break-all">{viewCert.certificateId}</p>
              </div>

              {/* Certificate Data */}
              <div className="bg-gray-800/50 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-2">Certificate Data (Content Hash Source)</p>
                <div className="bg-gray-900 rounded p-3 max-h-32 overflow-y-auto">
                  <p className="text-green-400 font-mono text-xs whitespace-pre-wrap break-all">
                    {viewCert.certificateData || 'No data'}
                  </p>
                </div>
              </div>

              {/* Hash */}
              <div className="bg-gray-800/50 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-2">Certificate Hash (SHA-256)</p>
                <p className="text-yellow-400 font-mono text-xs break-all">{viewCert.certificateHash}</p>
              </div>

              {/* Validity */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Valid From</p>
                  <p className="text-white font-semibold">
                    {viewCert.validFrom ? new Date(viewCert.validFrom).toLocaleString() : 'N/A'}
                  </p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Valid Until</p>
                  <p className="text-white font-semibold">
                    {viewCert.validUntil ? new Date(viewCert.validUntil).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Digital Signature */}
              {viewCert.digitalSignature && (
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-2">Digital Signature</p>
                  <p className="text-purple-400 font-mono text-xs break-all">{viewCert.digitalSignature}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleDownloadCert(viewCert)}
                  className="btn-secondary flex-1 flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download JSON
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    navigator.clipboard.writeText(viewCert._id);
                    toast.success('Certificate ID copied!');
                  }}
                  className="btn-primary flex-1"
                >
                  Copy ID for Verification
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Certificates;
