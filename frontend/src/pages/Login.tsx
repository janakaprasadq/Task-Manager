import React, { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
interface LoginProps {
    onNavigateToRegister: () => void;
}
export const Login: React.FC<LoginProps> = ({ onNavigateToRegister }) => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        // Basic Validation
        if (!email.trim() || !password.trim()) {
            setError('Please fill in all fields.');
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address.');
            return;
        }
        setLoading(true);
        try {
            const response = await api.post('/api/auth/login', { email, password });
            const { user, token } = response.data;
            login(user, token);
        } catch (err: any) {
            console.error('Login error:', err);
            const errorMessage = err.response?.data?.error || 'Something went wrong. Please try again.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 p-4">
            <div className="w-full max-w-md backdrop-blur-md bg-white/10 border border-white/20 shadow-2xl rounded-2xl p-8 space-y-6 transform transition-all duration-300 hover:scale-[1.01]">

                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center p-3 bg-purple-500/20 border border-purple-500/30 rounded-xl text-purple-400 mb-2">
                        <LogIn className="h-8 w-8" />
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-white font-sans">
                        Welcome Back
                    </h2>
                    <p className="text-slate-300 text-sm">
                        Sign in to manage your tasks efficiently
                    </p>
                </div>
                {/* Error Alert */}
                {error && (
                    <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-300 p-4 rounded-xl text-sm">
                        <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
                        <p className="font-medium">{error}</p>
                    </div>
                )}
                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-200 block text-left">
                            Email Address
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-purple-400 transition-colors">
                                <Mail className="h-5 w-5" />
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                disabled={loading}
                                className="w-full pl-11 pr-4 py-3 bg-slate-950/40 border border-slate-700/60 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all text-sm disabled:opacity-50"
                                required
                            />
                        </div>
                    </div>
                    {/* Password */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-200 block text-left">
                            Password
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-purple-400 transition-colors">
                                <Lock className="h-5 w-5" />
                            </div>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                disabled={loading}
                                className="w-full pl-11 pr-12 py-3 bg-slate-950/40 border border-slate-700/60 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all text-sm disabled:opacity-50"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={loading}
                                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white transition-colors focus:outline-none disabled:opacity-50"
                            >
                                {showPassword ? (
                                    <EyeOff className="h-5 w-5" />
                                ) : (
                                    <Eye className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                    </div>
                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium rounded-xl shadow-lg hover:shadow-purple-500/20 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all duration-150 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 text-sm mt-2 cursor-pointer"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Signing in...</span>
                            </>
                        ) : (
                            <>
                                <span>Sign In</span>
                                <LogIn className="h-4 w-4" />
                            </>
                        )}
                    </button>
                </form>
                {/* Footer */}
                <div className="pt-2 text-center text-sm">
                    <p className="text-slate-400">
                        Don't have an account?{' '}
                        <button
                            onClick={onNavigateToRegister}
                            disabled={loading}
                            className="text-purple-400 hover:text-purple-300 font-semibold focus:outline-none hover:underline disabled:opacity-50 transition-colors cursor-pointer"
                        >
                            Sign up
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};