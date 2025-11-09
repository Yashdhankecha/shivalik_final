import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { communityApi } from '../apis/community';
import { Community } from '../types/CommunityTypes';
import { showMessage } from '../utils/Constant';
import { getImageUrl } from '../utils/imageUtils';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import {
  ArrowLeft, MapPin, Building2, Calendar,
  Clock, CheckCircle, X, Users, Plus, Upload, ShoppingBag
} from 'lucide-react';
// Import new tab components
import PulsesTab from '../components/community/Pulses/PulsesTab';
import EventsTab from '../components/community/Events/EventsTab';
import MarketplaceTab from '../components/community/Marketplace/MarketplaceTab';
import DirectoryTab from '../components/community/Directory/DirectoryTab';
import { formatDateToDDMMYYYY } from '../utils/dateUtils';

interface Pulse {
  _id: string;
  title: string;
  description: string;
  territory: string;
  attachment?: string;
  userId: {
    _id: string;
    name: string;
  };
  likes: string[];
  comments: Array<{
    userId: string;
    text: string;
    createdAt: string;
  }>;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface MarketplaceListing {
  _id: string;
  type: 'want' | 'offer';
  title: string;
  description: string;
  price: number;
  attachment?: string;
  userId: {
    _id: string;
    name: string;
  };
  createdAt: string;
  status: 'pending' | 'approved' | 'sold' | 'closed';
}

interface Member {
  _id: string;
  name: string;
  email?: string;
  role: string;
  isManager: boolean;
}

interface Event {
  _id: string;
  title: string;
  description: string;
  eventDate: string;
  startTime: string;
  endTime?: string;
  location?: string;
  maxParticipants?: number;
  registeredParticipants?: string[];
  eventType: string;
  status: 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled';
  createdBy: {
    _id: string;
    name: string;
  };
  createdAt: string;
}

const CommunityDashboard = () => {
  const { communityId } = useParams<{ communityId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [community, setCommunity] = useState<Community | null>(null);
  const [activeTab, setActiveTab] = useState('pulses');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joinStatus, setJoinStatus] = useState<'not-joined' | 'requested' | 'joined' | 'rejected'>('not-joined');
  const [rejectionMessage, setRejectionMessage] = useState<string | null>(null);

  useEffect(() => {
    if (communityId) {
      fetchCommunityData();
      checkJoinStatus();
    }
  }, [communityId, isAuthenticated]);

  // Refresh membership status when user logs in or when component becomes visible
  useEffect(() => {
    if (isAuthenticated && communityId) {
      checkJoinStatus();
    }
  }, [isAuthenticated]);

  const fetchCommunityData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await communityApi.getCommunityById(communityId!);
      
      // Handle different response structures
      // API returns: { message: "...", result: community } or { data: community }
      let communityData = null;
      
      if (response.result) {
        communityData = response.result;
      } else if (response.data) {
        communityData = response.data;
      } else if (response) {
        communityData = response;
      }
      
      if (!communityData || !communityData._id) {
        throw new Error('Community data not found in response. The community may not exist.');
      }
      
      setCommunity(communityData);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          error.message || 
                          'Failed to load community. Please try again later.';
      setError(errorMessage);
      showMessage(errorMessage, 'error');
      console.error('Error fetching community:', error);
      console.error('Response received:', error.response?.data || 'No response data');
    } finally {
      setLoading(false);
    }
  };

  const checkJoinStatus = async () => {
    if (!isAuthenticated) {
      setJoinStatus('not-joined');
      return;
    }

    try {
      // First check membership status (most reliable)
      try {
        const membershipResponse = await communityApi.checkCommunityMembership(communityId!);
        const membershipData = membershipResponse.result || membershipResponse.data;
        
        if (membershipData?.isMember) {
          setJoinStatus('joined');
          setRejectionMessage(null);
          return;
        }
      } catch (membershipError: any) {
        // If membership check fails, fall back to join request check
        console.log('Membership check failed, falling back to join request check:', membershipError?.message);
      }

      // Fallback: Check join request status
      const response = await communityApi.getUserJoinRequests();
      // Handle response structure
      const requestsData = response.result || response.data || response;
      const requests = Array.isArray(requestsData) ? requestsData : (requestsData.requests || []);
      
      const request = requests.find((r: any) => {
        const reqCommunityId = r.communityId?._id || r.communityId;
        return reqCommunityId === communityId;
      });

      if (request) {
        const status = request.status?.toLowerCase() || request.status;
        if (status === 'approved') {
          setJoinStatus('joined');
        } else if (status === 'rejected') {
          setJoinStatus('rejected');
          setRejectionMessage(request.reviewNotes || null);
        } else {
          setJoinStatus('requested');
        }
      } else {
        setJoinStatus('not-joined');
      }
    } catch (error) {
      console.error('Error checking join status:', error);
      setJoinStatus('not-joined');
    }
  };

  const handleJoinCommunity = async () => {
    if (!isAuthenticated) {
      // Redirect to login with return URL
      navigate('/login', { state: { from: `/community/${communityId}` } });
      return;
    }

    try {
      await communityApi.createJoinRequest({ communityId: communityId! });
      showMessage('Join request sent successfully!', 'success');
      setJoinStatus('requested');
    } catch (error: any) {
      showMessage(error.message || 'Failed to send join request', 'error');
    }
  };

  const handleLeaveCommunity = async () => {
    try {
      await communityApi.leaveCommunity(communityId!);
      showMessage('You have left the community', 'success');
      setJoinStatus('not-joined');
      // Refresh community data to update member count
      fetchCommunityData();
    } catch (error: any) {
      showMessage(error.message || 'Failed to leave community', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-6 text-center">
          <X className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Community</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => navigate('/')} className="bg-black hover:bg-gray-800">
            Back to Home
          </Button>
        </Card>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full p-6 text-center">
          <X className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Community Not Found</h2>
          <p className="text-gray-600 mb-4">The community you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/')} className="bg-black hover:bg-gray-800">
            Back to Home
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/')}
                className="p-2 hover:bg-gray-100"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              {joinStatus === 'joined' ? (
                <Button 
                  variant="outline" 
                  onClick={handleLeaveCommunity}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  Leave Community
                </Button>
              ) : joinStatus === 'requested' ? (
                <Button variant="outline" disabled>
                  <Clock className="w-4 h-4 mr-2" />
                  Request Pending
                </Button>
              ) : joinStatus === 'rejected' ? (
                <div className="flex items-center gap-2">
                  <Badge variant="destructive">Request Rejected</Badge>
                  <Button 
                    variant="outline" 
                    onClick={handleJoinCommunity}
                    className="ml-2"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={handleJoinCommunity}
                  className="bg-black hover:bg-gray-800 text-white"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Join Community
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Rejection Message */}
      {rejectionMessage && (
        <div className="bg-red-50 border-b border-red-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
            <div className="flex items-center gap-2">
              <X className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">
                <span className="font-medium">Join request rejected:</span> {rejectionMessage}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Hero Banner Section with Large Image */}
      <div className="relative w-full">
        {/* Banner Image */}
        <div className="relative h-[400px] md:h-[500px] lg:h-[600px] w-full overflow-hidden bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900">
          {community.bannerImage ? (
            <img 
              src={getImageUrl(community.bannerImage)} 
              alt={community.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 flex items-center justify-center">
              <Building2 className="w-24 h-24 text-white opacity-50" />
            </div>
          )}
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
          
          {/* Content Overlay */}
          <div className="absolute inset-0 flex items-end">
            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 pb-8 md:pb-12">
              <div className="flex flex-col md:flex-row md:items-end gap-6">
                {/* Community Logo */}
                <div className="flex-shrink-0">
                  {community.logo ? (
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden border-4 border-white shadow-2xl">
                      <img 
                        src={community.logo} 
                        alt={community.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl flex items-center justify-center border-4 border-white shadow-2xl">
                      <Building2 className="w-12 h-12 md:w-16 md:h-16 text-white" />
                    </div>
                  )}
                </div>
                
                {/* Community Info */}
                <div className="flex-1 text-white">
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 drop-shadow-lg">
                    {community.name}
                  </h1>
                  
                  {/* Location - Large and Prominent */}
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="w-5 h-5 md:w-6 md:h-6 text-white flex-shrink-0" />
                    <div className="flex flex-col">
                      <p className="text-lg md:text-xl lg:text-2xl font-semibold text-white drop-shadow-md">
                        {community.location?.city && community.location?.state 
                          ? `${community.location.city}, ${community.location.state}`
                          : community.location?.city 
                          ? community.location.city
                          : community.location?.state
                          ? community.location.state
                          : 'Location not specified'}
                      </p>
                      {community.location?.address && (
                        <p className="text-sm md:text-base text-gray-200 mt-1">
                          {community.location.address}
                        </p>
                      )}
                      {community.location?.zipCode && (
                        <p className="text-sm md:text-base text-gray-200">
                          ZIP: {community.location.zipCode}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Description */}
                  {community.description && (
                    <p className="text-base md:text-lg text-gray-100 max-w-3xl leading-relaxed drop-shadow-md">
                      {community.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Community Stats Bar */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-6 py-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Users className="w-5 h-5 text-gray-700" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Members</p>
                <p className="text-lg font-bold text-gray-900">
                  {community.members ? community.members.length + 1 : 1}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-700" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Established</p>
                <p className="text-lg font-bold text-gray-900">
                  {formatDateToDDMMYYYY(community.createdAt)}
                </p>
              </div>
            </div>
            
            {community.status && (
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-gray-700" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <Badge className="bg-black text-white mt-1">
                    {community.status}
                  </Badge>
                </div>
              </div>
            )}
            
            {community.territory && (
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Building2 className="w-5 h-5 text-gray-700" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Territory</p>
                  <p className="text-lg font-bold text-gray-900">
                    {community.territory}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full">
            <button
              onClick={() => setActiveTab('pulses')}
              className={`flex-1 px-4 sm:px-6 py-3 sm:py-3.5 text-sm sm:text-base font-semibold rounded-lg transition-all duration-200 ${
                activeTab === 'pulses'
                  ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20 transform scale-[1.02]'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-md'
              }`}
            >
              <div className="flex items-center justify-center gap-2 sm:gap-3">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Pulses</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`flex-1 px-4 sm:px-6 py-3 sm:py-3.5 text-sm sm:text-base font-semibold rounded-lg transition-all duration-200 ${
                activeTab === 'events'
                  ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20 transform scale-[1.02]'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-md'
              }`}
            >
              <div className="flex items-center justify-center gap-2 sm:gap-3">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Events</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('marketplace')}
              className={`flex-1 px-4 sm:px-6 py-3 sm:py-3.5 text-sm sm:text-base font-semibold rounded-lg transition-all duration-200 ${
                activeTab === 'marketplace'
                  ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20 transform scale-[1.02]'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-md'
              }`}
            >
              <div className="flex items-center justify-center gap-2 sm:gap-3">
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Marketplace</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('directory')}
              className={`flex-1 px-4 sm:px-6 py-3 sm:py-3.5 text-sm sm:text-base font-semibold rounded-lg transition-all duration-200 ${
                activeTab === 'directory'
                  ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20 transform scale-[1.02]'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-md'
              }`}
            >
              <div className="flex items-center justify-center gap-2 sm:gap-3">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>Directory</span>
              </div>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          {activeTab === 'pulses' && (
            <PulsesTab />
          )}
          {activeTab === 'events' && (
            <EventsTab communityId={communityId!} user={user} />
          )}
          {activeTab === 'marketplace' && (
            <MarketplaceTab />
          )}
          {activeTab === 'directory' && (
            <DirectoryTab />
          )}
        </div>
      </main>
    </div>
  );
};

export default CommunityDashboard;