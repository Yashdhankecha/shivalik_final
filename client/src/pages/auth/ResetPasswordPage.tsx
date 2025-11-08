import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, Shield, Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, NewInputOTPSlot } from '@/components/ui/input-otp';
import { showMessage } from '@/utils/Constant';
import apiClient from '@/apis/apiService';

export const ResetPasswordPage = () => {
    const navigate = useNavigate();
    
    const [email, setEmail] = useState('');
    const [otpArray, setOtpArray] = useState(Array(6).fill(''));
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [resetSuccess, setResetSuccess] = useState(false);

    useEffect(() => {
        const savedEmail = localStorage.getItem('reset_email');
        if (!savedEmail) {
            navigate('/forgot-password');
            return;
        }
        setEmail(savedEmail);
    }, [navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const otp = otpArray.join('');
        
        if (otp.length !== 6) {
            showMessage('Please enter the 6-digit OTP', 'error');
            return;
        }

        if (!newPassword || !confirmPassword) {
            showMessage('Please fill in all password fields', 'error');
            return;
        }

        if (newPassword.length < 6) {
            showMessage('Password must be at least 6 characters long', 'error');
            return;
        }

        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
            showMessage('Password must contain uppercase, lowercase, and number', 'error');
            return;
        }

        if (newPassword !== confirmPassword) {
            showMessage('Passwords do not match', 'error');
            return;
        }

        setLoading(true);

        try {
            const response = await apiClient.post('/auth/reset-password', {
                email,
                otp,
                newPassword
            });
            
            if (response.data.message) {
                showMessage('Password reset successfully');
                setResetSuccess(true);
                localStorage.removeItem('reset_email');
                
                // Redirect to login after 2 seconds
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            }
        } catch (error: any) {
            showMessage(error.response?.data?.message || 'Failed to reset password', 'error');
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
            <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    {/* Logo & Branding */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-900 to-black shadow-xl mb-4 border border-gray-300">
                            <Building2 className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold text-black mb-2">Shivalik Group</h1>
                        <p className="text-gray-600 text-sm">Real Estate Operating System</p>
                    </div>

                    {/* Reset Password Card */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
                        {!resetSuccess ? (
                            <>
                                <div className="mb-6">
                                    <h2 className="text-2xl font-bold text-black mb-2">Reset Password</h2>
                                    <p className="text-gray-600 text-sm">
                                        Enter the OTP sent to <span className="font-medium text-black">{email}</span> and create a new password.
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    {/* OTP Input */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-3">
                                            Enter OTP
                                        </label>
                                        <div className="flex justify-center">
                                            <InputOTP
                                                maxLength={6}
                                                value={otpArray.join('')}
                                                onChange={(value) => {
                                                    const newOtpArray = value.split('');
                                                    while (newOtpArray.length < 6) newOtpArray.push('');
                                                    setOtpArray(newOtpArray.slice(0, 6));
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
                                    </div>

                                    {/* New Password */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            New Password
                                        </label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                                <Shield className="w-4 h-4 text-gray-500" />
                                            </div>
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                placeholder="Enter new password"
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
                                            Must be at least 6 characters with uppercase, lowercase, and number
                                        </p>
                                    </div>

                                    {/* Confirm Password */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Confirm Password
                                        </label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                                <Shield className="w-4 h-4 text-gray-500" />
                                            </div>
                                            <input
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder="Confirm new password"
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

                                    {/* Submit Button */}
                                    <Button
                                        type="submit"
                                        disabled={loading || otpArray.join('').length !== 6 || !newPassword || !confirmPassword}
                                        className="w-full h-12 bg-black hover:bg-gray-800 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                <span>Resetting Password...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Reset Password</span>
                                                <ArrowRight className="w-4 h-4" />
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </>
                        ) : (
                            <div className="text-center py-8">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                                    <CheckCircle2 className="w-8 h-8 text-black" />
                                </div>
                                <h3 className="text-2xl font-bold text-black mb-2">Password Reset Successful!</h3>
                                <p className="text-gray-600 mb-6">
                                    Your password has been reset successfully. Redirecting to login...
                                </p>
                                <div className="w-12 h-12 border-4 border-gray-600/20 border-t-black rounded-full animate-spin mx-auto" />
                            </div>
                        )}

                        {!resetSuccess && (
                            <div className="mt-6 text-center">
                                <Link
                                    to="/forgot-password"
                                    className="text-sm text-gray-700 hover:text-black font-medium"
                                >
                                    Didn't receive OTP? Resend
                                </Link>
                            </div>
                        )}
                        
                        <div className="mt-4 text-center">
                            <p className="text-sm text-gray-500">
                                Continue as{' '}
                                <button 
                                    onClick={() => navigate('/dashboard')}
                                    className="text-black hover:text-gray-800 font-medium underline"
                                >
                                    Guest
                                </button>
                            </p>
                        </div>
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
