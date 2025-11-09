import { Community } from '../../types/CommunityTypes';
import { Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getImageUrl } from '../../utils/imageUtils';

interface FeaturedCommunitiesProps {
    communities: Community[];
    loading: boolean;
    onJoinCommunity: (communityId: string) => void;
    onViewAll: () => void;
}

const FeaturedCommunities = ({ 
    communities, 
    loading, 
    onJoinCommunity, 
    onViewAll 
}: FeaturedCommunitiesProps) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [sharedCommunityId, setSharedCommunityId] = useState<string | null>(null);
    
    if (loading) {
        return (
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-black mb-8">Featured Communities</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="animate-pulse">
                                <div className="bg-gray-200 h-48 rounded-t-lg"></div>
                                <div className="bg-white p-6 rounded-b-lg border border-t-0 border-gray-300">
                                    <div className="h-6 bg-gray-200 rounded mb-3"></div>
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-4xl font-bold text-black mb-2">
                            Featured Communities
                        </h2>
                        <p className="text-gray-600">Discover premium living spaces with world-class amenities</p>
                    </div>
                    <button
                        onClick={onViewAll}
                        className="px-6 py-3 bg-black text-white font-semibold rounded-full hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                        View All →
                    </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {communities.map((community) => (
                        <div 
                            key={community._id} 
                            className="bg-white rounded-2xl overflow-hidden transition-all duration-300 transform hover:-translate-y-2 border border-gray-300 cursor-pointer"
                            onClick={() => navigate(`/community/${community._id}`)}
                        >
                            <div className="h-56 bg-gray-800 relative overflow-hidden">
                                {community.bannerImage ? (
                                    <img
                                        src={getImageUrl(community.bannerImage)}
                                        alt={community.name}
                                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                                    />
                                ) : (
                                    <img
                                        src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800"
                                        alt={community.name}
                                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                                    />
                                )}
                                <div className="absolute top-4 right-4 px-3 py-1 bg-gray-900 backdrop-blur-sm rounded-full text-xs font-semibold text-white">
                                    Featured
                                </div>
                            </div>
                            
                            <div className="p-6">
                                <h3 className="text-2xl font-bold text-black mb-2">
                                    {community.name}
                                </h3>
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                    {community.shortDescription || community.description || 'Luxury living redefined with modern amenities and excellent connectivity.'}
                                </p>
                                
                                <div className="flex items-center text-sm text-gray-600 mb-6">
                                    <svg className="w-4 h-4 mr-1 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span className="font-medium">
                                        {community.location?.city || 'Dehradun'}, {community.location?.state || 'Uttarakhand'}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 mb-4">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const communityUrl = `${window.location.origin}/community/${community._id}`;
                                            if (navigator.share) {
                                                navigator.share({
                                                    title: community.name,
                                                    text: community.shortDescription || community.description || '',
                                                    url: communityUrl,
                                                }).catch(() => {
                                                    // Fallback to copy
                                                    navigator.clipboard.writeText(communityUrl);
                                                    setSharedCommunityId(community._id);
                                                    setTimeout(() => setSharedCommunityId(null), 2000);
                                                });
                                            } else {
                                                navigator.clipboard.writeText(communityUrl);
                                                setSharedCommunityId(community._id);
                                                setTimeout(() => setSharedCommunityId(null), 2000);
                                            }
                                        }}
                                        className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Share2 className="w-4 h-4" />
                                        {sharedCommunityId === community._id ? 'Copied!' : 'Share'}
                                    </button>
                                </div>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onJoinCommunity(community._id);
                                    }}
                                    className="w-full px-4 py-3 bg-black text-white font-semibold rounded-xl hover:bg-gray-800 transition-all duration-300"
                                >
                                    Join Community
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {communities.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">No featured communities available</p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default FeaturedCommunities;