import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, Mail, Phone, User, Shield, Eye, EyeOff, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, NewInputOTPSlot } from '@/components/ui/input-otp';
import { showMessage } from '@/utils/Constant';
import apiClient from '@/apis/apiService';
import { setToLocalStorage } from '@/utils/localstorage';

export const RegisterPage = () => {
    const navigate = useNavigate();
    
    const [step, setStep] = useState<'details' | 'verify-email'>('details');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobileNumber: '',
        countryCode: '+91',
        password: '',
        confirmPassword: ''
    });
    const [emailOTP, setEmailOTP] = useState(Array(6).fill(''));
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        setFormData(prev => ({
            ...prev,
            mobileNumber: value
        }));
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validation
        if (!formData.name || !formData.email || !formData.mobileNumber || !formData.password || !formData.confirmPassword) {
            showMessage('Please fill in all fields', 'error');
            return;
        }

        if (formData.mobileNumber.length !== 10) {
            showMessage('Mobile number must be 10 digits', 'error');
            return;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(formData.email)) {
            showMessage('Please enter a valid email address', 'error');
            return;
        }

        if (formData.password.length < 6) {
            showMessage('Password must be at least 6 characters long', 'error');
            return;
        }

        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
            showMessage('Password must contain uppercase, lowercase, and number', 'error');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            showMessage('Passwords do not match', 'error');
            return;
        }

        setLoading(true);

        try {
            console.log('Sending registration data:', {
                name: formData.name,
                email: formData.email,
                mobileNumber: formData.mobileNumber,
                countryCode: formData.countryCode,
                password: '***'
            });

            const response = await apiClient.post('/api/v1/auth/register', {
                name: formData.name,
                email: formData.email,
                mobileNumber: formData.mobileNumber,
                countryCode: formData.countryCode,
                password: formData.password
            });
            
            if (response.data.message) {
                showMessage('OTP sent to your email');
                setStep('verify-email');
            }
        } catch (error: any) {
            console.error('Registration error:', error);
            console.error('Error response:', error.response);
            
            // Handle validation errors
            if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
                const errorMessages = error.response.data.errors.map((err: any) => err.msg).join(', ');
                showMessage(errorMessages, 'error');
            } else if (error.response?.data?.message) {
                showMessage(error.response.data.message, 'error');
            } else if (error.response?.data) {
                // Handle response.toJson format from backend
                const data = error.response.data;
                showMessage(data.message || JSON.stringify(data), 'error');
            } else if (error.message) {
                showMessage(error.message, 'error');
            } else {
                showMessage('Registration failed. Please try again.', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const otp = emailOTP.join('');
        
        if (otp.length !== 6) {
            showMessage('Please enter the 6-digit OTP', 'error');
            return;
        }

        setLoading(true);

        try {
            const response = await apiClient.post('/api/v1/auth/verify-otp', {
                email: formData.email,
                otp
            });
            
            if (response.data.result) {
                showMessage('Registration completed successfully!');
                // Save auth tokens
                await setToLocalStorage('auth_token', response.data.result.accessToken);
                await setToLocalStorage('refresh_token', response.data.result.refreshToken);
                await setToLocalStorage('userInfo', response.data.result.user);
                // Redirect to main page
                navigate('/');
            }
        } catch (error: any) {
            showMessage(error.response?.data?.message || 'Email verification failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    const resendEmailOTP = async () => {
        setLoading(true);
        try {
            const response = await apiClient.post('/api/v1/auth/resend-otp', {
                email: formData.email
            });
            
            if (response.data.message) {
                showMessage('OTP resent to your email');
            }
        } catch (error: any) {
            showMessage(error.response?.data?.message || 'Failed to resend OTP', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full relative overflow-hidden bg-white">
            {/* Real Estate Background */}
            <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-5"
                style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070')"
                }}
            />
            
            {/* Overlay Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-100/20 via-transparent to-gray-200/20" />
            
            {/* Content */}
            <div className="relative z-10 min-h-screen flex items-center justify-center p-4 py-12">
                <div className="w-full max-w-md">
                    {/* Logo & Branding */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-900 to-black shadow-xl mb-4 border border-gray-300">
                            <Building2 className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold text-black mb-2">Shivalik Group</h1>
                        <p className="text-gray-600 text-sm">Real Estate Operating System</p>
                    </div>

                    {/* Register Card */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
                        {/* Progress Indicator */}
                        <div className="flex items-center justify-center mb-6">
                            <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                    step === 'details' ? 'bg-black text-white' : 'bg-gray-200 text-gray-700'
                                }`}>
                                    {step !== 'details' ? <Check className="w-4 h-4" /> : '1'}
                                </div>
                                <span className="text-xs font-medium text-gray-700">Details</span>
                            </div>
                            <div className="flex-1 h-px bg-gray-300 mx-2" />
                            <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                    step === 'verify-email' ? 'bg-black text-white' : 'bg-gray-200 text-gray-700'
                                }`}>
                                    2
                                </div>
                                <span className="text-xs font-medium text-gray-700">Verify Email</span>
                            </div>
                        </div>

                        {/* Step 1: Registration Details */}
                        {step === 'details' && (
                            <>
                                <div className="mb-6">
                                    <h2 className="text-2xl font-bold text-black mb-2">Create Account</h2>
                                    <p className="text-gray-600 text-sm">Enter your details to get started</p>
                                </div>

                                <form onSubmit={handleRegister} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Full Name *
                                        </label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                                <User className="w-4 h-4 text-gray-500" />
                                            </div>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                placeholder="Enter your full name"
                                                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none transition-all text-sm"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email Address *
                                        </label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                                <Mail className="w-4 h-4 text-gray-500" />
                                            </div>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                placeholder="Enter your email"
                                                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none transition-all text-sm"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Mobile Number *
                                        </label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-gray-500">
                                                <Phone className="w-4 h-4" />
                                                <span className="text-sm font-medium">+91</span>
                                                <div className="w-px h-5 bg-gray-300" />
                                            </div>
                                            <input
                                                type="tel"
                                                name="mobileNumber"
                                                value={formData.mobileNumber}
                                                onChange={handlePhoneChange}
                                                placeholder="Enter 10-digit mobile number"
                                                maxLength={10}
                                                className="w-full pl-24 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none transition-all text-sm"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Password *
                                        </label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                                <Shield className="w-4 h-4 text-gray-500" />
                                            </div>
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                placeholder="Create a strong password"
                                                className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none transition-all text-sm"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        <p className="mt-1.5 text-xs text-gray-500">
                                            Min 6 characters with uppercase, lowercase, and number
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Confirm Password *
                                        </label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                                <Shield className="w-4 h-4 text-gray-500" />
                                            </div>
                                            <input
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                name="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                placeholder="Confirm your password"
                                                className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none transition-all text-sm"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
                                            >
                                                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full h-12 bg-black hover:bg-gray-800 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                <span>Creating Account...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Continue</span>
                                                <ArrowRight className="w-4 h-4" />
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </>
                        )}

                        {/* Step 2: Verify Email OTP */}
                        {step === 'verify-email' && (
                            <>
                                <div className="mb-6">
                                    <h2 className="text-2xl font-bold text-black mb-2">Verify Email</h2>
                                    <p className="text-gray-600 text-sm">
                                        Enter the OTP sent to <span className="font-medium text-black">{formData.email}</span>
                                    </p>
                                </div>

                                <form onSubmit={handleVerifyEmail} className="space-y-5">
                                    <div className="flex justify-center">
                                        <InputOTP
                                            maxLength={6}
                                            value={emailOTP.join('')}
                                            onChange={(value) => {
                                                const newOtpArray = value.split('');
                                                while (newOtpArray.length < 6) newOtpArray.push('');
                                                setEmailOTP(newOtpArray.slice(0, 6));
                                            }}
                                        >
                                            <InputOTPGroup className="flex gap-2">
                                                {Array(6).fill(0).map((_, index) => (
                                                    <NewInputOTPSlot
                                                        key={index}
                                                        index={index}
                                                        className="w-12 h-12 text-lg font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                                                    />
                                                ))}
                                            </InputOTPGroup>
                                        </InputOTP>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={loading || emailOTP.join('').length !== 6}
                                        className="w-full h-12 bg-black hover:bg-gray-800 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                <span>Verifying...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Complete Registration</span>
                                                <ArrowRight className="w-4 h-4" />
                                            </>
                                        )}
                                    </Button>

                                    <button
                                        type="button"
                                        onClick={resendEmailOTP}
                                        disabled={loading}
                                        className="w-full text-sm text-gray-700 hover:text-black font-medium"
                                    >
                                        Resend OTP
                                    </button>
                                </form>
                            </>
                        )}

                        {/* Login Link */}
                        {step === 'details' && (
                            <div className="mt-6 text-center">
                                <p className="text-sm text-gray-600">
                                    Already have an account?{' '}
                                    <Link to="/login" className="text-black hover:text-gray-800 font-medium">
                                        Sign in here
                                    </Link>
                                </p>
                                <p className="text-sm text-gray-500 mt-2">
                                    Continue as{' '}
                                    <button 
                                        onClick={() => navigate('/dashboard')}
                                        className="text-black hover:text-gray-800 font-medium underline"
                                    >
                                        Guest
                                    </button>
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-500">
                            © 2025 Shivalik Group. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
