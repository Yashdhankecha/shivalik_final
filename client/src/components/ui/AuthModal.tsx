import { useNavigate } from 'react-router-dom';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const AuthModal = ({ isOpen, onClose, onSuccess }: AuthModalProps) => {
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleLogin = () => {
        onClose();
        navigate('/login', { state: { returnUrl: window.location.pathname } });
    };

    const handleRegister = () => {
        onClose();
        navigate('/register', { state: { returnUrl: window.location.pathname } });
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
                {/* Backdrop */}
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                    onClick={onClose}
                />

                {/* Modal */}
                <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6 z-10 border border-gray-300">
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* Content */}
                    <div className="text-center">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
                            <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>

                        <h3 className="text-lg font-medium text-black mb-2">
                            Authentication Required
                        </h3>
                        
                        <p className="text-sm text-gray-600 mb-6">
                            Please sign in or create an account to continue with this action.
                        </p>

                        {/* Action buttons */}
                        <div className="space-y-3">
                            <button
                                onClick={handleLogin}
                                className="w-full px-4 py-2 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
                            >
                                Sign In
                            </button>
                            
                            <button
                                onClick={handleRegister}
                                className="w-full px-4 py-2 bg-gray-100 text-black font-semibold border-2 border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Create Account
                            </button>

                            <button
                                onClick={onClose}
                                className="w-full px-4 py-2 text-gray-600 font-medium hover:text-gray-800"
                            >
                                Maybe Later
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;