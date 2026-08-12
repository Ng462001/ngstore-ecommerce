import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';

const VerifyEmail = () => {
    const { token } = useParams();
    const [status, setStatus] = useState('verifying');
    const [message, setMessage] = useState('');
    const calledRef = useRef(false); // Declare useRef at the top level of the component

    useEffect(() => {
        if (calledRef.current) return; // Only run once
        calledRef.current = true;

        const verify = async () => {
            if (!token) {
                setStatus('error');
                setMessage('Invalid verification token');
                toast.error('Invalid verification token');
                return;
            }

            try {
                const { data } = await axios.put(`${import.meta.env.VITE_API_URL}/api/users/verifyemail/${token}`);
                setStatus('success');
                setMessage(data.message);
                toast.success(data.message);
            } catch (error) {
                setStatus('error');
                const errorMsg = error.response?.data?.message || 'Email verification failed';
                setMessage(errorMsg);
                toast.error(errorMsg);
            }
        };

        verify();
    }, [token]); // Add token to dependencies

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: "easeOut"
            }
        },
        exit: {
            opacity: 0,
            y: -20,
            transition: {
                duration: 0.4
            }
        }
    };

    const iconVariants = {
        hidden: { scale: 0, rotate: -180 },
        visible: {
            scale: 1,
            rotate: 0,
            transition: {
                type: "spring",
                stiffness: 200,
                damping: 15
            }
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="bg-surface rounded-2xl shadow-card p-8 border border-border-light">
                    {/* Logo/Brand */}
                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-center mb-8"
                    >
                        <h1 className="font-heading text-3xl font-semibold text-text-primary">
                            Email Verification
                        </h1>
                        <div className="w-16 h-0.5 bg-accent mx-auto mt-3 rounded-full"></div>
                    </motion.div>

                    <AnimatePresence mode="wait">
                        {status === 'verifying' && (
                            <motion.div
                                key="verifying"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="text-center"
                            >
                                <div className="relative mb-6">
                                    <div className="w-20 h-20 mx-auto relative">
                                        <div className="absolute inset-0 rounded-full border-4 border-border-light"></div>
                                        <motion.div
                                            className="absolute inset-0 rounded-full border-4 border-t-accent border-r-transparent border-b-transparent border-l-transparent"
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                        ></motion.div>
                                    </div>
                                </div>
                                <h2 className="font-heading text-xl font-semibold mb-2 text-text-primary">
                                    Verifying Your Email
                                </h2>
                                <p className="text-text-secondary text-sm">
                                    Please wait while we verify your email address...
                                </p>
                            </motion.div>
                        )}

                        {status === 'success' && (
                            <motion.div
                                key="success"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="text-center"
                            >
                                <motion.div
                                    variants={iconVariants}
                                    className="mb-6"
                                >
                                    <div className="w-24 h-24 mx-auto bg-success/10 rounded-full flex items-center justify-center border border-success/30">
                                        <svg className="w-12 h-12 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <motion.path
                                                initial={{ pathLength: 0 }}
                                                animate={{ pathLength: 1 }}
                                                transition={{ duration: 0.5, delay: 0.3 }}
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={3}
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                    </div>
                                </motion.div>

                                <motion.h2
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="font-heading text-2xl font-semibold mb-3 text-text-primary"
                                >
                                    Email Verified Successfully!
                                </motion.h2>

                                <motion.p
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="text-text-secondary text-sm mb-8"
                                >
                                    {message || "Your email has been verified. You can now access all features of your account."}
                                </motion.p>

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 }}
                                >
                                    <Link
                                        to="/login"
                                        className="inline-flex items-center px-8 py-3.5 bg-accent hover:bg-accent-hover text-white font-semibold rounded-xl transition-all duration-300 shadow-soft"
                                    >
                                        <span>Continue to Login</span>
                                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </Link>
                                </motion.div>
                            </motion.div>
                        )}

                        {status === 'error' && (
                            <motion.div
                                key="error"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="text-center"
                            >
                                <motion.div
                                    variants={iconVariants}
                                    className="mb-6"
                                >
                                    <div className="w-24 h-24 mx-auto bg-error/10 rounded-full flex items-center justify-center border border-error/30">
                                        <svg className="w-12 h-12 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <motion.path
                                                initial={{ pathLength: 0 }}
                                                animate={{ pathLength: 1 }}
                                                transition={{ duration: 0.5, delay: 0.3 }}
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={3}
                                                d="M6 18L18 6M6 6l12 12"
                                            />
                                        </svg>
                                    </div>
                                </motion.div>

                                <motion.h2
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="font-heading text-2xl font-semibold mb-3 text-text-primary"
                                >
                                    Verification Failed
                                </motion.h2>

                                <motion.p
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="text-text-secondary text-sm mb-8"
                                >
                                    {message || "We couldn't verify your email. The link may be expired or invalid."}
                                </motion.p>

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 }}
                                    className="space-y-4"
                                >
                                    <Link
                                        to="/signup"
                                        className="inline-flex items-center px-8 py-3.5 bg-surface-muted text-text-primary font-semibold rounded-xl hover:bg-border-light transition-all duration-300 border border-border-light"
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                        </svg>
                                        Back to Signup
                                    </Link>

                                    <p className="text-xs text-text-secondary">
                                        Need help? <button
                                            onClick={() => window.location.href = 'mailto:ngtech2026@gmail.com'}
                                            className="text-accent hover:underline focus:outline-none font-medium"
                                        >
                                            Contact Support
                                        </button>
                                    </p>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};


export default VerifyEmail;