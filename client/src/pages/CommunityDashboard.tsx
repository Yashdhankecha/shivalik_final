import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { communityApi } from '../apis/community';
import { Community } from '../types/CommunityTypes';
import { showMessage } from '../utils/Constant';
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
          setRejectionMessage(request.reviewNotes || 'Your join request was rejected.');
        } else {
          setJoinStatus('requested');
        }
      } else {
        setJoinStatus('not-joined');
        setRejectionMessage(null);
      }
    } catch (error: any) {
      console.error('Could not check join status:', error);
      // Don't set error state here, just log it - user can still view public content
      setJoinStatus('not-joined');
    }
  };

  const handleJoinCommunity = async () => {
    if (!isAuthenticated) {
      showMessage('Please login to join communities', 'error');
      navigate('/login');
      return;
    }

    try {
      await communityApi.createJoinRequest({ communityId: communityId! });
      setJoinStatus('requested');
      showMessage('Join request sent! Waiting for manager approval.', 'success');
    } catch (error: any) {
      showMessage(error.message || 'Failed to send join request', 'error');
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm sm:text-base">Loading community...</p>
        </div>
      </div>
    );
  }

  if (error && !community) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <div className="text-lg sm:text-2xl font-bold text-gray-900 mb-2">Error Loading Community</div>
          <p className="text-gray-600 mb-2 text-sm sm:text-base">{error}</p>
          <p className="text-gray-500 mb-6 text-xs sm:text-sm">
            {error.includes('not found') || error.includes('404') 
              ? 'The community you are looking for does not exist or has been removed.'
              : 'Please check your connection and try again.'}
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => navigate('/dashboard')} variant="outline" className="text-sm sm:text-base">
              Back to Dashboard
            </Button>
            <Button onClick={() => {
              setError(null);
              setLoading(true);
              fetchCommunityData();
            }} className="bg-black hover:bg-gray-800 text-white text-sm sm:text-base">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-gray-600" />
          </div>
          <div className="text-lg sm:text-2xl font-bold text-gray-900 mb-2">Loading Community...</div>
          <p className="text-gray-600 mb-6 text-sm sm:text-base">Please wait while we load the community information.</p>
          <Button onClick={() => navigate('/dashboard')} variant="outline" className="text-sm sm:text-base">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Responsive */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-gray-700 hover:text-black hover:bg-gray-100 p-1 sm:p-2">
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="text-xs sm:text-sm">Back</span>
              </Button>
              <h1 className="text-base sm:text-xl font-bold text-black">Community</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Community Banner - Responsive */}
      <div className="bg-gradient-to-r from-gray-900 to-black text-white py-4 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="w-16 h-16 sm:w-24 sm:h-24 bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center text-2xl sm:text-4xl font-bold border border-gray-700">
                {community.logo ? (
                  <img src={community.logo} alt={community.name} className="w-full h-full object-cover rounded-xl sm:rounded-2xl" />
                ) : (
                  community.name.substring(0, 2).toUpperCase()
                )}
              </div>
              <div>
                <h1 className="text-xl sm:text-3xl font-bold mb-1 sm:mb-2">{community.name}</h1>
                <p className="text-gray-300 text-xs sm:text-sm mb-1 sm:mb-2">
                  {community.shortDescription || community.description?.substring(0, 80) + '...'}
                </p>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    {community.totalUnits} Units
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                    {community.location.city}, {community.location.state}
                  </span>
                  {community.establishedYear && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                      Established {community.establishedYear}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Join Button - Responsive */}
            <div className="flex flex-col items-end gap-2">
              <Button 
                className={`px-3 sm:px-6 py-1.5 sm:py-2.5 font-semibold text-xs sm:text-sm ${
                  joinStatus === 'joined' 
                    ? 'bg-gray-800 hover:bg-gray-700' 
                    : joinStatus === 'requested'
                    ? 'bg-yellow-500 hover:bg-yellow-600'
                    : joinStatus === 'rejected'
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-black hover:bg-gray-800 text-white'
                }`}
                onClick={handleJoinCommunity}
                disabled={joinStatus !== 'not-joined' && joinStatus !== 'rejected'}
              >
                {joinStatus === 'joined' && <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />}
                {joinStatus === 'requested' && <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />}
                {joinStatus === 'rejected' && <X className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />}
                {joinStatus === 'joined' ? 'Joined' : 
                 joinStatus === 'requested' ? 'Requested' : 
                 joinStatus === 'rejected' ? 'Rejected' : 
                 'Join Community'}
              </Button>
              {joinStatus === 'rejected' && rejectionMessage && (
                <p className="text-xs text-red-600 max-w-xs text-right">
                  {rejectionMessage}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Community Details Section - Responsive */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
          {/* Main Content */}
          <div className="xl:col-span-2">
            {/* Tabs - Responsive */}
            <div className="bg-white border-b border-gray-200 sticky top-12 sm:top-16 z-30">
              <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-2 sm:py-3">
                {['Pulses', 'Marketplace', 'Directory', 'Events'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      if (joinStatus !== 'joined' && tab.toLowerCase() !== 'pulses') {
                        showMessage('Please join the community to access this tab', 'error');
                        return;
                      }
                      setActiveTab(tab.toLowerCase());
                    }}
                    className={`px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm whitespace-nowrap transition-all ${
                      activeTab === tab.toLowerCase()
                        ? 'bg-black text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } ${joinStatus !== 'joined' && tab.toLowerCase() !== 'pulses' ? 'opacity-50' : ''}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Rejection Message Banner */}
            {joinStatus === 'rejected' && rejectionMessage && (
              <Card className="p-4 mb-4 bg-red-50 border-red-200 border-2">
                <div className="flex items-start gap-3">
                  <X className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-red-800 mb-1">Join Request Rejected</h4>
                    <p className="text-sm text-red-700">{rejectionMessage}</p>
                    <p className="text-xs text-red-600 mt-2">You can submit a new join request if you'd like to try again.</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Tab Content */}
            {joinStatus !== 'joined' && activeTab !== 'pulses' ? (
              <Card className="p-6 sm:p-12 text-center mt-4 sm:mt-6 bg-white border border-gray-200">
                <Users className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-lg sm:text-xl font-bold text-black mb-1 sm:mb-2">Join to Access</h3>
                <p className="text-gray-600 text-sm sm:text-base mb-3 sm:mb-4">You need to join this community to view {activeTab}</p>
                {joinStatus === 'rejected' ? (
                  <div className="space-y-2">
                    {rejectionMessage && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-3">
                        <p className="text-sm text-red-700 font-medium mb-1">Previous rejection reason:</p>
                        <p className="text-sm text-red-600">{rejectionMessage}</p>
                      </div>
                    )}
                    <Button onClick={handleJoinCommunity} className="bg-black hover:bg-gray-800 text-white text-sm sm:text-base">
                      Submit New Join Request
                    </Button>
                  </div>
                ) : (
                  <Button onClick={handleJoinCommunity} className="bg-black hover:bg-gray-800 text-white text-sm sm:text-base">
                    Join Community
                  </Button>
                )}
              </Card>
            ) : (
              <>
                {/* Pulses Tab */}
                {activeTab === 'pulses' && (
                  <div className="mt-4 sm:mt-6">
                    <PulsesTab />
                  </div>
                )}

                {/* Events Tab */}
                {activeTab === 'events' && (
                  <div className="mt-4 sm:mt-6">
                    <EventsTab />
                  </div>
                )}

                {/* Marketplace Tab */}
                {activeTab === 'marketplace' && (
                  <div className="mt-4 sm:mt-6">
                    <MarketplaceTab />
                  </div>
                )}

                {/* Directory Tab */}
                {activeTab === 'directory' && (
                  <div className="mt-4 sm:mt-6">
                    <DirectoryTab />
                  </div>
                )}

                {/* OLD CODE REMOVED - Using tab components (PulsesTab, EventsTab, MarketplaceTab, DirectoryTab) */}
                {/* All old inline implementations have been removed to prevent undefined variable errors */}
              </>
            )}
          </div>

          {/* Sidebar - Community Details - Responsive */}
          <div className="space-y-4 sm:space-y-6">
            {/* Community Info Card */}
            <Card className="bg-white border border-gray-200">
              <CardHeader className="border-b border-gray-200 p-3 sm:p-5">
                <h3 className="text-base sm:text-lg font-bold text-black">Community Info</h3>
              </CardHeader>
              <CardContent className="p-3 sm:p-5 space-y-3 sm:space-y-4">
                <div>
                  <h4 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Description</h4>
                  <p className="text-black text-xs sm:text-sm">{community.description}</p>
                </div>
                
                <div>
                  <h4 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Location</h4>
                  <p className="text-black text-xs sm:text-sm">
                    {community.location.address && `${community.location.address}, `}
                    {community.location.city}, {community.location.state} {community.location.zipCode}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Contact</h4>
                  <div className="space-y-1">
                    {community.contactInfo?.email && (
                      <p className="text-black text-xs sm:text-sm">📧 {community.contactInfo.email}</p>
                    )}
                    {community.contactInfo?.phone && (
                      <p className="text-black text-xs sm:text-sm">📞 {community.contactInfo.phone}</p>
                    )}
                    {community.contactInfo?.website && (
                      <p className="text-black text-xs sm:text-sm">🌐 {community.contactInfo.website}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Status</h4>
                  <Badge 
                    variant={
                      community.status === 'Active' || community.status === 'active' ? 'default' : 
                      community.status === 'UnderDevelopment' ? 'secondary' : 'outline'
                    }
                    className="bg-gray-100 text-black text-xs sm:text-sm"
                  >
                    {community.status}
                  </Badge>
                </div>
                
                <div>
                  <h4 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Created</h4>
                  <p className="text-black text-xs sm:text-sm">
                    {new Date(community.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Amenities Card */}
            {community.amenityIds && community.amenityIds.length > 0 && (
              <Card className="bg-white border border-gray-200">
                <CardHeader className="border-b border-gray-200 p-3 sm:p-5">
                  <h3 className="text-base sm:text-lg font-bold text-black">Amenities</h3>
                </CardHeader>
                <CardContent className="p-3 sm:p-5">
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    {community.amenityIds.map((amenity) => (
                      <div key={amenity._id} className="flex items-center gap-1 sm:gap-2 p-2 bg-gray-50 rounded-lg">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-black text-xs sm:text-sm font-bold">
                            {amenity.name.substring(0, 1).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-black">{amenity.name}</p>
                          <p className="text-xs text-gray-500">{amenity.category}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Highlights Card */}
            {community.highlights && community.highlights.length > 0 && (
              <Card className="bg-white border border-gray-200">
                <CardHeader className="border-b border-gray-200 p-3 sm:p-5">
                  <h3 className="text-base sm:text-lg font-bold text-black">Highlights</h3>
                </CardHeader>
                <CardContent className="p-3 sm:p-5">
                  <ul className="space-y-1 sm:space-y-2">
                    {community.highlights.map((highlight, index) => (
                      <li key={index} className="flex items-start gap-1 sm:gap-2">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-black text-xs">✓</span>
                        </div>
                        <span className="text-black text-xs sm:text-sm">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Banner Image */}
            {community.bannerImage && (
              <Card className="bg-white border border-gray-200">
                <CardHeader className="border-b border-gray-200 p-3 sm:p-5">
                  <h3 className="text-base sm:text-lg font-bold text-black">Community View</h3>
                </CardHeader>
                <CardContent className="p-0">
                  <img 
                    src={community.bannerImage} 
                    alt={community.name} 
                    className="w-full h-32 sm:h-48 object-cover rounded-b-lg"
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityDashboard;