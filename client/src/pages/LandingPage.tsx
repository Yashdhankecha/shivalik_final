import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { communityApi } from '../apis/community';
import { Community } from '../types/CommunityTypes';
import { useAuth } from '../hooks/useAuth';
import { showMessage } from '../utils/Constant';
import { getImageUrl } from '../utils/imageUtils';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Settings, LogOut, User, ChevronDown, Heart, Share2, Check } from 'lucide-react';
import AuthModal from '../components/ui/AuthModal';
import HeroSection from '../components/landing/HeroSection';
import FeaturedCommunities from '../components/landing/FeaturedCommunities';
import Footer from '../components/landing/Footer';

interface Pulse {
    _id: string;
    title: string;
    description: string;
    userId: {
        _id: string;
        name: string;
    };
    communityId: {
        _id: string;
        name: string;
    };
    attachment?: string;
    likes: string[];
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
    const [sharedPulseId, setSharedPulseId] = useState<string | null>(null);
    const [likedPulses, setLikedPulses] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetchLandingPageData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
            
            // Fetch recent approved pulses from all communities
            try {
                // Get all featured communities and fetch pulses from each
                const allPulses: Pulse[] = [];
                for (const community of communities.slice(0, 3)) {
                    try {
                        const response = await communityApi.getPulsesByCommunity(community._id, {
                            page: 1,
                            limit: 2
                        });
                        const pulsesData = response.result?.pulses || response.data?.pulses || [];
                        const formattedPulses = pulsesData.map((pulse: any) => ({
                            _id: pulse._id,
                            title: pulse.title,
                            description: pulse.description,
                            userId: pulse.userId || { _id: '', name: 'Unknown' },
                            communityId: { _id: community._id, name: community.name },
                            attachment: pulse.attachment,
                            likes: pulse.likes || [],
                            createdAt: pulse.createdAt
                        }));
                        allPulses.push(...formattedPulses);
                    } catch (error) {
                        console.error(`Error fetching pulses for community ${community._id}:`, error);
                    }
                }
                // Sort by date and take most recent 6
                allPulses.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                setRecentPulses(allPulses.slice(0, 6));
                
                // Initialize liked pulses if user is logged in
                if (user && allPulses.length > 0) {
                    const liked = new Set<string>();
                    allPulses.forEach(pulse => {
                        if (pulse.likes && Array.isArray(pulse.likes)) {
                            const userLiked = pulse.likes.some((like: any) => {
                                const idStr = typeof like === 'string' ? like : (like._id || like.toString());
                                return idStr === user.id;
                            });
                            if (userLiked) {
                                liked.add(pulse._id);
                            }
                        }
                    });
                    setLikedPulses(liked);
                }
            } catch (error) {
                console.error('Error fetching pulses:', error);
                setRecentPulses([]);
            }
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

    const handleLikePulse = async (pulseId: string) => {
        if (!isAuthenticated) {
            setPendingAction(() => () => handleLikePulse(pulseId));
            setShowAuthModal(true);
            return;
        }

        try {
            // Save like to database
            await communityApi.toggleLikePulse(pulseId);
            
            // Find which community this pulse belongs to and refetch from database
            const pulse = recentPulses.find(p => p._id === pulseId);
            if (pulse) {
                try {
                    // Refetch pulses from the community to get updated data from database
                    const pulseResponse = await communityApi.getPulsesByCommunity(pulse.communityId._id, {
                        page: 1,
                        limit: 10
                    });
                    const pulsesData = pulseResponse.result?.pulses || pulseResponse.data?.pulses || [];
                    const updatedPulse = pulsesData.find((p: any) => p._id === pulseId);
                    
                    if (updatedPulse) {
                        // Update the pulse with fresh data from database
                        setRecentPulses(prevPulses => 
                            prevPulses.map(p => {
                                if (p._id === pulseId) {
                                    return {
                                        ...p,
                                        likes: updatedPulse.likes || []
                                    };
                                }
                                return p;
                            })
                        );
                        
                        // Update liked status based on actual database data
                        if (user && updatedPulse.likes && Array.isArray(updatedPulse.likes)) {
                            const userLiked = updatedPulse.likes.some((id: any) => {
                                const idStr = typeof id === 'string' ? id : (id._id || id.toString());
                                return idStr === user.id;
                            });
                            setLikedPulses(prev => {
                                const newSet = new Set(prev);
                                if (userLiked) {
                                    newSet.add(pulseId);
                                } else {
                                    newSet.delete(pulseId);
                                }
                                return newSet;
                            });
                        }
                    }
                } catch (error) {
                    console.error('Error refetching pulse:', error);
                    showMessage('Like saved but failed to refresh data', 'info');
                }
            }
        } catch (error: any) {
            showMessage(error.message || 'Failed to like pulse', 'error');
        }
    };

    const handleSharePulse = async (pulse: Pulse) => {
        const pulseUrl = `${window.location.origin}/community/${pulse.communityId._id}?pulse=${pulse._id}`;
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: pulse.title,
                    text: pulse.description,
                    url: pulseUrl,
                });
                return;
            } catch (error: any) {
                if (error.name !== 'AbortError') {
                    console.error('Error sharing:', error);
                }
            }
        }
        
        // Fallback to copy
        try {
            await navigator.clipboard.writeText(pulseUrl);
            setSharedPulseId(pulse._id);
            showMessage('Link copied to clipboard!', 'success');
            setTimeout(() => setSharedPulseId(null), 2000);
        } catch (error) {
            showMessage('Failed to copy link', 'error');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Navigation Header with Glass Effect */}
            <nav className="bg-white shadow-lg sticky top-0 z-50 border-b border-gray-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shadow-lg">
                                <span className="text-white font-bold text-lg">S</span>
                            </div>
                            <h1 className="text-2xl font-bold text-black">
                                Shivalik Real Estate
                            </h1>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            {!isAuthenticated ? (
                                <button
                                    onClick={() => navigate('/login')}
                                    className="px-6 py-2.5 bg-black text-white font-semibold rounded-full hover:bg-gray-800 hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                                >
                                    Sign In
                                </button>
                            ) : (
                                <div className="relative">
                                    <button
                                        onClick={() => setShowUserMenu(!showUserMenu)}
                                        className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-full hover:bg-black hover:shadow-lg transition-all duration-300"
                                    >
                                        <Avatar className="w-8 h-8 border-2 border-gray-400">
                                            <AvatarFallback className="bg-gray-800 text-white text-sm font-bold">
                                                {user?.name?.charAt(0) || 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="font-medium text-white">{user?.name || 'User'}</span>
                                        <ChevronDown className={`w-4 h-4 text-white transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                                    </button>

                                    {showUserMenu && (
                                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-300 py-2 transform transition-all">
                                            <div className="px-4 py-3 border-b border-gray-200">
                                                <p className="font-semibold text-black">{user?.name || 'User'}</p>
                                                <p className="text-sm text-gray-600">{user?.email}</p>
                                            </div>
                                            <button 
                                                onClick={() => navigate('/profile')} 
                                                className="w-full px-4 py-2.5 text-left hover:bg-gray-100 flex items-center gap-3 transition-colors text-black"
                                            >
                                                <User className="w-4 h-4" />
                                                <span className="font-medium">Profile</span>
                                            </button>
                                            <button 
                                                onClick={() => navigate('/settings')} 
                                                className="w-full px-4 py-2.5 text-left hover:bg-gray-100 flex items-center gap-3 transition-colors text-black"
                                            >
                                                <Settings className="w-4 h-4" />
                                                <span className="font-medium">Settings</span>
                                            </button>
                                            <button 
                                                onClick={() => navigate('/dashboard')} 
                                                className="w-full px-4 py-2.5 text-left hover:bg-gray-100 flex items-center gap-3 transition-colors border-t border-gray-200 mt-1 pt-3 text-black"
                                            >
                                                <span className="font-medium text-gray-700">Go to Dashboard</span>
                                            </button>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full px-4 py-2.5 text-left hover:bg-gray-100 text-black flex items-center gap-3 transition-colors"
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
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-black mb-4">
                            Recent Community Pulses
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Stay updated with the latest happenings across all communities
                        </p>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="bg-gray-200 rounded-2xl h-64 animate-pulse"></div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {recentPulses.map((pulse, index) => (
                                <div 
                                    key={pulse._id} 
                                    className="bg-white rounded-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-300 overflow-hidden group"
                                >
                                    {/* Gradient Header */}
                                    <div className={`h-2 bg-gray-800`}></div>
                                    
                                    <div className="p-6">
                                        {/* Author Info */}
                                        <div className="flex items-center gap-3 mb-4">
                                            <Avatar className="w-10 h-10">
                                                <AvatarFallback className="bg-gray-800 text-white text-sm font-bold">
                                                    {pulse.userId.name.substring(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <p className="font-semibold text-black">{pulse.userId.name}</p>
                                                <p className="text-xs text-gray-600">{pulse.communityId.name}</p>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <h3 className="text-lg font-bold text-black mb-2 line-clamp-2">
                                            {pulse.title}
                                        </h3>
                                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                            {pulse.description}
                                        </p>

                                        {/* Image */}
                                        {pulse.attachment && (
                                            <div className="mb-4 rounded-xl overflow-hidden">
                                                <img 
                                                    src={getImageUrl(pulse.attachment)} 
                                                    alt={pulse.title}
                                                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                            </div>
                                        )}

                                        {/* Stats */}
                                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleLikePulse(pulse._id);
                                                }}
                                                className={`flex items-center gap-1.5 text-sm transition-colors ${
                                                    likedPulses.has(pulse._id)
                                                        ? 'text-red-500'
                                                        : 'text-gray-600 hover:text-red-500'
                                                }`}
                                            >
                                                <Heart 
                                                    className={`w-5 h-5 ${likedPulses.has(pulse._id) ? 'fill-current' : ''}`} 
                                                />
                                                <span className="font-medium">
                                                    {Array.isArray(pulse.likes) 
                                                        ? pulse.likes.filter((like: any) => like !== null && like !== undefined).length 
                                                        : 0}
                                                </span>
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleSharePulse(pulse);
                                                }}
                                                className={`flex items-center gap-1.5 text-sm transition-colors ${
                                                    sharedPulseId === pulse._id
                                                        ? 'text-green-600'
                                                        : 'text-gray-600 hover:text-gray-900'
                                                }`}
                                            >
                                                {sharedPulseId === pulse._id ? (
                                                    <>
                                                        <Check className="w-5 h-5" />
                                                        <span className="font-medium">Copied!</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Share2 className="w-5 h-5" />
                                                        <span className="font-medium">Share</span>
                                                    </>
                                                )}
                                            </button>
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
                            className="px-8 py-3 bg-black text-white font-semibold rounded-full hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
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