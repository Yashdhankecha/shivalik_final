import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, Mail, Phone, ArrowRight, Shield, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { showMessage } from '@/utils/Constant';
import apiClient from '@/apis/apiService';
import { setToLocalStorage } from '@/utils/localstorage';

export const LoginPage = () => {
    const navigate = useNavigate();

    const [loginMethod, setLoginMethod] = useState<'phone' | 'email'>('email');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        setPhoneNumber(value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Check for admin credentials (works offline)
            if (loginMethod === 'email' && email === 'admin@gmail.com' && password === '321ewq') {
                showMessage('Admin login successful!');
                // Set admin user data
                await setToLocalStorage('auth_token', 'admin-token-' + Date.now());
                await setToLocalStorage('userInfo', {
                    email: 'admin@gmail.com',
                    name: 'Admin User',
                    role: 'admin'
                });
                navigate('/admin');
                setLoading(false);
                return;
            }

            // Validation
            if (loginMethod === 'phone') {
                if (!phoneNumber || phoneNumber.length !== 10) {
                    showMessage('Please enter a valid 10-digit mobile number', 'error');
                    setLoading(false);
                    return;
                }
                if (!password) {
                    showMessage('Please enter your password', 'error');
                    setLoading(false);
                    return;
                }

                // Login with mobile number
                const response = await apiClient.post('/api/v1/auth/login', {
                    mobileNumber: phoneNumber,
                    password
                });

                if (response.data.result) {
                    showMessage('Login successful!');
                    await setToLocalStorage('auth_token', response.data.result.accessToken);
                    await setToLocalStorage('refresh_token', response.data.result.refreshToken);
                    await setToLocalStorage('userInfo', response.data.result.user);
                    navigate('/dashboard');
                }
            } else {
                if (!email) {
                    showMessage('Please enter your email address', 'error');
                    setLoading(false);
                    return;
                }

                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailPattern.test(email)) {
                    showMessage('Please enter a valid email address', 'error');
                    setLoading(false);
                    return;
                }

                if (!password) {
                    showMessage('Please enter your password', 'error');
                    setLoading(false);
                    return;
                }

                // Login with email
                const response = await apiClient.post('/api/v1/auth/login', {
                    email,
                    password
                });

                if (response.data.result) {
                    showMessage('Login successful!');
                    await setToLocalStorage('auth_token', response.data.result.accessToken);
                    await setToLocalStorage('refresh_token', response.data.result.refreshToken);
                    await setToLocalStorage('userInfo', response.data.result.user);
                    navigate('/dashboard');
                }
            }
        } catch (error: any) {
            // Check if it's a connection error and provide helpful message
            if (error.code === 'ERR_NETWORK' || error.message?.includes('ERR_CONNECTION_REFUSED')) {
                showMessage('Backend server is not running. Use admin credentials (admin@gmail.com / 321ewq) for offline access.', 'error');
            } else {
                showMessage(error.response?.data?.message || 'Login failed. Please check your credentials.', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full relative overflow-hidden bg-gradient-to-br from-gray-900 via-green-950 to-black">
            {/* Real Estate Background */}
            <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
                style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070')"
                }}
            />
            
            {/* Overlay Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-transparent to-green-900/20" />
            
            {/* Content */}
            <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    {/* Logo & Branding */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-green-800 shadow-xl mb-4">
                            <Building2 className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold text-white mb-2">Shivalik Group</h1>
                        <p className="text-emerald-200 text-sm">Real Estate Operating System</p>
                    </div>

                    {/* Login Card */}
                    <div className="bg-gray-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-emerald-900/30 p-8">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-emerald-100 mb-2">Welcome Back</h2>
                            <p className="text-gray-400 text-sm">Sign in to access your dashboard</p>
                        </div>

                        {/* Login Method Toggle */}
                        <div className="flex gap-2 mb-6 p-1 bg-gray-800 rounded-lg">
                            <button
                                type="button"
                                onClick={() => setLoginMethod('phone')}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all ${
                                    loginMethod === 'phone'
                                        ? 'bg-emerald-600 text-white shadow-sm'
                                        : 'text-gray-400 hover:text-gray-200'
                                }`}
                            >
                                <Phone className="w-4 h-4" />
                                Phone
                            </button>
                            <button
                                type="button"
                                onClick={() => setLoginMethod('email')}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all ${
                                    loginMethod === 'email'
                                        ? 'bg-emerald-600 text-white shadow-sm'
                                        : 'text-gray-400 hover:text-gray-200'
                                }`}
                            >
                                <Mail className="w-4 h-4" />
                                Email
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Phone Number Input */}
                            {loginMethod === 'phone' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Mobile Number
                                        </label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-gray-400">
                                                <Phone className="w-4 h-4" />
                                                <span className="text-sm font-medium">+91</span>
                                                <div className="w-px h-5 bg-gray-600" />
                                            </div>
                                            <input
                                                type="tel"
                                                value={phoneNumber}
                                                onChange={handlePhoneNumberChange}
                                                placeholder="Enter 10-digit mobile number"
                                                maxLength={10}
                                                className="w-full pl-24 pr-4 py-3 bg-gray-800 border border-gray-700 text-emerald-100 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Password
                                        </label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                                <Shield className="w-4 h-4 text-gray-400" />
                                            </div>
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="Enter your password"
                                                className="w-full pl-12 pr-12 py-3 bg-gray-800 border border-gray-700 text-emerald-100 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Email Input */}
                            {loginMethod === 'email' && (
                                <>
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
                                                placeholder="Enter your email address"
                                                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Password
                                        </label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                                <Shield className="w-4 h-4 text-gray-500" />
                                            </div>
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="Enter your password"
                                                className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end text-sm">
                                        <Link
                                            to="/forgot-password"
                                            className="text-blue-600 hover:text-blue-700 font-medium"
                                        >
                                            Forgot password?
                                        </Link>
                                    </div>
                                </>
                            )}

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={loading || 
                                    (loginMethod === 'phone' && phoneNumber.length !== 10) ||
                                    (loginMethod === 'email' && !email) ||
                                    !password
                                }
                                className="w-full h-12 bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl hover:shadow-emerald-900/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Signing in...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Sign In</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </Button>
                        </form>

                        {/* Additional Links */}
                        <div className="mt-6 text-center space-y-2">
                            <p className="text-sm text-gray-400">
                                Don't have an account?{' '}
                                <Link to="/register" className="text-emerald-400 hover:text-emerald-300 font-medium">
                                    Register here
                                </Link>
                            </p>
                        </div>
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