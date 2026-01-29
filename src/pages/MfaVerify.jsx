'use client';

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';

const MfaVerify = () => {
    const navigate = useNavigate();
    const { verifyMFA, mfaRequired } = useAuth();
    const [token, setToken] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // If someone lands here directly without triggering MFA flow, redirect
    useEffect(() => {
        if (!mfaRequired) {
            navigate('/login');
        }
    }, [mfaRequired, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!token || token.length < 6) {
            setError('Please enter a valid 6-digit code');
            return;
        }

        setLoading(true);
        setError('');

        const result = await verifyMFA(token);

        if (result.success) {
            toast.success('Verification successful!');
            navigate('/dashboard');
        } else {
            setError(result.message);
            toast.error(result.message);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <div className="card text-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring' }}
                        className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                        <Shield className="w-10 h-10 text-blue-400" />
                    </motion.div>

                    <h2 className="text-2xl font-bold mb-2">Two-Factor Authentication</h2>
                    <p className="text-gray-400 mb-8">
                        Enter the 6-digit code sent to your email or authenticator app.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={token}
                                onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="000000"
                                className="input-field !pl-12 text-center text-2xl tracking-[0.5em] font-mono"
                                maxLength={6}
                                autoFocus
                            />
                        </div>
                        {error && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-red-400 text-sm flex items-center justify-center gap-1"
                            >
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </motion.p>
                        )}

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={loading || token.length !== 6}
                            type="submit"
                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="loading-spinner" style={{ width: '20px', height: '20px' }} />
                                    Verifying...
                                </span>
                            ) : (
                                'Verify Identity'
                            )}
                        </motion.button>
                    </form>

                    <div className="mt-6 text-sm text-gray-500">
                        <p>Don't have access to your code?</p>
                        <button className="text-blue-400 hover:text-blue-300 transition-colors mt-1">
                            Use a recovery code
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default MfaVerify;
