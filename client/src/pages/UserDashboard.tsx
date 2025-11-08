import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { communityApi } from '../apis/community';
import { Community as CommunityType } from '../types/CommunityTypes';
import { showMessage } from '../utils/Constant';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { 
  Search, Users, Star,
  ChevronRight, MapPin, Settings, LogOut, Building2,
  UserPlus, Check, Clock, Dumbbell, Waves, Car, Shield, TreePine
} from 'lucide-react';

interface JoinRequest {
  communityId: string;
  status: 'pending' | 'approved' | 'rejected';
}

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Dynamic data from API
  const [allCommunities, setAllCommunities] = useState<CommunityType[]>([]);
  const [myCommunities, setMyCommunities] = useState<CommunityType[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCommunities();
    if (isAuthenticated) {
      fetchJoinRequests();
    }
  }, [isAuthenticated]);

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      // Fetch all communities without pagination limit
      const response = await communityApi.getAllCommunities({ limit: 100 });
      console.log('API Response:', response); // Debug log
      
      // Handle the response structure from the backend API
      if (response && response.result) {
        // The API returns communities in response.result.communities
        const communities = response.result.communities || [];
        setAllCommunities(communities);
        // Filter user's communities (this would come from a separate API in production)
        // For now, we'll show featured ones as "my communities"
        setMyCommunities(communities.filter((c: CommunityType) => c.isFeatured).slice(0, 3));
      } else if (response && response.data) {
        // Fallback for alternative response format
        const communities = response.data.communities || response.data || [];
        setAllCommunities(communities);
        setMyCommunities(communities.filter((c: CommunityType) => c.isFeatured).slice(0, 3));
      } else {
        // If no data structure matches, use the response directly
        const communities = Array.isArray(response) ? response : [];
        setAllCommunities(communities);
        setMyCommunities(communities.filter((c: CommunityType) => c.isFeatured).slice(0, 3));
      }
    } catch (error: any) {
      console.error('Error fetching communities:', error);
      showMessage(error.message || 'Failed to load communities', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchJoinRequests = async () => {
    try {
      const response = await communityApi.getUserJoinRequests();
      if (response && response.data) {
        setJoinRequests(response.data.map((req: any) => ({
          communityId: req.communityId?._id || req.communityId,
          status: req.status.toLowerCase()
        })));
      }
    } catch (error) {
      // User might not be authenticated, that's okay
      console.log('Could not fetch join requests');
    }
  };

  const handleJoinCommunity = async (communityId: string) => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      // Redirect to login with return URL
      navigate('/login', { state: { from: `/community/${communityId}` } });
      return;
    }
    
    try {
      await communityApi.createJoinRequest({ communityId });
      showMessage('Join request sent successfully!', 'success');
      // Update join requests state
      setJoinRequests([...joinRequests, { communityId, status: 'pending' }]);
    } catch (error: any) {
      showMessage(error.message || 'Failed to send join request', 'error');
    }
  };

  const getJoinRequestStatus = (communityId: string) => {
    const request = joinRequests.find(r => r.communityId === communityId);
    return request?.status;
  };

  const getCommunityColor = (index: number) => {
    const colors = [
      'from-gray-700 to-gray-900',
      'from-gray-600 to-gray-800',
      'from-gray-500 to-gray-700',
      'from-gray-400 to-gray-600',
      'from-gray-300 to-gray-500',
      'from-gray-200 to-gray-400',
      'from-gray-100 to-gray-300',
      'from-gray-50 to-gray-200'
    ];
    return colors[index % colors.length];
  };

  const filteredCommunities = allCommunities.filter(community =>
    community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    community.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const demoAmenities = [
    { icon: Dumbbell, name: 'Gym', color: 'text-gray-700' },
    { icon: Waves, name: 'Pool', color: 'text-gray-600' },
    { icon: Car, name: 'Parking', color: 'text-gray-500' },
    { icon: Shield, name: 'Security', color: 'text-gray-800' },
    { icon: Users, name: 'Club', color: 'text-gray-400' },
    { icon: TreePine, name: 'Garden', color: 'text-gray-300' }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation Bar */}
      <nav className="bg-white backdrop-blur-xl shadow-sm sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-full px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-gray-900 to-black rounded-xl flex items-center justify-center shadow-lg border border-gray-300">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-black bg-clip-text text-transparent">
                Real Estate Community
              </span>
            </div>

            {/* Right Actions - Profile Only for authenticated users, Guest option for others */}
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  {/* User Profile Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-3 hover:bg-gray-100 rounded-full px-4 py-2 transition-colors border border-gray-300"
                    >
                      <Avatar className="w-9 h-9 border-2 border-gray-300">
                        <AvatarFallback className="bg-gradient-to-br from-gray-800 to-gray-900 text-white font-semibold">
                          {user?.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-black font-medium">{user?.name || 'User'}</span>
                      <ChevronRight className={`w-4 h-4 text-gray-500 transition-transform ${showUserMenu ? 'rotate-90' : ''}`} />
                    </button>

                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-56 bg-white backdrop-blur-xl rounded-xl shadow-2xl border border-gray-200 py-2">
                        <div className="px-4 py-3 border-b border-gray-200">
                          <p className="font-semibold text-black">{user?.name || 'User'}</p>
                          <p className="text-sm text-gray-600">{user?.email}</p>
                        </div>
                        <button className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3 text-black" onClick={() => navigate('/profile')}>
                          <Settings className="w-4 h-4 text-gray-500" />
                          <span>Profile</span>
                        </button>
                        <button className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3 text-black" onClick={() => navigate('/settings')}>
                          <Settings className="w-4 h-4 text-gray-500" />
                          <span>Settings</span>
                        </button>
                        <button
                          onClick={handleLogout}
                          className="w-full px-4 py-2 text-left hover:bg-red-50 text-red-500 flex items-center gap-3"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 text-sm">Guest Access</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-gray-300 text-gray-700 hover:bg-gray-100"
                    onClick={() => navigate('/login')}
                  >
                    Sign In
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="flex max-w-full">
        {/* LEFT SIDEBAR - My Communities Navigation */}
        <aside className="w-72 bg-white backdrop-blur-sm border-r border-gray-200 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto">
          <div className="p-4">
            {/* Search Communities */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Search communities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 bg-white border-gray-300 text-black placeholder:text-gray-500"
                />
              </div>
            </div>

            {/* Your Communities */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">My Communities</h3>
              </div>
              
              {loading ? (
                <div className="text-center py-4 text-gray-500">Loading...</div>
              ) : myCommunities.length > 0 ? (
                <div className="space-y-1">
                  {myCommunities.map((community, index) => (
                    <div
                      key={community._id}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 transition-all group cursor-pointer"
                    >
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getCommunityColor(index)} flex items-center justify-center text-white font-bold shadow-md group-hover:scale-110 transition-transform`}>
                        {community.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-semibold text-black text-sm">{community.name}</p>
                        <p className="text-xs text-gray-500">{community.totalUnits || 0} units</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No communities joined yet</p>
              )}
            </div>

          </div>
        </aside>

        {/* MAIN SECTION - Browse All Communities */}
        <main className="flex-1 p-6 overflow-y-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-black mb-2">Browse Communities</h1>
            <p className="text-gray-600">Discover and join communities that match your interests</p>
            {!isAuthenticated && (
              <div className="mt-3 p-3 bg-gray-100 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Guest Mode:</span> You can browse communities, but you'll need to sign in to join them.
                </p>
              </div>
            )}
          </div>

          {/* Community Grid */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCommunities.map((community, index) => (
                <Card 
                  key={community._id} 
                  className="bg-white backdrop-blur-sm border-gray-200 hover:shadow-xl transition-all group cursor-pointer"
                  onClick={() => navigate(`/community/${community._id}`)}
                >
                  <div className={`h-48 rounded-t-xl bg-gradient-to-br ${getCommunityColor(index)} relative overflow-hidden`}>
                    {community.bannerImage ? (
                      <img
                        src={community.bannerImage}
                        alt={community.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building2 className="w-16 h-16 text-white/30" />
                      </div>
                    )}
                    {community.isFeatured && (
                      <Badge className="absolute top-3 right-3 bg-yellow-100 text-yellow-800">
                        <Star className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all"></div>
                  </div>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold text-lg text-black group-hover:text-gray-800 transition-colors">
                        {community.name}
                      </h3>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Users className="w-4 h-4" />
                        <span>{community.totalUnits || 0}</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {community.shortDescription || community.description?.substring(0, 100) + '...'}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {community.amenityIds?.slice(0, 3).map((amenity: any) => (
                        <Badge key={amenity._id} variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                          {amenity.name}
                        </Badge>
                      ))}
                      {community.amenityIds && community.amenityIds.length > 3 && (
                        <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                          +{community.amenityIds.length - 3} more
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <MapPin className="w-4 h-4" />
                        <span>{community.location?.city || 'Location N/A'}</span>
                      </div>
                      
                      {isAuthenticated ? (
                        getJoinRequestStatus(community._id) === 'approved' ? (
                          <Button size="sm" className="bg-gray-800 hover:bg-gray-700 text-white">
                            <Check className="w-4 h-4 mr-1" />
                            Joined
                          </Button>
                        ) : getJoinRequestStatus(community._id) === 'pending' ? (
                          <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600 text-white" disabled>
                            <Clock className="w-4 h-4 mr-1" />
                            Pending
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            className="bg-black hover:bg-gray-800 text-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleJoinCommunity(community._id);
                            }}
                          >
                            <UserPlus className="w-4 h-4 mr-1" />
                            Join
                          </Button>
                        )
                      ) : (
                        <Button 
                          size="sm" 
                          className="bg-black hover:bg-gray-800 text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate('/login', { state: { from: `/community/${community._id}` } });
                          }}
                        >
                          <UserPlus className="w-4 h-4 mr-1" />
                          Sign In to Join
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {filteredCommunities.length === 0 && !loading && (
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-700 mb-2">No communities found</h3>
              <p className="text-gray-500">Try adjusting your search or browse all communities</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;