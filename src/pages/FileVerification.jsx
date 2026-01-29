'use client';

import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function FileVerification() {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [certificateId, setCertificateId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      toast.success(`File selected: ${selectedFile.name}`);
    }
  };

  const handleVerify = async () => {
    try {
      if (!file || !certificateId) {
        toast.error('Please select a file and certificate');
        return;
      }

      setLoading(true);
      const fileData = await file.text();

      const response = await api.post('/verification/verify-integrity', {
        certificateId,
        fileData,
        providedSignature: '',
      });

      setResult(response.data.data);
      toast.success(response.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Verification failed');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 p-8 rounded-2xl m-2">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8 pt-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-green-600 bg-clip-text text-transparent mb-2 leading-normal pb-1">
            File Integrity Verification
          </h1>
          <p className="text-slate-400">Detect tampering and verify digital signatures</p>
        </div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 border border-slate-700/50 rounded-xl backdrop-blur-sm p-8 mb-8"
        >
          {/* File Upload */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Upload File to Verify</h2>
            <motion.div
              whileHover={{ borderColor: '#10b981' }}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-600 rounded-lg p-12 text-center cursor-pointer hover:bg-slate-800/50 transition-all"
            >
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="text-4xl mb-3">📄</div>
              {file ? (
                <div>
                  <p className="text-green-400 font-semibold">{file.name}</p>
                  <p className="text-slate-400 text-sm mt-1">{(file.size / 1024).toFixed(2)} KB</p>
                </div>
              ) : (
                <div>
                  <p className="text-white font-semibold mb-1">Drop file here or click to select</p>
                  <p className="text-slate-400 text-sm">Supports any file type</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Certificate Selection */}
          <div className="mb-8">
            <label className="block text-slate-300 font-semibold mb-3">Select Certificate</label>
            <input
              type="text"
              value={certificateId}
              onChange={(e) => setCertificateId(e.target.value)}
              placeholder="Enter certificate ID"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-green-500 focus:outline-none"
            />
            <p className="text-slate-400 text-sm mt-2">Enter the certificate ID used to sign this file</p>
          </div>

          {/* Verify Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleVerify}
            disabled={loading || !file || !certificateId}
            className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-lg"
          >
            {loading ? 'Verifying...' : 'Verify Integrity'}
          </motion.button>
        </motion.div>

        {/* Results */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-gradient-to-br ${result.tampered
              ? 'from-red-900/20 to-red-800/20 border border-red-700/50'
              : 'from-green-900/20 to-green-800/20 border border-green-700/50'
              } rounded-xl backdrop-blur-sm p-8`}
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="text-5xl">
                {result.tampered ? '⚠️' : '✅'}
              </div>
              <div className="flex-1">
                <h3 className={`text-2xl font-bold ${result.tampered ? 'text-red-400' : 'text-green-400'}`}>
                  {result.tampered ? 'File Integrity Compromised' : 'File Integrity Verified'}
                </h3>
                <p className="text-slate-400 mt-1">
                  {result.tampered
                    ? 'Potential tampering detected. Do not use this file.'
                    : 'File signature is valid and has not been modified.'}
                </p>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-800/50 rounded-lg p-4">
                <p className="text-slate-400 text-sm mb-1">Signature Valid</p>
                <p className={`text-lg font-semibold ${result.signatureValid ? 'text-green-400' : 'text-red-400'}`}>
                  {result.signatureValid ? 'Valid' : 'Invalid'}
                </p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <p className="text-slate-400 text-sm mb-1">Certificate Status</p>
                <p className="text-lg font-semibold text-cyan-400">{result.certificateStatus}</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <p className="text-slate-400 text-sm mb-1">Certificate Expired</p>
                <p className={`text-lg font-semibold ${result.certificateExpired ? 'text-red-400' : 'text-green-400'}`}>
                  {result.certificateExpired ? 'Yes' : 'No'}
                </p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <p className="text-slate-400 text-sm mb-1">MITM Risk Level</p>
                <p className={`text-lg font-semibold ${result.mitmRiskLevel === 'low' ? 'text-green-400' : 'text-red-400'
                  }`}>
                  {result.mitmRiskLevel.toUpperCase()}
                </p>
              </div>
            </div>

            {/* Risk Indicators */}
            {result.details?.reasons && result.details.reasons.length > 0 && (
              <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4 mb-6">
                <h4 className="text-red-400 font-semibold mb-2">Issues Detected:</h4>
                <ul className="space-y-1">
                  {result.details.reasons.map((reason, idx) => (
                    <li key={idx} className="text-red-300 text-sm flex items-center gap-2">
                      <span>•</span> {reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Verification ID */}
            <div className="bg-slate-800/50 rounded-lg p-4">
              <p className="text-slate-400 text-sm mb-1">Verification ID</p>
              <p className="text-cyan-400 font-mono text-xs break-all">{result.verificationId}</p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
