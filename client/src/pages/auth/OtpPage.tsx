import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, NewInputOTPSlot } from '@/components/ui/input-otp';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../../hooks/useAuth';
import { getFromLocalStorage, setToLocalStorage } from '@/utils/localstorage';
import { resetVerifyOTP, verifyOTP } from '@/store/slices/otpSlice';
import { showMessage } from '@/utils/Constant';

export const OtpPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { login } = useAuth();

    const { user, error, status }: any = useSelector((state: any) => state.otp);

    const [otpArray, setOtpArray] = useState(Array(6).fill(''));
    const [phoneNumber, setPhoneNumber] = useState('');
    const [canResend, setCanResend] = useState(false);
    const [resendTimer, setResendTimer] = useState(30);

    const inputRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        (async () => {
            const user_mobile: any = await getFromLocalStorage('user_mobile');
            if (!user_mobile) {
                navigate('/login');
                return;
            }
            setPhoneNumber(user_mobile);
        })();
    }, [navigate]);

    // Timer for resend OTP
    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => {
                setResendTimer(resendTimer - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [resendTimer]);

    useEffect(() => {
        if (status === 'complete' && user?.result?.accessToken) {
            // Prepare user data for login
            const userData = {
                id: user.result.id || '',
                name: user.result.name || '',
                email: user.result.email || '',
                phone: phoneNumber,
                role: user.result.userRoles?.join(',') || '',
                avatar: user.result.avatar || ''
            };
            login(userData, user.result.accessToken);
            setToLocalStorage('userInfo', user.result);
            setToLocalStorage('auth_token', user.result.accessToken);
            dispatch(resetVerifyOTP());

            // Delay navigation to ensure context update propagates
            setTimeout(() => {
                const roles: string[] = user?.result?.userRoles || [];
                if (roles.includes('SuperAdmin')) {
                    navigate('/users');
                }
                showMessage('Login successful');
            }, 0);
        } else if (status === 'failed') {
            showMessage(error || 'An error occurred', 'error');
        }
    }, [status, navigate, login, user, phoneNumber]);

    const handleBackspace = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace' && index > 0 && !otpArray[index]) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>, index: number) => {
        if (index !== 0) return;
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');
        if (pastedData.length === 6) {
            const newOtpArray = pastedData.split('').slice(0, 6);
            setOtpArray(newOtpArray);
            inputRefs.current[5]?.focus();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const otp = otpArray.join('');
        if (otp.length === 6) {
            dispatch(verifyOTP({ otp, phoneNumber, countryCode: '+91' }));
        } else {
            showMessage('Please enter a 6-digit OTP.', 'error');
        }
    };

    return (
        <div
            style={{ backgroundImage: "url('/authBgImage.svg')" }}
            className="min-h-screen w-full bg-white flex items-center justify-center p-4 bg-no-repeat bg-center bg-cover"
        >
            <div className="w-full max-w-sm rounded-2xl shadow-lg border border-gray-100 text-center p-6">
                <div className="w-12 h-12 mx-auto rounded-[10px] bg-white border border-[#F0F0F0] flex items-center justify-center">
                    <img src="/loginIcon.svg" alt="Login" className="w-5 h-5" loading="lazy" />
                </div>
                <h1 className="my-4 text-2xl font-bold text-[#2E2E2E]">R OS</h1>
                <p className="inline-block px-[14px] py-[6px] h-[36px] rounded-full bg-[#EDEDED] text-[#757575] text-[14px] leading-[24px] font-semibold text-center">
                    Enter OTP
                </p>
                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <div className="flex justify-center gap-3">
                        <InputOTP
                            maxLength={6}
                            value={otpArray.join('')}
                            onChange={(value) => {
                                const newOtpArray = value.split('');
                                while (newOtpArray.length < 6) newOtpArray.push('');
                                setOtpArray(newOtpArray.slice(0, 6));
                            }}
                        >
                            <div
                                className={`relative border-b transition-colors`}
                            >
                                <InputOTPGroup className="flex gap-[10px] px-1">
                                    {Array(6).fill(0).map((_, index) => (
                                        <NewInputOTPSlot
                                            key={index}
                                            index={index}
                                            className="w-[46px] h-[46px] text-[24px] text-[#1B1B1B] text-center font-medium border-[#E0E0E0] bg-transparent outline-none focus:outline-none"
                                            ref={(el) => (inputRefs.current[index] = el)}
                                            onKeyDown={(e: any) => handleBackspace(e, index)}
                                            onPaste={(e: any) => handlePaste(e, index)}
                                        />
                                    ))}
                                </InputOTPGroup>
                            </div>
                        </InputOTP>
                    </div>
                    <Button
                        type="submit"
                        disabled={status === 'loading' || otpArray.join('').length !== 6}
                        className="w-full h-12 bg-black text-white rounded-md hover:bg-gray-800 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                    >
                        {status === 'loading' ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                Verifying...
                            </>
                        ) : status === 'complete' ? (
                            'Verified Successfully'
                        ) : (
                            'Verify'
                        )}
                    </Button>
                </form>
                <p className="mt-6 text-xs text-gray-400">R-OS Admin v1.0.0</p>
            </div>
        </div>
    );
};
