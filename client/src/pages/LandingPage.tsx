import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { communityApi } from '../apis/community';
import { Community } from '../types/CommunityTypes';
import { useAuth } from '../hooks/useAuth';
import { showMessage } from '../utils/Constant';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Settings, LogOut, User, ChevronDown } from 'lucide-react';
import AuthModal from '../components/ui/AuthModal';
import HeroSection from '../components/landing/HeroSection';
import FeaturedCommunities from '../components/landing/FeaturedCommunities';
import Footer from '../components/landing/Footer';

interface Pulse {
    _id: string;
    title: string;
    description: string;
    author: {
        name: string;
        avatar?: string;
    };
    community: {
        name: string;
    };
    attachment?: string;
    likes: number;
    comments: number;
    createdAt: string;
}

const LandingPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user, logout } = useAuth();
    
    const [featuredCommunities, setFeaturedCommunities] = useState<Community[]>([]);
    const [recentPulses, setRecentPulses] = useState<Pulse[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

    useEffect(() => {
        fetchLandingPageData();
    }, []);

    const fetchLandingPageData = async () => {
        try {
            setLoading(true);
            const [communitiesRes] = await Promise.all([
                communityApi.getFeaturedCommunities(6)
            ]);

            // Handle both possible response structures
            const communities = Array.isArray(communitiesRes) 
                ? communitiesRes 
                : communitiesRes.result || communitiesRes.data || [];

            setFeaturedCommunities(communities);
            
            // Mock recent pulses - in production, fetch from API
            setRecentPulses([
                {
                    _id: '1',
                    title: 'Welcome to Sunrise Valley Community',
                    description: 'Excited to share our new community amenities! Check out the newly renovated clubhouse and swimming pool.',
                    author: { name: 'John Doe', avatar: 'JD' },
                    community: { name: 'Sunrise Valley' },
                    attachment: 'https://images.unsplash.com/photo-1571055107559-3e67626fa8be?w=800',
                    likes: 24,
                    comments: 8,
                    createdAt: new Date().toISOString()
                },
                {
                    _id: '2',
                    title: 'Community Garden Initiative',
                    description: 'Join us this weekend for our community garden planting session. Bring your family and lets make our community greener!',
                    author: { name: 'Sarah Smith', avatar: 'SS' },
                    community: { name: 'Green Meadows' },
                    attachment: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
                    likes: 42,
                    comments: 15,
                    createdAt: new Date().toISOString()
                },
                {
                    _id: '3',
                    title: 'New Security System Installed',
                    description: 'Great news! Our community now has a state-of-the-art security system with 24/7 monitoring for your safety.',
                    author: { name: 'Mike Johnson', avatar: 'MJ' },
                    community: { name: 'Palm Springs' },
                    attachment: 'https://images.unsplash.com/photo-1516156008625-3a9d6067fab5?w=800',
                    likes: 56,
                    comments: 12,
                    createdAt: new Date().toISOString()
                }
            ]);
        } catch (error: any) {
            console.error('Error fetching landing page data:', error);
            showMessage(error.message || 'Failed to load data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleJoinCommunity = async (communityId: string, message?: string) => {
        if (!isAuthenticated) {
            setPendingAction(() => () => handleJoinCommunity(communityId, message));
            setShowAuthModal(true);
            return;
        }

        try {
            const response = await communityApi.createJoinRequest({ communityId, message });
            showMessage(response.message || 'Join request submitted successfully', 'success');
        } catch (error: any) {
            showMessage(error.message || 'Failed to submit join request', 'error');
        }
    };

    const handleAuthSuccess = () => {
        setShowAuthModal(false);
        if (pendingAction) {
            pendingAction();
            setPendingAction(null);
        }
    };

    const handleViewAllCommunities = () => {
        navigate('/dashboard');
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-950 to-black">
            {/* Navigation Header with Glass Effect */}
            <nav className="bg-black/40 backdrop-blur-xl shadow-lg sticky top-0 z-50 border-b border-emerald-900/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-green-800 rounded-xl flex items-center justify-center shadow-lg">
                                <span className="text-white font-bold text-lg">S</span>
                            </div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-green-600 bg-clip-text text-transparent">
                                Shivalik Real Estate
                            </h1>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            {!isAuthenticated ? (
                                <button
                                    onClick={() => navigate('/login')}
                                    className="px-6 py-2.5 bg-emerald-900/60 backdrop-blur-md border border-emerald-700/40 text-emerald-100 font-semibold rounded-full hover:bg-emerald-800/80 hover:shadow-lg hover:shadow-emerald-900/50 transition-all duration-300 transform hover:scale-105"
                                >
                                    Sign In
                                </button>
                            ) : (
                                <div className="relative">
                                    <button
                                        onClick={() => setShowUserMenu(!showUserMenu)}
                                        className="flex items-center gap-2 px-4 py-2 bg-emerald-900/60 backdrop-blur-md border border-emerald-700/40 rounded-full hover:bg-emerald-800/80 hover:shadow-lg hover:shadow-emerald-900/50 transition-all duration-300"
                                    >
                                        <Avatar className="w-8 h-8 border-2 border-emerald-500">
                                            <AvatarFallback className="bg-gradient-to-br from-emerald-600 to-green-800 text-white text-sm font-bold">
                                                {user?.name?.charAt(0) || 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="font-medium text-emerald-100">{user?.name || 'User'}</span>
                                        <ChevronDown className={`w-4 h-4 text-emerald-200 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                                    </button>

                                    {showUserMenu && (
                                        <div className="absolute right-0 mt-2 w-56 bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-emerald-900/40 py-2 transform transition-all">
                                            <div className="px-4 py-3 border-b border-emerald-900/30">
                                                <p className="font-semibold text-emerald-100">{user?.name || 'User'}</p>
                                                <p className="text-sm text-gray-400">{user?.email}</p>
                                            </div>
                                            <button 
                                                onClick={() => navigate('/profile')} 
                                                className="w-full px-4 py-2.5 text-left hover:bg-emerald-900/30 flex items-center gap-3 transition-colors text-emerald-100"
                                            >
                                                <User className="w-4 h-4 text-emerald-500" />
                                                <span className="font-medium">Profile</span>
                                            </button>
                                            <button 
                                                onClick={() => navigate('/settings')} 
                                                className="w-full px-4 py-2.5 text-left hover:bg-emerald-900/30 flex items-center gap-3 transition-colors text-emerald-100"
                                            >
                                                <Settings className="w-4 h-4 text-emerald-500" />
                                                <span className="font-medium">Settings</span>
                                            </button>
                                            <button 
                                                onClick={() => navigate('/dashboard')} 
                                                className="w-full px-4 py-2.5 text-left hover:bg-emerald-900/30 flex items-center gap-3 transition-colors border-t border-emerald-900/30 mt-1 pt-3 text-emerald-100"
                                            >
                                                <span className="font-medium text-emerald-400">Go to Dashboard</span>
                                            </button>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full px-4 py-2.5 text-left hover:bg-red-900/30 text-red-400 flex items-center gap-3 transition-colors"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                <span className="font-medium">Logout</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <HeroSection onExplore={handleViewAllCommunities} />

            {/* Featured Communities */}
            <FeaturedCommunities
                communities={featuredCommunities}
                loading={loading}
                onJoinCommunity={handleJoinCommunity}
                onViewAll={handleViewAllCommunities}
            />

            {/* Recent Pulses Section */}
            <section className="py-16 bg-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-green-600 bg-clip-text text-transparent mb-4">
                            Recent Community Pulses
                        </h2>
                        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                            Stay updated with the latest happenings across all communities
                        </p>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="bg-gray-100 rounded-2xl h-64 animate-pulse"></div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {recentPulses.map((pulse, index) => (
                                <div 
                                    key={pulse._id} 
                                    className="bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-emerald-900/30 transition-all duration-300 transform hover:-translate-y-2 border border-emerald-900/20 overflow-hidden group"
                                >
                                    {/* Gradient Header */}
                                    <div className={`h-2 bg-gradient-to-r ${
                                        index % 3 === 0 ? 'from-emerald-600 to-green-700' :
                                        index % 3 === 1 ? 'from-green-600 to-teal-700' :
                                        'from-teal-600 to-emerald-700'
                                    }`}></div>
                                    
                                    <div className="p-6">
                                        {/* Author Info */}
                                        <div className="flex items-center gap-3 mb-4">
                                            <Avatar className="w-10 h-10">
                                                <AvatarFallback className="bg-gradient-to-br from-emerald-600 to-green-800 text-white text-sm font-bold">
                                                    {pulse.author.avatar || pulse.author.name.substring(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <p className="font-semibold text-emerald-100">{pulse.author.name}</p>
                                                <p className="text-xs text-gray-400">{pulse.community.name}</p>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <h3 className="text-lg font-bold text-emerald-100 mb-2 line-clamp-2">
                                            {pulse.title}
                                        </h3>
                                        <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                                            {pulse.description}
                                        </p>

                                        {/* Image */}
                                        {pulse.attachment && (
                                            <div className="mb-4 rounded-xl overflow-hidden">
                                                <img 
                                                    src={pulse.attachment} 
                                                    alt={pulse.title}
                                                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                            </div>
                                        )}

                                        {/* Stats */}
                                        <div className="flex items-center gap-4 pt-4 border-t border-emerald-900/30">
                                            <div className="flex items-center gap-1 text-gray-400">
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                                                </svg>
                                                <span className="text-sm font-medium">{pulse.likes}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-gray-400">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                </svg>
                                                <span className="text-sm font-medium">{pulse.comments}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* View All Button */}
                    <div className="text-center mt-12">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-green-700 text-white font-semibold rounded-full hover:shadow-2xl hover:shadow-emerald-900/50 transition-all duration-300 transform hover:scale-105"
                        >
                            View All Pulses
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <Footer />

            {/* Auth Modal */}
            <AuthModal
                isOpen={showAuthModal}
                onClose={() => {
                    setShowAuthModal(false);
                    setPendingAction(null);
                }}
                onSuccess={handleAuthSuccess}
            />
        </div>
    );
};

export default LandingPage;