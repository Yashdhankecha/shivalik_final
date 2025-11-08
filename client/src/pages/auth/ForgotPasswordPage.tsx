import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { showMessage } from '@/utils/Constant';
import apiClient from '@/apis/apiService';

export const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!email) {
            showMessage('Please enter your email address', 'error');
            return;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            showMessage('Please enter a valid email address', 'error');
            return;
        }

        setLoading(true);

        try {
            const response = await apiClient.post('/auth/forgot-password', { email });
            
            if (response.data.message) {
                showMessage('OTP sent to your email successfully');
                localStorage.setItem('reset_email', email);
                navigate('/reset-password');
            }
        } catch (error: any) {
            showMessage(error.response?.data?.message || 'Failed to send OTP', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full relative overflow-hidden">
            {/* Real Estate Background */}
            <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.7)), url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070')"
                }}
            />
            
            {/* Overlay Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-amber-900/20" />
            
            {/* Content */}
            <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    {/* Logo & Branding */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 shadow-xl mb-4">
                            <Building2 className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold text-white mb-2">Shivalik Group</h1>
                        <p className="text-blue-200 text-sm">Real Estate Operating System</p>
                    </div>

                    {/* Forgot Password Card */}
                    <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-8">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Forgot Password?</h2>
                            <p className="text-gray-600 text-sm">
                                Enter your email address and we'll send you an OTP to reset your password.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Email Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                        <Mail className="w-4 h-4 text-gray-500" />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your registered email"
                                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={loading || !email}
                                className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Sending OTP...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Send OTP</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </Button>

                            {/* Back to Login */}
                            <Link
                                to="/login"
                                className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to Login
                            </Link>
                        </form>
                    </div>

                    {/* Footer */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-white/80">
                            © 2025 Shivalik Group. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
